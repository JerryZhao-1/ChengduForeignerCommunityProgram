import {
  createMockService,
  PLACE_TOP_LEVEL_CATEGORIES,
  PlaceMapMarkerSchema,
  PlaceSchema
} from "@community-map/shared";
import { describe, expect, it } from "vitest";

const buildPlace = (overrides: Partial<ReturnType<typeof PlaceSchema.parse>>) =>
  PlaceSchema.parse({
    _id: "place_001",
    community_id: "tongzilin",
    name_zh: "Alpha",
    name_en: "Alpha",
    cover_file_id: null,
    cover_url: null,
    category_level_1: "public-service",
    category_level_2: "community-center",
    tag_ids: ["service"],
    address_zh: "成都",
    address_en: "Chengdu",
    location: { latitude: 30.6, longitude: 104.0 },
    tencent_map_poi_id: null,
    business_hours_zh: "周一至周日",
    business_hours_en: "Every day",
    intro_zh: "简介",
    intro_en: "Intro",
    recommended_reason_zh: null,
    recommended_reason_en: null,
    is_recommended: false,
    recommended_rank: 0,
    gallery_file_ids: [],
    gallery_urls: [],
    supports_navigation: true,
    supports_favorite: true,
    supports_share: true,
    status: "published",
    ...overrides
  });

describe("places marker contract", () => {
  it("freezes the supported top-level category taxonomy", () => {
    expect(PLACE_TOP_LEVEL_CATEGORIES).toEqual([
      "public-service",
      "food-drink",
      "shopping",
      "lifestyle",
      "education",
      "health-wellness",
      "entertainment",
      "outdoor-sports",
      "transport",
      "community"
    ]);
  });

  it("keeps marker parsing limited to marker-safe fields", () => {
    const marker = PlaceMapMarkerSchema.parse({
      _id: "place_001",
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      category_level_1: "public-service",
      is_recommended: true,
      location: {
        latitude: 30.615,
        longitude: 104.0625
      },
      address_zh: "成都",
      intro_zh: "简介",
      gallery_urls: ["https://example.com/gallery.jpg"],
      gallery_media: [
        {
          file_id: "cloud://place-001-1",
          cloud_path: "public/places/place_001/1.jpg",
          url: "https://example.com/gallery.jpg",
          alt_zh: "图集",
          alt_en: "Gallery"
        }
      ],
      navigation: {
        latitude: 30.615,
        longitude: 104.0625,
        name_zh: "桐梓林社区中心",
        name_en: "Tongzilin Community Center",
        address_zh: "成都",
        address_en: "Chengdu"
      }
    });

    expect(marker).toEqual({
      _id: "place_001",
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      category_level_1: "public-service",
      is_recommended: true,
      location: {
        latitude: 30.615,
        longitude: 104.0625
      }
    });
    expect(marker).not.toHaveProperty("address_zh");
    expect(marker).not.toHaveProperty("intro_zh");
    expect(marker).not.toHaveProperty("gallery_urls");
    expect(marker).not.toHaveProperty("gallery_media");
    expect(marker).not.toHaveProperty("navigation");
  });

  it("rejects unsupported top-level categories for place and marker payloads", () => {
    expect(() =>
      PlaceSchema.parse({
        _id: "place_invalid",
        community_id: "tongzilin",
        name_zh: "无效分类地点",
        name_en: "Invalid Category Place",
        cover_file_id: null,
        cover_url: null,
        category_level_1: "service",
        category_level_2: "community-center",
        tag_ids: [],
        address_zh: "成都",
        address_en: "Chengdu",
        location: { latitude: 30.6, longitude: 104.0 },
        tencent_map_poi_id: null,
        business_hours_zh: "周一至周日",
        business_hours_en: "Every day",
        intro_zh: "简介",
        intro_en: "Intro",
        recommended_reason_zh: null,
        recommended_reason_en: null,
        is_recommended: false,
        recommended_rank: 0,
        gallery_file_ids: [],
        gallery_urls: [],
        supports_navigation: true,
        supports_favorite: true,
        supports_share: true,
        status: "published"
      })
    ).toThrow();

    expect(() =>
      PlaceMapMarkerSchema.parse({
        _id: "place_invalid",
        name_zh: "无效分类地点",
        name_en: "Invalid Category Place",
        category_level_1: "service",
        is_recommended: false,
        location: {
          latitude: 30.6,
          longitude: 104.0
        }
      })
    ).toThrow();
  });

  it("returns map markers in deterministic recommended order", () => {
    const service = createMockService({
      places: [
        buildPlace({
          _id: "place_010",
          name_zh: "Zulu",
          name_en: "Zulu",
          is_recommended: false,
          recommended_rank: 0,
          category_level_1: "food-drink"
        }),
        buildPlace({
          _id: "place_003",
          name_zh: "Bravo",
          name_en: "Bravo",
          is_recommended: true,
          recommended_rank: 2
        }),
        buildPlace({
          _id: "place_002",
          name_zh: "Alpha",
          name_en: "Zoo",
          is_recommended: true,
          recommended_rank: 1
        }),
        buildPlace({
          _id: "place_001",
          name_zh: "Alpha",
          name_en: "Apple",
          is_recommended: true,
          recommended_rank: 1
        }),
        buildPlace({
          _id: "place_000",
          name_zh: "Alpha",
          name_en: "Apple",
          is_recommended: true,
          recommended_rank: 1
        })
      ]
    });

    const markers = service.places.mapMarkers();

    expect(markers.map((marker) => marker._id)).toEqual([
      "place_000",
      "place_001",
      "place_002",
      "place_003",
      "place_010"
    ]);
    expect(markers.map((marker) => marker.name_zh)).toEqual([
      "Alpha",
      "Alpha",
      "Alpha",
      "Bravo",
      "Zulu"
    ]);
  });
});
