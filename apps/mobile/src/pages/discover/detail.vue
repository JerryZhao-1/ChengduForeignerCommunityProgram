<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { Post } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import SectionPanel from "@/components/SectionPanel.vue";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].discover);
const post = ref<Post | null>(null);
const postId = ref("");
const isLoading = ref(true);
const errorMessage = ref("");
const commentValue = ref("");
const isSubmittingComment = ref(false);
const showReportForm = ref(false);
const reportReason = ref("");
const reportDescription = ref("");
const isSubmittingReport = ref(false);

const getLanguageLabel = (language: Post["language"]) =>
  language === "zh" ? copy.value.languageZh : copy.value.languageEn;

const loadPost = async (id: string) => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const result = await mobileApi.discover.detailPost(id);
    post.value = result.data;
  } catch {
    post.value = null;
    errorMessage.value = copy.value.detailError;
  } finally {
    isLoading.value = false;
  }
};

onLoad((query) => {
  const id = String(query?.id ?? "");
  if (!id) {
    errorMessage.value = copy.value.detailMissing;
    isLoading.value = false;
    return;
  }

  postId.value = id;
  loadPost(id);
});

const submitComment = async () => {
  if (!post.value) {
    return;
  }

  const content = commentValue.value.trim();
  if (!content) {
    uni.showToast({ title: copy.value.commentRequired, icon: "none" });
    return;
  }

  isSubmittingComment.value = true;
  try {
    await mobileApi.discover.createComment(post.value._id, {
      content,
      language: state.locale
    });
    commentValue.value = "";
    uni.showToast({ title: copy.value.commentSuccess, icon: "success" });
  } catch {
    uni.showToast({ title: copy.value.commentError, icon: "none" });
  } finally {
    isSubmittingComment.value = false;
  }
};

const submitReport = async () => {
  if (!post.value) {
    return;
  }

  const reason = reportReason.value.trim();
  if (!reason) {
    uni.showToast({ title: copy.value.reportReasonRequired, icon: "none" });
    return;
  }

  isSubmittingReport.value = true;
  try {
    const result = await mobileApi.discover.reportPost(post.value._id, {
      reason,
      description: reportDescription.value.trim() || undefined
    });
    post.value = result.data;
    showReportForm.value = false;
    reportReason.value = "";
    reportDescription.value = "";
    uni.showToast({ title: copy.value.reportSuccess, icon: "success" });
  } catch {
    uni.showToast({ title: copy.value.reportError, icon: "none" });
  } finally {
    isSubmittingReport.value = false;
  }
};
</script>

<template>
  <view class="page">
    <AsyncStateCard v-if="isLoading" variant="loading" :text="copy.detailLoading" />
    <AsyncStateCard v-else-if="errorMessage" variant="error" :text="errorMessage" />

    <SectionPanel
      v-else-if="post"
      :title="post.title"
      :subtitle="`${getLanguageLabel(post.language)} · ${post.location_text || copy.locationFallback}`"
    >
      <view v-if="post.image_urls.length" class="gallery">
        <image
          v-for="url in post.image_urls"
          :key="url"
          class="gallery-image"
          :src="url"
          mode="aspectFill"
        />
      </view>

      <view class="content">{{ post.content }}</view>

      <view v-if="post.tag_ids.length" class="tags">
        <text v-for="tag in post.tag_ids" :key="tag" class="tag">#{{ tag }}</text>
      </view>

      <view class="status-row">
        <text class="status-pill">{{ post.review_status }}</text>
        <button class="report-toggle" @click="showReportForm = !showReportForm">
          {{ copy.reportTitle }}
        </button>
      </view>

      <view v-if="showReportForm" class="report-box">
        <input
          v-model="reportReason"
          class="input"
          :placeholder="copy.reportReasonPlaceholder"
        />
        <textarea
          v-model="reportDescription"
          class="textarea small"
          :placeholder="copy.reportDescriptionPlaceholder"
        />
        <button class="warning" :disabled="isSubmittingReport" @click="submitReport">
          {{ isSubmittingReport ? copy.submittingReport : copy.submitReport }}
        </button>
      </view>

      <view class="comment-box">
        <textarea
          v-model="commentValue"
          class="textarea"
          :placeholder="copy.commentPlaceholder"
        />
        <button
          class="primary"
          :disabled="isSubmittingComment"
          @click="submitComment"
        >
          {{ isSubmittingComment ? copy.submittingComment : copy.submitComment }}
        </button>
      </view>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
  min-height: 100vh;
  background: #f8fafc;
}

.gallery {
  display: grid;
  gap: 16rpx;
  margin-bottom: 22rpx;
}

.gallery-image {
  width: 100%;
  height: 320rpx;
  border-radius: 16rpx;
  background: #e2e8f0;
}

.content {
  line-height: 1.7;
  color: #111827;
  white-space: pre-wrap;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 20rpx;
}

.tag,
.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.tag {
  padding: 6rpx 14rpx;
  background: #e6f4ff;
  color: #0052d9;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-top: 24rpx;
}

.status-pill {
  padding: 6rpx 14rpx;
  background: #f3f4f6;
  color: #374151;
}

.report-toggle,
.warning,
.primary {
  border-radius: 10rpx;
  font-size: 26rpx;
}

.report-toggle {
  margin: 0;
  background: #fff7e6;
  color: #ad5a00;
}

.report-box,
.comment-box {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #e5e7eb;
}

.input {
  width: 100%;
  box-sizing: border-box;
  min-height: 78rpx;
  background: #ffffff;
  border: 1rpx solid #d1d5db;
  border-radius: 12rpx;
  padding: 20rpx 22rpx;
  font-size: 26rpx;
}

.textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 180rpx;
  background: #ffffff;
  border: 1rpx solid #d1d5db;
  border-radius: 12rpx;
  margin-top: 16rpx;
  padding: 20rpx 22rpx;
  line-height: 1.6;
}

.textarea.small {
  min-height: 140rpx;
}

.primary {
  margin-top: 20rpx;
  background: #1d4ed8;
  color: white;
}

.warning {
  margin-top: 20rpx;
  background: #fff1f0;
  color: #c41d7f;
}

.primary[disabled],
.warning[disabled] {
  opacity: 0.7;
}
</style>
