<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { EventRegistration } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { getMobileCopy } from "@/i18n";
import { useAppStore } from "@/stores/app-store";
import { getRegistrationStatusLabel } from "./registration-presentation";

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).registrations);
const registrations = ref<EventRegistration[]>([]);
const loading = ref(true);
const error = ref("");

const load = async () => {
  loading.value = true;
  error.value = "";
  try {
    const result = await mobileApi.events.myRegistrations();
    registrations.value = result.data;
  } catch {
    registrations.value = [];
    error.value = copy.value.error;
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>

<template>
  <view class="page">
    <view class="title">{{ copy.title }}</view>
    <AsyncStateCard v-if="loading" variant="loading" :text="copy.loading" />
    <AsyncStateCard v-else-if="error" variant="error" :text="error" />
    <AsyncStateCard
      v-else-if="registrations.length === 0"
      variant="empty"
      :text="copy.empty"
    />
    <view v-else>
      <view v-for="item in registrations" :key="item._id" class="card">
        <view class="record-title">{{ copy.record }}: {{ item._id }}</view>
        <view class="caption">
          {{ copy.status }}:
          {{ getRegistrationStatusLabel(state.locale, item.registration_status) }}
        </view>
        <view class="caption">{{ copy.contact }}: {{ item.contact_name }}</view>
        <view class="caption">{{ copy.phone }}: {{ item.contact_phone }}</view>
        <view class="caption">{{ copy.attendees }}: {{ item.attendee_count }}</view>
        <view class="caption">{{ copy.ticket }}: {{ item.ticket_id }}</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f8fafc;
}

.title {
  margin-bottom: 22rpx;
  font-size: 36rpx;
  font-weight: 700;
}

.card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
}

.record-title {
  font-weight: 600;
}

.caption {
  margin-top: 10rpx;
  color: #6b7280;
}
</style>
