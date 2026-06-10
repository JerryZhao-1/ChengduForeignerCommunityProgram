import type { PlaceDetail, PlaceMapMarker } from "@community-map/shared";
import { describe, expect, it } from "vitest";

import {
  buildPlaceDetailNavigationTarget,
  buildPlaceMarkerNavigationTarget,
  hasValidPlaceNavigationTarget,
  placesPagePaths
} from "./navigation";

describe("mobile places navigation helpers", () => {
  it("builds stable page paths", () => {
    expect(placesPagePaths.detail("place_001")).toBe(
      "/pages/places/detail?id=place_001"
    );
    expect(placesPagePaths.recommended()).toBe(
      "/pages/places/index?recommended=true&sort=recommended"
    );
  });

  it("localizes detail navigation targets", () => {
    const navigation: PlaceDetail["navigation"] = {
      latitude: 30.61,
      longitude: 104.06,
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      address_zh: "成都市武侯区",
      address_en: "Wuhou District, Chengdu"
    };

    expect(buildPlaceDetailNavigationTarget(navigation, "en")).toEqual({
      latitude: 30.61,
      longitude: 104.06,
      name: "Tongzilin Community Center",
      address: "Wuhou District, Chengdu"
    });
  });

  it("uses marker coordinates for map navigation targets", () => {
    const marker: PlaceMapMarker = {
      _id: "place_001",
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      category_level_1: "community",
      is_recommended: true,
      location: {
        latitude: 30.61,
        longitude: 104.06
      }
    };

    expect(buildPlaceMarkerNavigationTarget(marker, "zh")).toEqual({
      latitude: 30.61,
      longitude: 104.06,
      name: "桐梓林社区中心",
      address: ""
    });
  });

  it("rejects invalid native navigation coordinates", () => {
    expect(
      hasValidPlaceNavigationTarget({
        latitude: Number.NaN,
        longitude: 104.06,
        name: "Bad marker",
        address: ""
      })
    ).toBe(false);
    expect(
      hasValidPlaceNavigationTarget({
        latitude: 30.61,
        longitude: 104.06,
        name: "Valid marker",
        address: ""
      })
    ).toBe(true);
  });
});
