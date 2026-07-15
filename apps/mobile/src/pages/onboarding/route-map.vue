<script setup lang="ts">
import type { CommunityPlanItem } from "@community-map/shared";
import { computed, onMounted, ref } from "vue";

import { getMobileCopy } from "@/i18n";
import { interpolate } from "@/i18n/localized";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { pickLocalized, useAppStore } from "@/stores/app-store";

const { state: appState } = useAppStore();
const onboarding = useOnboardingStore();
const copy = computed(() => getMobileCopy(appState.locale).onboarding);
const failedCoverIds = ref<string[]>([]);
const routeItems = computed<readonly CommunityPlanItem[]>(
  () => onboarding.state.plan?.items ?? []
);

const back = () => {
  onboarding.goToStep("plan");
  uni.navigateBack();
};

const openPlace = (placeId: string) => {
  uni.navigateTo({ url: `/pages/places/detail?id=${placeId}` });
};

const openEvent = (eventId: string) => {
  uni.navigateTo({ url: `/pages/events/detail?id=${eventId}` });
};

const markCoverUnavailable = (placeId: string) => {
  if (!failedCoverIds.value.includes(placeId)) {
    failedCoverIds.value = [...failedCoverIds.value, placeId];
  }
};

onMounted(() => {
  if (!onboarding.state.plan) {
    uni.redirectTo({ url: "/pages/onboarding/welcome" });
  } else {
    onboarding.goToStep("route-map");
  }
});
</script>

<template>
  <!-- #ifdef H5 -->
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="header">
        <view class="title">{{ copy.route.title }}</view>
        <view class="subtitle">{{ copy.route.subtitle }}</view>
        <view class="map-unavailable">{{ copy.route.mapUnavailable }}</view>
      </view>

      <view class="route-list">
        <view
          v-for="(item, index) in routeItems"
          :key="item.item_id"
          class="route-card"
        >
          <view class="route-order">{{
            interpolate(copy.plan.stopLabel, { index: index + 1 })
          }}</view>

          <template v-if="item.type === 'place_visit'">
            <image
              v-if="
                item.place.cover_url &&
                !failedCoverIds.includes(item.place._id)
              "
              class="cover"
              mode="aspectFill"
              :src="item.place.cover_url"
              @error="markCoverUnavailable(item.place._id)"
            />
            <view v-else class="cover-fallback">
              {{ copy.route.imageUnavailable }}
            </view>
            <view class="route-name">
              {{
                pickLocalized(
                  appState.locale,
                  item.place.name_zh,
                  item.place.name_en
                )
              }}
            </view>
            <view class="coordinates">
              {{ interpolate(copy.route.coordinates, item.place.location) }}
            </view>
            <button
              class="action primary"
              role="button"
              tabindex="0"
              @click="openPlace(item.place._id)"
              @keyup.enter="openPlace(item.place._id)"
              @keyup.space.prevent="openPlace(item.place._id)"
            >
              {{ copy.route.openPlace }}
            </button>
          </template>

          <template v-else-if="item.type === 'event_attend'">
            <image
              v-if="item.event.cover_url"
              class="cover"
              mode="aspectFill"
              :src="item.event.cover_url"
            />
            <view v-else class="cover-fallback">
              {{ copy.route.imageUnavailable }}
            </view>
            <view class="route-name">
              {{
                pickLocalized(
                  appState.locale,
                  item.event.title_zh,
                  item.event.title_en
                )
              }}
            </view>
            <view class="route-summary">
              {{
                pickLocalized(
                  appState.locale,
                  item.event.summary_zh,
                  item.event.summary_en
                )
              }}
            </view>
            <button
              class="action primary"
              role="button"
              tabindex="0"
              @click="openEvent(item.event._id)"
              @keyup.enter="openEvent(item.event._id)"
              @keyup.space.prevent="openEvent(item.event._id)"
            >
              {{ copy.route.openEvent }}
            </button>
          </template>
        </view>
      </view>

      <button
        class="action secondary"
        role="button"
        tabindex="0"
        @click="back"
        @keyup.enter="back"
        @keyup.space.prevent="back"
      >
        {{ copy.route.back }}
      </button>
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
.page-scroll,
.mp-only {
  min-height: 100vh;
  background: #f6f0e5;
}

.page {
  min-height: 100vh;
  max-width: 960rpx;
  margin: 0 auto;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
}

.header,
.route-list,
.route-card {
  display: flex;
  flex-direction: column;
}

.header,
.route-card {
  padding: 32rpx;
  border: 1rpx solid #e5ddd0;
  border-radius: 24rpx;
  background: #fbf8f1;
}

.header,
.route-card {
  gap: 16rpx;
}

.route-list {
  gap: 24rpx;
  margin: 32rpx 0;
}

.title {
  color: #263331;
  font-size: 40rpx;
  font-weight: 600;
}

.subtitle,
.coordinates,
.route-summary,
.mp-only-description {
  color: #5c6b68;
  font-size: 26rpx;
  line-height: 1.6;
}

.map-unavailable {
  padding: 16rpx;
  border-radius: 12rpx;
  color: #8a6a1f;
  background: #f7edd8;
  font-size: 24rpx;
}

.route-order {
  color: #0f766e;
  font-size: 24rpx;
  font-weight: 600;
}

.cover {
  width: 100%;
  height: 280rpx;
  border-radius: 16rpx;
}

.cover-fallback {
  min-height: 160rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c6b68;
  background: #e8f4f2;
  font-size: 24rpx;
  text-align: center;
}

.route-name {
  color: #263331;
  font-size: 32rpx;
  font-weight: 600;
}

.action {
  min-height: 88rpx;
  margin: 0;
  border: 0;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.action::after {
  border: 0;
}

.action.primary {
  color: #ffffff;
  background: #0f766e;
}

.action.secondary {
  color: #123b3a;
  background: #e8f4f2;
}

.action:focus-visible {
  outline: 4rpx solid #d39a3a;
  outline-offset: 4rpx;
}

.mp-only {
  padding: 96rpx 40rpx;
  box-sizing: border-box;
}

.mp-only-title {
  color: #263331;
  font-size: 40rpx;
  font-weight: 600;
}

.mp-only-description {
  margin-top: 24rpx;
}
</style>
