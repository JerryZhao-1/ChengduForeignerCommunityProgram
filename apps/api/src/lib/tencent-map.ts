import { createHash } from "node:crypto";

import { z } from "zod";
import { PlacePoiSearchResponseSchema } from "@community-map/shared";

import { apiError } from "./errors";

const TENCENT_PLACE_SEARCH_PATH = "/ws/place/v1/search";
const TENCENT_PLACE_SEARCH_URL = `https://apis.map.qq.com${TENCENT_PLACE_SEARCH_PATH}`;
const DEFAULT_BOUNDARY = "region(成都,0)";
const DEFAULT_PAGE_SIZE = "10";

const TencentMapPlaceSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  address: z.string().optional(),
  category: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  ad_info: z
    .object({
      province: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional()
    })
    .optional()
});

const TencentMapSearchResponseSchema = z.object({
  status: z.number(),
  message: z.string().optional(),
  data: z.array(TencentMapPlaceSchema).optional()
});

const buildSignature = (
  path: string,
  params: Record<string, string>,
  secretKey: string
) => {
  const query = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("md5")
    .update(`${path}?${query}${secretKey}`)
    .digest("hex");
};

export const searchTencentPlacePois = async (keyword: string) => {
  const key = process.env.TENCENT_MAP_KEY?.trim();
  const secretKey = process.env.TENCENT_MAP_SECRET_KEY?.trim();

  if (!key) {
    throw apiError(
      "CONFIGURATION_ERROR",
      "Tencent Map key is not configured.",
      500
    );
  }

  const params: Record<string, string> = {
    boundary: DEFAULT_BOUNDARY,
    key,
    keyword,
    page_size: DEFAULT_PAGE_SIZE
  };

  const url = new URL(TENCENT_PLACE_SEARCH_URL);
  for (const [paramKey, value] of Object.entries(params)) {
    url.searchParams.set(paramKey, value);
  }

  if (secretKey) {
    url.searchParams.set(
      "sig",
      buildSignature(TENCENT_PLACE_SEARCH_PATH, params, secretKey)
    );
  }

  const response = await fetch(url, {
    headers: {
      "x-legacy-url-decode": "no"
    }
  });

  if (!response.ok) {
    throw apiError("UPSTREAM_ERROR", "Tencent Map search request failed.", 502, {
      status: response.status
    });
  }

  const parsed = TencentMapSearchResponseSchema.safeParse(
    (await response.json()) as unknown
  );

  if (!parsed.success) {
    throw apiError(
      "UPSTREAM_ERROR",
      "Tencent Map search response was invalid.",
      502,
      {
        issues: parsed.error.issues
      }
    );
  }

  if (parsed.data.status !== 0) {
    throw apiError(
      "UPSTREAM_ERROR",
      parsed.data.message ?? "Tencent Map search failed.",
      502,
      {
        status: parsed.data.status
      }
    );
  }

  return PlacePoiSearchResponseSchema.parse(
    (parsed.data.data ?? []).map((item) => ({
      id: item.id ?? `${item.title}:${item.location.lat},${item.location.lng}`,
      title: item.title,
      address: item.address ?? "",
      category: item.category ?? null,
      location: {
        latitude: item.location.lat,
        longitude: item.location.lng
      },
      province: item.ad_info?.province ?? null,
      city: item.ad_info?.city ?? null,
      district: item.ad_info?.district ?? null
    }))
  );
};
