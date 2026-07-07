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
const hasLoaded = ref(false);

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

onLoad(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight ?? 0;
  loadPosts().finally(() => {
    hasLoaded.value = true;
  });
});

onShow(() => {
  if (hasLoaded.value) {
    page.value = 1;
    loadPosts(1);
  }
});

onPullDownRefresh(refresh);
onReachBottom(loadMore);
</script>

<template>
  <view class="page">
    <view class="top-actions" :style="customTopStyle">
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
        <view
          v-for="post in posts"
          :key="post._id"
          class="card"
          @click="openDetail(post._id)"
        >
          <view v-if="getFirstMedia(post)" class="media-frame">
            <image
              v-if="getFirstMedia(post)?.kind === 'image'"
              class="cover"
              :src="getFirstMedia(post)?.url"
              mode="aspectFill"
            />
            <view v-else class="video-preview">
              <video
                class="video-cover"
                :src="getFirstMedia(post)?.url"
                :controls="false"
                :show-center-play-btn="false"
                :show-play-btn="false"
                :show-fullscreen-btn="false"
                :enable-progress-gesture="false"
              />
              <view class="video-overlay">
                <text class="play-mark">▶</text>
                <text>{{ copy.videoBadge }}</text>
              </view>
            </view>
            <view class="media-badge">
              <text v-if="getFirstMedia(post)?.kind === 'video'">{{ copy.videoBadge }}</text>
              <text v-else-if="post.image_urls.length > 1">
                {{ copy.multiImageBadge }} {{ post.image_urls.length }}
              </text>
              <text v-else>1 {{ copy.imageCount }}</text>
            </view>
          </view>
          <view v-else class="text-only-badge">{{ copy.textOnlyBadge }}</view>
          <view class="card-body">
            <view class="card-top">
              <view class="card-title">{{ post.title }}</view>
              <text class="language">{{ getLanguageLabel(post.language) }}</text>
            </view>
            <view class="card-text">{{ summarize(post.content) }}</view>
            <view class="meta-row">
              <text class="meta">{{ post.author_display.nickname }}</text>
              <text class="meta">{{ post.created_at.slice(0, 10) }}</text>
              <text class="meta">{{ post.location_text || copy.locationFallback }}</text>
              <text class="meta">{{ post.comment_count }} {{ copy.commentSectionTitle }}</text>
              <text class="meta">{{ post.like_count }} ♥</text>
              <text v-if="getMediaMeta(post)" class="meta">
                {{ getMediaMeta(post) }}
              </text>
            </view>
            <view v-if="post.tag_ids.length" class="tags">
              <text v-for="tag in getVisibleTags(post)" :key="tag" class="tag">#{{ tag }}</text>
              <text v-if="getHiddenTagCount(post)" class="tag more">
                +{{ getHiddenTagCount(post) }} {{ copy.moreTags }}
              </text>
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
  justify-content: flex-start;
  margin: -12rpx 0 12rpx;
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
  display: grid;
  gap: 18rpx;
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
