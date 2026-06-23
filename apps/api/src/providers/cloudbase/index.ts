import { randomUUID } from "node:crypto";

import tcb from "@cloudbase/node-sdk";
import {
  PLACE_TOP_LEVEL_CATEGORIES,
  PlaceSchema,
  type PageResult,
  type Place,
  type PlaceDetail,
  type PlaceGalleryMedia,
  type PlaceListItem,
  type PlaceMapMarker
} from "@community-map/shared";

import { createMockProvider } from "../mock";
import type { ApiProvider } from "../types";

const DEFAULT_COMMUNITY_ID = "tongzilin";
const MAX_PLACES_FETCH = 1000;

type CloudbaseApp = ReturnType<typeof tcb.init>;
type PlacesCollection = ReturnType<
  ReturnType<ReturnType<typeof tcb.init>["database"]>["collection"]
>;

interface LiveCloudbaseContext {
  app: CloudbaseApp;
  places: PlacesCollection;
}

const cleanUpdate = <TInput extends Record<string, unknown>>(input: TInput) =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as Partial<Place>;

const toCloudbaseSetDocument = (place: Place) => {
  const document: Partial<Place> = { ...place };
  delete document._id;
  return document;
};

const paginate = <TItem>(
  items: TItem[],
  params: { page?: number; pageSize?: number }
): PageResult<TItem> => {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length
  };
};

const keywordMatch = (value: string, keyword?: string) =>
  !keyword || value.toLowerCase().includes(keyword.toLowerCase());

const hasUsableCoordinates = (place: Place) =>
  Number.isFinite(place.location.latitude) &&
  Number.isFinite(place.location.longitude) &&
  place.location.latitude >= -90 &&
  place.location.latitude <= 90 &&
  place.location.longitude >= -180 &&
  place.location.longitude <= 180;

const sortPlaces = (
  places: Place[],
  sort: "recommended" | "name" = "recommended"
) => {
  return [...places].sort((left, right) => {
    if (sort === "name") {
      return left.name_en.localeCompare(right.name_en);
    }

    if (left.is_recommended !== right.is_recommended) {
      return left.is_recommended ? -1 : 1;
    }

    return left.recommended_rank - right.recommended_rank;
  });
};

const sortPlacesForMapMarkers = (places: Place[]) =>
  [...places].sort((left, right) => {
    if (left.is_recommended !== right.is_recommended) {
      return left.is_recommended ? -1 : 1;
    }

    return left.name_en.localeCompare(right.name_en);
  });

const toPlaceListItem = (place: Place): PlaceListItem => ({
  _id: place._id,
  name_zh: place.name_zh,
  name_en: place.name_en,
  cover_url: place.cover_url,
  category_level_1: place.category_level_1,
  category_level_2: place.category_level_2,
  short_address_zh: place.address_zh,
  short_address_en: place.address_en,
  summary_zh: place.intro_zh,
  summary_en: place.intro_en,
  tag_ids: place.tag_ids,
  is_recommended: place.is_recommended,
  recommended_reason_zh: place.recommended_reason_zh,
  recommended_reason_en: place.recommended_reason_en,
  supports_navigation: place.supports_navigation
});

const toFallbackGalleryMedia = (place: Place): PlaceGalleryMedia[] =>
  place.gallery_urls.map((url, index) => {
    const parsedUrl = new URL(url);

    return {
      file_id: place.gallery_file_ids[index] ?? `legacy-url-${index + 1}`,
      cloud_path: parsedUrl.pathname.replace(/^\/+/, ""),
      url,
      alt_zh: `${place.name_zh} 图集 ${index + 1}`,
      alt_en: `${place.name_en} gallery ${index + 1}`
    };
  });

const cloudPathFromFileId = (fileId: string) => {
  const withoutScheme = fileId.replace(/^cloud:\/\//, "");
  const pathStart = withoutScheme.indexOf("/");

  return pathStart >= 0 ? withoutScheme.slice(pathStart + 1) : withoutScheme;
};

const toCloudbaseGalleryMedia = async (
  context: LiveCloudbaseContext,
  place: Place
): Promise<PlaceGalleryMedia[]> => {
  if (place.gallery_file_ids.length === 0) {
    return [];
  }

  const result = await context.app.getTempFileURL({
    fileList: place.gallery_file_ids
  });
  const urlsByFileId = new Map(
    result.fileList
      .filter((item) => item.tempFileURL)
      .map((item) => [item.fileID, item.tempFileURL])
  );

  return place.gallery_file_ids
    .map((fileId, index) => {
      const url = urlsByFileId.get(fileId);
      if (!url) {
        return null;
      }

      return {
        file_id: fileId,
        cloud_path: cloudPathFromFileId(fileId),
        url,
        alt_zh: `${place.name_zh} 图集 ${index + 1}`,
        alt_en: `${place.name_en} gallery ${index + 1}`
      };
    })
    .filter((item): item is PlaceGalleryMedia => item !== null);
};

const toPlaceDetail = async (
  context: LiveCloudbaseContext,
  place: Place
): Promise<PlaceDetail> => {
  const cloudbaseGalleryMedia = await toCloudbaseGalleryMedia(context, place);
  const gallery_media =
    cloudbaseGalleryMedia.length > 0
      ? cloudbaseGalleryMedia
      : toFallbackGalleryMedia(place);

  return {
    _id: place._id,
    community_id: place.community_id,
    name_zh: place.name_zh,
    name_en: place.name_en,
    cover_url: place.cover_url,
    category_level_1: place.category_level_1,
    category_level_2: place.category_level_2,
    tag_ids: place.tag_ids,
    address_zh: place.address_zh,
    address_en: place.address_en,
    location: place.location,
    business_hours_zh: place.business_hours_zh,
    business_hours_en: place.business_hours_en,
    intro_zh: place.intro_zh,
    intro_en: place.intro_en,
    gallery_media,
    gallery_urls: gallery_media.map((media) => media.url),
    is_recommended: place.is_recommended,
    recommended_reason_zh: place.recommended_reason_zh,
    recommended_reason_en: place.recommended_reason_en,
    supports_navigation: place.supports_navigation,
    supports_favorite: place.supports_favorite,
    supports_share: place.supports_share,
    navigation: {
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      name_zh: place.name_zh,
      name_en: place.name_en,
      address_zh: place.address_zh,
      address_en: place.address_en
    },
    share: {
      title_zh: place.name_zh,
      title_en: place.name_en,
      summary_zh: place.intro_zh,
      summary_en: place.intro_en
    }
  };
};

const getCloudbaseEnvId = () =>
  process.env.CLOUDBASE_ENV_ID ?? process.env.TCB_ENV;

const createLiveContext = (): LiveCloudbaseContext | null => {
  const env = getCloudbaseEnvId();

  if (process.env.CLOUDBASE_PROVIDER_MODE !== "live" || !env) {
    return null;
  }

  const app = tcb.init({ env });
  const db = app.database();

  return {
    app,
    places: db.collection("places")
  };
};

const normalizePlace = (raw: unknown): Place | null => {
  const parsed = PlaceSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const readPlaces = async (context: LiveCloudbaseContext) => {
  const result = await context.places.limit(MAX_PLACES_FETCH).get();
  return result.data.map(normalizePlace).filter((place): place is Place => !!place);
};

const createPlaceFromInput = (input: Partial<Place>): Place =>
  PlaceSchema.parse({
    _id: `place_${randomUUID()}`,
    community_id: DEFAULT_COMMUNITY_ID,
    name_zh: input.name_zh ?? "",
    name_en: input.name_en ?? "",
    cover_file_id: input.cover_file_id ?? null,
    cover_url: input.cover_url ?? null,
    category_level_1: input.category_level_1 ?? PLACE_TOP_LEVEL_CATEGORIES[0],
    category_level_2: input.category_level_2 ?? "",
    tag_ids: input.tag_ids ?? [],
    address_zh: input.address_zh ?? "",
    address_en: input.address_en ?? "",
    location: input.location ?? { latitude: 30.615, longitude: 104.062 },
    tencent_map_poi_id: input.tencent_map_poi_id ?? null,
    business_hours_zh: input.business_hours_zh ?? "",
    business_hours_en: input.business_hours_en ?? "",
    intro_zh: input.intro_zh ?? "",
    intro_en: input.intro_en ?? "",
    recommended_reason_zh: input.recommended_reason_zh ?? null,
    recommended_reason_en: input.recommended_reason_en ?? null,
    is_recommended: input.is_recommended ?? false,
    recommended_rank: input.recommended_rank ?? 0,
    gallery_file_ids: input.gallery_file_ids ?? [],
    gallery_urls: input.gallery_urls ?? [],
    supports_navigation: input.supports_navigation ?? true,
    supports_favorite: input.supports_favorite ?? true,
    supports_share: input.supports_share ?? true,
    status: input.status ?? "draft",
    import_review: input.import_review ?? null
  });

const createLivePlacesProvider = (context: LiveCloudbaseContext): ApiProvider["places"] => ({
  async list(input) {
    const places = sortPlaces(
      (await readPlaces(context)).filter((place) => {
        if (place.status !== "published") {
          return false;
        }

        if (input.communityId && place.community_id !== input.communityId) {
          return false;
        }

        if (
          input.category &&
          place.category_level_1 !== input.category &&
          place.category_level_2 !== input.category
        ) {
          return false;
        }

        if (input.tag && !place.tag_ids.includes(input.tag)) {
          return false;
        }

        if (input.recommended && !place.is_recommended) {
          return false;
        }

        return (
          keywordMatch(place.name_zh, input.keyword) ||
          keywordMatch(place.name_en, input.keyword) ||
          keywordMatch(place.intro_zh, input.keyword) ||
          keywordMatch(place.intro_en, input.keyword)
        );
      }),
      input.sort
    );

    return paginate(places.map(toPlaceListItem), input);
  },
  async listAdmin() {
    const places = await readPlaces(context);
    return paginate(places, { pageSize: places.length || 20 });
  },
  async detail(id) {
    const place = (await readPlaces(context)).find((item) => item._id === id);

    if (!place || place.status !== "published") {
      return null;
    }

    return toPlaceDetail(context, place);
  },
  async mapMarkers() {
    return sortPlacesForMapMarkers(
      (await readPlaces(context)).filter(
        (place) =>
          place.community_id === DEFAULT_COMMUNITY_ID &&
          place.status === "published" &&
          hasUsableCoordinates(place)
      )
    ).map((place): PlaceMapMarker => ({
      _id: place._id,
      name_zh: place.name_zh,
      name_en: place.name_en,
      category_level_1: place.category_level_1,
      is_recommended: place.is_recommended,
      location: place.location
    }));
  },
  async create(input) {
    const place = createPlaceFromInput(input);
    await context.places.doc(place._id).set(toCloudbaseSetDocument(place));
    return place;
  },
  async update(id, input) {
    const places = await readPlaces(context);
    const existing = places.find((place) => place._id === id);

    if (!existing) {
      return null;
    }

    const nextPlace = PlaceSchema.parse({
      ...existing,
      ...cleanUpdate(input)
    });

    await context.places.doc(id).update(cleanUpdate(input));
    return nextPlace;
  }
});

export const createCloudbaseProvider = (): ApiProvider => {
  const fallback = createMockProvider();
  const liveContext = createLiveContext();

  if (!liveContext) {
    return fallback;
  }

  return {
    ...fallback,
    places: createLivePlacesProvider(liveContext)
  };
};
