import { PLACE_TOP_LEVEL_CATEGORIES } from "@community-map/shared";
import { describe, expect, it } from "vitest";

import {
  getPlaceCategoryLabel,
  getPlaceCategoryPathLabel,
  getPlaceTagLabel,
  PLACE_LIST_CATEGORIES
} from "./list-categories";

describe("mobile places category filters", () => {
  it("uses only shared top-level taxonomy values", () => {
    expect(PLACE_LIST_CATEGORIES.map((option) => option.value)).toEqual([
      ...PLACE_TOP_LEVEL_CATEGORIES
    ]);
  });

  it("localizes supported top-level and secondary categories", () => {
    expect(getPlaceCategoryLabel("en", "public-service")).toBe(
      "Public Services"
    );
    expect(getPlaceCategoryLabel("zh", "community-center")).toBe(
      "社区中心"
    );
    expect(
      getPlaceCategoryPathLabel("en", "food-drink", "cafe")
    ).toBe("Food & Drink / Cafe");
  });

  it("localizes known tags and provides a readable unknown fallback", () => {
    expect(getPlaceTagLabel("zh", "english-friendly")).toBe("英语友好");
    expect(getPlaceTagLabel("en", "new-place-tag")).toBe("New Place Tag");
  });
});
