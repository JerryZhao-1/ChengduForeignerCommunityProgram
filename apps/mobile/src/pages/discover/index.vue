<script setup lang="ts">
import { computed, ref } from "vue";
import {
  onLoad,
  onPullDownRefresh,
  onReachBottom,
  onShow
} from "@dcloudio/uni-app";
import type { Post } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import SectionPanel from "@/components/SectionPanel.vue";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";
import { getProfileOverride } from "@/stores/profile-store";
import {
  getFirstMedia,
  getHiddenTagCount,
  getMediaSummary,
  getVisibleTags
} from "./media";

const { state } = useAppStore();
const posts = ref<Post[]>([]);
const page = ref(1);
const pageSize = 10;
const total = ref(0);
const isLoading = ref(false);
const isRefreshing = ref(false);
const isLoadingMore = ref(false);
const errorMessage = ref("");
const statusBarHeight = ref(0);
const currentAvatar = ref("");

const copy = computed(() => appCopy[state.locale].discover);
const hasMore = computed(() => posts.value.length < total.value);
const customTopStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value}px`
}));

const getLanguageLabel = (language: Post["language"]) =>
  language === "zh" ? copy.value.languageZh : copy.value.languageEn;

const summarize = (content: string) =>
  content.length > 96 ? `${content.slice(0, 96)}...` : content;

const getMediaMeta = (post: Post) => {
  const summary = getMediaSummary(post);
  const parts = [];

  if (summary.imageCount) {
    parts.push(`${summary.imageCount} ${copy.value.imageCount}`);
  }

  if (summary.videoCount) {
    parts.push(`${summary.videoCount} ${copy.value.videoCount}`);
  }

  return parts.join(" · ");
};

const isVideoPost = (post: Post) => getFirstMedia(post)?.kind === "video";

const getCoverImage = (post: Post) => {
  const first = getFirstMedia(post);
  return first?.kind === "image" ? first.url : "";
};

const getVideoUrl = (post: Post) => {
  const first = getFirstMedia(post);
  return first?.kind === "video" ? first.url : "";
};

const getExcerpt = (post: Post) => {
  const text = (post.content ?? post.title ?? "").trim();
  return text.length > 100 ? `${text.slice(0, 100)}...` : text;
};

const leftColumn = computed(() =>
  posts.value.filter((_, index) => index % 2 === 0)
);
const rightColumn = computed(() =>
  posts.value.filter((_, index) => index % 2 === 1)
);

const loadPosts = async (nextPage = 1, append = false) => {
  if (isLoading.value || isLoadingMore.value) {
    return;
  }

  errorMessage.value = "";
  if (append) {
    isLoadingMore.value = true;
  } else {
    isLoading.value = true;
  }

  try {
    const result = await mobileApi.discover.listPosts({
      communityId: state.communityId,
      page: nextPage,
      pageSize
    });
    const items = result.data.items;

    posts.value = append ? [...posts.value, ...items] : items;
    page.value = result.data.page;
    total.value = result.data.total;
  } catch (error) {
    errorMessage.value = copy.value.error;
    if (!append) {
      posts.value = [];
      total.value = 0;
    }
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
    isRefreshing.value = false;
    uni.stopPullDownRefresh();
  }
};

const refresh = () => {
  isRefreshing.value = true;
  page.value = 1;
  loadPosts(1);
};

const loadMore = () => {
  if (!hasMore.value) {
    return;
  }
  loadPosts(page.value + 1, true);
};

const openDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/discover/detail?id=${id}`
  });
};

const openCreate = () => {
  uni.navigateTo({
    url: "/pages/discover/create"
  });
};

const openSearch = () => {
  uni.navigateTo({
    url: "/pages/discover/search"
  });
};

const openMyProfile = () => {
  uni.navigateTo({
    url: "/pages/more/profile"
  });
};

const loadCurrentAvatar = async () => {
  const override = getProfileOverride(state.userId);
  if (override.avatarUrl) {
    currentAvatar.value = override.avatarUrl;
    return;
  }
  try {
    const me = await mobileApi.auth.me();
    currentAvatar.value = me.data.user.avatar_url ?? "";
  } catch {
    currentAvatar.value = "";
  }
};

onLoad(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight ?? 0;
  loadPosts();
  loadCurrentAvatar();
});

onShow(loadCurrentAvatar);
onPullDownRefresh(refresh);
onReachBottom(loadMore);
</script>

<template>
  <view class="page">
    <view class="top-actions" :style="customTopStyle">
      <view class="profile-entry" @click="openMyProfile">
        <image
          v-if="currentAvatar"
          class="profile-entry-avatar"
          :src="currentAvatar"
          mode="aspectFill"
        />
        <view v-else class="profile-entry-avatar fallback">我</view>
      </view>
      <button class="search-icon-button" :aria-label="copy.searchIconLabel" @click="openSearch">
        ⌕
      </button>
    </view>

    <SectionPanel :title="copy.feedTitle" :subtitle="copy.feedSubtitle">
      <view class="actions">
        <button class="primary" @click="openCreate">{{ copy.createPost }}</button>
      </view>

      <AsyncStateCard v-if="isLoading && !posts.length" variant="loading" :text="copy.loading" />
      <view v-else-if="errorMessage" class="status-block">
        <AsyncStateCard variant="error" :text="errorMessage" />
        <button class="retry" @click="loadPosts(1)">{{ copy.retry }}</button>
      </view>
      <AsyncStateCard
        v-else-if="posts.length === 0"
        variant="empty"
        :text="copy.empty"
      />
      <view v-else class="feed">
        <view class="waterfall">
          <view
            v-for="(column, colIndex) in [leftColumn, rightColumn]"
            :key="colIndex"
            class="wf-col"
          >
            <view
              v-for="post in column"
              :key="post._id"
              class="wf-card"
              @click="openDetail(post._id)"
            >
              <image
                v-if="getCoverImage(post)"
                class="wf-image"
                :src="getCoverImage(post)"
                mode="widthFix"
              />
              <view v-else-if="isVideoPost(post)" class="wf-video-wrap">
                <video
                  class="wf-video"
                  :src="getVideoUrl(post)"
                  :controls="false"
                  :show-center-play-btn="false"
                  :show-play-btn="false"
                  :show-fullscreen-btn="false"
                  :enable-progress-gesture="false"
                  object-fit="cover"
                />
                <view class="card-play">▶</view>
              </view>
              <view v-else class="wf-text">
                <text class="text-cover-quote">“</text>
                <text class="wf-text-body">{{ getExcerpt(post) }}</text>
              </view>
              <view class="wf-title">{{ post.title }}</view>
              <view class="wf-foot">
                <text class="wf-loc">{{ post.location_text || copy.locationFallback }}</text>
                <text class="wf-lang">{{ getLanguageLabel(post.language) }}</text>
              </view>
            </view>
          </view>
        </view>

        <button
          v-if="hasMore"
          class="load-more"
          :disabled="isLoadingMore"
          @click="loadMore"
        >
          {{ isLoadingMore ? copy.loadingMore : copy.loadMore }}
        </button>
        <view v-else class="no-more">{{ copy.noMore }}</view>
      </view>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
  min-height: 100vh;
  background: #f8fafc;
}

.top-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16rpx;
  margin: -12rpx 0 12rpx;
}

.profile-entry {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.08);
}

.profile-entry-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #cbd5e1;
}

.profile-entry-avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: #0f766e;
  font-size: 30rpx;
  font-weight: 700;
}

.search-icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #ffffff;
  color: #111827;
  font-size: 42rpx;
  line-height: 72rpx;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.08);
}

.actions {
  margin-bottom: 20rpx;
}

.primary,
.retry,
.load-more {
  border-radius: 10rpx;
  font-size: 26rpx;
}

.primary {
  background: #1d4ed8;
  color: white;
}

.status-block {
  display: grid;
  gap: 16rpx;
}

.retry {
  background: #fff1f0;
  color: #c41d7f;
}

.feed {
  display: block;
}

.waterfall {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.wf-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.wf-card {
  overflow: hidden;
  border-radius: 18rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(15, 23, 42, 0.06);
}

.wf-image {
  width: 100%;
  display: block;
  background: #e2e8f0;
}

.wf-video-wrap {
  position: relative;
  width: 100%;
  height: 300rpx;
  background: #000000;
}

.wf-video {
  width: 100%;
  height: 100%;
}

.wf-text {
  position: relative;
  padding: 30rpx 22rpx 10rpx;
  background: linear-gradient(135deg, #ecfdf5, #f0fdfa);
}

.text-cover-quote {
  position: absolute;
  top: 6rpx;
  left: 14rpx;
  color: rgba(15, 118, 110, 0.25);
  font-size: 72rpx;
  font-weight: 700;
  line-height: 1;
}

.wf-text-body {
  position: relative;
  z-index: 1;
  color: #334155;
  font-size: 27rpx;
  line-height: 1.55;
}

.card-play {
  position: absolute;
  top: 12rpx;
  right: 14rpx;
  color: #ffffff;
  font-size: 26rpx;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.5);
}

.wf-title {
  padding: 16rpx 18rpx 6rpx;
  color: #111827;
  font-size: 27rpx;
  line-height: 1.45;
  font-weight: 600;
}

.wf-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  padding: 4rpx 18rpx 18rpx;
}

.wf-loc {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #94a3b8;
  font-size: 22rpx;
}

.wf-lang {
  flex-shrink: 0;
  color: #0f766e;
  font-size: 22rpx;
}

.card {
  overflow: hidden;
  border: 1rpx solid #e5e7eb;
  border-radius: 18rpx;
  background: #ffffff;
}

.media-frame {
  position: relative;
  overflow: hidden;
  background: #e2e8f0;
}

.cover,
.video-cover,
.video-preview {
  width: 100%;
  height: 260rpx;
  background: #e2e8f0;
}

.video-preview {
  position: relative;
  overflow: hidden;
  background: #111827;
}

.video-cover {
  opacity: 0.72;
}

.video-overlay {
  position: absolute;
  left: 24rpx;
  bottom: 22rpx;
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(17, 24, 39, 0.72);
  color: #ffffff;
  font-size: 24rpx;
}

.play-mark {
  font-size: 22rpx;
}

.media-badge,
.text-only-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.media-badge {
  position: absolute;
  top: 18rpx;
  right: 18rpx;
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #111827;
}

.text-only-badge {
  margin: 22rpx 24rpx 0;
  padding: 6rpx 14rpx;
  background: #f3f4f6;
  color: #64748b;
}

.card-body {
  padding: 24rpx;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.card-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
  color: #111827;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.language,
.tag {
  display: inline-flex;
  align-items: center;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.language {
  padding: 6rpx 12rpx;
  background: #fff7e6;
  color: #ad5a00;
}

.card-text {
  margin-top: 14rpx;
  color: #6b7280;
  line-height: 1.6;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 14rpx;
}

.meta {
  color: #64748b;
  font-size: 24rpx;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 16rpx;
}

.tag {
  padding: 6rpx 14rpx;
  background: #e6f4ff;
  color: #0052d9;
}

.tag.more {
  background: #f3f4f6;
  color: #64748b;
}

.load-more {
  margin-top: 6rpx;
  background: #e6f4ff;
  color: #0052d9;
}

.no-more {
  padding: 20rpx 0 4rpx;
  text-align: center;
  color: #94a3b8;
  font-size: 24rpx;
}
</style>
