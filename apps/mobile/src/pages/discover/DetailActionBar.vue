<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder: string;
  liked: boolean;
  likeCount: number;
  favorited: boolean;
  favoriteCount: number;
  shareCount: number;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "keyboardHeightChange", payload: { detail: { height: number } }): void;
  (event: "submit"): void;
  (event: "toggleLike"): void;
  (event: "toggleFavorite"): void;
  (event: "openShare"): void;
}>();

const updateValue = (event: Event) => {
  const detail = (event as unknown as { detail?: { value?: unknown } }).detail;
  emit("update:modelValue", typeof detail?.value === "string" ? detail.value : "");
};
</script>

<template>
  <view class="comment-bar">
    <view class="comment-bar-field">
      <text class="comment-pencil">✎</text>
      <input
        class="comment-bar-input"
        :placeholder="placeholder"
        confirm-type="send"
        :adjust-position="false"
        :cursor-spacing="16"
        :value="modelValue"
        @input="updateValue"
        @keyboardheightchange="emit('keyboardHeightChange', $event)"
        @confirm="emit('submit')"
      />
    </view>
    <view class="bar-actions">
      <view
        class="bar-action"
        :class="{ liked }"
        @click="emit('toggleLike')"
      >
        <text class="bar-icon">{{ liked ? "♥" : "♡" }}</text>
        <text class="bar-count">{{ likeCount }}</text>
      </view>
      <view
        class="bar-action"
        :class="{ favorited }"
        @click="emit('toggleFavorite')"
      >
        <text class="bar-icon">{{ favorited ? "★" : "☆" }}</text>
        <text class="bar-count">{{ favoriteCount }}</text>
      </view>
      <view class="bar-action" @click="emit('openShare')">
        <text class="bar-icon">↗</text>
        <text class="bar-count">{{ shareCount }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.comment-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #e5e7eb;
  background: rgba(255, 255, 255, 0.96);
  box-sizing: border-box;
}

.comment-bar-field {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
  height: 64rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
}

.comment-pencil {
  color: #64748b;
  font-size: 28rpx;
}

.comment-bar-input {
  flex: 1;
  min-width: 0;
  color: #111827;
  font-size: 26rpx;
}

.bar-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.bar-action {
  display: flex;
  align-items: center;
  gap: 4rpx;
  min-width: 58rpx;
  color: #64748b;
  font-size: 24rpx;
}

.bar-action.liked {
  color: #ff2442;
}

.bar-action.favorited {
  color: #f59e0b;
}

.bar-icon {
  font-size: 32rpx;
  line-height: 1;
}

.bar-count {
  min-width: 18rpx;
}
</style>
