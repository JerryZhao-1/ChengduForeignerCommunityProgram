<script setup lang="ts">
import { EVENT_CONTACT_PHONE_PATTERN } from "@community-map/shared";
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";

const phone = ref("");
const loading = ref(false);

const phoneDisplay = computed(() =>
  EVENT_CONTACT_PHONE_PATTERN.test(phone.value) ? phone.value : "未设置"
);

const load = async () => {
  loading.value = true;

  try {
    const result = await mobileApi.auth.me();
    phone.value = result.data.user.phone ?? "";
  } finally {
    loading.value = false;
  }
};

const showPasswordNotice = () => {
  uni.showToast({ title: "Mock 登录暂不支持修改密码", icon: "none" });
};

const showDeleteNotice = () => {
  uni.showToast({ title: "Mock 登录暂不支持注销账号", icon: "none" });
};

onShow(load);
</script>

<template>
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="group-title">账号</view>
      <view class="section">
        <view class="setting-row">
          <text class="row-label">手机号</text>
          <text class="row-value">{{ loading ? "加载中..." : phoneDisplay }}</text>
          <text class="row-arrow">›</text>
        </view>

        <view class="setting-row" @click="showPasswordNotice">
          <text class="row-label">登录密码</text>
          <text class="row-value">Mock 登录</text>
          <text class="row-arrow">›</text>
        </view>

        <view class="setting-row danger" @click="showDeleteNotice">
          <text class="row-label">注销账号</text>
          <text class="row-arrow">›</text>
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

.danger .row-label {
  color: #f87171;
}

.row-value {
  max-width: 360rpx;
  overflow: hidden;
  color: #8b9098;
  font-size: 26rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-arrow {
  margin-left: 12rpx;
  color: #6b7280;
  font-size: 42rpx;
  line-height: 1;
}
</style>
