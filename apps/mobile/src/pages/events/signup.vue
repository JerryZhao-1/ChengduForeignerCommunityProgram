<script setup lang="ts">
import {
  ApiClientError,
  type Event,
  type EventRegistration
} from "@community-map/shared";
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import { getMobileCopy } from "@/i18n";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import {
  formatEventTimeRange,
  resolveEventAddress
} from "./event-presentation";
import {
  findActiveRegistrationForEvent,
  getEventSignupState,
  isActiveEventRegistration,
  isPublicEvent,
  shouldConfirmRegistrationAfterSubmitError
} from "./event-signup-state";
import {
  isValidPhoneNumber,
  normalizePhoneNumber,
  PHONE_NUMBER_LENGTH
} from "./registration-form";

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).events);
const loading = ref(false);
const submitting = ref(false);
const error = ref("");
const event = ref<Event | null>(null);
const eventId = ref("");
const registrations = ref<EventRegistration[]>([]);
const ticketCode = ref("");
const form = ref({
  name: "",
  phone: "",
  attendeeCount: 1
});
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
  event.value ? resolveEventAddress(event.value, state.locale).value : ""
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

const currentRegistration = computed(() => {
  if (!event.value) {
    return null;
  }

  return findActiveRegistrationForEvent(registrations.value, event.value._id);
});

onLoad((query) => {
  eventId.value = typeof query?.id === "string" ? query.id : "";
});

onShow(() => {
  void loadEvent(eventId.value);
});

const loadRegistrationTicket = async (
  registration: EventRegistration | null
) => {
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

  try {
    const eventResult = await mobileApi.events.detail(id);
    if (!isPublicEvent(eventResult.data)) {
      error.value = unavailableEventMessage.value;
      loading.value = false;
      return;
    }
    event.value = eventResult.data;
  } catch (err) {
    console.error(err);
    error.value = isUnavailableEventError(err)
      ? unavailableEventMessage.value
      : copy.value.states.error;
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
  }

  try {
    const meResult = await mobileApi.auth.me();
    const currentPhone = meResult.data.user.phone ?? "";
    if (!form.value.phone && currentPhone.length >= 6) {
      form.value.phone = normalizePhoneNumber(currentPhone);
    }
  } catch (err) {
    console.error(err);
  }

  try {
    await loadRegistrationTicket(currentRegistration.value);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  if (!event.value || submitting.value) {
    return;
  }

  if (!signupState.value.canSignup) {
    uni.showToast({ title: signupCopy.value.reason, icon: "none" });
    return;
  }

  const name = form.value.name.trim();
  const phone = normalizePhoneNumber(form.value.phone);
  form.value.phone = phone;
  const attendeeCount = Number(form.value.attendeeCount) || 1;

  if (!name || !phone) {
    uni.showToast({
      title: copy.value.registration.namePhoneRequired,
      icon: "none"
    });
    return;
  }

  if (!isValidPhoneNumber(phone)) {
    uni.showToast({
      title: copy.value.registration.phoneInvalid,
      icon: "none"
    });
    return;
  }

  if (
    !Number.isInteger(attendeeCount) ||
    attendeeCount < 1 ||
    attendeeCount > 10
  ) {
    uni.showToast({
      title: copy.value.registration.attendeesInvalid,
      icon: "none"
    });
    return;
  }

  submitting.value = true;
  ticketCode.value = "";

  const currentEventId = event.value._id;

  try {
    const result = await mobileApi.events.register(currentEventId, {
      contact_name: name,
      contact_phone: phone,
      attendee_count: attendeeCount,
      source_channel: "miniapp"
    });

    registrations.value = mergeRegistration(
      registrations.value,
      result.data.registration
    );
    ticketCode.value = result.data.ticket.ticket_code;
    uni.showToast({ title: copy.value.registration.success, icon: "success" });
  } catch (err) {
    const shouldConfirm = shouldConfirmRegistrationAfterSubmitError(err);
    const confirmed = shouldConfirm
      ? await confirmRegistrationAfterSubmitError(currentEventId)
      : false;

    if (confirmed) {
      uni.showToast({
        title: copy.value.registration.success,
        icon: "success"
      });
      return;
    }

    console.warn("[events:signup] submit failed", err);
    uni.showToast({ title: copy.value.registration.failed, icon: "none" });
  } finally {
    submitting.value = false;
  }
};

const confirmRegistrationAfterSubmitError = async (currentEventId: string) => {
  try {
    const registrationResult = await mobileApi.events.myRegistrations();
    const latestRegistrations = Array.isArray(registrationResult.data)
      ? registrationResult.data
      : [];
    const confirmedRegistration = findActiveRegistrationForEvent(
      latestRegistrations,
      currentEventId
    );

    if (!confirmedRegistration) {
      console.warn(
        "[events:signup] no registration found after submit failure"
      );
      return false;
    }

    registrations.value = mergeRegistration(
      latestRegistrations,
      confirmedRegistration
    );
    await loadRegistrationTicket(confirmedRegistration);
    console.warn(
      "[events:signup] registration confirmed after submit failure",
      confirmedRegistration._id
    );
    return true;
  } catch (confirmationError) {
    console.warn(
      "[events:signup] registration confirmation failed",
      confirmationError
    );
    return false;
  }
};

const mergeRegistration = (
  items: EventRegistration[],
  registration: EventRegistration
) => {
  const existingIndex = items.findIndex(
    (item) => item._id === registration._id
  );

  if (existingIndex >= 0) {
    return items.map((item, index) =>
      index === existingIndex ? registration : item
    );
  }

  return [...items, registration];
};

</script>

<template>
  <view class="page">
    <view v-if="loading" class="state-text">{{ copy.states.loading }}</view>
    <view v-else-if="error" class="state-text error">{{ error }}</view>

    <template v-else-if="event">
      <view class="card">
        <text class="title">{{
          pickLocalized(state.locale, event.title_zh, event.title_en)
        }}</text>
        <text class="meta">{{ copy.time }}: {{ eventTimeRange }}</text>
        <text class="meta">{{ copy.place }}: {{ eventAddress }}</text>
      </view>

      <view v-if="!signupState.canSignup" class="notice-card">
        <text class="notice-title">{{ signupCopy.label }}</text>
        <text class="notice-text">{{ signupCopy.reason }}</text>
      </view>

      <view class="card" :class="{ disabled: !signupState.canSignup }">
        <text class="section-title">{{ copy.registration.title }}</text>

        <view class="field">
          <text class="label">{{ copy.registration.name }}</text>
          <input
            v-model="form.name"
            class="input"
            :placeholder="copy.registration.namePlaceholder"
            :disabled="!signupState.canSignup"
          />
        </view>

        <view class="field">
          <text class="label">{{ copy.registration.phone }}</text>
          <input
            v-model="form.phone"
            class="input"
            :placeholder="copy.registration.phonePlaceholder"
            type="number"
            :maxlength="PHONE_NUMBER_LENGTH"
            :disabled="!signupState.canSignup"
          />
        </view>

        <view class="field">
          <text class="label">{{ copy.registration.attendees }}</text>
          <input
            v-model="form.attendeeCount"
            class="input"
            :placeholder="copy.registration.attendeesPlaceholder"
            type="number"
            :disabled="!signupState.canSignup"
          />
        </view>

        <button
          class="primary"
          :class="{ disabled: !signupState.canSignup }"
          :disabled="!signupState.canSignup"
          :loading="submitting"
          @click="submit"
        >
          {{ signupState.canSignup ? copy.registration.submit : signupCopy.label }}
        </button>
      </view>

      <view v-if="ticketCode" class="success-card">
        <text class="success-title">{{ copy.registration.success }}</text>
        <text class="success-text">
          {{ copy.registration.ticketCode }}: {{ ticketCode }}
        </text>
      </view>
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

.card,
.notice-card,
.success-card {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  border: 1rpx solid #e5e7eb;
}

.card.disabled {
  opacity: 0.75;
}

.title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
}

.meta {
  display: block;
  margin-top: 8rpx;
  color: #374151;
  font-size: 25rpx;
}

.section-title {
  display: block;
  margin-bottom: 18rpx;
  font-size: 30rpx;
  font-weight: 700;
}

.field {
  margin-bottom: 18rpx;
}

.label {
  display: block;
  margin-bottom: 8rpx;
  color: #4b5563;
  font-size: 24rpx;
}

.input {
  height: 78rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
  font-size: 26rpx;
}

.primary {
  margin-top: 8rpx;
  background: #0f766e;
  color: #ffffff;
}

.primary.disabled {
  background: #9ca3af;
  color: #ffffff;
}

.notice-card {
  background: #fffbeb;
  border-color: #fde68a;
}

.notice-title,
.notice-text {
  display: block;
}

.notice-title {
  color: #92400e;
  font-size: 30rpx;
  font-weight: 700;
}

.notice-text {
  margin-top: 8rpx;
  color: #92400e;
}

.success-card {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.success-title,
.success-text {
  display: block;
}

.success-title {
  color: #047857;
  font-size: 30rpx;
  font-weight: 700;
}

.success-text {
  margin-top: 8rpx;
  color: #065f46;
}
</style>
