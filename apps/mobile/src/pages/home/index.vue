<script setup lang="ts">
import type { Event } from "@community-map/shared";
import { computed, onMounted, ref } from "vue";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";
import { getMobileCopy } from "@/i18n";
import { isPublicEvent } from "@/pages/events/event-signup-state";
import { formatEventTimeRange } from "@/pages/events/event-presentation";
import { placesPagePaths } from "@/pages/places/navigation";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import { useOnboardingStore } from "@/stores/onboarding-store";

const { state } = useAppStore();
const onboarding = useOnboardingStore();
const copy = computed(() => getMobileCopy(state.locale).home);
const onboardingCopy = computed(() => getMobileCopy(state.locale).onboarding);
const events = ref<Array<any>>([]);
const announcements = ref<Array<any>>([]);
const places = ref<Array<any>>([]);

const load = async () => {
  const [eventsResult, announcementsResult, placesResult] =
    await Promise.allSettled([
      mobileApi.events.list(),
      mobileApi.announcements.list(),
      mobileApi.places.list()
    ]);

  if (eventsResult.status === "fulfilled") {
    events.value = (eventsResult.value.data.items as Event[])
      .filter(isPublicEvent)
      .slice(0, 2);
  } else {
    events.value = [];
  }

  if (announcementsResult.status === "fulfilled") {
    announcements.value = announcementsResult.value.data.items.slice(0, 2);
  } else {
    announcements.value = [];
  }

  if (placesResult.status === "fulfilled") {
    places.value = placesResult.value.data.items.slice(0, 2);
  } else {
    places.value = [];
  }
};

const open = (url: string) => {
  uni.navigateTo({ url });
};

const goJudge = () => {
  onboarding.startOnboarding();
  onboarding.useExamplePreference();
  uni.navigateTo({ url: "/pages/onboarding/preferences" });
};

const goPlan = () => {
  onboarding.startOnboarding();
  uni.navigateTo({ url: "/pages/onboarding/preferences" });
};

onMounted(load);
</script>

<template>
  <scroll-view scroll-y enable-flex class="page-scroll">
    <view class="page">
      <!-- #ifdef H5 -->
      <!-- Competition hero (H5 judge entry) -->
      <view class="competition-hero">
        <view class="hero-eyebrow">{{ onboardingCopy.brandEyebrow }}</view>
        <view class="hero-title">{{ onboardingCopy.heroTitle }}</view>
        <view class="hero-subtitle">{{ onboardingCopy.heroSubtitle }}</view>
        <view class="hero-notice">{{ onboardingCopy.guestNotice }}</view>
        <view class="hero-entries">
          <view class="hero-entry primary" @click="goJudge">
            <view class="hero-entry-title">{{
              onboardingCopy.judgeEntry
            }}</view>
            <view class="hero-entry-caption">{{
              onboardingCopy.judgeEntryCaption
            }}</view>
          </view>
          <view class="hero-entry secondary" @click="goPlan">
            <view class="hero-entry-title">{{ onboardingCopy.planEntry }}</view>
            <view class="hero-entry-caption">{{
              onboardingCopy.planEntryCaption
            }}</view>
          </view>
        </view>
      </view>

      <!-- Continue exploring (demoted existing modules) -->
      <view class="section-divider">
        <view class="divider-line"></view>
        <view class="divider-label">{{
          onboardingCopy.continueExploring
        }}</view>
        <view class="divider-line"></view>
      </view>
      <!-- #endif -->

      <SectionPanel :title="copy.events" :subtitle="copy.eventsSubtitle">
        <view
          v-for="event in events"
          :key="event._id"
          class="list-item"
          @click="open(`/pages/events/detail?id=${event._id}`)"
        >
          <view>{{
            pickLocalized(state.locale, event.title_zh, event.title_en)
          }}</view>
          <view class="caption">
            {{
              formatEventTimeRange(
                state.locale,
                event.start_time,
                event.end_time
              )
            }}
          </view>
        </view>
      </SectionPanel>

      <SectionPanel
        :title="copy.announcements"
        :subtitle="copy.announcementsSubtitle"
      >
        <view v-for="item in announcements" :key="item._id" class="list-item">
          <view>{{
            pickLocalized(state.locale, item.title_zh, item.title_en)
          }}</view>
        </view>
      </SectionPanel>

      <SectionPanel :title="copy.places" :subtitle="copy.placesSubtitle">
        <view class="places-actions">
          <button class="action-button" @click="open(placesPagePaths.list())">
            {{ copy.viewPlaces }}
          </button>
          <button
            class="action-button ghost"
            @click="open(placesPagePaths.recommended())"
          >
            {{ copy.viewRecommendedPlaces }}
          </button>
        </view>
        <view
          v-for="place in places"
          :key="place._id"
          class="list-item"
          @click="open(`/pages/places/detail?id=${place._id}`)"
        >
          <view>{{
            pickLocalized(state.locale, place.name_zh, place.name_en)
          }}</view>
          <view class="caption">
            {{
              pickLocalized(
                state.locale,
                place.short_address_zh,
                place.short_address_en
              )
            }}
          </view>
        </view>
      </SectionPanel>

      <SectionPanel :title="copy.quickActions">
        <view class="quick-grid">
          <view class="quick-item" @click="open('/pages/more/profile')">{{
            copy.profile
          }}</view>
          <view class="quick-item" @click="open('/pages/more/notifications')">{{
            copy.notifications
          }}</view>
          <view
            class="quick-item"
            @click="open('/pages/more/my-registrations')"
            >{{ copy.registrations }}</view
          >
          <view
            class="quick-item"
            @click="open('/pages/more/language-settings')"
            >{{ copy.language }}</view
          >
        </view>
      </SectionPanel>
    </view>
  </scroll-view>
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
  padding: 32rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  max-width: 750rpx;
  margin: 0 auto;
}

/* Competition hero */
.competition-hero {
  padding: 48rpx 32rpx;
  border-radius: 24rpx;
  background: #fbf8f1;
  border: 1rpx solid #e5ddd0;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.hero-eyebrow {
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
  color: #263331;
  font-family: "Fraunces", "Songti SC", "STSong", serif;
}

.hero-subtitle {
  font-size: 28rpx;
  line-height: 1.5;
  color: #5c6b68;
}

.hero-notice {
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  background: #e8f4f2;
  font-size: 24rpx;
  color: #123b3a;
  align-self: flex-start;
}

.hero-entries {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 8rpx;
}

.hero-entry {
  padding: 32rpx 28rpx;
  border-radius: 20rpx;
  border: 1rpx solid #e5ddd0;
  background: #fbf8f1;
  min-height: 88rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8rpx;
}

.hero-entry.primary {
  background: #0f766e;
  border-color: #0f766e;
}

.hero-entry.primary .hero-entry-title,
.hero-entry.primary .hero-entry-caption {
  color: #ffffff;
}

.hero-entry-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #263331;
}

.hero-entry-caption {
  font-size: 24rpx;
  color: #5c6b68;
}

/* Section divider */
.section-divider {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin: 16rpx 0 8rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: #e5ddd0;
}

.divider-label {
  font-size: 24rpx;
  color: #8fa09d;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: "Fraunces", "Songti SC", serif;
}

/* Existing demoted sections */
.list-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e5e7eb;
}

.caption {
  color: #6b7280;
  margin-top: 8rpx;
  font-size: 24rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.quick-item {
  padding: 24rpx;
  border-radius: 20rpx;
  background: #ecfeff;
  text-align: center;
  font-weight: 600;
}

.places-actions {
  display: flex;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.action-button {
  flex: 1;
  background: #0f766e;
  color: #ffffff;
  font-size: 26rpx;
}

.action-button.ghost {
  background: #ccfbf1;
  color: #115e59;
}

@media (min-width: 768px) {
  .hero-entries {
    flex-direction: row;
  }

  .hero-entry {
    flex: 1;
  }
}
</style>
