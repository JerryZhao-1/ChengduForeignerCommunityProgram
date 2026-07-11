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
import { mobileEnv } from "@/config/env";
import {
  formatLocalizedNumber,
  getMobileCopy,
  interpolate
} from "@/i18n";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import {
  formatEventTimeRange,
  resolveEventAddress,
  resolveEventCoverSource
} from "./event-presentation";
import {
  getEventSignupState,
  isActiveEventRegistration,
  isPublicEvent
} from "./event-signup-state";

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).events);
const commonCopy = computed(() => getMobileCopy(state.locale).common);
const event = ref<Event | null>(null);
const relatedPosts = ref<Post[]>([]);
const eventId = ref("");
const registrations = ref<EventRegistration[]>([]);
const ticketCode = ref("");
const loading = ref(false);
const error = ref("");
const failedCoverSources = ref<string[]>([]);
const unavailableEventMessage = computed(
  () => copy.value.signupStates.unavailable.reason
);

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
    : { canSignup: false, code: "unavailable" as const }
);

const signupCopy = computed(
  () => copy.value.signupStates[signupState.value.code]
);

const eventAddress = computed(() =>
  event.value ? resolveEventAddress(event.value, state.locale) : null
);

const eventTimeRange = computed(() =>
  event.value
    ? formatEventTimeRange(
        state.locale,
        event.value.start_time,
        event.value.end_time
      )
    : ""
);

const eventCoverSource = computed(() =>
  event.value
    ? resolveEventCoverSource(event.value, {
        preferCloudFileId: mobileEnv.apiMode === "cloudbase-function",
        failedSources: failedCoverSources.value
      })
    : null
);

const handleCoverError = () => {
  if (eventCoverSource.value) {
    failedCoverSources.value = [
      ...failedCoverSources.value,
      eventCoverSource.value
    ];
  }
};

const addressFallbackNotice = computed(() => {
  const address = eventAddress.value;
  if (!address?.usedFallback || !address.resolvedLocale) {
    return "";
  }
  const language =
    address.resolvedLocale === "zh"
      ? commonCopy.value.languageZh
      : commonCopy.value.languageEn;
  return interpolate(commonCopy.value.fallbackLanguage, { language });
});

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
    error.value = copy.value.states.missingId;
    return;
  }

  loading.value = true;
  error.value = "";
  event.value = null;
  relatedPosts.value = [];
  failedCoverSources.value = [];

  try {
    const eventResult = await mobileApi.events.detail(id);
    if (!isPublicEvent(eventResult.data)) {
      error.value = unavailableEventMessage.value;
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
      ? unavailableEventMessage.value
      : copy.value.states.error;
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
    uni.showToast({ title: signupCopy.value.reason, icon: "none" });
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

const statusLabel = (item: Event) => {
  const currentSignupState = getEventSignupState(item, new Date(), {
    isRegistered: registeredEventIds.value.has(item._id)
  });

  if (!currentSignupState.canSignup) {
    return copy.value.signupStates[currentSignupState.code].label;
  }

  if (new Date(item.start_time) <= new Date()) {
    return copy.value.states.ongoing;
  }
  return copy.value.states.registrationOpen;
};

const commentCount = (count: number) =>
  interpolate(copy.value.commentsCount, {
    count: formatLocalizedNumber(state.locale, count)
  });
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state-text">{{ copy.states.loading }}</view>
    <view v-else-if="error" class="state-text error">{{ error }}</view>

    <template v-else-if="event">
      <image
        v-if="eventCoverSource"
        class="cover"
        :src="eventCoverSource"
        mode="aspectFill"
        @error="handleCoverError"
      />
      <view v-else class="cover cover-placeholder">
        {{ pickLocalized(state.locale, event.title_zh, event.title_en) }}
      </view>

      <view class="card">
        <view class="title-row">
          <text class="title">{{ pickLocalized(state.locale, event.title_zh, event.title_en) }}</text>
          <text class="status">{{ statusLabel(event) }}</text>
        </view>
        <text class="meta"><text class="meta-label">{{ copy.time }}:</text> {{ eventTimeRange }}</text>
        <text class="meta"><text class="meta-label">{{ copy.place }}:</text> {{ eventAddress?.value }}</text>
        <text v-if="addressFallbackNotice" class="fallback-notice">
          {{ addressFallbackNotice }}
        </text>
        <text class="meta">
          <text class="meta-label">{{ copy.capacity }}:</text>
          {{ formatLocalizedNumber(state.locale, event.capacity) }}
        </text>
      </view>

      <view class="card">
        <text class="section-title">{{ copy.details }}</text>
        <text class="details">{{ pickLocalized(state.locale, event.content_zh, event.content_en) }}</text>
      </view>

      <view v-if="relatedPosts.length" class="card">
        <text class="section-title">{{ copy.relatedDiscussion }}</text>
        <view
          v-for="post in relatedPosts"
          :key="post._id"
          class="related-card"
          @click="openRelatedPost(post._id)"
        >
          <text class="related-title">{{ post.title }}</text>
          <view class="related-meta">
            <text>{{ post.author_display.nickname }}</text>
            <text>{{ commentCount(post.comment_count) }}</text>
          </view>
        </view>
      </view>

      <button class="secondary-action" @click="startDiscussion">
        {{ copy.startDiscussion }}
      </button>

      <view v-if="ticketCode" class="ticket-card">
        <text class="section-title">{{ copy.ticket }}</text>
        <text class="ticket-code">{{ ticketCode }}</text>
      </view>

      <button
        class="primary"
        :class="{ disabled: !signupState.canSignup }"
        :disabled="!signupState.canSignup"
        @click="register"
      >
        {{ signupCopy.label }}
      </button>
    </template>

    <view v-else class="state-text">{{ copy.states.missing }}</view>
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

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 24rpx;
  color: #64748b;
  text-align: center;
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

.meta-label {
  font-weight: 600;
}

.fallback-notice {
  display: block;
  margin-top: 8rpx;
  color: #92400e;
  font-size: 22rpx;
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
