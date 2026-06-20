<script setup lang="ts">
import type { User } from "@community-map/shared";
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";

const users = ref<User[]>([]);
const loading = ref(false);

const load = async () => {
  loading.value = true;

  try {
    const result = await mobileApi.profile.blockedUsers();
    users.value = result.data;
  } finally {
    loading.value = false;
  }
};

const unblock = async (user: User) => {
  await mobileApi.profile.toggleBlock(user._id);
  users.value = users.value.filter((item) => item._id !== user._id);
  uni.showToast({ title: `已解除屏蔽 ${user.nickname}`, icon: "none" });
};

onShow(load);
</script>

<template>
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="group-title">已屏蔽用户</view>
      <view class="section">
        <view v-if="loading" class="state-text">加载中...</view>
        <view v-else-if="!users.length" class="state-text">暂无屏蔽用户</view>
        <view
          v-else
          v-for="user in users"
          :key="user._id"
          class="setting-row"
          @click="unblock(user)"
        >
          <text class="row-label">{{ user.nickname }}</text>
          <text class="block-icon">🚫</text>
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
  padding: 20rpx 0 48rpx;
  box-sizing: border-box;
  background: #0b0b0d;
  color: #f9fafb;
}

.group-title {
  padding: 20rpx 24rpx 12rpx;
  color: #7a7f87;
  font-size: 24rpx;
}

.section {
  background: #1c1c1e;
}

.setting-row {
  display: flex;
  align-items: center;
  min-height: 92rpx;
  padding: 0 24rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
  box-sizing: border-box;
}

.setting-row:active {
  background: rgba(255, 255, 255, 0.06);
}

.row-label {
  flex: 1;
  color: #f3f4f6;
  font-size: 28rpx;
}

.block-icon {
  font-size: 30rpx;
}

.state-text {
  padding: 48rpx 24rpx;
  color: #8b9098;
  font-size: 26rpx;
}
</style>
