<script setup lang="ts">
defineProps<{
  variant: "loading" | "empty" | "error";
  text: string;
}>();
</script>

<template>
  <view class="status-card" :class="variant">
    {{ text }}
  </view>
</template>

<style scoped>
.status-card {
  padding: 28rpx 24rpx;
  border-radius: 16rpx;
  background: #f3f4f6;
  color: #4b5563;
  line-height: 1.6;
  text-align: center;
}

.status-card.loading {
  background: #e6f4ff;
  color: #0052d9;
}

.status-card.empty {
  background: #f9fafb;
  color: #6b7280;
}

.status-card.error {
  background: #fff1f0;
  color: #c41d7f;
}
</style>
