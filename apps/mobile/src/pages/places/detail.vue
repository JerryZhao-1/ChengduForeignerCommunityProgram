<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { PlaceDetail } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import SectionPanel from "@/components/SectionPanel.vue";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import { getPlacesCopy } from "./copy";
import { placesPagePaths } from "./navigation";
import { usePlaceAsyncState } from "./usePlaceAsyncState";

const { state } = useAppStore();
const place = ref<PlaceDetail | null>(null);
const { loading, error, run, setError } = usePlaceAsyncState();
const detailCopy = computed(() => getPlacesCopy(state.locale, "detail"));
const galleryMedia = computed(() => {
  if (!place.value) {
    return [];
  }

  if (place.value.gallery_media.length > 0) {
    return place.value.gallery_media;
  }

  return place.value.gallery_urls.map((url, index) => ({
    file_id: `legacy-gallery-${index + 1}`,
    cloud_path: "",
    url,
    alt_zh: `${place.value?.name_zh ?? ""} 图集 ${index + 1}`,
    alt_en: `${place.value?.name_en ?? ""} gallery ${index + 1}`
  }));
});

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
  }
});

const openNavigation = () => {
  if (!place.value) {
    return;
  }

  uni.openLocation({
    latitude: place.value.navigation.latitude,
    longitude: place.value.navigation.longitude,
    name: pickLocalized(
      state.locale,
      place.value.navigation.name_zh,
      place.value.navigation.name_en
    ),
    address: pickLocalized(
      state.locale,
      place.value.navigation.address_zh,
      place.value.navigation.address_en
    ),
    scale: 16,
    fail: () => {
      uni.showToast({
        title: detailCopy.value.navigationFailed,
        icon: "none"
      });
    }
  });
};

const openMapPosition = () => {
  if (!place.value) {
    return;
  }

  uni.navigateTo({
    url: placesPagePaths.map(place.value._id)
  });
};

const favoritePlaceholder = () => {
  uni.showToast({
    title: detailCopy.value.favoritePending,
    icon: "none"
  });
};

const sharePlaceholder = () => {
  uni.showShareMenu?.({
    menus: ["shareAppMessage", "shareTimeline"]
  });

  uni.showToast({
    title: detailCopy.value.sharePending,
    icon: "none"
  });
};
</script>

<template>
  <view class="page">
    <AsyncStateCard v-if="loading" variant="loading" :text="detailCopy.loading" />
    <AsyncStateCard v-else-if="error" variant="error" :text="error" />
    <SectionPanel
      v-else-if="place"
      :title="pickLocalized(state.locale, place.name_zh, place.name_en)"
      :subtitle="`${place.category_level_1} / ${place.category_level_2}`"
    >
      <image
        v-if="place.cover_url"
        class="hero-image"
        :src="place.cover_url"
        mode="aspectFill"
      />
      <view class="tag-row">
        <text v-for="tag in place.tag_ids" :key="tag" class="tag">#{{ tag }}</text>
      </view>
      <view class="info-block">
        <view class="info-label">{{ detailCopy.address }}</view>
        <view class="line">
          {{ pickLocalized(state.locale, place.address_zh, place.address_en) }}
        </view>
      </view>
      <view class="info-block">
        <view class="info-label">{{ detailCopy.businessHours }}</view>
        <view class="line">
          {{
            pickLocalized(
              state.locale,
              place.business_hours_zh,
              place.business_hours_en
            )
          }}
        </view>
      </view>
      <view class="info-block">
        <view class="info-label">{{ detailCopy.intro }}</view>
        <view class="line">{{
          pickLocalized(state.locale, place.intro_zh, place.intro_en)
        }}</view>
      </view>
      <view v-if="place.is_recommended" class="recommendation">
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
          v-if="galleryMedia.length"
          class="gallery-scroll"
          scroll-x
          enable-flex
        >
          <image
            v-for="media in galleryMedia"
            :key="media.file_id"
            class="gallery-item"
            :src="media.url"
            :alt="pickLocalized(state.locale, media.alt_zh, media.alt_en)"
            mode="aspectFill"
          />
        </scroll-view>
        <AsyncStateCard v-else variant="empty" :text="detailCopy.noGallery" />
      </view>
      <view class="button-row">
        <button class="action-button primary" @click="openNavigation">
          {{ detailCopy.openNavigation }}
        </button>
        <button class="action-button secondary" @click="openMapPosition">
          {{ detailCopy.openMapPosition }}
        </button>
      </view>
      <view class="button-row">
        <button class="action-button ghost" @click="favoritePlaceholder">
          {{ detailCopy.favoriteEntry }}
        </button>
        <button class="action-button ghost" @click="sharePlaceholder">
          {{ detailCopy.shareEntry }}
        </button>
      </view>
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

.hero-image {
  display: block;
  width: 100%;
  height: 360rpx;
  margin-bottom: 16rpx;
  border-radius: 16rpx;
  background: #e2e8f0;
}

.tag-row,
.button-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.tag {
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

.recommendation {
  margin-bottom: 16rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #fff7e6;
  color: #ad5a00;
}

.gallery {
  margin-bottom: 16rpx;
}

.gallery-scroll {
  width: 100%;
  white-space: nowrap;
}

.gallery-item {
  display: inline-block;
  width: 520rpx;
  height: 320rpx;
  margin-right: 16rpx;
  border-radius: 16rpx;
  background: #e5e7eb;
}

.action-button {
  min-width: 220rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.primary {
  background: #0052d9;
  color: white;
}

.secondary {
  background: #e6f4ff;
  color: #0052d9;
}

.ghost {
  background: #f3f4f6;
  color: #374151;
}
</style>
