<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <view class="panel">
    <view class="panel-title">{{ title }}</view>
    <view v-if="subtitle" class="panel-subtitle">{{ subtitle }}</view>
    <slot />
  </view>
</template>

<style scoped>
.panel {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 28rpx;
  border: 1rpx solid #e5e7eb;
}

.panel-title {
  font-size: 34rpx;
  font-weight: 600;
}

.panel-subtitle {
  color: #6b7280;
  margin-top: 8rpx;
  margin-bottom: 20rpx;
  font-size: 26rpx;
}
</style>
