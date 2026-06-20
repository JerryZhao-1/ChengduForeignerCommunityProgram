<script setup lang="ts">
const openPage = (url: string) => {
  uni.navigateTo({ url });
};

const logout = () => {
  uni.showToast({ title: "Mock 登录暂不支持退出", icon: "none" });
};
</script>

<template>
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="group-title">账号</view>
      <view class="section">
        <view class="setting-row" @click="openPage('/pages/more/account-security')">
          <text class="row-label">账号与安全</text>
          <text class="row-arrow">›</text>
        </view>
        <view class="setting-row" @click="openPage('/pages/more/block-list')">
          <text class="row-label">屏蔽列表</text>
          <text class="row-arrow">›</text>
        </view>
        <view class="setting-row" @click="openPage('/pages/more/privacy-settings')">
          <text class="row-label">隐私设置</text>
          <text class="row-arrow">›</text>
        </view>
      </view>

      <view class="group-title">通用</view>
      <view class="section">
        <view class="setting-row" @click="openPage('/pages/more/push-settings')">
          <text class="row-label">推送设置</text>
          <text class="row-arrow">›</text>
        </view>
      </view>

      <view class="group-title">关于</view>
      <view class="section">
        <view class="setting-row" @click="openPage('/pages/more/feedback')">
          <text class="row-label">问题反馈</text>
          <text class="row-arrow">›</text>
        </view>
        <view class="setting-row" @click="openPage('/pages/more/information-collection')">
          <text class="row-label">信息收集清单</text>
          <text class="row-arrow">›</text>
        </view>
        <view class="setting-row">
          <text class="row-label">关于我们</text>
          <text class="row-arrow">›</text>
        </view>
      </view>

      <button class="logout-button" @click="logout">退出登录</button>
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

.row-arrow {
  color: #6b7280;
  font-size: 42rpx;
  line-height: 1;
}

.logout-button {
  margin: 28rpx 0 0;
  height: 84rpx;
  border-radius: 0;
  background: #1c1c1e;
  color: #f3f4f6;
  font-size: 28rpx;
  line-height: 84rpx;
}

.logout-button::after {
  border: 0;
}
</style>
