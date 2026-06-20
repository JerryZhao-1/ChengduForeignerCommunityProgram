<script setup lang="ts">
import type { PlaceSubmission } from "@community-map/shared";
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";

const submissions = ref<PlaceSubmission[]>([]);
const loading = ref(false);

const statusText = (status: PlaceSubmission["status"]) => {
  if (status === "approved") {
    return "已通过";
  }

  if (status === "rejected") {
    return "未通过";
  }

  return "待审核";
};

const load = async () => {
  loading.value = true;

  try {
    const result = await mobileApi.placeSubmissions.listMine();
    submissions.value = result.data;
  } finally {
    loading.value = false;
  }
};

onShow(load);
</script>

<template>
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="intro-card">
        <text class="title">信息收集清单</text>
        <text class="desc">这里展示你向社区工作人员提供的店铺照片和补充信息。</text>
      </view>

      <view v-if="loading" class="state-text">加载中...</view>
      <view v-else-if="!submissions.length" class="state-text">暂无提交记录</view>

      <template v-else>
        <view v-for="item in submissions" :key="item._id" class="submission-card">
          <view class="card-top">
            <text class="submission-title">{{ item.name }}</text>
            <text class="status">{{ statusText(item.status) }}</text>
          </view>
          <text class="meta">{{ item.address }}</text>
          <text v-if="item.note" class="meta">备注：{{ item.note }}</text>
          <scroll-view v-if="item.photo_urls.length" scroll-x class="photo-row">
            <image
              v-for="url in item.photo_urls"
              :key="url"
              class="photo"
              :src="url"
              mode="aspectFill"
            />
          </scroll-view>
        </view>
      </template>
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

.intro-card,
.submission-card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: #1c1c1e;
}

.title,
.desc,
.submission-title,
.meta,
.state-text {
  display: block;
}

.title {
  color: #f9fafb;
  font-size: 32rpx;
  font-weight: 700;
}

.desc,
.meta,
.state-text {
  margin-top: 10rpx;
  color: #8b9098;
  font-size: 24rpx;
  line-height: 1.5;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.submission-title {
  flex: 1;
  color: #f9fafb;
  font-size: 30rpx;
  font-weight: 700;
}

.status {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #134e4a;
  color: #ccfbf1;
  font-size: 22rpx;
}

.photo-row {
  margin-top: 16rpx;
  white-space: nowrap;
}

.photo {
  display: inline-block;
  width: 160rpx;
  height: 120rpx;
  margin-right: 12rpx;
  border-radius: 14rpx;
  background: #111827;
}
</style>
