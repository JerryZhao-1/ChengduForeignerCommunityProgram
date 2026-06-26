<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { Post } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";
import {
  getFirstMedia,
  getHiddenTagCount,
  getMediaSummary,
  getVisibleTags
} from "./media";

const SEARCH_HISTORY_KEY = "discover-search-history-v1";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].discover);
const keyword = ref("");
const history = ref<string[]>([]);
const results = ref<Post[]>([]);
const isSearching = ref(false);
const hasSearched = ref(false);
const errorMessage = ref("");
const statusBarHeight = ref(0);

const customNavStyle = computed(() => ({
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

const readHistory = () => {
  const stored = uni.getStorageSync(SEARCH_HISTORY_KEY);
  history.value = Array.isArray(stored)
    ? stored.filter((item): item is string => typeof item === "string")
    : [];
};

const writeHistory = (items: string[]) => {
  history.value = items.slice(0, 10);
  uni.setStorageSync(SEARCH_HISTORY_KEY, history.value);
};

const rememberKeyword = (value: string) => {
  const next = [value, ...history.value.filter((item) => item !== value)];
  writeHistory(next);
};

const goBack = () => {
  uni.navigateBack({ delta: 1 });
};

const search = async (value = keyword.value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    uni.showToast({ title: copy.value.searchRequired, icon: "none" });
    return;
  }

  keyword.value = trimmed;
  rememberKeyword(trimmed);
  hasSearched.value = true;
  isSearching.value = true;
  errorMessage.value = "";

  try {
    const result = await mobileApi.discover.listPosts({
      communityId: state.communityId,
      keyword: trimmed,
      page: 1,
      pageSize: 20
    });
    results.value = result.data.items;
  } catch {
    results.value = [];
    errorMessage.value = copy.value.searchError;
  } finally {
    isSearching.value = false;
  }
};

const selectHistory = (item: string) => {
  search(item);
};

const removeHistory = (item: string) => {
  writeHistory(history.value.filter((historyItem) => historyItem !== item));
};

const clearHistory = () => {
  writeHistory([]);
};

const openDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/discover/detail?id=${id}`
  });
};

onLoad(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight ?? 0;
  readHistory();
});
</script>

<template>
  <view class="page">
    <view class="custom-nav" :style="customNavStyle">
      <view class="nav-content">
        <view class="nav-back" @click.stop="goBack">‹</view>
        <button class="search-submit" :disabled="isSearching" @click="search()">
          {{ copy.search }}
        </button>
        <view class="search-field">
          <text class="search-mark">⌕</text>
          <input
            v-model="keyword"
            class="input"
            :placeholder="copy.searchPlaceholder"
            confirm-type="search"
            focus
            @confirm="search()"
          />
        </view>
      </view>
    </view>

    <view class="body">
      <view v-if="!hasSearched" class="history-panel">
        <view class="section-heading">
          <view class="section-title">{{ copy.searchHistoryTitle }}</view>
          <button v-if="history.length" class="clear-history" @click="clearHistory">
            {{ copy.searchHistoryClear }}
          </button>
        </view>

        <view v-if="history.length" class="history-list">
          <view v-for="item in history" :key="item" class="history-item">
            <view class="history-text" @click="selectHistory(item)">{{ item }}</view>
            <button class="history-remove" @click="removeHistory(item)">×</button>
          </view>
        </view>
        <view v-else class="empty-history">{{ copy.searchHistoryEmpty }}</view>
      </view>

      <AsyncStateCard v-if="isSearching" variant="loading" :text="copy.searching" />
      <view v-else-if="errorMessage" class="status-block">
        <AsyncStateCard variant="error" :text="errorMessage" />
        <button class="retry" @click="search()">{{ copy.retry }}</button>
      </view>
      <AsyncStateCard
        v-else-if="hasSearched && results.length === 0"
        variant="empty"
        :text="copy.searchEmpty"
      />

      <view v-else-if="hasSearched" class="feed">
        <view
          v-for="post in results"
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
              <text class="meta">{{ post.location_text || copy.locationFallback }}</text>
              <text v-if="getMediaMeta(post)" class="meta">{{ getMediaMeta(post) }}</text>
            </view>
            <view v-if="post.tag_ids.length" class="tags">
              <text v-for="tag in getVisibleTags(post)" :key="tag" class="tag">#{{ tag }}</text>
              <text v-if="getHiddenTagCount(post)" class="tag more">
                +{{ getHiddenTagCount(post) }} {{ copy.moreTags }}
              </text>
            </view>
          </view>
        </view>
      </view>
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
  gap: 14rpx;
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

.search-field {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 10rpx;
  min-height: 72rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
}

.search-mark {
  color: #64748b;
  font-size: 30rpx;
}

.input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  color: #111827;
  font-size: 26rpx;
}

.search-submit {
  flex-shrink: 0;
  margin: 0;
  padding: 0 18rpx;
  min-height: 60rpx;
  line-height: 60rpx;
  border-radius: 999rpx;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 24rpx;
}

.search-submit[disabled] {
  opacity: 0.7;
}

.body {
  padding: 24rpx;
}

.history-panel {
  padding: 28rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 18rpx;
  background: #ffffff;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 18rpx;
}

.section-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.clear-history,
.history-remove,
.retry {
  border-radius: 10rpx;
  font-size: 24rpx;
}

.clear-history {
  margin: 0;
  padding: 0 16rpx;
  min-height: 48rpx;
  line-height: 48rpx;
  background: #f3f4f6;
  color: #64748b;
}

.history-list {
  display: grid;
  gap: 14rpx;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 18rpx 20rpx;
  border-radius: 14rpx;
  background: #f9fafb;
}

.history-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #111827;
  font-size: 26rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-remove {
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  width: 44rpx;
  height: 44rpx;
  line-height: 40rpx;
  background: #eef2f7;
  color: #64748b;
}

.empty-history {
  padding: 22rpx;
  border-radius: 12rpx;
  background: #f9fafb;
  color: #64748b;
  font-size: 24rpx;
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
  display: -webkit-box;
  overflow: hidden;
  color: #111827;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 1.35;
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
  display: -webkit-box;
  overflow: hidden;
  margin-top: 14rpx;
  color: #6b7280;
  line-height: 1.6;
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
</style>
