<script setup lang="ts">
import {
  ApiClientError,
  type CommunityPlanItem,
  type CommunityPlanPlaceVisitItem
} from "@community-map/shared";
import { computed, onMounted } from "vue";

import { mobileApi } from "@/api/client";
import { getMobileCopy } from "@/i18n";
import { formatLocalizedDate, interpolate } from "@/i18n/localized";
import {
  getCompletionProgress,
  useOnboardingStore
} from "@/stores/onboarding-store";
import { pickLocalized, useAppStore } from "@/stores/app-store";

const { state: appState } = useAppStore();
const onboarding = useOnboardingStore();
const copy = computed(() => getMobileCopy(appState.locale).onboarding);
const plan = computed(() => onboarding.state.plan);
const progress = computed(() => getCompletionProgress(onboarding.state));

const durationText = computed(() =>
  plan.value
    ? interpolate(copy.value.plan.duration, {
        minutes: plan.value.total_duration_minutes
      })
    : ""
);

const formatItemTime = (item: CommunityPlanItem): string => {
  if (!plan.value) return "";
  const startMs =
    Date.parse(plan.value.generated_at) + item.start_offset_minutes * 60 * 1000;
  const endMs = startMs + item.duration_minutes * 60 * 1000;
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit"
  };
  return `${formatLocalizedDate(appState.locale, startMs, options)}–${formatLocalizedDate(appState.locale, endMs, options)}`;
};

const stopLabel = (index: number): string =>
  interpolate(copy.value.plan.stopLabel, { index });

const localized = (zh: string, en: string) =>
  pickLocalized(appState.locale, zh, en);

const itemStatus = (item: CommunityPlanItem) =>
  onboarding.state.itemStatuses[item.item_id] ?? "pending";

const itemStatusText = (item: CommunityPlanItem) => {
  const status = itemStatus(item);
  if (status === "visited") return copy.value.plan.visited;
  if (status === "demo_confirmed") return copy.value.plan.demoConfirmed;
  if (status === "unavailable") return copy.value.plan.unavailable;
  return copy.value.plan.itemTypes[item.type];
};

const openRoute = () => {
  onboarding.goToStep("route-map");
  uni.navigateTo({ url: "/pages/onboarding/route-map" });
};

const openPlace = async (item: CommunityPlanPlaceVisitItem) => {
  try {
    await mobileApi.places.detail(item.ref_id);
    uni.navigateTo({ url: `/pages/places/detail?id=${item.ref_id}` });
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      onboarding.markPlaceUnavailable(item.item_id);
    }
  }
};

const finish = () => {
  if (onboarding.finish()) {
    uni.navigateTo({ url: "/pages/onboarding/complete" });
  }
};

onMounted(() => {
  if (!onboarding.state.plan) {
    uni.redirectTo({ url: "/pages/onboarding/welcome" });
  } else {
    onboarding.goToStep("plan");
  }
});
</script>

<template>
  <!-- #ifdef H5 -->
  <scroll-view scroll-y enable-flex class="page-scroll">
    <view class="page">
      <view v-if="plan" class="plan">
        <view class="plan-header">
          <view class="plan-title">{{ copy.plan.title }}</view>
          <view class="plan-duration">{{ durationText }}</view>
          <view class="source-badges">
            <view class="source-badge">
              {{ copy.plan.generationSources[plan.generation_source] }}
            </view>
            <view class="source-badge">
              {{ copy.plan.aiStatuses[plan.ai_status] }}
            </view>
          </view>
          <view v-if="onboarding.state.planOffline" class="offline-notice">
            {{ copy.plan.offlineNotice }}
          </view>
          <button class="action-button route" @click="openRoute">
            {{ copy.plan.viewRoute }}
          </button>
        </view>

        <view class="route-list">
          <view
            v-for="(item, index) in plan.items"
            :key="item.item_id"
            class="stop-card"
          >
            <view class="stop-header">
              <view>
                <view class="stop-number">{{ stopLabel(index + 1) }}</view>
                <view class="item-status">{{ itemStatusText(item) }}</view>
              </view>
              <view class="stop-time">{{ formatItemTime(item) }}</view>
            </view>

            <view class="stop-body">
              <view class="stop-title">
                {{ localized(item.title_zh, item.title_en) }}
              </view>
              <view class="stop-summary">
                {{ localized(item.summary_zh, item.summary_en) }}
              </view>
              <view class="stop-tips">
                {{ localized(item.tips_zh, item.tips_en) }}
              </view>

              <view v-if="item.type === 'place_visit'" class="item-actions">
                <button
                  class="action-button secondary"
                  :disabled="itemStatus(item) === 'unavailable'"
                  @click="openPlace(item)"
                >
                  {{ copy.plan.openPlace }}
                </button>
                <button
                  class="action-button primary"
                  :disabled="itemStatus(item) !== 'pending'"
                  @click="onboarding.markPlaceVisited(item.item_id)"
                >
                  {{
                    itemStatus(item) === "visited"
                      ? copy.plan.visited
                      : copy.plan.markVisited
                  }}
                </button>
              </view>

              <view v-else class="item-actions event-actions">
                <view class="demo-disclosure">{{
                  copy.plan.demoDisclosure
                }}</view>
                <button
                  class="action-button event"
                  :disabled="itemStatus(item) === 'demo_confirmed'"
                  @click="onboarding.confirmDemoEvent(item.item_id)"
                >
                  {{
                    itemStatus(item) === "demo_confirmed"
                      ? copy.plan.demoConfirmed
                      : copy.plan.demoConfirm
                  }}
                </button>
              </view>
            </view>
          </view>
        </view>

        <view class="finish-panel">
          <view v-if="!progress.canFinish" class="finish-guidance">
            {{ copy.plan.finishGuidance }}
          </view>
          <button
            class="action-button finish"
            :disabled="!progress.canFinish"
            @click="finish"
          >
            {{ copy.plan.finish }}
          </button>
        </view>
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
.page-scroll,
.mp-only {
  min-height: 100vh;
  background: #f6f0e5;
}

.page {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
  max-width: 960rpx;
  margin: 0 auto;
}

.plan,
.route-list,
.stop-body,
.plan-header {
  display: flex;
  flex-direction: column;
}

.plan {
  gap: 40rpx;
}

.route-list,
.stop-body {
  gap: 24rpx;
}

.plan-header,
.stop-card,
.finish-panel {
  padding: 32rpx;
  border: 1rpx solid #e5ddd0;
  border-radius: 24rpx;
  background: #fbf8f1;
}

.plan-header {
  gap: 16rpx;
}

.plan-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #263331;
  font-family: "Fraunces", "Songti SC", serif;
}

.plan-duration,
.stop-time,
.item-status,
.finish-guidance {
  color: #5c6b68;
  font-size: 24rpx;
}

.source-badges,
.item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.source-badge,
.offline-notice,
.item-status {
  align-self: flex-start;
  padding: 8rpx 16rpx;
  border-radius: 10rpx;
  background: #e8f4f2;
}

.offline-notice {
  color: #8a6a1f;
  background: #f7edd8;
  font-size: 24rpx;
}

.stop-card {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.stop-header {
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
}

.stop-number {
  color: #0f766e;
  font-size: 24rpx;
  font-weight: 600;
}

.item-status {
  margin-top: 8rpx;
}

.stop-title {
  color: #263331;
  font-size: 34rpx;
  font-weight: 600;
}

.stop-summary,
.stop-tips,
.demo-disclosure {
  color: #5c6b68;
  font-size: 27rpx;
  line-height: 1.6;
}

.stop-tips,
.demo-disclosure {
  padding: 20rpx;
  border-left: 4rpx solid #d39a3a;
  background: #f7edd8;
}

.event-actions {
  flex-direction: column;
}

.action-button {
  min-height: 88rpx;
  margin: 0;
  padding: 20rpx 28rpx;
  border: 0;
  border-radius: 16rpx;
  font-size: 28rpx;
  line-height: 1.4;
}

.action-button::after {
  border: 0;
}

.action-button.primary,
.action-button.route,
.action-button.finish {
  color: #ffffff;
  background: #0f766e;
}

.action-button.secondary {
  color: #123b3a;
  background: #e8f4f2;
}

.action-button.event {
  color: #ffffff;
  background: #e66a45;
}

.action-button[disabled] {
  opacity: 0.48;
}

.finish-panel {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
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
  color: #5c6b68;
  font-size: 28rpx;
  line-height: 1.6;
}
</style>
