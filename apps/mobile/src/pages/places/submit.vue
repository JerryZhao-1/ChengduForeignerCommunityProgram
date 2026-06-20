<script setup lang="ts">
import { ref } from "vue";

import { mobileApi } from "@/api/client";

const submitting = ref(false);
const form = ref({
  name: "",
  address: "",
  photoUrls: "",
  note: ""
});

const submit = async () => {
  const name = form.value.name.trim();
  const address = form.value.address.trim();
  const photoUrls = form.value.photoUrls
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const note = form.value.note.trim();

  if (!name || !address) {
    uni.showToast({ title: "请填写店铺名称和地址", icon: "none" });
    return;
  }

  submitting.value = true;

  try {
    await mobileApi.placeSubmissions.create({
      name,
      address,
      photo_urls: photoUrls,
      note
    });
    uni.showToast({ title: "提交成功，获得20积分", icon: "success" });
    setTimeout(() => {
      uni.redirectTo({ url: "/pages/more/information-collection" });
    }, 500);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="card">
        <text class="title">提交地点信息</text>
        <text class="desc">上传店铺照片和补充信息，社区工作人员审核后会加入 Places 地标。</text>

        <view class="field">
          <text class="label">店铺名称</text>
          <input v-model="form.name" class="input" placeholder="例如：桐梓林社区中心" />
        </view>

        <view class="field">
          <text class="label">地址或位置描述</text>
          <input v-model="form.address" class="input" placeholder="请输入地址或附近地标" />
        </view>

        <view class="field">
          <text class="label">照片 URL</text>
          <textarea
            v-model="form.photoUrls"
            class="textarea"
            placeholder="mock 阶段每行填写一个图片 URL，也可以先留空"
          />
        </view>

        <view class="field">
          <text class="label">备注</text>
          <textarea
            v-model="form.note"
            class="textarea"
            placeholder="补充营业时间、推荐理由或方便 admin 审核的信息"
          />
        </view>

        <view class="reward-card">
          <text class="reward-title">积分奖励</text>
          <text class="reward-text">提交信息 +20，通过审核后额外 +30。</text>
        </view>

        <button class="primary" :loading="submitting" @click="submit">提交信息</button>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.page-scroll {
  min-height: 100vh;
  background: #f8fafc;
}

.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background: #f8fafc;
}

.card {
  padding: 28rpx;
  border-radius: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e5e7eb;
}

.title,
.desc,
.label,
.reward-title,
.reward-text {
  display: block;
}

.title {
  color: #111827;
  font-size: 34rpx;
  font-weight: 700;
}

.desc {
  margin-top: 10rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 1.5;
}

.field {
  margin-top: 24rpx;
}

.label {
  margin-bottom: 10rpx;
  color: #374151;
  font-size: 24rpx;
  font-weight: 600;
}

.input,
.textarea {
  width: 100%;
  padding: 0 20rpx;
  border-radius: 14rpx;
  box-sizing: border-box;
  background: #f3f4f6;
  color: #111827;
  font-size: 26rpx;
}

.input {
  height: 78rpx;
}

.textarea {
  min-height: 160rpx;
  padding-top: 18rpx;
}

.reward-card {
  margin-top: 24rpx;
  padding: 20rpx;
  border-radius: 18rpx;
  background: #ecfdf5;
}

.reward-title {
  color: #047857;
  font-size: 26rpx;
  font-weight: 700;
}

.reward-text {
  margin-top: 8rpx;
  color: #065f46;
  font-size: 24rpx;
}

.primary {
  margin-top: 24rpx;
  border-radius: 999rpx;
  background: #0f766e;
  color: #ffffff;
}
</style>
