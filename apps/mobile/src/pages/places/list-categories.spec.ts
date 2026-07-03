import { PLACE_TOP_LEVEL_CATEGORIES } from "@community-map/shared";
import { describe, expect, it } from "vitest";

import { PLACE_LIST_CATEGORIES } from "./list-categories";

describe("mobile places category filters", () => {
  it("uses only shared top-level taxonomy values", () => {
    expect(PLACE_LIST_CATEGORIES.map((option) => option.value)).toEqual([
      ...PLACE_TOP_LEVEL_CATEGORIES
    ]);
  });
});
