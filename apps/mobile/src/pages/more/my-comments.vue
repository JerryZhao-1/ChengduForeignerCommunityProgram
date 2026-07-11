<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
import type { Comment } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { getMobileCopy } from "@/i18n";
import { useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).discover);
const comments = ref<Comment[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");

const statusLabel = (comment: Comment) => {
  const labels: Record<Comment["status"], string> = {
    visible: copy.value.statusVisible,
    reported: copy.value.statusReported,
    hidden: copy.value.statusHidden,
    deleted: copy.value.statusDeleted
  };
  return labels[comment.status];
};

const loadComments = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const result = await mobileApi.discover.myComments({ pageSize: 50 });
    comments.value = result.data.items;
  } catch {
    comments.value = [];
    errorMessage.value = copy.value.myCommentsError;
  } finally {
    isLoading.value = false;
    uni.stopPullDownRefresh();
  }
};

const openComment = (id: string) => {
  uni.navigateTo({ url: `/pages/more/my-comment-detail?id=${id}` });
};

onLoad(loadComments);
onPullDownRefresh(loadComments);
</script>

<template>
  <view class="page">
    <view class="title">{{ copy.myCommentsTitle }}</view>
    <AsyncStateCard
      v-if="isLoading"
      variant="loading"
      :text="copy.myCommentsLoading"
    />
    <view v-else-if="errorMessage" class="status-block">
      <AsyncStateCard variant="error" :text="errorMessage" />
      <button class="retry" @click="loadComments">{{ copy.retry }}</button>
    </view>
    <AsyncStateCard
      v-else-if="comments.length === 0"
      variant="empty"
      :text="copy.myCommentsEmpty"
    />

    <view v-else class="list">
      <view
        v-for="comment in comments"
        :key="comment._id"
        class="card"
        @click="openComment(comment._id)"
      >
        <view class="row">
          <view class="content">{{ comment.content }}</view>
          <text class="status">{{ statusLabel(comment) }}</text>
        </view>
        <view class="meta">
          <text>{{ comment.created_at.slice(0, 10) }}</text>
          <text>{{ comment.post_id }}</text>
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
  padding: 20rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 14rpx;
  background: #ffffff;
}

.row {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
}

.content {
  flex: 1;
  min-width: 0;
  color: #111827;
  font-size: 28rpx;
  line-height: 1.5;
}

.status {
  flex-shrink: 0;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  background: #f3f4f6;
  color: #374151;
  font-size: 22rpx;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 12rpx;
  color: #64748b;
  font-size: 24rpx;
}
</style>
