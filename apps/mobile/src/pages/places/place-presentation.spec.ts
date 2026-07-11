import { describe, expect, it } from "vitest";

import {
  formatPlaceCommentsCount,
  formatPlaceFallbackNotice,
  formatPlaceGalleryAlt,
  resolvePlaceField
} from "./place-presentation";

describe("place presentation", () => {
  it("resolves formal content and exposes fallback metadata", () => {
    const field = resolvePlaceField("en", "桐梓林社区中心", " ");

    expect(field.value).toBe("桐梓林社区中心");
    expect(field.usedFallback).toBe(true);
    expect(formatPlaceFallbackNotice("en", [field])).toBe(
      "This content is currently shown in Chinese"
    );
  });

  it("localizes gallery alt text and comment counts", () => {
    expect(
      formatPlaceGalleryAlt("en", "Tongzilin Community Center", 2)
    ).toBe("Tongzilin Community Center gallery image 2");
    expect(formatPlaceGalleryAlt("zh", "社区中心", 1, true)).toBe(
      "社区中心 外部图集 1"
    );
    expect(formatPlaceCommentsCount("zh", 3)).toBe("3 条评论");
    expect(formatPlaceCommentsCount("en", 3)).toBe("3 comments");
  });
});
