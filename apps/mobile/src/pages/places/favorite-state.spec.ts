import { describe, expect, it } from "vitest";

import {
  resetPlaceFavoriteStateForTest,
  usePlaceFavoriteState
} from "./favorite-state";

describe("mobile places favorite state", () => {
  it("toggles visible local state for the selected place", () => {
    resetPlaceFavoriteStateForTest();
    const placeId = "place_001";
    const favorite = usePlaceFavoriteState(() => placeId);

    expect(favorite.isFavorite.value).toBe(false);

    expect(favorite.toggleFavorite()).toBe(true);
    expect(favorite.isFavorite.value).toBe(true);

    expect(favorite.toggleFavorite()).toBe(true);
    expect(favorite.isFavorite.value).toBe(false);
  });

  it("keeps state scoped by place id", () => {
    resetPlaceFavoriteStateForTest(["place_002"]);

    const firstPlace = usePlaceFavoriteState(() => "place_001");
    const secondPlace = usePlaceFavoriteState(() => "place_002");

    expect(firstPlace.isFavorite.value).toBe(false);
    expect(secondPlace.isFavorite.value).toBe(true);
  });
});
