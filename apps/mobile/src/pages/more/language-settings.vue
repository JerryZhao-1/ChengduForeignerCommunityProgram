<script setup lang="ts">
import { computed } from "vue";

import { getMobileCopy, type MobileLocale } from "@/i18n";
import { useAppStore } from "@/stores/app-store";

const { state, setLocale } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).language);

const selectLocale = async (locale: MobileLocale) => {
  await setLocale(locale);
  uni.showToast({
    title: state.localeSyncPending
      ? copy.value.syncPending
      : copy.value.saved,
    icon: "none"
  });
};
</script>

<template>
  <view class="page">
    <view class="title">{{ copy.title }}</view>
    <view class="caption">{{ copy.caption }}</view>

    <view class="language-card" role="radiogroup" :aria-label="copy.title">
      <button
        class="language-option"
        :class="{ selected: state.locale === 'zh' }"
        :aria-checked="state.locale === 'zh'"
        role="radio"
        @click="selectLocale('zh')"
      >
        <view>
          <text class="option-title">{{ copy.chinese }}</text>
          <text class="option-code">ZH</text>
        </view>
        <text v-if="state.locale === 'zh'" class="selected-mark">✓</text>
      </button>
      <button
        class="language-option"
        :class="{ selected: state.locale === 'en' }"
        :aria-checked="state.locale === 'en'"
        role="radio"
        @click="selectLocale('en')"
      >
        <view>
          <text class="option-title">{{ copy.english }}</text>
          <text class="option-code">EN</text>
        </view>
        <text v-if="state.locale === 'en'" class="selected-mark">✓</text>
      </button>
    </view>

    <view v-if="state.localeSyncPending" class="sync-note">
      {{ copy.syncPending }}
    </view>
  </view>
</template>

<style scoped>
.page {
  padding: 32rpx 24rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
}

.caption {
  margin: 16rpx 0 28rpx;
  color: #6b7280;
  line-height: 1.6;
}

.language-card {
  overflow: hidden;
  border: 1rpx solid #dcdcdc;
  border-radius: 16rpx;
  background: #ffffff;
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 112rpx;
  padding: 20rpx 24rpx;
  border: 0;
  border-radius: 0;
  background: #ffffff;
  color: #1f1f1f;
  text-align: left;
}

.language-option::after {
  border: 0;
}

.language-option + .language-option {
  border-top: 1rpx solid #eeeeee;
}

.language-option.selected {
  background: #edf5ff;
  color: #0052d9;
}

.option-title,
.option-code {
  display: block;
}

.option-title {
  font-size: 30rpx;
  font-weight: 600;
}

.option-code {
  margin-top: 4rpx;
  color: #8c8c8c;
  font-size: 22rpx;
}

.selected-mark {
  color: #0052d9;
  font-size: 36rpx;
  font-weight: 700;
}

.sync-note {
  margin-top: 20rpx;
  padding: 18rpx 20rpx;
  border-radius: 12rpx;
  background: #fff7e6;
  color: #8b572a;
  font-size: 24rpx;
  line-height: 1.5;
}
</style>
