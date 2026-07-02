<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { PlaceMapMarker } from "@community-map/shared";
import { onLoad, onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import { getPlacesCopy } from "./copy";
import {
  buildPlaceMarkerNavigationTarget,
  openPlaceNativeNavigation,
  PLACE_MAP_FOCUS_STORAGE_KEY,
  placesPagePaths
} from "./navigation";
import { usePlaceAsyncState } from "./usePlaceAsyncState";

interface RenderedMarker {
  id: number;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  iconPath: string;
  callout: {
    content: string;
    color: string;
    fontSize: number;
    borderRadius: number;
    bgColor: string;
    padding: number;
    display: "BYCLICK";
  };
}

const DEFAULT_CENTER = {
  latitude: 30.615,
  longitude: 104.0625
};

const MARKER_ICON_PATH = "/static/place-marker.svg";

const { state } = useAppStore();
const places = ref<PlaceMapMarker[]>([]);
const { loading, error, run } = usePlaceAsyncState();
const selectedPlaceId = ref<string | null>(null);
const presetPlaceId = ref<string | null>(null);
const pageHeight = ref("100vh");

const mapCopy = computed(() => getPlacesCopy(state.locale, "map"));
const selectedPlace = computed(
  () =>
    places.value.find((place) => place._id === selectedPlaceId.value) ??
    places.value.find((place) => place._id === presetPlaceId.value) ??
    places.value[0] ??
    null
);
const failedCoverUrls = ref<Record<string, true>>({});

const selectedCoverUrl = computed(() => {
  const coverUrl = selectedPlace.value?.cover_url;

  if (!coverUrl || failedCoverUrls.value[coverUrl]) {
    return null;
  }

  return coverUrl;
});

const selectedPlaceName = computed(() =>
  selectedPlace.value
    ? pickLocalized(
        state.locale,
        selectedPlace.value.name_zh,
        selectedPlace.value.name_en
      )
    : ""
);

const mapLatitude = computed(
  () => selectedPlace.value?.location.latitude ?? DEFAULT_CENTER.latitude
);

const mapLongitude = computed(
  () => selectedPlace.value?.location.longitude ?? DEFAULT_CENTER.longitude
);

const renderedMarkers = computed<RenderedMarker[]>(() =>
  places.value.map((place, index) => ({
    id: index,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    width: place._id === selectedPlace.value?._id ? 34 : 28,
    height: place._id === selectedPlace.value?._id ? 42 : 36,
    iconPath: MARKER_ICON_PATH,
    callout: {
      content: pickLocalized(state.locale, place.name_zh, place.name_en),
      color: "#ffffff",
      fontSize: 12,
      borderRadius: 16,
      bgColor: place._id === selectedPlace.value?._id ? "#0052d9" : "#334155",
      padding: 8,
      display: "BYCLICK"
    }
  }))
);

const updatePageHeight = () => {
  try {
    const systemInfo = uni.getSystemInfoSync();
    const windowHeight = Number(systemInfo.windowHeight);

    if (Number.isFinite(windowHeight) && windowHeight > 0) {
      pageHeight.value = `${windowHeight}px`;
    }
  } catch {
    pageHeight.value = "100vh";
  }
};

const loadMarkers = async () => {
  const result = await run(
    () => mobileApi.places.mapMarkers(),
    mapCopy.value.error
  );

  if (!result) {
    places.value = [];
    selectedPlaceId.value = null;
    return;
  }

  places.value = result.data;
  selectedPlaceId.value =
    result.data.find((place) => place._id === presetPlaceId.value)?._id ??
    result.data[0]?._id ??
    null;
};

const focusPresetPlace = (placeId: string | null) => {
  if (!placeId) {
    return;
  }

  presetPlaceId.value = placeId;
  selectedPlaceId.value =
    places.value.find((place) => place._id === placeId)?._id ?? null;
};

const consumePendingFocusPlace = () => {
  const pendingPlaceId = uni.getStorageSync?.(PLACE_MAP_FOCUS_STORAGE_KEY);

  if (typeof pendingPlaceId !== "string" || pendingPlaceId.length === 0) {
    return;
  }

  uni.removeStorageSync?.(PLACE_MAP_FOCUS_STORAGE_KEY);
  focusPresetPlace(pendingPlaceId);
};

const handleMarkerTap = (event: { detail?: { markerId?: number } }) => {
  const markerId = event.detail?.markerId;
  if (markerId === undefined) {
    return;
  }

  const place = places.value[markerId];
  if (place) {
    selectedPlaceId.value = place._id;
  }
};

const handleSelectedCoverError = () => {
  const coverUrl = selectedPlace.value?.cover_url;

  if (!coverUrl) {
    return;
  }

  failedCoverUrls.value = {
    ...failedCoverUrls.value,
    [coverUrl]: true
  };
};

const openDetail = () => {
  if (!selectedPlace.value) {
    return;
  }

  uni.navigateTo({
    url: placesPagePaths.detail(selectedPlace.value._id)
  });
};

const openNavigation = () => {
  if (!selectedPlace.value) {
    return;
  }

  openPlaceNativeNavigation(
    buildPlaceMarkerNavigationTarget(selectedPlace.value, state.locale),
    {
      unavailable: mapCopy.value.navigationUnavailable,
      failed: mapCopy.value.navigationFailed
    }
  );
};

const openList = (recommended = false) => {
  uni.navigateTo({
    url: recommended ? placesPagePaths.recommended() : placesPagePaths.list()
  });
};

onMounted(loadMarkers);

onMounted(updatePageHeight);

onShow(() => {
  updatePageHeight();
  consumePendingFocusPlace();
});

onLoad((query) => {
  focusPresetPlace(query?.id ? String(query.id) : null);
});
</script>

<template>
  <view class="page" :style="{ height: pageHeight }">
    <view class="page-header">
      <view>
        <view class="page-title">{{ mapCopy.title }}</view>
        <view class="page-subtitle">{{ mapCopy.subtitle }}</view>
      </view>
      <view class="action-row">
        <button class="place-action secondary" @click="openList(false)">
          {{ mapCopy.openList }}
        </button>
        <button class="place-action secondary" @click="openList(true)">
          {{ mapCopy.openRecommended }}
        </button>
      </view>
    </view>

    <view class="map-frame">
      <map
        class="map-card"
        :latitude="mapLatitude"
        :longitude="mapLongitude"
        :scale="15"
        :markers="renderedMarkers"
        :show-location="true"
        @markertap="handleMarkerTap"
      />
      <cover-view v-if="selectedPlace" class="marker-cover-preview">
        <cover-view class="marker-cover-preview__label">
          {{ selectedPlaceName }}
        </cover-view>
      </cover-view>
    </view>

    <view class="summary-slot">
      <AsyncStateCard v-if="loading" variant="loading" :text="mapCopy.loading" />
      <AsyncStateCard v-else-if="error" variant="error" :text="error" />
      <view v-else-if="selectedPlace" class="summary-card">
        <view class="summary-main">
          <view class="summary-cover">
            <image
              v-if="selectedCoverUrl"
              class="summary-cover__image"
              :src="selectedCoverUrl"
              mode="aspectFit"
              @error="handleSelectedCoverError"
            />
            <view v-else class="summary-cover__fallback">
              {{ selectedPlaceName }}
            </view>
          </view>
          <view class="summary-content">
            <view class="summary-title">
              {{ selectedPlaceName }}
            </view>
            <view class="summary-meta">{{ selectedPlace.category_level_1 }}</view>
            <view v-if="selectedPlace.is_recommended" class="place-badge">
              {{ mapCopy.recommendedBadge }}
            </view>
          </view>
        </view>
        <view class="summary-actions">
          <button class="place-action primary" @click="openDetail">
            {{ mapCopy.openDetail }}
          </button>
          <button class="place-action secondary" @click="openNavigation">
            {{ mapCopy.openNavigation }}
          </button>
        </view>
      </view>
      <AsyncStateCard v-else variant="empty" :text="mapCopy.empty" />
    </view>
  </view>
</template>

<style scoped>
.page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100vh;
  padding: 18rpx 20rpx;
  overflow: hidden;
  background: #f8fafc;
}

.page-header {
  flex: 0 0 auto;
}

.page-title {
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.25;
}

.page-subtitle {
  color: #6b7280;
  margin-top: 6rpx;
  line-height: 1.4;
  font-size: 24rpx;
}

.map-frame {
  position: relative;
  flex: 1 1 auto;
  min-height: 260rpx;
  width: 100%;
  margin-top: 14rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #e2e8f0;
}

.map-card {
  width: 100%;
  height: 100%;
}

.marker-cover-preview {
  position: absolute;
  right: 28rpx;
  top: 28rpx;
  max-width: 300rpx;
  min-height: 56rpx;
  padding: 12rpx 16rpx;
  border-radius: 8rpx;
  background: rgba(15, 23, 42, 0.86);
  box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.22);
  z-index: 2;
}

.marker-cover-preview__label {
  color: #ffffff;
  font-size: 22rpx;
  line-height: 1.35;
}

.action-row {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
  flex-wrap: wrap;
}

.place-action {
  flex: 1 1 0;
  min-width: 0;
  height: auto;
  margin: 0;
  border-radius: 8rpx;
  font-size: 24rpx;
  line-height: 1.2;
  padding: 12rpx 16rpx;
}

.primary {
  background: #0052d9;
  color: #ffffff;
}

.secondary {
  background: #e6f4ff;
  color: #0052d9;
}

.summary-slot {
  flex: 0 0 auto;
  margin-top: 14rpx;
}

.summary-card {
  background: #ffffff;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  padding: 16rpx;
}

.summary-main {
  display: flex;
  gap: 16rpx;
  align-items: stretch;
}

.summary-cover {
  flex: 0 0 188rpx;
  width: 188rpx;
  height: 128rpx;
  border-radius: 10rpx;
  overflow: hidden;
  background: #eef2f7;
  border: 1rpx solid #e5e7eb;
}

.summary-cover__image {
  width: 100%;
  height: 100%;
}

.summary-cover__fallback {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 12rpx;
  color: #475569;
  font-size: 20rpx;
  line-height: 1.35;
  text-align: center;
  background: #f8fafc;
}

.summary-content {
  flex: 1 1 auto;
  min-width: 0;
}

.summary-title {
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.3;
}

.summary-meta {
  margin-top: 6rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.35;
}

.place-badge {
  display: inline-flex;
  margin-top: 8rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  background: #fff7e6;
  color: #ad5a00;
  font-size: 22rpx;
}

.summary-actions {
  display: flex;
  gap: 12rpx;
  margin-top: 14rpx;
}
</style>
