<script setup lang="ts">
import {
  EVENT_CONTACT_NAME_PATTERN,
  EVENT_CONTACT_PHONE_PATTERN,
  type Event,
  type EventRegistration
} from "@community-map/shared";
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import { getEventSignupState } from "./event-signup-state";

const { state } = useAppStore();
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

const registeredEventIds = computed(
  () => new Set(registrations.value.map((item) => item.event_id))
);

const signupState = computed(() =>
  event.value
    ? getEventSignupState(event.value, new Date(), {
        isRegistered: registeredEventIds.value.has(event.value._id)
      })
    : { canSignup: false, label: "暂不可报名", reason: "" }
);

const currentRegistration = computed(() =>
  event.value
    ? registrations.value.find((item) => item.event_id === event.value?._id) ?? null
    : null
);

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

  try {
    const [eventResult, registrationResult, meResult] = await Promise.all([
      mobileApi.events.detail(id),
      mobileApi.events.myRegistrations(),
      mobileApi.auth.me()
    ]);
    event.value = eventResult.data;
    registrations.value = Array.isArray(registrationResult.data)
      ? registrationResult.data
      : [];
    const currentPhone = meResult.data.user.phone ?? "";

    if (!form.value.phone && EVENT_CONTACT_PHONE_PATTERN.test(currentPhone)) {
      form.value.phone = currentPhone;
    }

    await loadRegistrationTicket(currentRegistration.value);
  } catch (err) {
    console.error(err);
    error.value = "活动加载失败，请稍后重试";
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  if (!event.value || submitting.value) {
    return;
  }

  if (!signupState.value.canSignup) {
    uni.showToast({ title: signupState.value.reason, icon: "none" });
    return;
  }

  const name = form.value.name.trim();
  const phone = form.value.phone.trim();
  const attendeeCount = Number(form.value.attendeeCount) || 1;

  if (!name || !phone) {
    uni.showToast({ title: "请填写姓名和电话", icon: "none" });
    return;
  }

  if (!EVENT_CONTACT_NAME_PATTERN.test(name)) {
    uni.showToast({ title: "姓名仅支持字母和空格", icon: "none" });
    return;
  }

  if (!EVENT_CONTACT_PHONE_PATTERN.test(phone)) {
    uni.showToast({ title: "电话格式需为 +xx xxxx xxxxxx", icon: "none" });
    return;
  }

  submitting.value = true;
  ticketCode.value = "";

  try {
    const result = await mobileApi.events.register(event.value._id, {
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
    uni.showToast({ title: "报名成功", icon: "success" });
  } catch (err) {
    console.error(err);
    uni.showToast({ title: "报名失败，请稍后重试", icon: "none" });
  } finally {
    submitting.value = false;
  }
};

const mergeRegistration = (
  items: EventRegistration[],
  registration: EventRegistration
) => {
  const existingIndex = items.findIndex((item) => item._id === registration._id);

  if (existingIndex >= 0) {
    return items.map((item, index) =>
      index === existingIndex ? registration : item
    );
  }

  return [...items, registration];
};

const formatTime = (input: string) => {
  const date = new Date(input);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${min}`;
};
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state-text">加载中...</view>
    <view v-else-if="error" class="state-text error">{{ error }}</view>

    <template v-else-if="event">
      <view class="card">
        <text class="title">{{ pickLocalized(state.locale, event.title_zh, event.title_en) }}</text>
        <text class="meta">时间：{{ formatTime(event.start_time) }} - {{ formatTime(event.end_time) }}</text>
        <text class="meta">地点：{{ event.address_text }}</text>
      </view>

      <view v-if="!signupState.canSignup" class="notice-card">
        <text class="notice-title">{{ signupState.label }}</text>
        <text class="notice-text">{{ signupState.reason }}</text>
      </view>

      <view class="card" :class="{ disabled: !signupState.canSignup }">
        <text class="section-title">报名信息</text>

        <view class="field">
          <text class="label">姓名</text>
          <input
            v-model="form.name"
            class="input"
            placeholder="请输入姓名"
            :disabled="!signupState.canSignup"
          />
        </view>

        <view class="field">
          <text class="label">电话</text>
          <input
            v-model="form.phone"
            class="input"
            placeholder="+86 1380 000000"
            type="text"
            :disabled="!signupState.canSignup"
          />
        </view>

        <view class="field">
          <text class="label">人数</text>
          <input
            v-model="form.attendeeCount"
            class="input"
            placeholder="请输入人数"
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
          {{ signupState.canSignup ? "提交报名" : signupState.label }}
        </button>
      </view>

      <view v-if="ticketCode" class="success-card">
        <text class="success-title">报名成功</text>
        <text class="success-text">凭证号：{{ ticketCode }}</text>
      </view>
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
