<script setup lang="ts">
import { computed, onMounted } from "vue";

import { getMobileCopy } from "@/i18n";
import { interpolate } from "@/i18n/localized";
import {
  getCompletionProgress,
  useOnboardingStore
} from "@/stores/onboarding-store";
import { useAppStore } from "@/stores/app-store";

const { state: appState } = useAppStore();
const onboarding = useOnboardingStore();
const copy = computed(() => getMobileCopy(appState.locale).onboarding);
const progress = computed(() => getCompletionProgress(onboarding.state));

const placesResult = computed(() =>
  interpolate(copy.value.complete.places, {
    visited: progress.value.visitedPlaces,
    total: progress.value.availablePlaces
  })
);

const eventsResult = computed(() =>
  interpolate(copy.value.complete.events, {
    confirmed: progress.value.confirmedEvents,
    total: progress.value.totalEvents
  })
);

const unavailablePlacesResult = computed(() =>
  interpolate(copy.value.complete.unavailablePlaces, {
    visited: progress.value.visitedPlaces,
    total: progress.value.availablePlaces
  })
);

const startOver = () => {
  onboarding.reset();
  uni.reLaunch({ url: "/pages/onboarding/welcome" });
};

onMounted(() => {
  if (!onboarding.state.plan || !progress.value.canFinish) {
    uni.redirectTo({ url: "/pages/onboarding/welcome" });
  } else {
    onboarding.goToStep("complete");
  }
});
</script>

<template>
  <!-- #ifdef H5 -->
  <view class="page">
    <view class="complete-card">
      <view class="eyebrow">Tongzilin · 桐梓林</view>
      <view class="title">{{ copy.complete.title }}</view>
      <view class="subtitle">{{ copy.complete.subtitle }}</view>
      <view class="results">
        <view class="result">{{ placesResult }}</view>
        <view class="result">{{ eventsResult }}</view>
        <view v-if="progress.availablePlaces === 0" class="unavailable-result">
          {{ unavailablePlacesResult }}
        </view>
      </view>
      <view class="disclosure">{{ copy.complete.demoDisclosure }}</view>
      <button class="start-over" @click="startOver">
        {{ copy.complete.startOver }}
      </button>
    </view>
  </view>
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <view class="mp-only">
    <view class="mp-only-title">{{ copy.mpOnly.title }}</view>
    <view class="mp-only-description">{{ copy.mpOnly.description }}</view>
  </view>
  <!-- #endif -->
</template>

<style scoped>
.page,
.mp-only {
  min-height: 100vh;
  padding: 64rpx 32rpx;
  box-sizing: border-box;
  background: #f6f0e5;
}

.complete-card {
  max-width: 960rpx;
  margin: 0 auto;
  padding: 48rpx 32rpx;
  border: 1rpx solid #e5ddd0;
  border-radius: 28rpx;
  background: #fbf8f1;
}

.eyebrow {
  color: #0f766e;
  font-size: 22rpx;
  letter-spacing: 0.15em;
}

.title {
  margin-top: 24rpx;
  color: #263331;
  font-size: 44rpx;
  font-weight: 600;
}

.subtitle,
.disclosure,
.mp-only-description {
  margin-top: 20rpx;
  color: #5c6b68;
  font-size: 27rpx;
  line-height: 1.6;
}

.results {
  display: grid;
  gap: 16rpx;
  margin-top: 32rpx;
}

.result {
  padding: 24rpx;
  border-radius: 16rpx;
  color: #123b3a;
  background: #e8f4f2;
  font-size: 30rpx;
  font-weight: 600;
}

.unavailable-result {
  padding: 20rpx;
  border-radius: 12rpx;
  color: #8a6a1f;
  background: #f7edd8;
  font-size: 24rpx;
}

.disclosure {
  padding: 20rpx;
  border-left: 4rpx solid #d39a3a;
  background: #f7edd8;
}

.start-over {
  min-height: 88rpx;
  margin: 36rpx 0 0;
  border: 0;
  border-radius: 16rpx;
  color: #ffffff;
  background: #0f766e;
  font-size: 28rpx;
}

.start-over::after {
  border: 0;
}

.mp-only-title {
  color: #263331;
  font-size: 40rpx;
  font-weight: 600;
}
</style>
