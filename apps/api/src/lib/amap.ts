import { z } from "zod";
import { PlaceAmapMediaSearchResponseSchema } from "@community-map/shared";

import { apiError } from "./errors";

const AMAP_PLACE_SEARCH_URL = "https://restapi.amap.com/v3/place/text";
const DEFAULT_OFFSET = "10";

const AmapPhotoSchema = z.object({
  title: z.union([z.string(), z.array(z.never())]).optional(),
  url: z.string().url()
});

const AmapPoiSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.union([z.string(), z.array(z.never())]).optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  pname: z.string().optional(),
  cityname: z.union([z.string(), z.array(z.never())]).optional(),
  adname: z.union([z.string(), z.array(z.never())]).optional(),
  photos: z.array(AmapPhotoSchema).optional()
});

const AmapPlaceSearchResponseSchema = z.object({
  status: z.string(),
  info: z.string().optional(),
  infocode: z.string().optional(),
  pois: z.array(AmapPoiSchema).optional()
});

const normalizeText = (value?: string | never[]) =>
  typeof value === "string" ? value : "";

const parseLocation = (value?: string) => {
  if (!value) {
    return null;
  }

  const [longitudeText, latitudeText] = value.split(",");
  const longitude = Number(longitudeText);
  const latitude = Number(latitudeText);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
};

export const searchAmapPlaceMedia = async (input: {
  keyword: string;
  city?: string;
}) => {
  const key = process.env.AMAP_WEB_SERVICE_KEY?.trim();

  if (!key) {
    throw apiError(
      "CONFIGURATION_ERROR",
      "Amap WebService key is not configured.",
      500
    );
  }

  const url = new URL(AMAP_PLACE_SEARCH_URL);
  url.searchParams.set("key", key);
  url.searchParams.set("keywords", input.keyword);
  url.searchParams.set("city", input.city ?? "成都");
  url.searchParams.set("extensions", "all");
  url.searchParams.set("offset", DEFAULT_OFFSET);
  url.searchParams.set("page", "1");

  const response = await fetch(url);

  if (!response.ok) {
    throw apiError("UPSTREAM_ERROR", "Amap media search request failed.", 502, {
      status: response.status
    });
  }

  const parsed = AmapPlaceSearchResponseSchema.safeParse(
    (await response.json()) as unknown
  );

  if (!parsed.success) {
    throw apiError(
      "UPSTREAM_ERROR",
      "Amap media search response was invalid.",
      502,
      {
        issues: parsed.error.issues
      }
    );
  }

  if (parsed.data.status !== "1") {
    throw apiError(
      "UPSTREAM_ERROR",
      parsed.data.info ?? "Amap media search failed.",
      502,
      {
        infocode: parsed.data.infocode
      }
    );
  }

  return PlaceAmapMediaSearchResponseSchema.parse(
    (parsed.data.pois ?? []).map((poi) => ({
      id: poi.id,
      title: poi.name,
      address: normalizeText(poi.address),
      category: poi.type ?? null,
      location: parseLocation(poi.location),
      province: poi.pname ?? null,
      city: normalizeText(poi.cityname) || null,
      district: normalizeText(poi.adname) || null,
      image_candidates: (poi.photos ?? []).map((photo) => ({
        source: "amap",
        source_place_id: poi.id,
        image_url: photo.url,
        image_title:
          typeof photo.title === "string" ? photo.title.trim() || null : null,
        attribution: {
          label: "Image source: Amap",
          provider_name: "Amap"
        }
      }))
    }))
  );
};
