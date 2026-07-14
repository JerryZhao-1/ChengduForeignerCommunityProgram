<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import { uploadReportEvidence } from "@/api/report-evidence-upload";
import { getMobileCopy } from "@/i18n";
import { useAppStore } from "@/stores/app-store";
import { submitDiscoverReport } from "./report-submit";

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).discover);

const postId = ref("");
const commentId = ref("");
const statusBarHeight = ref(0);
const reasonIndex = ref(-1);
const otherReason = ref("");
const detail = ref("");
const imagePaths = ref<string[]>([]);
const videoPaths = ref<string[]>([]);
const isSubmitting = ref(false);

const customNavStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value}px`
}));

const reasonOptions = computed(() => copy.value.reportReasonOptions);
const selectedReason = computed(() =>
  reasonIndex.value >= 0 ? reasonOptions.value[reasonIndex.value] : null
);
const isOtherReason = computed(() => selectedReason.value?.value === "other");
const selectedReasonLabel = computed(
  () => selectedReason.value?.label ?? copy.value.reportReasonSelectPlaceholder
);
const canAddImages = computed(() => imagePaths.value.length < 9);

onLoad((query) => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight ?? 0;
  postId.value = String(query?.id ?? "");
  commentId.value = String(query?.commentId ?? "");
});

const goBack = () => {
  uni.navigateBack({ delta: 1 });
};

const onReasonChange = (event: { detail: { value: number | string } }) => {
  reasonIndex.value = Number(event.detail.value);
};

const addImages = async () => {
  if (!canAddImages.value) {
    uni.showToast({ title: copy.value.reportEvidenceImageLimit, icon: "none" });
    return;
  }

  try {
    const result = await uni.chooseImage({
      count: 9 - imagePaths.value.length,
      sizeType: ["compressed"]
    });
    imagePaths.value = [...imagePaths.value, ...result.tempFilePaths];
  } catch {
    // User cancellation does not require an error toast.
  }
};

const addVideo = async () => {
  try {
    const result = await uni.chooseVideo({
      sourceType: ["album", "camera"],
      compressed: true,
      maxDuration: 60
    });
    videoPaths.value = [...videoPaths.value, result.tempFilePath];
  } catch {
    // User cancellation does not require an error toast.
  }
};

const removeImage = (path: string) => {
  imagePaths.value = imagePaths.value.filter((item) => item !== path);
};

const removeVideo = (path: string) => {
  videoPaths.value = videoPaths.value.filter((item) => item !== path);
};

const getFileNameFromPath = (path: string, fallback: string) => {
  const cleanPath = path.split("?")[0] ?? path;
  return cleanPath.split("/").filter(Boolean).pop() || fallback;
};

const registerEvidenceFiles = async () => {
  const paths = [...imagePaths.value, ...videoPaths.value];
  const evidenceFileIds: string[] = [];
  const bizId = `pending_report_${postId.value}`;

  for (const [index, path] of paths.entries()) {
    const fileName = getFileNameFromPath(path, `evidence-${index + 1}`);
    const asset = await uploadReportEvidence({
      filePath: path,
      fileName,
      bizId
    });
    evidenceFileIds.push(asset.file_id);
  }

  return evidenceFileIds;
};

const getReasonForSubmit = () => {
  if (!selectedReason.value) {
    return "";
  }

  if (!isOtherReason.value) {
    return selectedReason.value.label;
  }

  return otherReason.value.trim();
};

const getDescriptionForSubmit = () => {
  const parts = [];
  const trimmedDetail = detail.value.trim();

  if (trimmedDetail) {
    parts.push(trimmedDetail);
  }

  if (imagePaths.value.length || videoPaths.value.length) {
    parts.push(
      `${copy.value.reportEvidenceSummaryPrefix}${imagePaths.value.length}${copy.value.reportEvidenceImageUnit}${videoPaths.value.length}${copy.value.reportEvidenceVideoUnit}`
    );
  }

  return parts.join("\n");
};

const submitReport = async () => {
  if (isSubmitting.value) {
    return;
  }

  if (!postId.value) {
    uni.showToast({ title: copy.value.detailMissing, icon: "none" });
    return;
  }

  if (!selectedReason.value) {
    uni.showToast({ title: copy.value.reportReasonRequired, icon: "none" });
    return;
  }

  const reason = getReasonForSubmit();
  if (!reason) {
    uni.showToast({
      title: copy.value.reportOtherReasonRequired,
      icon: "none"
    });
    return;
  }

  isSubmitting.value = true;
  try {
    const description = getDescriptionForSubmit();
    const evidenceFileIds = await registerEvidenceFiles();
    await submitDiscoverReport(
      mobileApi.discover,
      {
        postId: postId.value,
        commentId: commentId.value || undefined
      },
      {
        reason,
        description: description || undefined,
        evidence_file_ids: evidenceFileIds
      }
    );
    uni.showToast({ title: copy.value.reportSuccess, icon: "success" });
    setTimeout(() => {
      uni.navigateBack({ delta: 1 });
    }, 800);
  } catch {
    uni.showToast({ title: copy.value.reportError, icon: "none" });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <view class="page">
    <view class="custom-nav" :style="customNavStyle">
      <view class="nav-content">
        <view class="nav-back" @click.stop="goBack">‹</view>
        <view class="nav-title">{{ copy.reportTitle }}</view>
        <button
          class="nav-done"
          :disabled="isSubmitting"
          @click.stop="submitReport"
        >
          {{ isSubmitting ? copy.submittingReport : copy.reportDone }}
        </button>
        <view class="nav-spacer" />
      </view>
    </view>

    <view class="form-card">
      <view class="field-group">
        <view class="label">{{ copy.reportReasonLabel }}</view>
        <picker
          class="picker"
          mode="selector"
          :range="reasonOptions"
          range-key="label"
          :value="reasonIndex"
          @change="onReasonChange"
        >
          <view class="picker-value" :class="{ placeholder: reasonIndex < 0 }">
            {{ selectedReasonLabel }}
          </view>
        </picker>
      </view>

      <view v-if="isOtherReason" class="field-group">
        <view class="label">{{ copy.reportOtherReasonLabel }}</view>
        <input
          v-model="otherReason"
          class="input"
          maxlength="80"
          :placeholder="copy.reportOtherReasonPlaceholder"
        />
      </view>

      <view class="field-group">
        <view class="label">{{ copy.reportDescriptionLabel }}</view>
        <textarea
          v-model="detail"
          class="textarea"
          maxlength="800"
          :placeholder="copy.reportDescriptionPlaceholder"
        />
      </view>

      <view class="field-group">
        <view class="label">{{ copy.reportEvidenceLabel }}</view>
        <view class="evidence-hint">{{ copy.reportEvidenceHint }}</view>
        <view class="evidence-actions">
          <button
            class="secondary"
            :disabled="!canAddImages"
            @click="addImages"
          >
            {{ copy.reportAddImage }}
          </button>
          <button class="secondary" @click="addVideo">
            {{ copy.reportAddVideo }}
          </button>
        </view>

        <view
          v-if="imagePaths.length || videoPaths.length"
          class="evidence-list"
        >
          <view v-for="path in imagePaths" :key="path" class="evidence-item">
            <image class="evidence-image" :src="path" mode="aspectFill" />
            <button class="remove" @click="removeImage(path)">×</button>
          </view>
          <view
            v-for="path in videoPaths"
            :key="path"
            class="evidence-item video"
          >
            <view class="video-thumb">{{ copy.videoBadge }}</view>
            <button class="remove" @click="removeVideo(path)">×</button>
          </view>
        </view>
        <view v-else class="empty-evidence">{{
          copy.reportEvidenceEmpty
        }}</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8fafc;
}

.custom-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  border-bottom: 1rpx solid #eef2f7;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-height: 96rpx;
  padding: 0 24rpx;
}

.nav-back {
  width: 48rpx;
  height: 72rpx;
  line-height: 66rpx;
  color: #111827;
  font-size: 58rpx;
  font-weight: 300;
}

.nav-title {
  flex-shrink: 0;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.nav-spacer {
  flex: 1;
  min-width: 0;
}

.nav-done {
  flex-shrink: 0;
  margin: 0;
  padding: 0 22rpx;
  min-height: 52rpx;
  line-height: 52rpx;
  border-radius: 10rpx;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 24rpx;
}

.nav-done[disabled] {
  opacity: 0.7;
}

.form-card {
  margin: 24rpx;
  padding: 28rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  background: #ffffff;
}

.field-group {
  margin-bottom: 28rpx;
}

.field-group:last-child {
  margin-bottom: 0;
}

.label {
  margin-bottom: 10rpx;
  color: #374151;
  font-size: 26rpx;
  font-weight: 600;
}

.input,
.textarea,
.picker-value {
  box-sizing: border-box;
  width: 100%;
  background: #ffffff;
  border: 1rpx solid #d1d5db;
  border-radius: 12rpx;
  padding: 20rpx 22rpx;
  font-size: 26rpx;
}

.picker-value {
  min-height: 78rpx;
  color: #111827;
}

.picker-value.placeholder {
  color: #9ca3af;
}

.input {
  min-height: 78rpx;
}

.textarea {
  min-height: 220rpx;
  line-height: 1.6;
}

.evidence-hint {
  margin-bottom: 16rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.5;
}

.evidence-actions {
  display: flex;
  gap: 16rpx;
}

.secondary {
  flex: 1;
  border-radius: 10rpx;
  background: #e6f4ff;
  color: #0052d9;
  font-size: 26rpx;
}

.secondary[disabled] {
  opacity: 0.6;
}

.evidence-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
  margin-top: 18rpx;
}

.evidence-item {
  position: relative;
  overflow: hidden;
  height: 160rpx;
  border-radius: 12rpx;
  background: #e2e8f0;
}

.evidence-image,
.video-thumb {
  width: 100%;
  height: 100%;
}

.video-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111827;
  color: #ffffff;
  font-size: 24rpx;
}

.remove {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  margin: 0;
  padding: 0;
  width: 36rpx;
  height: 36rpx;
  line-height: 32rpx;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.72);
  color: #ffffff;
  font-size: 26rpx;
}

.empty-evidence {
  margin-top: 18rpx;
  padding: 22rpx;
  border-radius: 12rpx;
  background: #f9fafb;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.5;
}
</style>
