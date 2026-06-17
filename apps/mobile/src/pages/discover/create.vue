<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";
import { getMediaKind } from "./media";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].discover);

const form = reactive({
  title: "",
  content: "",
  language: "en" as "zh" | "en",
  tagsText: "",
  location_text: "",
  imageUrlsText: ""
});

const isSubmitting = ref(false);

const parseTags = () =>
  form.tagsText
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

const parseImageUrls = () =>
  form.imageUrlsText
    .split(/\n/)
    .map((url) => url.trim())
    .filter(Boolean);

const hasInvalidImageUrl = (urls: string[]) =>
  urls.some((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol !== "http:" && parsed.protocol !== "https:";
    } catch {
      return true;
    }
  });

const mediaPreviewItems = computed(() =>
  parseImageUrls().map((url) => ({
    url,
    kind: getMediaKind(url)
  }))
);

const showValidation = (title: string) => {
  uni.showToast({
    title,
    icon: "none"
  });
};

const submit = async () => {
  if (isSubmitting.value) {
    return;
  }

  const title = form.title.trim();
  const content = form.content.trim();
  const tagIds = parseTags();
  const imageUrls = parseImageUrls();

  if (!title) {
    showValidation(copy.value.titleRequired);
    return;
  }

  if (!content) {
    showValidation(copy.value.contentRequired);
    return;
  }

  if (!tagIds.length) {
    showValidation(copy.value.tagsRequired);
    return;
  }

  if (hasInvalidImageUrl(imageUrls)) {
    showValidation(copy.value.invalidImageUrl);
    return;
  }

  isSubmitting.value = true;
  try {
    const result = await mobileApi.discover.createPost({
      title,
      content,
      language: form.language,
      tag_ids: tagIds,
      location_text: form.location_text.trim() || null,
      image_file_ids: [],
      image_urls: imageUrls
    });

    uni.showToast({ title: copy.value.createSuccess, icon: "success" });
    uni.redirectTo({
      url: `/pages/discover/detail?id=${result.data._id}`
    });
  } catch {
    uni.showToast({ title: copy.value.createError, icon: "none" });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <view class="page">
    <SectionPanel :title="copy.createTitle" :subtitle="copy.createSubtitle">
      <view class="field-group">
        <view class="label">{{ copy.titleLabel }}</view>
        <input
          v-model="form.title"
          class="input"
          maxlength="80"
          :placeholder="copy.titlePlaceholder"
        />
      </view>

      <view class="field-group">
        <view class="label">{{ copy.contentLabel }}</view>
        <textarea
          v-model="form.content"
          class="textarea"
          maxlength="1200"
          :placeholder="copy.contentPlaceholder"
        />
      </view>

      <view class="field-group">
        <view class="label">{{ copy.languageLabel }}</view>
        <view class="segmented">
          <button
            class="segment"
            :class="{ active: form.language === 'zh' }"
            @click="form.language = 'zh'"
          >
            {{ copy.languageZh }}
          </button>
          <button
            class="segment"
            :class="{ active: form.language === 'en' }"
            @click="form.language = 'en'"
          >
            {{ copy.languageEn }}
          </button>
        </view>
      </view>

      <view class="field-group">
        <view class="label">{{ copy.tagsLabel }}</view>
        <input
          v-model="form.tagsText"
          class="input"
          :placeholder="copy.tagsPlaceholder"
        />
      </view>

      <view class="field-group">
        <view class="label">{{ copy.locationLabel }}</view>
        <input
          v-model="form.location_text"
          class="input"
          :placeholder="copy.locationPlaceholder"
        />
      </view>

      <view class="field-group">
        <view class="label">{{ copy.imageUrlsLabel }}</view>
        <textarea
          v-model="form.imageUrlsText"
          class="textarea small"
          :placeholder="copy.imageUrlsPlaceholder"
        />
      </view>

      <view class="preview-section">
        <view class="label">{{ copy.mediaPreviewLabel }}</view>
        <view v-if="mediaPreviewItems.length" class="preview-list">
          <view
            v-for="item in mediaPreviewItems"
            :key="item.url"
            class="preview-item"
            :class="item.kind"
          >
            <image
              v-if="item.kind === 'image'"
              class="preview-image"
              :src="item.url"
              mode="aspectFill"
            />
            <view v-else class="preview-video">
              <text class="preview-play">▶</text>
              <text>{{ copy.videoBadge }}</text>
            </view>
          </view>
        </view>
        <view v-else class="no-preview">{{ copy.noMediaPreview }}</view>
      </view>

      <button class="primary" :disabled="isSubmitting" @click="submit">
        {{ isSubmitting ? copy.submittingPost : copy.submitPost }}
      </button>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
  min-height: 100vh;
  background: #f8fafc;
}

.field-group {
  margin-bottom: 22rpx;
}

.label {
  margin-bottom: 10rpx;
  color: #374151;
  font-size: 26rpx;
  font-weight: 600;
}

.input,
.textarea {
  width: 100%;
  box-sizing: border-box;
  background: #ffffff;
  border: 1rpx solid #d1d5db;
  border-radius: 12rpx;
  padding: 20rpx 22rpx;
  font-size: 26rpx;
}

.input {
  min-height: 78rpx;
}

.textarea {
  min-height: 220rpx;
  line-height: 1.6;
}

.textarea.small {
  min-height: 160rpx;
}

.preview-section {
  margin-bottom: 24rpx;
}

.preview-list {
  display: grid;
  gap: 14rpx;
}

.preview-item {
  overflow: hidden;
  border-radius: 14rpx;
  background: #e2e8f0;
}

.preview-image,
.preview-video {
  width: 100%;
  height: 220rpx;
}

.preview-video {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: #111827;
  color: #ffffff;
  font-size: 26rpx;
}

.preview-play {
  font-size: 24rpx;
}

.no-preview {
  padding: 22rpx;
  border-radius: 12rpx;
  background: #f9fafb;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.5;
}

.segmented {
  display: flex;
  gap: 16rpx;
}

.segment {
  flex: 1;
  border-radius: 10rpx;
  background: #f3f4f6;
  color: #374151;
  font-size: 26rpx;
}

.segment.active {
  background: #e6f4ff;
  color: #0052d9;
}

.primary {
  margin-top: 8rpx;
  border-radius: 10rpx;
  background: #1d4ed8;
  color: white;
  font-size: 28rpx;
}

.primary[disabled] {
  opacity: 0.7;
}
</style>
