<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import type { Comment, Event, PlaceDetail, Post } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { getMobileCopy } from "@/i18n";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import DetailActionBar from "./DetailActionBar.vue";
import DetailContent from "./DetailContent.vue";
import { getDiscoverEnforcementMessage } from "./enforcement-error";
import { normalizePostMedia } from "./media";

interface CommentItem {
  id: string;
  authorId?: string;
  authorName: string;
  avatarUrl: string;
  content: string;
  time: string;
  likeCount: number;
  liked: boolean;
}

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).discover);
const post = ref<Post | null>(null);
const associatedPlace = ref<PlaceDetail | null>(null);
const associatedEvent = ref<Event | null>(null);
const hasUnavailablePlace = ref(false);
const hasUnavailableEvent = ref(false);
const postId = ref("");
const isLoading = ref(true);
const errorMessage = ref("");
const commentValue = ref("");
const isSubmittingComment = ref(false);
const statusBarHeight = ref(0);
const keyboardHeight = ref(0);
const mediaIndex = ref(0);
const isFollowing = ref(false);
const isAuthorSelf = ref(true);
const isUpdatingFollow = ref(false);
const postLiked = ref(false);
const postLikeCount = ref(0);
const postFavorited = ref(false);
const postFavoriteCount = ref(0);
const postShareCount = ref(0);
const isUpdatingPostInteraction = ref(false);
const showShare = ref(false);
const capsuleSafeRight = ref(0);

const comments = ref<CommentItem[]>([]);

const commentCount = computed(() => comments.value.length);

const getLanguageLabel = (language: Post["language"]) =>
  language === "zh" ? copy.value.languageZh : copy.value.languageEn;

const postMedia = computed(() =>
  post.value ? normalizePostMedia(post.value) : []
);
const placeAssociationTitle = computed(() =>
  associatedPlace.value
    ? pickLocalized(
        state.locale,
        associatedPlace.value.name_zh,
        associatedPlace.value.name_en
      )
    : ""
);
const eventAssociationTitle = computed(() =>
  associatedEvent.value
    ? pickLocalized(
        state.locale,
        associatedEvent.value.title_zh,
        associatedEvent.value.title_en
      )
    : ""
);
const placeAssociation = computed(() =>
  associatedPlace.value
    ? {
        title: placeAssociationTitle.value,
        meta: pickLocalized(
          state.locale,
          associatedPlace.value.address_zh,
          associatedPlace.value.address_en
        ),
        coverUrl: associatedPlace.value.cover_url ?? ""
      }
    : null
);
const eventAssociation = computed(() =>
  associatedEvent.value
    ? {
        title: eventAssociationTitle.value,
        meta: associatedEvent.value.address_text,
        coverUrl: associatedEvent.value.cover_url ?? ""
      }
    : null
);
const customNavStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value}px`,
  "--nav-capsule-safe-right": `${capsuleSafeRight.value}px`
}));
const author = computed(() => {
  if (!post.value) {
    return null;
  }

  return {
    name: post.value.author_display.nickname,
    avatarUrl: post.value.author_display.avatar_url ?? ""
  };
});

const loadAuthorProfile = async (authorUserId: string) => {
  isFollowing.value = false;
  isAuthorSelf.value = true;

  try {
    const result = await mobileApi.discover.profile(authorUserId);
    isFollowing.value = result.data.followed_by_actor;
    isAuthorSelf.value = result.data.is_self;
  } catch {
    isFollowing.value = false;
    isAuthorSelf.value = true;
  }
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

const toCommentItem = (comment: Comment): CommentItem => {
  return {
    id: comment._id,
    authorId: comment.author_user_id,
    authorName: comment.author_display.nickname || comment.author_user_id,
    avatarUrl: comment.author_display.avatar_url ?? "",
    content: comment.content,
    time: formatTime(comment.created_at),
    likeCount: 0,
    liked: false
  };
};

const loadAssociations = async (item: Post) => {
  associatedPlace.value = null;
  associatedEvent.value = null;
  hasUnavailablePlace.value = false;
  hasUnavailableEvent.value = false;

  if (item.place_id) {
    try {
      const result = await mobileApi.places.detail(item.place_id);
      associatedPlace.value = result.data;
    } catch {
      hasUnavailablePlace.value = true;
    }
  }

  if (item.event_id) {
    try {
      const result = await mobileApi.events.detail(item.event_id);
      associatedEvent.value = result.data;
    } catch {
      hasUnavailableEvent.value = true;
    }
  }
};

const loadComments = async (id: string) => {
  const result = await mobileApi.discover.listComments(id, {
    page: 1,
    pageSize: 50
  });
  comments.value = result.data.items.map(toCommentItem);
};

const applyPostInteraction = (interaction: {
  liked: boolean;
  favorited: boolean;
  like_count: number;
  favorite_count: number;
  share_count: number;
}) => {
  postLiked.value = interaction.liked;
  postFavorited.value = interaction.favorited;
  postLikeCount.value = interaction.like_count;
  postFavoriteCount.value = interaction.favorite_count;
  postShareCount.value = interaction.share_count;
};

const loadPostInteraction = async (id: string) => {
  try {
    const result = await mobileApi.discover.postInteraction(id);
    applyPostInteraction(result.data);
  } catch {
    postLiked.value = false;
    postFavorited.value = false;
  }
};

const loadPost = async (id: string) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await mobileApi.discover.detailPost(id);
    post.value = result.data;
    postLikeCount.value = result.data.like_count;
    postFavoriteCount.value = result.data.favorite_count;
    postShareCount.value = result.data.share_count;
    await loadAuthorProfile(result.data.author_user_id);
    await loadPostInteraction(id);
    await loadAssociations(result.data);
    await loadComments(id);
  } catch {
    post.value = null;
    comments.value = [];
    associatedPlace.value = null;
    associatedEvent.value = null;
    isFollowing.value = false;
    isAuthorSelf.value = true;
    errorMessage.value = copy.value.detailError;
  } finally {
    isLoading.value = false;
  }
};

onLoad((query) => {
  const systemInfo = uni.getSystemInfoSync();
  statusBarHeight.value = systemInfo.statusBarHeight ?? 0;
  const miniProgramUni = uni as unknown as {
    getMenuButtonBoundingClientRect?: () => { left: number };
  };
  const menuButtonRect = miniProgramUni.getMenuButtonBoundingClientRect?.();
  capsuleSafeRight.value =
    menuButtonRect && systemInfo.windowWidth
      ? Math.max(systemInfo.windowWidth - menuButtonRect.left + 8, 0)
      : 0;
  const id = String(query?.id ?? "");
  if (!id) {
    errorMessage.value = copy.value.detailMissing;
    isLoading.value = false;
    return;
  }

  postId.value = id;
  loadPost(id);
});

const goBack = () => {
  const pages = getCurrentPages();

  if (pages.length > 1) {
    uni.navigateBack({
      delta: 1
    });
    return;
  }

  uni.switchTab({
    url: "/pages/discover/index"
  });
};

const submitComment = async () => {
  if (!post.value) {
    return;
  }

  const content = commentValue.value.trim();
  if (!content) {
    uni.showToast({ title: copy.value.commentRequired, icon: "none" });
    return;
  }

  isSubmittingComment.value = true;
  try {
    await mobileApi.discover.createComment(post.value._id, {
      content,
      language: state.locale
    });
    commentValue.value = "";
    await loadPost(post.value._id);
    uni.showToast({ title: copy.value.commentSuccess, icon: "success" });
  } catch (err) {
    uni.showToast({
      title:
        getDiscoverEnforcementMessage(err, copy.value) ||
        copy.value.commentError,
      icon: "none"
    });
  } finally {
    isSubmittingComment.value = false;
  }
};

const onKeyboardHeightChange = (event: { detail: { height: number } }) => {
  keyboardHeight.value = event.detail.height;
};

const onMediaChange = (event: { detail: { current: number } }) => {
  mediaIndex.value = event.detail.current;
};

const toggleLike = (comment: CommentItem) => {
  if (comment.liked) {
    comment.liked = false;
    comment.likeCount = Math.max(0, comment.likeCount - 1);
  } else {
    comment.liked = true;
    comment.likeCount += 1;
  }
};

const openCommentActions = (comment: CommentItem) => {
  uni.showActionSheet({
    itemList: [copy.value.reportButton],
    success: ({ tapIndex }) => {
      if (tapIndex === 0 && post.value) {
        uni.navigateTo({
          url: `/pages/discover/report?id=${encodeURIComponent(post.value._id)}&commentId=${encodeURIComponent(comment.id)}`
        });
      }
    }
  });
};

const toggleFollow = async () => {
  if (!post.value || isAuthorSelf.value || isUpdatingFollow.value) {
    return;
  }

  isUpdatingFollow.value = true;
  try {
    const result = await mobileApi.discover.setProfileFollow(
      post.value.author_user_id,
      {
        following: !isFollowing.value
      }
    );
    isFollowing.value = result.data.following;
    uni.showToast({
      title: isFollowing.value ? copy.value.followDone : copy.value.unfollowDone,
      icon: "none"
    });
  } catch {
    uni.showToast({ title: copy.value.followError, icon: "none" });
  } finally {
    isUpdatingFollow.value = false;
  }
};

const openProfile = (userId?: string) => {
  if (!userId) {
    return;
  }
  uni.navigateTo({
    url: `/pages/more/profile?id=${userId}`
  });
};

const openAuthorProfile = () => {
  openProfile(post.value?.author_user_id);
};

const openAssociatedPlace = () => {
  if (!associatedPlace.value) {
    return;
  }
  uni.navigateTo({
    url: `/pages/places/detail?id=${associatedPlace.value._id}`
  });
};

const openAssociatedEvent = () => {
  if (!associatedEvent.value) {
    return;
  }
  uni.navigateTo({
    url: `/pages/events/detail?id=${associatedEvent.value._id}`
  });
};

const togglePostLike = async () => {
  if (!post.value || isUpdatingPostInteraction.value) {
    return;
  }

  isUpdatingPostInteraction.value = true;
  try {
    const result = await mobileApi.discover.setPostLike(post.value._id, {
      liked: !postLiked.value
    });
    applyPostInteraction(result.data);
  } catch {
    uni.showToast({ title: copy.value.detailError, icon: "none" });
  } finally {
    isUpdatingPostInteraction.value = false;
  }
};

const togglePostFavorite = async () => {
  if (!post.value || isUpdatingPostInteraction.value) {
    return;
  }

  isUpdatingPostInteraction.value = true;
  try {
    const result = await mobileApi.discover.setPostFavorite(post.value._id, {
      favorited: !postFavorited.value
    });
    applyPostInteraction(result.data);
  } catch {
    uni.showToast({ title: copy.value.detailError, icon: "none" });
  } finally {
    isUpdatingPostInteraction.value = false;
  }
};

const sharePath = computed(() => `/pages/discover/detail?id=${postId.value}`);
const shareTitle = computed(
  () => post.value?.title || copy.value.shareCardTitle
);

const openShare = () => {
  copyShareLink();
};

const closeShare = () => {
  showShare.value = false;
};

const recordPostShare = async (
  channel: "wechat" | "moments" | "copy_link" | "system" | "other"
) => {
  if (!post.value) {
    return;
  }

  try {
    const result = await mobileApi.discover.recordPostShare(post.value._id, {
      channel
    });
    applyPostInteraction(result.data);
  } catch {
    uni.showToast({ title: copy.value.shareError, icon: "none" });
  }
};

const copyShareLink = () => {
  uni.setClipboardData({
    data: sharePath.value,
    success: () => {
      uni.showToast({ title: copy.value.shareLinkCopied, icon: "none" });
      void recordPostShare("copy_link");
    }
  });
  closeShare();
};

onShareAppMessage(() => {
  void recordPostShare("wechat");
  return {
    title: shareTitle.value,
    path: sharePath.value
  };
});

onShareTimeline(() => {
  void recordPostShare("moments");
  return {
    title: shareTitle.value,
    query: `id=${postId.value}`
  };
});

const openReport = () => {
  if (!post.value) {
    return;
  }

  uni.navigateTo({
    url: `/pages/discover/report?id=${post.value._id}`
  });
};

const openActions = () => {
  if (!post.value) {
    return;
  }

  uni.showActionSheet({
    itemList: [copy.value.reportButton],
    success: ({ tapIndex }) => {
      if (tapIndex === 0) {
        openReport();
      }
    }
  });
};
</script>

<template>
  <view class="page">
    <view class="custom-nav" :style="customNavStyle">
      <view class="nav-content">
        <view class="nav-back" @click.stop="goBack">‹</view>
        <template v-if="author">
          <image
            v-if="author.avatarUrl"
            class="nav-avatar"
            :src="author.avatarUrl"
            mode="aspectFill"
            @click.stop="openAuthorProfile"
          />
          <view
            v-else
            class="nav-avatar fallback"
            @click.stop="openAuthorProfile"
          >
            {{ author.name.slice(0, 1).toUpperCase() }}
          </view>
          <view class="nav-user" @click.stop="openAuthorProfile">
            <view class="nav-name">{{ author.name }}</view>
            <view class="nav-id">{{ post?.author_user_id }}</view>
          </view>
        </template>
        <view v-else class="nav-placeholder">{{ copy.feedTitle }}</view>
      </view>
    </view>

    <view class="detail-card">
      <AsyncStateCard
        v-if="isLoading"
        variant="loading"
        :text="copy.detailLoading"
      />
      <AsyncStateCard
        v-else-if="errorMessage"
        variant="error"
        :text="errorMessage"
      />

      <DetailContent
        v-else-if="post && author"
        :post="post"
        :author-name="author.name"
        :author-avatar-url="author.avatarUrl"
        :author-initial="author.name.slice(0, 1).toUpperCase()"
        :is-author-self="isAuthorSelf"
        :is-following="isFollowing"
        :is-updating-follow="isUpdatingFollow"
        :media="postMedia"
        :media-index="mediaIndex"
        :language-label="getLanguageLabel(post.language)"
        :location-label="post.location_text || copy.locationFallback"
        :place-association="placeAssociation"
        :event-association="eventAssociation"
        :has-unavailable-place="hasUnavailablePlace"
        :has-unavailable-event="hasUnavailableEvent"
        :place-association-label="copy.placeAssociationLabel"
        :event-association-label="copy.eventAssociationLabel"
        :place-association-unavailable="copy.placeAssociationUnavailable"
        :event-association-unavailable="copy.eventAssociationUnavailable"
        :comments="comments"
        :comment-count="commentCount"
        :follow-button="copy.followButton"
        :following-button="copy.followingButton"
        :more-actions-label="copy.moreActionsLabel"
        :comment-section-title="copy.commentSectionTitle"
        :comment-section-hint="copy.commentSectionHint"
        @open-author="openAuthorProfile"
        @toggle-follow="toggleFollow"
        @media-change="onMediaChange"
        @open-actions="openActions"
        @open-associated-place="openAssociatedPlace"
        @open-associated-event="openAssociatedEvent"
        @open-profile="openProfile"
        @toggle-comment-like="toggleLike"
        @open-comment-actions="openCommentActions"
      />
    </view>

    <DetailActionBar
      v-if="post"
      v-model="commentValue"
      :placeholder="copy.commentBarPlaceholder"
      :liked="postLiked"
      :like-count="postLikeCount"
      :favorited="postFavorited"
      :favorite-count="postFavoriteCount"
      :share-count="postShareCount"
      @keyboard-height-change="onKeyboardHeightChange"
      @submit="submitComment"
      @toggle-like="togglePostLike"
      @toggle-favorite="togglePostFavorite"
      @open-share="openShare"
    />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background: #f8fafc;
}

.custom-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  border-bottom: 1rpx solid #eef2f7;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-height: 96rpx;
  padding: 0 calc(24rpx + var(--nav-capsule-safe-right, 0px)) 0 24rpx;
}

.nav-back {
  width: 48rpx;
  height: 72rpx;
  line-height: 66rpx;
  color: #111827;
  font-size: 58rpx;
  font-weight: 300;
}

.nav-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #e2e8f0;
}

.nav-avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 26rpx;
  font-weight: 700;
}

.nav-user {
  flex-shrink: 1;
  min-width: 0;
}

.nav-name {
  overflow: hidden;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-id,
.nav-placeholder {
  margin-top: 4rpx;
  color: #64748b;
  font-size: 22rpx;
}

.detail-card {
  margin: 24rpx;
  padding: 28rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  background: #ffffff;
}

.detail-author-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 22rpx;
}

.detail-author-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 14rpx;
}

.detail-author-avatar {
  flex-shrink: 0;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #e2e8f0;
}

.detail-author-avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 24rpx;
  font-weight: 700;
}

.detail-author-text {
  min-width: 0;
}

.detail-author-name {
  overflow: hidden;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-author-id {
  overflow: hidden;
  margin-top: 4rpx;
  color: #64748b;
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-follow {
  flex-shrink: 0;
  margin: 0;
  padding: 0 26rpx;
  min-height: 56rpx;
  line-height: 56rpx;
  border-radius: 999rpx;
  background: #ff2442;
  color: #ffffff;
  font-size: 26rpx;
}

.detail-follow.following {
  background: #f3f4f6;
  color: #6b7280;
}

.gallery {
  position: relative;
  margin-bottom: 22rpx;
}

.media-swiper {
  width: 100%;
  height: 600rpx;
  overflow: hidden;
  border-radius: 18rpx;
  background: #111827;
}

.media-slide,
.slide-image,
.slide-video {
  width: 100%;
  height: 100%;
}

.media-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 18rpx;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 10rpx;
}

.media-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}

.media-dot.active {
  background: rgba(255, 255, 255, 0.9);
}

.article-header {
  padding-bottom: 22rpx;
  border-bottom: 1rpx solid #e5e7eb;
}

.article-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.article-title {
  flex: 1;
  min-width: 0;
  color: #111827;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.35;
}

.more-button {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f3f4f6;
  color: #374151;
}

.more-dots {
  font-size: 40rpx;
  line-height: 1;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 14rpx;
  color: #64748b;
  font-size: 24rpx;
}

.content {
  margin-top: 24rpx;
  line-height: 1.7;
  color: #111827;
  font-size: 30rpx;
  white-space: pre-wrap;
}

.association-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 22rpx;
}

.association-card {
  display: flex;
  gap: 16rpx;
  align-items: center;
  min-height: 128rpx;
  padding: 14rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  background: #f9fafb;
}

.association-cover {
  flex-shrink: 0;
  width: 112rpx;
  height: 96rpx;
  border-radius: 8rpx;
  background: #e2e8f0;
}

.association-main {
  flex: 1;
  min-width: 0;
}

.association-label {
  color: #64748b;
  font-size: 22rpx;
  font-weight: 600;
}

.association-title {
  overflow: hidden;
  margin-top: 4rpx;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.association-meta {
  overflow: hidden;
  margin-top: 4rpx;
  color: #64748b;
  font-size: 23rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.association-unavailable {
  padding: 18rpx;
  border-radius: 10rpx;
  background: #f3f4f6;
  color: #64748b;
  font-size: 24rpx;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 20rpx;
}

.tag,
.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.tag {
  padding: 6rpx 14rpx;
  background: #e6f4ff;
  color: #0052d9;
}

.status-pill {
  padding: 6rpx 14rpx;
  background: #f3f4f6;
  color: #374151;
}

.comment-box {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #e5e7eb;
}

.comment-heading {
  margin-bottom: 14rpx;
}

.comment-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 600;
}

.comment-hint {
  margin-top: 6rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.5;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  margin-top: 24rpx;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.comment-avatar {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #e2e8f0;
}

.comment-avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 26rpx;
  font-weight: 700;
}

.comment-main {
  flex: 1;
  min-width: 0;
}

.comment-name {
  color: #64748b;
  font-size: 24rpx;
  font-weight: 600;
}

.comment-text {
  margin-top: 8rpx;
  color: #111827;
  font-size: 28rpx;
  line-height: 1.55;
  word-break: break-word;
}

.comment-time {
  margin-top: 8rpx;
  color: #9ca3af;
  font-size: 22rpx;
}

.comment-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 18rpx;
  padding-top: 4rpx;
}

.like-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  color: #9ca3af;
}

.like-button.liked {
  color: #ff2442;
}

.like-icon {
  font-size: 34rpx;
  line-height: 1;
}

.like-count {
  font-size: 20rpx;
  line-height: 1;
}

.comment-more {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.comment-more .more-dots {
  font-size: 36rpx;
  line-height: 1;
}

.comment-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid #eef2f7;
  transition: transform 0.2s ease;
}

.comment-bar-field {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 12rpx;
  box-sizing: border-box;
  min-height: 72rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
}

.comment-pencil {
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 28rpx;
}

.comment-bar-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  color: #111827;
  font-size: 26rpx;
}

.bar-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 28rpx;
}

.bar-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #1f2937;
}

.bar-action.liked {
  color: #ff2442;
}

.bar-action.favorited {
  color: #f5a623;
}

.bar-icon {
  font-size: 44rpx;
  line-height: 1;
}

.bar-icon-img {
  width: 44rpx;
  height: 44rpx;
}

.bar-count {
  color: #4b5563;
  font-size: 24rpx;
}

.share-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.share-sheet {
  background: #f7f7f7;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.share-title {
  padding: 32rpx 0 24rpx;
  text-align: center;
  color: #9ca3af;
  font-size: 26rpx;
}

.share-options {
  display: flex;
  gap: 24rpx;
  padding: 8rpx 40rpx 36rpx;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  margin: 0;
  padding: 0;
  background: transparent;
  line-height: normal;
}

.share-option::after {
  border: none;
}

.share-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: #ffffff;
  font-size: 48rpx;
}

.share-icon.wechat {
  background: #07c160;
}

.share-icon.moments {
  background: #3b82f6;
}

.share-icon.link {
  background: #e5e7eb;
}

.share-label {
  color: #4b5563;
  font-size: 24rpx;
}

.share-cancel {
  padding: 30rpx 0 calc(30rpx + env(safe-area-inset-bottom));
  border-top: 12rpx solid #ededed;
  text-align: center;
  color: #111827;
  font-size: 30rpx;
}
</style>
