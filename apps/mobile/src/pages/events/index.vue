<script setup lang="ts">
import type { Event, EventRegistration } from "@community-map/shared";
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import {
  getEventSignupState,
  isActiveEventRegistration
} from "./event-signup-state";

type TabKey = "all" | "thisWeek" | "upcoming" | "mine";

const { state } = useAppStore();
const activeTab = ref<TabKey>("all");
const events = ref<Event[]>([]);
const registrations = ref<EventRegistration[]>([]);
const loading = ref(false);
const error = ref("");

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "全部" },
  { key: "thisWeek", label: "本周" },
  { key: "upcoming", label: "即将开始" },
  { key: "mine", label: "我的" }
];

const load = async () => {
  loading.value = true;
  error.value = "";

  try {
    const [eventResult, registrationResult] = await Promise.all([
      mobileApi.events.list({ communityId: state.communityId, pageSize: 50 }),
      mobileApi.events.myRegistrations()
    ]);

    events.value = eventResult.data.items;
    registrations.value = Array.isArray(registrationResult.data)
      ? registrationResult.data
      : [];
  } catch (err) {
    console.error(err);
    error.value = "活动加载失败，请稍后重试";
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

    if (activeTab.value === "mine") {
      return registeredEventIds.value.has(event._id);
    }

    if (activeTab.value === "upcoming") {
      return start > now && event.publish_status === "published";
    }

    if (activeTab.value === "thisWeek") {
      return start >= startOfWeek && start < endOfWeek;
    }

    return true;
  });
});

const emptyText = computed(() => {
  if (activeTab.value === "mine") {
    return "你还没有报名活动";
  }
  if (activeTab.value === "upcoming") {
    return "暂无即将开始的活动";
  }
  if (activeTab.value === "thisWeek") {
    return "本周暂无活动";
  }
  return "请稍后再来看看";
});

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatTime = (input: string) => {
  const date = new Date(input);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${min}`;
};

const eventStatusLabel = (event: Event) => {
  const signupState = getEventSignupState(event, new Date(), {
    isRegistered: registeredEventIds.value.has(event._id)
  });

  if (signupState.canSignup) {
    return new Date(event.start_time) > new Date() ? "可报名" : "进行中";
  }

  return signupState.label;
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

    <view v-if="loading" class="state-text">加载中...</view>
    <view v-else-if="error" class="state-text error">{{ error }}</view>

    <template v-else>
      <view v-for="event in filteredEvents" :key="event._id" class="card" @click="openDetail(event._id)">
        <image v-if="event.cover_url" class="cover" :src="event.cover_url" mode="aspectFill" />
        <view class="content">
          <view class="title-row">
            <text class="card-title">{{ pickLocalized(state.locale, event.title_zh, event.title_en) }}</text>
            <text class="registered">{{ eventStatusLabel(event) }}</text>
          </view>
          <text class="card-text">{{ pickLocalized(state.locale, event.summary_zh, event.summary_en) }}</text>
          <text class="meta">{{ formatTime(event.start_time) }} - {{ formatTime(event.end_time) }}</text>
          <text class="meta">{{ event.address_text }}</text>
          <view class="footer">
            <text class="quota">名额 {{ event.capacity }}</text>
            <text class="action">查看详情</text>
          </view>
        </view>
      </view>

      <view v-if="!filteredEvents.length" class="empty">
        <text class="empty-title">暂无活动</text>
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
