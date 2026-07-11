<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
import type { DiscoverReportCase } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { getMobileCopy } from "@/i18n";
import { useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).discover);
const reports = ref<DiscoverReportCase[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");

const reportStatusLabel = (report: DiscoverReportCase) => {
  const labels: Record<DiscoverReportCase["status"], string> = {
    open: copy.value.reportStatusOpen,
    actioned: copy.value.reportStatusActioned,
    rejected: copy.value.reportStatusRejected
  };
  return labels[report.status];
};

const loadReports = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const result = await mobileApi.discover.myReports({ pageSize: 50 });
    reports.value = result.data.items;
  } catch {
    reports.value = [];
    errorMessage.value = copy.value.myReportsError;
  } finally {
    isLoading.value = false;
    uni.stopPullDownRefresh();
  }
};

const openReport = (id: string) => {
  uni.navigateTo({ url: `/pages/more/my-report-detail?id=${id}` });
};

onLoad(loadReports);
onPullDownRefresh(loadReports);
</script>

<template>
  <view class="page">
    <view class="title">{{ copy.myReportsTitle }}</view>
    <AsyncStateCard
      v-if="isLoading"
      variant="loading"
      :text="copy.myReportsLoading"
    />
    <view v-else-if="errorMessage" class="status-block">
      <AsyncStateCard variant="error" :text="errorMessage" />
      <button class="retry" @click="loadReports">{{ copy.retry }}</button>
    </view>
    <AsyncStateCard
      v-else-if="reports.length === 0"
      variant="empty"
      :text="copy.myReportsEmpty"
    />

    <view v-else class="list">
      <view
        v-for="report in reports"
        :key="report._id"
        class="card"
        @click="openReport(report._id)"
      >
        <view class="row">
          <view class="reason">{{ report.reason }}</view>
          <text class="status">{{ reportStatusLabel(report) }}</text>
        </view>
        <view class="desc">{{ report.description || copy.reportNoDescription }}</view>
        <view class="meta">
          <text>{{ report.target_type }}</text>
          <text>{{ report.created_at.slice(0, 10) }}</text>
        </view>
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
  color: #111827;
  font-size: 36rpx;
  font-weight: 700;
}

.status-block,
.list {
  display: grid;
  gap: 16rpx;
}

.retry {
  border-radius: 10rpx;
  background: #fff1f0;
  color: #c41d7f;
  font-size: 26rpx;
}

.card {
  padding: 20rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 14rpx;
  background: #ffffff;
}

.row {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
}

.reason {
  flex: 1;
  min-width: 0;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.status {
  flex-shrink: 0;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  background: #f3f4f6;
  color: #374151;
  font-size: 22rpx;
}

.desc,
.meta {
  margin-top: 12rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.5;
}

.meta {
  display: flex;
  gap: 14rpx;
}
</style>
