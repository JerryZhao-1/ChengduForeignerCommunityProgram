<script setup lang="ts">
import type { FeedbackItem } from "@community-map/shared";
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";

const content = ref("");
const feedback = ref<FeedbackItem[]>([]);
const submitting = ref(false);

const load = async () => {
  const result = await mobileApi.feedback.listMine();
  feedback.value = result.data;
};

const submit = async () => {
  const value = content.value.trim();

  if (!value) {
    uni.showToast({ title: "请输入想吐槽的内容", icon: "none" });
    return;
  }

  submitting.value = true;

  try {
    await mobileApi.feedback.create({ content: value });
    content.value = "";
    await load();
    uni.showToast({ title: "已收到反馈", icon: "success" });
  } finally {
    submitting.value = false;
  }
};

onShow(load);
</script>

<template>
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="card">
        <text class="title">问题反馈</text>
        <text class="desc">可以在这里发送槽点进行吐槽，开发者们会尽量修整。</text>
        <textarea
          v-model="content"
          class="textarea"
          placeholder="写下你遇到的问题或建议"
          maxlength="500"
        />
        <button class="primary" :loading="submitting" @click="submit">提交反馈</button>
      </view>

      <view class="card">
        <text class="title">我的反馈</text>
        <text v-if="!feedback.length" class="empty">暂无反馈</text>
        <view v-for="item in feedback" :key="item._id" class="feedback-item">
          <text class="feedback-content">{{ item.content }}</text>
          <text class="feedback-meta">{{ item.status === "submitted" ? "已提交" : "已处理" }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.page-scroll {
  min-height: 100vh;
  background: #0b0b0d;
}

.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background: #0b0b0d;
}

.card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #1c1c1e;
}

.title,
.desc,
.empty,
.feedback-content,
.feedback-meta {
  display: block;
}

.title {
  color: #f9fafb;
  font-size: 32rpx;
  font-weight: 700;
}

.desc,
.empty,
.feedback-meta {
  margin-top: 10rpx;
  color: #8b9098;
  font-size: 24rpx;
  line-height: 1.5;
}

.textarea {
  width: 100%;
  min-height: 220rpx;
  margin-top: 22rpx;
  padding: 18rpx;
  border-radius: 16rpx;
  box-sizing: border-box;
  background: #111113;
  color: #f9fafb;
  font-size: 26rpx;
}

.primary {
  margin-top: 18rpx;
  border-radius: 999rpx;
  background: #0f766e;
  color: #ffffff;
}

.feedback-item {
  padding: 18rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
}

.feedback-content {
  color: #f3f4f6;
  font-size: 26rpx;
  line-height: 1.5;
}
</style>
