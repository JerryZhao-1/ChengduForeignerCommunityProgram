<script setup lang="ts">
import type { Event, EventRegistration } from "@community-map/shared";
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import { mobileEnv } from "@/config/env";
import { getMobileCopy } from "@/i18n";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import {
  formatEventCapacity,
  formatEventTimeRange,
  resolveEventAddress,
  resolveEventCoverSource
} from "./event-presentation";
import { loadEventIndexData } from "./event-index-loader";
import {
  getEventSignupState,
  isActiveEventRegistration,
  isPublicEvent
} from "./event-signup-state";

type TabKey = "all" | "thisWeek" | "upcoming" | "mine";

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).events);
const activeTab = ref<TabKey>("all");
const events = ref<Event[]>([]);
const registrations = ref<EventRegistration[]>([]);
const loading = ref(false);
const error = ref("");
const failedCoverSources = ref<Record<string, string[]>>({});

const tabs = computed<Array<{ key: TabKey; label: string }>>(() => [
  { key: "all", label: copy.value.tabs.all },
  { key: "thisWeek", label: copy.value.tabs.thisWeek },
  { key: "upcoming", label: copy.value.tabs.upcoming },
  { key: "mine", label: copy.value.tabs.mine }
]);

const load = async () => {
  loading.value = true;
  error.value = "";

  try {
    const data = await loadEventIndexData({
      api: mobileApi,
      authenticated: state.authenticated,
      query: { communityId: state.communityId, pageSize: 50 }
    });

    events.value = data.events;
    registrations.value = data.registrations;
  } catch (err) {
    console.error(err);
    error.value = copy.value.states.error;
  } finally {
    loading.value = false;
  }
};

const openDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/events/detail?id=${id}`
  });
};

const registeredEventIds = computed(
  () =>
    new Set(
      registrations.value
        .filter(isActiveEventRegistration)
        .map((item) => item.event_id)
    )
);

const filteredEvents = computed(() => {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return events.value.filter((event) => {
    const start = new Date(event.start_time);

    if (!isPublicEvent(event)) {
      return false;
    }

    if (activeTab.value === "mine") {
      return registeredEventIds.value.has(event._id);
    }

    if (activeTab.value === "upcoming") {
      return start > now;
    }

    if (activeTab.value === "thisWeek") {
      return start >= startOfWeek && start < endOfWeek;
    }

    return true;
  });
});

const emptyText = computed(() => {
  if (activeTab.value === "mine") {
    return copy.value.states.emptyMine;
  }
  if (activeTab.value === "upcoming") {
    return copy.value.states.emptyUpcoming;
  }
  if (activeTab.value === "thisWeek") {
    return copy.value.states.emptyWeek;
  }
  return copy.value.states.emptyAll;
});

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
};

const eventStatusLabel = (event: Event) => {
  const signupState = getEventSignupState(event, new Date(), {
    isRegistered: registeredEventIds.value.has(event._id)
  });

  if (signupState.canSignup) {
    return new Date(event.start_time) > new Date()
      ? copy.value.states.registrationOpen
      : copy.value.states.ongoing;
  }

  return copy.value.signupStates[signupState.code].label;
};

const eventCoverSource = (event: Event) =>
  resolveEventCoverSource(event, {
    preferCloudFileId: mobileEnv.apiMode === "cloudbase-function",
    failedSources: failedCoverSources.value[event._id]
  });

const handleCoverError = (event: Event) => {
  const failedSource = eventCoverSource(event);
  if (failedSource) {
    failedCoverSources.value = {
      ...failedCoverSources.value,
      [event._id]: [
        ...(failedCoverSources.value[event._id] ?? []),
        failedSource
      ]
    };
  }
};

onShow(() => {
  void load();
});
</script>

<template>
  <view class="page">
    <view class="tabs">
      <text
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </text>
    </view>

    <view v-if="loading" class="state-text">{{ copy.states.loading }}</view>
    <view v-else-if="error" class="state-text error">{{ error }}</view>

    <template v-else>
      <view v-for="event in filteredEvents" :key="event._id" class="card" @click="openDetail(event._id)">
        <image
          v-if="eventCoverSource(event)"
          class="cover"
          :src="eventCoverSource(event) || ''"
          mode="aspectFill"
          @error="handleCoverError(event)"
        />
        <view v-else class="cover cover-placeholder">
          {{ pickLocalized(state.locale, event.title_zh, event.title_en) }}
        </view>
        <view class="content">
          <view class="title-row">
            <text class="card-title">{{ pickLocalized(state.locale, event.title_zh, event.title_en) }}</text>
            <text class="registered">{{ eventStatusLabel(event) }}</text>
          </view>
          <text class="card-text">{{ pickLocalized(state.locale, event.summary_zh, event.summary_en) }}</text>
          <text class="meta">
            {{ formatEventTimeRange(state.locale, event.start_time, event.end_time) }}
          </text>
          <text class="meta">{{ resolveEventAddress(event, state.locale).value }}</text>
          <view class="footer">
            <text class="quota">
              {{ formatEventCapacity(state.locale, copy.capacityValue, event.capacity) }}
            </text>
            <text class="action">{{ copy.viewDetail }}</text>
          </view>
        </view>
      </view>

      <view v-if="!filteredEvents.length" class="empty">
        <text class="empty-title">{{ copy.states.empty }}</text>
        <text class="empty-desc">{{ emptyText }}</text>
      </view>
    </template>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.tabs {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-item {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: #e5e7eb;
  color: #374151;
  font-size: 24rpx;
}

.tab-item.active {
  background: #0f766e;
  color: #ffffff;
}

.state-text {
  margin-top: 120rpx;
  text-align: center;
  color: #6b7280;
}

.state-text.error {
  color: #b91c1c;
}

.card {
  margin-bottom: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  border: 1rpx solid #e5e7eb;
}

.cover {
  width: 100%;
  height: 240rpx;
  background: #e5e7eb;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 24rpx;
  color: #64748b;
  text-align: center;
}

.content {
  padding: 20rpx;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.card-title {
  display: block;
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
}

.registered {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #dcfce7;
  color: #166534;
  font-size: 20rpx;
}

.card-text {
  margin-top: 12rpx;
  color: #6b7280;
  display: block;
}

.meta {
  display: block;
  margin-top: 8rpx;
  color: #4b5563;
  font-size: 24rpx;
}

.footer {
  margin-top: 14rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quota {
  color: #111827;
  font-size: 24rpx;
}

.action {
  color: #0f766e;
  font-size: 24rpx;
  font-weight: 600;
}

.empty {
  margin-top: 120rpx;
  text-align: center;
}

.empty-title,
.empty-desc {
  display: block;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 600;
}

.empty-desc {
  margin-top: 10rpx;
  color: #6b7280;
}
</style>
