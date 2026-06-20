<script setup lang="ts">
import type { Event, EventRegistration, EventTicket } from "@community-map/shared";
import { onShow } from "@dcloudio/uni-app";
import { ref } from "vue";

import { mobileApi } from "@/api/client";
import { pickLocalized, useAppStore } from "@/stores/app-store";

interface RegistrationCard {
  registration: EventRegistration;
  ticket: EventTicket | null;
  event: Event | null;
}

const { state } = useAppStore();
const cards = ref<RegistrationCard[]>([]);
const loading = ref(false);
const error = ref("");

const registrationStatusLabels: Record<EventRegistration["registration_status"], string> = {
  submitted: "已提交",
  confirmed: "已确认",
  cancelled: "已取消",
  closed: "已关闭"
};

const load = async () => {
  loading.value = true;
  error.value = "";

  try {
    const registrationResult = await mobileApi.events.myRegistrations();
    const registrations = Array.isArray(registrationResult.data)
      ? registrationResult.data
      : [];

    cards.value = await Promise.all(
      registrations.map(async (registration) => {
        const [ticketResult, eventResult] = await Promise.all([
          mobileApi.events.registrationTicket(registration._id),
          mobileApi.events.detail(registration.event_id)
        ]);

        return {
          registration,
          ticket: ticketResult.data,
          event: eventResult.data
        };
      })
    );
  } catch (err) {
    console.error(err);
    error.value = "报名凭证加载失败，请稍后重试";
  } finally {
    loading.value = false;
  }
};

const eventTitle = (item: RegistrationCard) =>
  item.event
    ? pickLocalized(state.locale, item.event.title_zh, item.event.title_en)
    : item.registration.event_id;

const openEvent = (item: RegistrationCard) => {
  uni.navigateTo({ url: `/pages/events/detail?id=${item.registration.event_id}` });
};

onShow(load);
</script>

<template>
  <view class="page">
    <view v-if="loading" class="state-text">加载中...</view>
    <view v-else-if="error" class="state-text error">{{ error }}</view>
    <view v-else-if="!cards.length" class="state-text">暂无报名凭证</view>

    <template v-else>
      <view
        v-for="item in cards"
        :key="item.registration._id"
        class="card"
        @click="openEvent(item)"
      >
        <view class="event-title">{{ eventTitle(item) }}</view>
        <view class="row">入场凭证：{{ item.ticket?.ticket_code ?? "暂无凭证" }}</view>
        <view class="row">报名记录：{{ item.registration._id }}</view>
        <view class="row">
          状态：{{ registrationStatusLabels[item.registration.registration_status] }}
        </view>
      </view>
    </template>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
  min-height: 100vh;
  background: #f3f4f6;
}

.card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #e5e7eb;
}

.card:active {
  background: #f9fafb;
}

.event-title {
  color: #111827;
  font-size: 32rpx;
  font-weight: 700;
}

.row {
  margin-top: 10rpx;
  color: #374151;
  font-size: 26rpx;
}

.state-text {
  padding: 120rpx 0;
  text-align: center;
  color: #6b7280;
}

.state-text.error {
  color: #b91c1c;
}
</style>
