<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Notification } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { formatLocalizedDate, getMobileCopy } from "@/i18n";
import { useAppStore } from "@/stores/app-store";
import { resolveNotificationPresentation } from "./notification-presentation";

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).notifications);
const notifications = ref<Notification[]>([]);
const loading = ref(true);
const error = ref("");
const updatingId = ref("");

const load = async () => {
  loading.value = true;
  error.value = "";
  try {
    const result = await mobileApi.notifications.list();
    notifications.value = result.data;
  } catch {
    notifications.value = [];
    error.value = copy.value.error;
  } finally {
    loading.value = false;
  }
};

const markRead = async (item: Notification) => {
  if (item.status === "read" || updatingId.value) {
    return;
  }
  updatingId.value = item._id;
  try {
    await mobileApi.notifications.markRead(item._id);
    await load();
  } catch {
    error.value = copy.value.error;
  } finally {
    updatingId.value = "";
  }
};

const presentation = (item: Notification) =>
  resolveNotificationPresentation(item, state.locale);

onMounted(load);
</script>

<template>
  <view class="page">
    <view class="title">{{ copy.title }}</view>
    <AsyncStateCard v-if="loading" variant="loading" :text="copy.loading" />
    <AsyncStateCard v-else-if="error" variant="error" :text="error" />
    <AsyncStateCard
      v-else-if="notifications.length === 0"
      variant="empty"
      :text="copy.empty"
    />
    <view v-else>
      <view v-for="item in notifications" :key="item._id" class="card">
        <view class="row">
          <view class="notification-title">{{ presentation(item).title.value }}</view>
          <view class="status">
            {{ item.status === "read" ? copy.read : copy.unread }}
          </view>
        </view>
        <view class="body">{{ presentation(item).body.value }}</view>
        <view class="date">
          {{ formatLocalizedDate(state.locale, item.created_at) }}
        </view>
        <button
          class="mark-read"
          size="mini"
          :disabled="item.status === 'read' || updatingId === item._id"
          @click="markRead(item)"
        >
          {{
            updatingId === item._id
              ? copy.markingRead
              : item.status === "read"
                ? copy.read
                : copy.markRead
          }}
        </button>
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

.row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.notification-title {
  font-weight: 600;
}

.status {
  color: #64748b;
  font-size: 22rpx;
}

.body,
.date {
  margin-top: 8rpx;
  color: #6b7280;
}

.date {
  font-size: 22rpx;
}

.mark-read {
  margin: 16rpx 0 0;
}
</style>
