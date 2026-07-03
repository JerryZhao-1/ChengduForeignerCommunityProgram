import type { PlaceDetail, PlaceMapMarker } from "@community-map/shared";

const withQuery = (
  path: string,
  query?: Record<string, string | number | boolean | undefined>
) => {
  const searchParams = Object.entries(query ?? {})
    .filter((entry): entry is [string, string | number | boolean] => {
      return entry[1] !== undefined;
    })
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    });

  return searchParams.length > 0 ? `${path}?${searchParams.join("&")}` : path;
};

export const placesPagePaths = {
  list: (query?: {
    keyword?: string;
    category?: string;
    tag?: string;
    recommended?: boolean;
    sort?: "recommended" | "name";
  }) => withQuery("/pages/places/index", query),
  detail: (id: string) => withQuery("/pages/places/detail", { id }),
  map: (id?: string) => withQuery("/pages/places/map", { id }),
  recommended: () =>
    withQuery("/pages/places/index", {
      recommended: true,
      sort: "recommended"
    })
};

export const PLACE_MAP_FOCUS_STORAGE_KEY =
  "community-map:places:focusPlaceId";

type PlacesLocale = "zh" | "en";

export interface PlaceNavigationFeedback {
  unavailable: string;
  failed: string;
}

export type PlaceNavigationTarget = {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
};

export const pickPlaceText = (
  locale: PlacesLocale,
  zhText: string,
  enText: string
) => (locale === "zh" ? zhText : enText);

export const buildPlaceDetailNavigationTarget = (
  navigation: PlaceDetail["navigation"],
  locale: PlacesLocale
): PlaceNavigationTarget => ({
  latitude: navigation.latitude,
  longitude: navigation.longitude,
  name: pickPlaceText(locale, navigation.name_zh, navigation.name_en),
  address: pickPlaceText(locale, navigation.address_zh, navigation.address_en)
});

export const buildPlaceMarkerNavigationTarget = (
  marker: PlaceMapMarker,
  locale: PlacesLocale
): PlaceNavigationTarget => ({
  latitude: marker.location.latitude,
  longitude: marker.location.longitude,
  name: pickPlaceText(locale, marker.name_zh, marker.name_en),
  address: ""
});

export const hasValidPlaceNavigationTarget = (
  target: PlaceNavigationTarget
) =>
  Number.isFinite(target.latitude) &&
  Number.isFinite(target.longitude) &&
  Math.abs(target.latitude) <= 90 &&
  Math.abs(target.longitude) <= 180;

export const openPlaceNativeNavigation = (
  target: PlaceNavigationTarget,
  feedback: PlaceNavigationFeedback
) => {
  if (!hasValidPlaceNavigationTarget(target)) {
    uni.showToast({
      title: feedback.unavailable,
      icon: "none"
    });
    return false;
  }

  uni.openLocation({
    latitude: target.latitude,
    longitude: target.longitude,
    name: target.name,
    address: target.address,
    scale: 16,
    fail: () => {
      uni.showToast({
        title: feedback.failed,
        icon: "none"
      });
    }
  });

  return true;
};
