<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { Comment } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { getMobileCopy } from "@/i18n";
import { useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).discover);
const comment = ref<Comment | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

const statusLabel = computed(() => {
  if (!comment.value) {
    return "";
  }
  const labels: Record<Comment["status"], string> = {
    visible: copy.value.statusVisible,
    reported: copy.value.statusReported,
    hidden: copy.value.statusHidden,
    deleted: copy.value.statusDeleted
  };
  return labels[comment.value.status];
});

const loadComment = async (id: string) => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const result = await mobileApi.discover.myCommentDetail(id);
    comment.value = result.data;
  } catch {
    comment.value = null;
    errorMessage.value = copy.value.myCommentsError;
  } finally {
    isLoading.value = false;
  }
};

const openPost = () => {
  if (!comment.value) {
    return;
  }
  uni.navigateTo({ url: `/pages/discover/detail?id=${comment.value.post_id}` });
};

onLoad((query) => {
  const id = String(query?.id ?? "").trim();
  if (id) {
    void loadComment(id);
    return;
  }
  isLoading.value = false;
  errorMessage.value = copy.value.detailMissing;
});
</script>

<template>
  <view class="page">
    <view class="title">{{ copy.myCommentDetailTitle }}</view>
    <AsyncStateCard v-if="isLoading" variant="loading" :text="copy.loading" />
    <AsyncStateCard v-else-if="errorMessage" variant="error" :text="errorMessage" />

    <view v-else-if="comment" class="card">
      <view class="status">{{ statusLabel }}</view>
      <view class="content">{{ comment.content }}</view>
      <view class="meta">
        <text>{{ comment.created_at }}</text>
        <text>{{ comment.post_id }}</text>
      </view>
      <button class="primary" @click="openPost">{{ copy.openPost }}</button>
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

.card {
  display: grid;
  gap: 18rpx;
  padding: 24rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 14rpx;
  background: #ffffff;
}

.status {
  justify-self: flex-start;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  background: #f3f4f6;
  color: #374151;
  font-size: 24rpx;
}

.content {
  color: #111827;
  font-size: 30rpx;
  line-height: 1.6;
  white-space: pre-wrap;
}

.meta {
  display: grid;
  gap: 8rpx;
  color: #64748b;
  font-size: 24rpx;
}

.primary {
  margin: 0;
  border-radius: 10rpx;
  background: #0f766e;
  color: #ffffff;
  font-size: 26rpx;
}
</style>
