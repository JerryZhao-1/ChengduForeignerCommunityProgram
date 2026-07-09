<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
import { ApiClientError, type Post } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";
import { getFirstMedia } from "@/pages/discover/media";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].discover);
const posts = ref<Post[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");

const statusLabel = (post: Post) => {
  const labels: Record<Post["status"], string> = {
    visible: copy.value.statusVisible,
    reported: copy.value.statusReported,
    hidden: copy.value.statusHidden,
    deleted: copy.value.statusDeleted
  };
  return labels[post.review_status === "reported" ? "reported" : post.status];
};

const canOpenPublicDetail = (post: Post) =>
  post.status === "visible" &&
  !["hidden", "deleted"].includes(post.review_status);

const loadPosts = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await mobileApi.discover.myLikedPosts({
      communityId: state.communityId,
      page: 1,
      pageSize: 50
    });
    posts.value = result.data.items;
  } catch (error) {
    posts.value = [];
    errorMessage.value =
      error instanceof ApiClientError &&
      (error.status === 401 || error.status === 403)
        ? copy.value.myInteractionAuthError
        : copy.value.myLikedError;
  } finally {
    isLoading.value = false;
    uni.stopPullDownRefresh();
  }
};

const openPost = (post: Post) => {
  if (!canOpenPublicDetail(post)) {
    uni.showToast({
      title: statusLabel(post),
      icon: "none"
    });
    return;
  }

  uni.navigateTo({
    url: `/pages/discover/detail?id=${post._id}`
  });
};

onLoad(loadPosts);
onPullDownRefresh(loadPosts);
</script>

<template>
  <view class="page">
    <view class="title">{{ copy.myLikedTitle }}</view>

    <AsyncStateCard
      v-if="isLoading"
      variant="loading"
      :text="copy.myLikedLoading"
    />
    <view v-else-if="errorMessage" class="status-block">
      <AsyncStateCard variant="error" :text="errorMessage" />
      <button class="retry" @click="loadPosts">{{ copy.retry }}</button>
    </view>
    <AsyncStateCard
      v-else-if="posts.length === 0"
      variant="empty"
      :text="copy.myLikedEmpty"
    />

    <view v-else class="list">
      <view
        v-for="post in posts"
        :key="post._id"
        class="card"
        :class="{ disabled: !canOpenPublicDetail(post) }"
        @click="openPost(post)"
      >
        <image
          v-if="getFirstMedia(post)?.kind === 'image'"
          class="thumb"
          :src="getFirstMedia(post)?.url"
          mode="aspectFill"
        />
        <view
          v-else-if="getFirstMedia(post)?.kind === 'video'"
          class="thumb video"
        >
          {{ copy.videoBadge }}
        </view>
        <view v-else class="thumb text">{{ copy.textOnlyBadge }}</view>
        <view class="body">
          <view class="row">
            <view class="post-title">{{ post.title }}</view>
            <text class="status">{{ statusLabel(post) }}</text>
          </view>
          <view class="content">{{ post.content }}</view>
          <view class="meta">
            <text>{{ post.comment_count }} {{ copy.commentSectionTitle }}</text>
            <text>{{ post.like_count }} ♥</text>
            <text>{{ post.favorite_count }} ★</text>
            <text>{{ post.created_at.slice(0, 10) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f8fafc;
}

.title {
  margin-bottom: 22rpx;
  color: #111827;
  font-size: 36rpx;
  font-weight: 700;
}

.status-block,
.list {
  display: grid;
  gap: 16rpx;
}

.retry {
  border-radius: 10rpx;
  background: #fff1f0;
  color: #c41d7f;
  font-size: 26rpx;
}

.card {
  display: flex;
  gap: 18rpx;
  padding: 18rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 14rpx;
  background: #ffffff;
}

.card.disabled {
  opacity: 0.78;
}

.thumb {
  flex-shrink: 0;
  width: 140rpx;
  height: 140rpx;
  border-radius: 10rpx;
  background: #e2e8f0;
}

.thumb.video,
.thumb.text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 24rpx;
}

.thumb.video {
  background: #111827;
  color: #ffffff;
}

.body {
  flex: 1;
  min-width: 0;
}

.row {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
}

.post-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  flex-shrink: 0;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  background: #f3f4f6;
  color: #374151;
  font-size: 22rpx;
}

.content {
  display: -webkit-box;
  margin-top: 10rpx;
  overflow: hidden;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 12rpx;
  color: #64748b;
  font-size: 22rpx;
}
</style>
