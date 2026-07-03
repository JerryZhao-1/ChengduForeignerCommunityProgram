<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import type { PlaceDetail } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import SectionPanel from "@/components/SectionPanel.vue";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import { getPlacesCopy } from "./copy";
import { usePlaceFavoriteState } from "./favorite-state";
import {
  buildPlaceDetailNavigationTarget,
  openPlaceNativeNavigation,
  PLACE_MAP_FOCUS_STORAGE_KEY,
  placesPagePaths
} from "./navigation";
import { usePlaceAsyncState } from "./usePlaceAsyncState";

const { state } = useAppStore();
const place = ref<PlaceDetail | null>(null);
const { loading, error, run, setError } = usePlaceAsyncState();
const detailCopy = computed(() => getPlacesCopy(state.locale, "detail"));
const { isFavorite, toggleFavorite } = usePlaceFavoriteState(
  () => place.value?._id ?? null
);
const failedExternalImages = ref<Set<string>>(new Set());
const galleryItems = computed(() => {
  if (!place.value) {
    return [];
  }

  const ownedMedia =
    place.value.gallery_media.length > 0
      ? place.value.gallery_media
      : place.value.gallery_urls.map((url, index) => ({
          file_id: `legacy-gallery-${index + 1}`,
          cloud_path: "",
          url,
          alt_zh: `${place.value?.name_zh ?? ""} 图集 ${index + 1}`,
          alt_en: `${place.value?.name_en ?? ""} gallery ${index + 1}`
        }));

  return [
    ...ownedMedia.map((media) => ({
      key: `owned-${media.file_id}`,
      kind: "owned" as const,
      url: media.url,
      alt_zh: media.alt_zh,
      alt_en: media.alt_en,
      attribution: null
    })),
    ...place.value.external_gallery_media.map((media, index) => ({
      key: `external-${media.source_place_id}-${index}`,
      kind: "external" as const,
      url: media.image_url,
      alt_zh:
        media.image_title ??
        `${place.value?.name_zh ?? ""} 外部图集 ${index + 1}`,
      alt_en:
        media.image_title ??
        `${place.value?.name_en ?? ""} external gallery ${index + 1}`,
      attribution: media.attribution.label
    }))
  ];
});
const shareTitle = computed(() => {
  if (!place.value) {
    return detailCopy.value.shareFallbackTitle;
  }

  return pickLocalized(
    state.locale,
    place.value.share.title_zh || place.value.name_zh,
    place.value.share.title_en || place.value.name_en
  );
});
const shareSummary = computed(() => {
  if (!place.value) {
    return "";
  }

  return pickLocalized(
    state.locale,
    place.value.share.summary_zh || place.value.intro_zh,
    place.value.share.summary_en || place.value.intro_en
  );
});
const sharePath = computed(() =>
  place.value ? placesPagePaths.detail(place.value._id) : placesPagePaths.list()
);
const shareImageUrl = computed(() => place.value?.cover_url ?? undefined);
const localizedText = (zh: string, en: string) =>
  pickLocalized(state.locale, zh, en).trim();
const categorySubtitle = computed(() => {
  if (!place.value) {
    return "";
  }

  return place.value.category_level_2
    ? `${place.value.category_level_1} / ${place.value.category_level_2}`
    : place.value.category_level_1;
});
const hasUsableCoordinates = computed(() => {
  if (!place.value) {
    return false;
  }

  const { latitude, longitude } = place.value.location;
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
});
const canOpenNavigation = computed(
  () => place.value?.supports_navigation !== false && hasUsableCoordinates.value
);

const syncShareMenuAvailability = () => {
  if (place.value?.supports_share === false) {
    uni.hideShareMenu?.({
      hideShareItems: ["shareAppMessage", "shareTimeline"]
    });
    return;
  }

  uni.showShareMenu?.({
    menus: ["shareAppMessage", "shareTimeline"]
  });
};

onLoad(async (query) => {
  if (!query?.id) {
    setError(detailCopy.value.missingId);
    return;
  }

  const result = await run(
    () => mobileApi.places.detail(String(query.id)),
    detailCopy.value.error
  );

  if (result) {
    place.value = result.data;
    syncShareMenuAvailability();
  }
});

onShareAppMessage(() => ({
  title: shareTitle.value,
  path: sharePath.value,
  imageUrl: shareImageUrl.value
}));

const openNavigation = () => {
  if (!place.value || !canOpenNavigation.value) {
    uni.showToast({
      title: detailCopy.value.navigationUnavailable,
      icon: "none"
    });
    return;
  }

  openPlaceNativeNavigation(
    {
      ...buildPlaceDetailNavigationTarget(place.value.navigation, state.locale)
    },
    {
      unavailable: detailCopy.value.navigationUnavailable,
      failed: detailCopy.value.navigationFailed
    }
  );
};

const openMapPosition = () => {
  if (!place.value || !hasUsableCoordinates.value) {
    uni.showToast({
      title: detailCopy.value.navigationUnavailable,
      icon: "none"
    });
    return;
  }

  uni.setStorageSync?.(PLACE_MAP_FOCUS_STORAGE_KEY, place.value._id);
  uni.switchTab({
    url: placesPagePaths.map()
  });
};

const toggleFavoriteState = () => {
  const nextState = !isFavorite.value;
  if (!toggleFavorite()) {
    return;
  }

  uni.showToast({
    title: nextState
      ? detailCopy.value.favoriteAdded
      : detailCopy.value.favoriteRemoved,
    icon: "none"
  });
};

const shareCurrentPlace = () => {
  if (place.value?.supports_share === false) {
    uni.showToast({
      title: detailCopy.value.shareUnavailable,
      icon: "none"
    });
    return;
  }

  uni.showShareMenu?.({
    menus: ["shareAppMessage", "shareTimeline"]
  });

  const link = sharePath.value;
  uni.setClipboardData?.({
    data: link,
    success: () => {
      uni.showToast({
        title: detailCopy.value.shareCopied,
        icon: "none"
      });
    },
    fail: () => {
      uni.showToast({
        title: detailCopy.value.shareReady,
        icon: "none"
      });
    }
  });

  if (!uni.setClipboardData) {
    uni.showToast({
      title: detailCopy.value.shareReady,
      icon: "none"
    });
  }
};

const shareButtonLabel = computed(() =>
  place.value?.supports_share === false
    ? detailCopy.value.shareUnavailable
    : detailCopy.value.shareEntry
);

const markExternalImageFailed = (url: string) => {
  failedExternalImages.value = new Set([...failedExternalImages.value, url]);
};
</script>

<template>
  <view class="page">
    <AsyncStateCard
      v-if="loading"
      variant="loading"
      :text="detailCopy.loading"
    />
    <AsyncStateCard v-else-if="error" variant="error" :text="error" />
    <SectionPanel
      v-else-if="place"
      :title="pickLocalized(state.locale, place.name_zh, place.name_en)"
      :subtitle="categorySubtitle"
    >
      <image
        v-if="place.cover_url"
        class="place-hero"
        :src="place.cover_url"
        mode="aspectFill"
      />
      <view v-if="place.cover_source" class="media-attribution">
        {{ place.cover_source.attribution.label }}
      </view>
      <view v-if="place.tag_ids.length" class="chip-row">
        <text v-for="tag in place.tag_ids" :key="tag" class="place-chip"
          >#{{ tag }}</text
        >
      </view>
      <view
        v-if="localizedText(place.address_zh, place.address_en)"
        class="info-block"
      >
        <view class="info-label">{{ detailCopy.address }}</view>
        <view class="line">{{
          localizedText(place.address_zh, place.address_en)
        }}</view>
      </view>
      <view
        v-if="localizedText(place.business_hours_zh, place.business_hours_en)"
        class="info-block"
      >
        <view class="info-label">{{ detailCopy.businessHours }}</view>
        <view class="line">
          {{ localizedText(place.business_hours_zh, place.business_hours_en) }}
        </view>
      </view>
      <view
        v-if="localizedText(place.intro_zh, place.intro_en)"
        class="info-block"
      >
        <view class="info-label">{{ detailCopy.intro }}</view>
        <view class="line">{{
          localizedText(place.intro_zh, place.intro_en)
        }}</view>
      </view>
      <view v-if="place.is_recommended" class="place-badge">
        {{
          pickLocalized(
            state.locale,
            place.recommended_reason_zh ?? detailCopy.recommendedFallback,
            place.recommended_reason_en ?? detailCopy.recommendedFallback
          )
        }}
      </view>
      <view class="gallery">
        <view class="info-label">{{ detailCopy.gallery }}</view>
        <scroll-view
          v-if="galleryItems.length"
          class="gallery-scroll"
          scroll-x
          enable-flex
        >
          <view
            v-for="media in galleryItems"
            :key="media.key"
            class="gallery-card"
          >
            <view
              v-if="
                media.kind === 'external' && failedExternalImages.has(media.url)
              "
              class="gallery-fallback"
            >
              <text>{{
                state.locale === "zh"
                  ? "外部图片暂不可用"
                  : "External image unavailable"
              }}</text>
            </view>
            <image
              v-else
              class="gallery-item"
              :src="media.url"
              :alt="pickLocalized(state.locale, media.alt_zh, media.alt_en)"
              mode="aspectFill"
              @error="
                media.kind === 'external' && markExternalImageFailed(media.url)
              "
            />
            <view v-if="media.attribution" class="media-attribution">
              {{ media.attribution }}
            </view>
          </view>
        </scroll-view>
        <AsyncStateCard v-else variant="empty" :text="detailCopy.noGallery" />
      </view>
      <view class="action-row">
        <button
          class="place-action primary"
          :disabled="!canOpenNavigation"
          @click="openNavigation"
        >
          {{ detailCopy.openNavigation }}
        </button>
        <button class="place-action secondary" @click="openMapPosition">
          {{ detailCopy.openMapPosition }}
        </button>
      </view>
      <view class="action-row">
        <button
          class="place-action ghost"
          :class="{ active: isFavorite }"
          :disabled="place.supports_favorite === false"
          @click="toggleFavoriteState"
        >
          {{
            isFavorite ? detailCopy.favoriteActive : detailCopy.favoriteEntry
          }}
        </button>
        <button
          class="place-action ghost"
          open-type="share"
          :disabled="place.supports_share === false"
          @click="shareCurrentPlace"
        >
          {{ shareButtonLabel }}
        </button>
      </view>
      <view v-if="shareSummary" class="share-summary">{{ shareSummary }}</view>
    </SectionPanel>
    <AsyncStateCard v-else variant="empty" :text="detailCopy.empty" />
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
  background: #f8fafc;
  min-height: 100vh;
}

.place-hero {
  display: block;
  width: 100%;
  height: 360rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  background: #e2e8f0;
}

.chip-row,
.action-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.place-chip {
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  background: #e6f4ff;
  color: #0052d9;
  font-size: 22rpx;
}

.info-block {
  margin-bottom: 18rpx;
}

.info-label {
  margin-bottom: 6rpx;
  color: #6b7280;
  font-size: 24rpx;
  font-weight: 600;
}

.line {
  line-height: 1.7;
  color: #1f2937;
}

.place-badge {
  margin-bottom: 16rpx;
  padding: 18rpx 20rpx;
  border-radius: 8rpx;
  background: #fff7e6;
  color: #ad5a00;
  line-height: 1.6;
}

.gallery {
  margin-bottom: 16rpx;
}

.gallery-scroll {
  width: 100%;
  white-space: nowrap;
}

.gallery-card {
  display: inline-flex;
  flex-direction: column;
  width: 520rpx;
  margin-right: 16rpx;
  vertical-align: top;
}

.gallery-item {
  display: block;
  width: 100%;
  height: 320rpx;
  border-radius: 12rpx;
  background: #e5e7eb;
}

.gallery-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 320rpx;
  padding: 24rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
  color: #64748b;
  font-size: 24rpx;
  text-align: center;
}

.media-attribution {
  margin: 6rpx 0 12rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.4;
}

.place-action {
  min-width: 220rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.primary {
  background: #0052d9;
  color: #ffffff;
}

.secondary {
  background: #e6f4ff;
  color: #0052d9;
}

.ghost {
  background: #f3f4f6;
  color: #374151;
}

.ghost.active {
  background: #fff7e6;
  color: #ad5a00;
}

.place-action[disabled] {
  color: #94a3b8;
  background: #f1f5f9;
}

.share-summary {
  margin-top: 4rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.6;
}
</style>
