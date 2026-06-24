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

const mapCopy = computed(() => getPlacesCopy(state.locale, "map"));
const selectedPlace = computed(
  () =>
    places.value.find((place) => place._id === selectedPlaceId.value) ??
    places.value.find((place) => place._id === presetPlaceId.value) ??
    places.value[0] ??
    null
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
      bgColor:
        place._id === selectedPlace.value?._id ? "#0052d9" : "#334155",
      padding: 8,
      display: "BYCLICK"
    }
  }))
);

const loadMarkers = async () => {
  const result = await run(() => mobileApi.places.mapMarkers(), mapCopy.value.error);

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

onShow(consumePendingFocusPlace);

onLoad((query) => {
  focusPresetPlace(query?.id ? String(query.id) : null);
});
</script>

<template>
  <view class="page">
    <view class="page-title">{{ mapCopy.title }}</view>
    <view class="page-subtitle">{{ mapCopy.subtitle }}</view>
    <view class="action-row">
      <button class="place-action secondary" @click="openList(false)">
        {{ mapCopy.openList }}
      </button>
      <button class="place-action secondary" @click="openList(true)">
        {{ mapCopy.openRecommended }}
      </button>
    </view>

    <map
      class="map-card"
      :latitude="mapLatitude"
      :longitude="mapLongitude"
      :scale="15"
      :markers="renderedMarkers"
      :show-location="true"
      @markertap="handleMarkerTap"
    />

    <AsyncStateCard v-if="loading" variant="loading" :text="mapCopy.loading" />
    <AsyncStateCard v-else-if="error" variant="error" :text="error" />
    <view v-else-if="selectedPlace" class="summary-card">
      <view class="summary-title">
        {{
          pickLocalized(
            state.locale,
            selectedPlace.name_zh,
            selectedPlace.name_en
          )
        }}
      </view>
      <view class="summary-meta">{{ selectedPlace.category_level_1 }}</view>
      <view v-if="selectedPlace.is_recommended" class="place-badge">
        {{ mapCopy.recommendedBadge }}
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
</template>

<style scoped>
.page {
  padding: 24rpx;
  background: #f8fafc;
  min-height: 100vh;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
}

.page-subtitle {
  color: #6b7280;
  margin-top: 12rpx;
  margin-bottom: 24rpx;
  line-height: 1.6;
}

.map-card {
  width: 100%;
  height: 720rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #e2e8f0;
}

.action-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
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

.summary-card {
  margin-top: 24rpx;
  background: #ffffff;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  padding: 28rpx;
}

.summary-title {
  font-size: 32rpx;
  font-weight: 600;
}

.summary-meta {
  margin-top: 10rpx;
  color: #64748b;
}

.place-badge {
  display: inline-flex;
  margin-top: 14rpx;
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  background: #fff7e6;
  color: #ad5a00;
  font-size: 22rpx;
}

.summary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 24rpx;
}
</style>
