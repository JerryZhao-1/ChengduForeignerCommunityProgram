<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { DiscoverReportCase } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].discover);
const report = ref<DiscoverReportCase | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

const statusLabel = computed(() => {
  if (!report.value) {
    return "";
  }
  const labels: Record<DiscoverReportCase["status"], string> = {
    open: copy.value.reportStatusOpen,
    actioned: copy.value.reportStatusActioned,
    rejected: copy.value.reportStatusRejected
  };
  return labels[report.value.status];
});

const loadReport = async (id: string) => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const result = await mobileApi.discover.myReportDetail(id);
    report.value = result.data;
  } catch {
    report.value = null;
    errorMessage.value = copy.value.myReportsError;
  } finally {
    isLoading.value = false;
  }
};

const openPost = () => {
  if (!report.value) {
    return;
  }
  uni.navigateTo({ url: `/pages/discover/detail?id=${report.value.post_id}` });
};

onLoad((query) => {
  const id = String(query?.id ?? "").trim();
  if (id) {
    void loadReport(id);
    return;
  }
  isLoading.value = false;
  errorMessage.value = copy.value.detailMissing;
});
</script>

<template>
  <view class="page">
    <view class="title">{{ copy.myReportDetailTitle }}</view>
    <AsyncStateCard v-if="isLoading" variant="loading" :text="copy.loading" />
    <AsyncStateCard v-else-if="errorMessage" variant="error" :text="errorMessage" />

    <view v-else-if="report" class="card">
      <view class="status">{{ statusLabel }}</view>
      <view class="field">
        <view class="label">{{ copy.reportReasonLabel }}</view>
        <view class="value">{{ report.reason }}</view>
      </view>
      <view class="field">
        <view class="label">{{ copy.reportDescriptionLabel }}</view>
        <view class="value">{{ report.description || copy.reportNoDescription }}</view>
      </view>
      <view class="field">
        <view class="label">{{ copy.reportEvidenceLabel }}</view>
        <view class="value">{{ report.evidence_file_ids.length }}</view>
      </view>
      <view class="field">
        <view class="label">{{ copy.reportResolutionLabel }}</view>
        <view class="value">{{ report.resolution_note || copy.reportPendingResolution }}</view>
      </view>
      <button class="primary" @click="openPost">{{ copy.openPost }}</button>
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

.card {
  display: grid;
  gap: 18rpx;
  padding: 24rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 14rpx;
  background: #ffffff;
}

.status {
  justify-self: flex-start;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  background: #f3f4f6;
  color: #374151;
  font-size: 24rpx;
}

.field {
  display: grid;
  gap: 8rpx;
}

.label {
  color: #64748b;
  font-size: 24rpx;
}

.value {
  color: #111827;
  font-size: 28rpx;
  line-height: 1.5;
  white-space: pre-wrap;
}

.primary {
  margin: 0;
  border-radius: 10rpx;
  background: #0f766e;
  color: #ffffff;
  font-size: 26rpx;
}
</style>
