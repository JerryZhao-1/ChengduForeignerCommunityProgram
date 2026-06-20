<script setup lang="ts">
import type { UserPrivacySettings } from "@community-map/shared";
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";

const settings = ref<UserPrivacySettings | null>(null);

const load = async () => {
  const result = await mobileApi.profile.privacy();
  settings.value = result.data;
};

const update = async (
  key: "show_favorites" | "show_comments",
  value: boolean
) => {
  const result = await mobileApi.profile.updatePrivacy({
    [key]: value
  });
  settings.value = result.data;
};

const getSwitchValue = (event: Event) =>
  Boolean((event as unknown as { detail?: { value?: boolean } }).detail?.value);

const updateFavorites = (event: Event) => {
  void update("show_favorites", getSwitchValue(event));
};

const updateComments = (event: Event) => {
  void update("show_comments", getSwitchValue(event));
};

onShow(load);
</script>

<template>
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="group-title">公开展示</view>
      <view class="section">
        <view class="setting-row">
          <view class="row-main">
            <text class="row-label">公开展示收藏列表</text>
            <text class="row-desc">关闭后，他人查看你的 Profile 时看不到收藏。</text>
          </view>
          <switch
            :checked="settings?.show_favorites ?? true"
            color="#0f766e"
            @change="updateFavorites"
          />
        </view>

        <view class="setting-row">
          <view class="row-main">
            <text class="row-label">公开展示评论列表</text>
            <text class="row-desc">关闭后，他人查看你的 Profile 时看不到评论。</text>
          </view>
          <switch
            :checked="settings?.show_comments ?? true"
            color="#0f766e"
            @change="updateComments"
          />
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
  min-height: 112rpx;
  padding: 18rpx 24rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
  box-sizing: border-box;
}

.row-main {
  flex: 1;
  min-width: 0;
}

.row-label,
.row-desc {
  display: block;
}

.row-label {
  color: #f3f4f6;
  font-size: 28rpx;
}

.row-desc {
  margin-top: 8rpx;
  color: #8b9098;
  font-size: 22rpx;
}
</style>
