<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { Event, PlaceListItem } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import { uploadPostMedia } from "@/api/post-media-upload";
import SectionPanel from "@/components/SectionPanel.vue";
import { appCopy } from "@/i18n/copy";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import { getDiscoverEnforcementMessage } from "./enforcement-error";
import { getMediaKind } from "./media";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].discover);

const form = reactive({
  title: "",
  content: "",
  language: "en" as "zh" | "en",
  tagsText: "",
  location_text: "",
  imageUrlsText: "",
  place_id: null as string | null,
  event_id: null as string | null
});

const isSubmitting = ref(false);
const isPickingMedia = ref(false);
const places = ref<PlaceListItem[]>([]);
const events = ref<Event[]>([]);

interface SelectedMedia {
  id: string;
  url: string;
  kind: "image" | "video";
  fileName: string;
  fileId: string | null;
  isUploading: boolean;
  error: string;
}

const selectedMedia = ref<SelectedMedia[]>([]);
const placePickerLabels = computed(() => [
  copy.value.associationNone,
  ...places.value.map((place) =>
    pickLocalized(state.locale, place.name_zh, place.name_en)
  )
]);
const eventPickerLabels = computed(() => [
  copy.value.associationNone,
  ...events.value.map((event) =>
    pickLocalized(state.locale, event.title_zh, event.title_en)
  )
]);
const selectedPlaceLabel = computed(() => {
  const place = places.value.find((item) => item._id === form.place_id);
  return place
    ? pickLocalized(state.locale, place.name_zh, place.name_en)
    : copy.value.associationNone;
});
const selectedEventLabel = computed(() => {
  const event = events.value.find((item) => item._id === form.event_id);
  return event
    ? pickLocalized(state.locale, event.title_zh, event.title_en)
    : copy.value.associationNone;
});

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

const mediaPreviewItems = computed(() => [
  ...selectedMedia.value.map((item) => ({
    id: item.id,
    url: item.url,
    kind: item.kind,
    isUploading: item.isUploading,
    error: item.error
  })),
  ...parseImageUrls().map((url) => ({
    id: "",
    url,
    kind: getMediaKind(url),
    isUploading: false,
    error: ""
  }))
]);

const showValidation = (title: string) => {
  uni.showToast({
    title,
    icon: "none"
  });
};

const fileNameFromPath = (path: string, kind: "image" | "video") => {
  const raw = path.split("/").pop()?.split("?")[0] ?? "";
  return (
    raw || `post-${kind}-${Date.now()}.${kind === "video" ? "mp4" : "jpg"}`
  );
};

const completeSelectedMedia = async (item: SelectedMedia) => {
  item.isUploading = true;
  item.error = "";

  try {
    const asset = await uploadPostMedia({
      filePath: item.url,
      fileName: item.fileName,
      kind: item.kind
    });
    item.fileId = asset.file_id;
  } catch {
    item.error = copy.value.mediaUploadError;
  } finally {
    item.isUploading = false;
  }
};

const chooseMedia = () => {
  if (isPickingMedia.value) {
    return;
  }

  isPickingMedia.value = true;
  uni.chooseMedia({
    count: Math.max(1, 9 - selectedMedia.value.length),
    mediaType: ["image", "video"],
    sourceType: ["album", "camera"],
    success: async (result) => {
      const tempFiles = (result.tempFiles ?? []) as Array<{
        tempFilePath: string;
        fileType?: "image" | "video";
      }>;
      const items = tempFiles.map((file) => {
        const kind = file.fileType === "video" ? "video" : "image";
        return {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          url: file.tempFilePath,
          kind,
          fileName: fileNameFromPath(file.tempFilePath, kind),
          fileId: null,
          isUploading: false,
          error: ""
        } satisfies SelectedMedia;
      });

      selectedMedia.value = [...selectedMedia.value, ...items].slice(0, 9);
      await Promise.all(items.map(completeSelectedMedia));
    },
    complete: () => {
      isPickingMedia.value = false;
    }
  });
};

const removeMedia = (id: string) => {
  selectedMedia.value = selectedMedia.value.filter((item) => item.id !== id);
};

const loadAssociationOptions = async () => {
  const [placeResult, eventResult] = await Promise.allSettled([
    mobileApi.places.list({ communityId: state.communityId, pageSize: 50 }),
    mobileApi.events.list({ communityId: state.communityId, pageSize: 50 })
  ]);

  if (placeResult.status === "fulfilled") {
    places.value = placeResult.value.data.items;
  }

  if (eventResult.status === "fulfilled") {
    events.value = eventResult.value.data.items;
  }
};

const onPlacePicked = (event: { detail: { value: string | number } }) => {
  const index = Number(event.detail.value);
  form.place_id = index > 0 ? (places.value[index - 1]?._id ?? null) : null;
};

const onEventPicked = (event: { detail: { value: string | number } }) => {
  const index = Number(event.detail.value);
  form.event_id = index > 0 ? (events.value[index - 1]?._id ?? null) : null;
};

onLoad((query) => {
  form.place_id = String(query?.placeId ?? "").trim() || null;
  form.event_id = String(query?.eventId ?? "").trim() || null;
  void loadAssociationOptions();
});

const submit = async () => {
  if (isSubmitting.value) {
    return;
  }

  const title = form.title.trim();
  const content = form.content.trim();
  const tagIds = parseTags();
  const imageUrls = parseImageUrls();
  const isUploadingMedia = selectedMedia.value.some((item) => item.isUploading);
  const failedMedia = selectedMedia.value.filter((item) => item.error);
  const imageFileIds = selectedMedia.value
    .map((item) => item.fileId)
    .filter((fileId): fileId is string => !!fileId);

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

  if (isUploadingMedia) {
    showValidation(copy.value.mediaUploading);
    return;
  }

  if (failedMedia.length) {
    showValidation(copy.value.mediaUploadError);
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
      image_file_ids: imageFileIds,
      image_urls: imageUrls,
      place_id: form.place_id,
      event_id: form.event_id
    });

    uni.showToast({ title: copy.value.createSuccess, icon: "success" });
    uni.redirectTo({
      url: `/pages/discover/detail?id=${result.data._id}`
    });
  } catch (err) {
    uni.showToast({
      title:
        getDiscoverEnforcementMessage(err, copy.value) ||
        copy.value.createError,
      icon: "none"
    });
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
        <view class="label">{{ copy.placeAssociationLabel }}</view>
        <picker :range="placePickerLabels" @change="onPlacePicked">
          <view class="picker-field">{{ selectedPlaceLabel }}</view>
        </picker>
      </view>

      <view class="field-group">
        <view class="label">{{ copy.eventAssociationLabel }}</view>
        <picker :range="eventPickerLabels" @change="onEventPicked">
          <view class="picker-field">{{ selectedEventLabel }}</view>
        </picker>
      </view>

      <view class="field-group">
        <view class="label">{{ copy.mediaPickerLabel }}</view>
        <button
          class="media-picker"
          :disabled="isPickingMedia || selectedMedia.length >= 9"
          @click="chooseMedia"
        >
          {{ isPickingMedia ? copy.mediaPicking : copy.mediaPickerButton }}
        </button>
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
            <view v-if="item.isUploading" class="preview-state">
              {{ copy.mediaUploading }}
            </view>
            <view v-else-if="item.error" class="preview-state error">
              {{ item.error }}
            </view>
            <button
              v-if="item.id"
              class="remove-media"
              @click="removeMedia(item.id)"
            >
              ×
            </button>
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
.textarea,
.picker-field {
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

.picker-field {
  min-height: 78rpx;
  color: #111827;
  line-height: 38rpx;
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
  position: relative;
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

.media-picker {
  margin: 0;
  border-radius: 10rpx;
  background: #0f766e;
  color: #ffffff;
  font-size: 26rpx;
}

.media-picker[disabled] {
  opacity: 0.7;
}

.preview-state {
  position: absolute;
  left: 14rpx;
  bottom: 14rpx;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  background: rgba(17, 24, 39, 0.76);
  color: #ffffff;
  font-size: 22rpx;
}

.preview-state.error {
  background: rgba(185, 28, 28, 0.86);
}

.remove-media {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.72);
  color: #ffffff;
  font-size: 34rpx;
  line-height: 48rpx;
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
