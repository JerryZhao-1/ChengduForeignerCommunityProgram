<script setup lang="ts">
import { computed } from "vue";

import { getMobileCopy } from "@/i18n";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAppStore } from "@/stores/app-store";

const app = useAppStore();
const { state: appState } = app;
const onboarding = useOnboardingStore();
const copy = computed(() => getMobileCopy(appState.locale).onboarding);

const goJudge = async () => {
  onboarding.startOnboarding();
  onboarding.useExamplePreference();
  await app.setLocale(onboarding.state.draft.preferred_language);
  uni.navigateTo({ url: "/pages/onboarding/preferences" });
};

const goPlan = () => {
  onboarding.startOnboarding();
  onboarding.updateDraft({ preferred_language: appState.locale });
  uni.navigateTo({ url: "/pages/onboarding/preferences" });
};
</script>

<template>
  <!-- #ifdef H5 -->
  <scroll-view scroll-y enable-flex class="page-scroll">
    <view class="page">
      <view class="hero">
        <view class="eyebrow">{{ copy.brandEyebrow }}</view>
        <view class="hero-title">{{ copy.heroTitle }}</view>
        <view class="hero-subtitle">{{ copy.heroSubtitle }}</view>
        <view class="guest-notice">{{ copy.guestNotice }}</view>
      </view>

      <view class="entries">
        <div
          class="entry-card primary"
          role="button"
          tabindex="0"
          @click="goJudge"
          @keyup.enter="goJudge"
          @keyup.space.prevent="goJudge"
        >
          <view class="entry-title">{{ copy.judgeEntry }}</view>
          <view class="entry-caption">{{ copy.judgeEntryCaption }}</view>
        </div>
        <div
          class="entry-card secondary"
          role="button"
          tabindex="0"
          @click="goPlan"
          @keyup.enter="goPlan"
          @keyup.space.prevent="goPlan"
        >
          <view class="entry-title">{{ copy.planEntry }}</view>
          <view class="entry-caption">{{ copy.planEntryCaption }}</view>
        </div>
      </view>
    </view>
  </scroll-view>
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <view class="mp-only">
    <view class="mp-only-title">{{ copy.mpOnly.title }}</view>
    <view class="mp-only-description">{{ copy.mpOnly.description }}</view>
  </view>
  <!-- #endif -->
</template>

<style scoped>
.page-scroll {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background: #f6f0e5;
}

.page {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 48rpx;
  max-width: 750rpx;
  margin: 0 auto;
}

.hero {
  padding: 48rpx 32rpx;
  border-radius: 32rpx;
  background: #fbf8f1;
  border: 1rpx solid #e5ddd0;
}

.eyebrow {
  font-size: 22rpx;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #5c6b68;
  font-weight: 500;
}

.hero-title {
  font-size: 44rpx;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 20rpx;
  color: #263331;
  font-family: "Fraunces", "Songti SC", "STSong", serif;
}

.hero-subtitle {
  font-size: 28rpx;
  line-height: 1.5;
  margin-top: 16rpx;
  color: #5c6b68;
}

.guest-notice {
  margin-top: 24rpx;
  padding: 16rpx 24rpx;
  border-radius: 12rpx;
  background: #e8f4f2;
  font-size: 24rpx;
  color: #123b3a;
  display: inline-block;
  align-self: flex-start;
}

.entries {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.entry-card {
  padding: 36rpx 32rpx;
  border-radius: 24rpx;
  border: 1rpx solid #e5ddd0;
  background: #fbf8f1;
  min-height: 88rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.entry-card.primary {
  background: #0f766e;
  border-color: #0f766e;
}

.entry-card.primary .entry-title,
.entry-card.primary .entry-caption {
  color: #ffffff;
}

.entry-card.secondary {
  background: #fbf8f1;
}

.entry-card:focus-visible {
  outline: 4rpx solid #d39a3a;
  outline-offset: 4rpx;
}

.entry-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #263331;
}

.entry-caption {
  font-size: 26rpx;
  margin-top: 8rpx;
  color: #5c6b68;
}

.mp-only {
  min-height: 100vh;
  padding: 96rpx 40rpx;
  box-sizing: border-box;
  background: #f6f0e5;
}

.mp-only-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #263331;
}

.mp-only-description {
  margin-top: 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #5c6b68;
}

@media (min-width: 768px) {
  .entries {
    flex-direction: row;
  }

  .entry-card {
    flex: 1;
  }
}
</style>
