<script setup lang="ts">
import {
  ApiClientError,
  type Event,
  type EventRegistration,
  type Post
} from "@community-map/shared";
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import {
  getEventSignupState,
  isActiveEventRegistration,
  isPublicEvent
} from "./event-signup-state";

const { state } = useAppStore();
const event = ref<Event | null>(null);
const relatedPosts = ref<Post[]>([]);
const eventId = ref("");
const registrations = ref<EventRegistration[]>([]);
const ticketCode = ref("");
const loading = ref(false);
const error = ref("");
const unavailableEventMessage = "活动暂不可访问或已下线";

const isUnavailableEventError = (err: unknown) =>
  err instanceof ApiClientError
    ? err.code === "NOT_FOUND" || err.status === 404
    : err instanceof Error && err.message.includes("HTTP 404");

const registeredEventIds = computed(
  () =>
    new Set(
      registrations.value
        .filter(isActiveEventRegistration)
        .map((item) => item.event_id)
    )
);

const signupState = computed(() =>
  event.value
    ? getEventSignupState(event.value, new Date(), {
        isRegistered: registeredEventIds.value.has(event.value._id)
      })
    : { canSignup: false, label: "暂不可报名", reason: "" }
);

const currentRegistration = computed(() => {
  if (!event.value) {
    return null;
  }

  return (
    registrations.value.find(
      (item) =>
        item.event_id === event.value?._id && isActiveEventRegistration(item)
    ) ?? null
  );
});

onLoad((query) => {
  eventId.value = typeof query?.id === "string" ? query.id : "";
});

onShow(() => {
  void loadEvent(eventId.value);
});

const loadRegistrationTicket = async (registration: EventRegistration | null) => {
  if (!registration) {
    ticketCode.value = "";
    return;
  }

  try {
    const result = await mobileApi.events.registrationTicket(registration._id);
    ticketCode.value = result.data.ticket_code;
  } catch (err) {
    console.error(err);
    ticketCode.value = "";
  }
};

const loadEvent = async (id: string) => {
  if (!id) {
    error.value = "缺少活动ID";
    return;
  }

  loading.value = true;
  error.value = "";
  event.value = null;
  relatedPosts.value = [];

  try {
    const eventResult = await mobileApi.events.detail(id);
    if (!isPublicEvent(eventResult.data)) {
      error.value = unavailableEventMessage;
      loading.value = false;
      return;
    }
    event.value = eventResult.data;
    try {
      const related = await mobileApi.discover.listEventRelatedPosts(
        eventResult.data._id,
        {
          communityId: state.communityId,
          pageSize: 5
        }
      );
      relatedPosts.value = related.data.items;
    } catch {
      relatedPosts.value = [];
    }
  } catch (err) {
    console.error(err);
    error.value = isUnavailableEventError(err)
      ? unavailableEventMessage
      : "活动加载失败，请稍后重试";
    relatedPosts.value = [];
    loading.value = false;
    return;
  }

  try {
    const registrationResult = await mobileApi.events.myRegistrations();
    registrations.value = Array.isArray(registrationResult.data)
      ? registrationResult.data
      : [];
  } catch (err) {
    console.error(err);
    registrations.value = [];
  } finally {
    await loadRegistrationTicket(currentRegistration.value);
    loading.value = false;
  }
};

const register = () => {
  if (!event.value) {
    return;
  }

  if (!signupState.value.canSignup) {
    uni.showToast({ title: signupState.value.reason, icon: "none" });
    return;
  }

  uni.navigateTo({
    url: `/pages/events/signup?id=${event.value._id}`
  });
};

const startDiscussion = () => {
  if (!event.value) {
    return;
  }
  uni.navigateTo({
    url: `/pages/discover/create?eventId=${event.value._id}`
  });
};

const openRelatedPost = (id: string) => {
  uni.navigateTo({ url: `/pages/discover/detail?id=${id}` });
};

const formatTime = (input: string) => {
  const date = new Date(input);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${min}`;
};

const statusLabel = (item: Event) => {
  const currentSignupState = getEventSignupState(item, new Date(), {
    isRegistered: registeredEventIds.value.has(item._id)
  });

  if (!currentSignupState.canSignup) {
    return currentSignupState.label;
  }

  if (new Date(item.start_time) <= new Date()) {
    return "进行中";
  }
  return "报名中";
};
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state-text">加载中...</view>
    <view v-else-if="error" class="state-text error">{{ error }}</view>

    <template v-else-if="event">
      <image v-if="event.cover_url" class="cover" :src="event.cover_url" mode="aspectFill" />

      <view class="card">
        <view class="title-row">
          <text class="title">{{ pickLocalized(state.locale, event.title_zh, event.title_en) }}</text>
          <text class="status">{{ statusLabel(event) }}</text>
        </view>
        <text class="meta">时间：{{ formatTime(event.start_time) }} - {{ formatTime(event.end_time) }}</text>
        <text class="meta">地点：{{ event.address_text }}</text>
        <text class="meta">名额：{{ event.capacity }}</text>
        <text class="meta">费用：免费</text>
      </view>

      <view class="card">
        <text class="section-title">活动介绍</text>
        <text class="details">{{ pickLocalized(state.locale, event.content_zh, event.content_en) }}</text>
      </view>

      <view v-if="relatedPosts.length" class="card">
        <text class="section-title">{{ state.locale === "zh" ? "相关讨论" : "Related Discussion" }}</text>
        <view
          v-for="post in relatedPosts"
          :key="post._id"
          class="related-card"
          @click="openRelatedPost(post._id)"
        >
          <text class="related-title">{{ post.title }}</text>
          <view class="related-meta">
            <text>{{ post.author_display.nickname }}</text>
            <text>{{ post.comment_count }} comments</text>
          </view>
        </view>
      </view>

      <button class="secondary-action" @click="startDiscussion">
        {{ state.locale === "zh" ? "发起活动讨论" : "Start Discussion" }}
      </button>

      <view v-if="ticketCode" class="ticket-card">
        <text class="section-title">入场凭证</text>
        <text class="ticket-code">{{ ticketCode }}</text>
      </view>

      <button
        class="primary"
        :class="{ disabled: !signupState.canSignup }"
        :disabled="!signupState.canSignup"
        @click="register"
      >
        {{ signupState.label }}
      </button>
    </template>

    <view v-else class="state-text">活动不存在</view>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.state-text {
  margin-top: 160rpx;
  text-align: center;
  color: #6b7280;
}

.state-text.error {
  color: #b91c1c;
}

.cover {
  width: 100%;
  height: 300rpx;
  border-radius: 20rpx;
  background: #e5e7eb;
}

.card,
.ticket-card {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 22rpx;
  border: 1rpx solid #e5e7eb;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
}

.status {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 20rpx;
}

.meta {
  display: block;
  margin-top: 8rpx;
  color: #374151;
  font-size: 25rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.details {
  color: #374151;
  line-height: 1.7;
}

.related-card {
  display: block;
  padding: 18rpx 0;
  border-top: 1rpx solid #e5e7eb;
}

.related-title {
  display: block;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.4;
}

.related-meta {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
  color: #64748b;
  font-size: 23rpx;
}

.ticket-card {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.ticket-code {
  display: block;
  margin-top: 8rpx;
  color: #065f46;
  font-size: 30rpx;
  font-weight: 700;
}

.primary {
  margin-top: 24rpx;
  background: #0f766e;
  color: #ffffff;
}

.secondary-action {
  margin-top: 20rpx;
  background: #e6f4ff;
  color: #0052d9;
}

.primary.disabled {
  background: #9ca3af;
  color: #ffffff;
}
</style>
