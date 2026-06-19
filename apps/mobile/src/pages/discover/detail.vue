<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { Post } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";
import { normalizePostMedia } from "./media";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].discover);
const post = ref<Post | null>(null);
const postId = ref("");
const isLoading = ref(true);
const errorMessage = ref("");
const commentValue = ref("");
const isSubmittingComment = ref(false);
const statusBarHeight = ref(0);

const authorProfiles: Record<string, { name: string; avatarUrl: string }> = {
  user_001: {
    name: "Jerry",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
  },
  user_002: {
    name: "Emma",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  }
};

const getLanguageLabel = (language: Post["language"]) =>
  language === "zh" ? copy.value.languageZh : copy.value.languageEn;

const postMedia = computed(() => (post.value ? normalizePostMedia(post.value) : []));
const customNavStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value}px`
}));
const author = computed(() => {
  if (!post.value) {
    return null;
  }

  return (
    authorProfiles[post.value.author_user_id] ?? {
      name: post.value.author_user_id,
      avatarUrl: ""
    }
  );
});

const loadPost = async (id: string) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await mobileApi.discover.detailPost(id);
    post.value = result.data;
  } catch {
    post.value = null;
    errorMessage.value = copy.value.detailError;
  } finally {
    isLoading.value = false;
  }
};

onLoad((query) => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight ?? 0;
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
    uni.showToast({ title: copy.value.commentSuccess, icon: "success" });
  } catch {
    uni.showToast({ title: copy.value.commentError, icon: "none" });
  } finally {
    isSubmittingComment.value = false;
  }
};

const openReport = () => {
  if (!post.value) {
    return;
  }

  uni.navigateTo({
    url: `/pages/discover/report?id=${post.value._id}`
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
          />
          <view v-else class="nav-avatar fallback">
            {{ author.name.slice(0, 1).toUpperCase() }}
          </view>
          <view class="nav-user">
            <view class="nav-name">{{ author.name }}</view>
            <view class="nav-id">{{ post?.author_user_id }}</view>
          </view>
          <button v-if="post" class="nav-report" @click.stop="openReport">
            {{ copy.reportButton }}
          </button>
        </template>
        <view v-else class="nav-placeholder">{{ copy.feedTitle }}</view>
      </view>
    </view>

    <view class="detail-card">
      <AsyncStateCard v-if="isLoading" variant="loading" :text="copy.detailLoading" />
      <AsyncStateCard v-else-if="errorMessage" variant="error" :text="errorMessage" />

      <template v-else-if="post">
        <view v-if="postMedia.length" class="gallery">
          <view
            v-for="media in postMedia"
            :key="media.url"
            class="media-item"
            :class="media.kind"
          >
            <image
              v-if="media.kind === 'image'"
              class="gallery-image"
              :src="media.url"
              mode="widthFix"
            />
            <video
              v-else
              class="gallery-video"
              :src="media.url"
              controls
              :autoplay="false"
              :show-center-play-btn="true"
              :enable-progress-gesture="true"
            />
          </view>
        </view>

        <view class="article-header">
          <view class="article-title">{{ post.title }}</view>
          <view class="article-meta">
            <text>{{ getLanguageLabel(post.language) }}</text>
            <text>{{ post.location_text || copy.locationFallback }}</text>
            <text>{{ post.review_status }}</text>
          </view>
        </view>

        <view class="content">{{ post.content }}</view>

        <view v-if="post.tag_ids.length" class="tags">
          <text v-for="tag in post.tag_ids" :key="tag" class="tag">#{{ tag }}</text>
        </view>

        <view class="comment-box">
          <view class="comment-heading">
            <view class="comment-title">{{ copy.commentSectionTitle }}</view>
            <view class="comment-hint">{{ copy.commentSectionHint }}</view>
          </view>
          <textarea
            v-model="commentValue"
            class="textarea"
            :placeholder="copy.commentPlaceholder"
          />
          <button
            class="primary"
            :disabled="isSubmittingComment"
            @click="submitComment"
          >
            {{ isSubmittingComment ? copy.submittingComment : copy.submitComment }}
          </button>
        </view>
      </template>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
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
  padding: 0 24rpx;
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
  flex: 1;
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

.gallery {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-bottom: 22rpx;
}

.media-item {
  overflow: hidden;
  border-radius: 18rpx;
  background: #e2e8f0;
}

.media-item.video {
  background: #111827;
}

.gallery-image,
.gallery-video {
  width: 100%;
}

.gallery-video {
  height: 420rpx;
  background: #e2e8f0;
}

.article-header {
  padding-bottom: 22rpx;
  border-bottom: 1rpx solid #e5e7eb;
}

.article-title {
  color: #111827;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.35;
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

.nav-report,
.primary {
  border-radius: 10rpx;
  font-size: 26rpx;
}

.nav-report {
  flex-shrink: 0;
  margin: 0;
  padding: 0 18rpx;
  min-height: 46rpx;
  line-height: 46rpx;
  border: 1rpx solid #fca5a5;
  background: #ffffff;
  color: #dc2626;
  font-size: 22rpx;
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

.input {
  width: 100%;
  box-sizing: border-box;
  min-height: 78rpx;
  background: #ffffff;
  border: 1rpx solid #d1d5db;
  border-radius: 12rpx;
  padding: 20rpx 22rpx;
  font-size: 26rpx;
}

.textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 180rpx;
  background: #ffffff;
  border: 1rpx solid #d1d5db;
  border-radius: 12rpx;
  margin-top: 16rpx;
  padding: 20rpx 22rpx;
  line-height: 1.6;
}

.primary {
  margin-top: 20rpx;
  background: #1d4ed8;
  color: white;
}

.primary[disabled] {
  opacity: 0.7;
}
</style>
