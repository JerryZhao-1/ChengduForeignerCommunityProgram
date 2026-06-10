import { computed, ref } from "vue";

const FAVORITE_STORAGE_KEY = "community-map:places:v1-favorites";

const favoriteIds = ref<string[]>([]);
let hydrated = false;

const readFavoriteIds = () => {
  if (typeof uni === "undefined") {
    return [];
  }

  try {
    const stored = uni.getStorageSync(FAVORITE_STORAGE_KEY);
    return Array.isArray(stored)
      ? stored.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
};

const writeFavoriteIds = (ids: string[]) => {
  if (typeof uni === "undefined") {
    return;
  }

  try {
    uni.setStorageSync(FAVORITE_STORAGE_KEY, ids);
  } catch {
    // Local v1 state remains usable even if device storage is unavailable.
  }
};

export const hydratePlaceFavoriteState = () => {
  if (hydrated) {
    return;
  }

  favoriteIds.value = readFavoriteIds();
  hydrated = true;
};

export const resetPlaceFavoriteStateForTest = (ids: string[] = []) => {
  favoriteIds.value = [...ids];
  hydrated = true;
};

export const usePlaceFavoriteState = (placeId: () => string | null) => {
  hydratePlaceFavoriteState();

  const isFavorite = computed(() => {
    const currentPlaceId = placeId();
    return currentPlaceId ? favoriteIds.value.includes(currentPlaceId) : false;
  });

  const setFavorite = (nextValue: boolean) => {
    const currentPlaceId = placeId();
    if (!currentPlaceId) {
      return false;
    }

    const nextIds = favoriteIds.value.filter((id) => id !== currentPlaceId);
    if (nextValue) {
      nextIds.push(currentPlaceId);
    }

    favoriteIds.value = nextIds;
    writeFavoriteIds(nextIds);
    return true;
  };

  const toggleFavorite = () => setFavorite(!isFavorite.value);

  return {
    isFavorite,
    setFavorite,
    toggleFavorite
  };
};
