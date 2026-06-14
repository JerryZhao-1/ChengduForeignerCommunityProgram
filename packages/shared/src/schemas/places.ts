import { z } from "zod";

import { PLACE_STATUSES } from "../enums";
import { PlaceSchema } from "./entities";
import { CoordinatesSchema, PageQuerySchema } from "./common";
import { PlaceTopLevelCategorySchema } from "./place-categories";

export const PlaceListSortSchema = z.enum(["recommended", "name"]);

export const PlaceListItemSchema = z.object({
  _id: z.string(),
  name_zh: z.string(),
  name_en: z.string(),
  cover_url: z.string().url().nullable(),
  category_level_1: PlaceTopLevelCategorySchema,
  category_level_2: z.string(),
  short_address_zh: z.string(),
  short_address_en: z.string(),
  summary_zh: z.string(),
  summary_en: z.string(),
  tag_ids: z.array(z.string()),
  is_recommended: z.boolean(),
  recommended_reason_zh: z.string().nullable(),
  recommended_reason_en: z.string().nullable(),
  supports_navigation: z.boolean()
});

export const PlaceMapMarkerSchema = z.object({
  _id: z.string(),
  name_zh: z.string(),
  name_en: z.string(),
  category_level_1: PlaceTopLevelCategorySchema,
  is_recommended: z.boolean(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  })
});

export const PlaceNavigationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name_zh: z.string(),
  name_en: z.string(),
  address_zh: z.string(),
  address_en: z.string()
});

export const PlaceShareSchema = z.object({
  title_zh: z.string(),
  title_en: z.string(),
  summary_zh: z.string(),
  summary_en: z.string()
});

export const PlaceGalleryMediaSchema = z.object({
  file_id: z.string(),
  cloud_path: z.string(),
  url: z.string().url(),
  alt_zh: z.string(),
  alt_en: z.string()
});

export const PlaceDetailSchema = z.object({
  _id: z.string(),
  community_id: z.string(),
  name_zh: z.string(),
  name_en: z.string(),
  cover_url: z.string().url().nullable(),
  category_level_1: PlaceTopLevelCategorySchema,
  category_level_2: z.string(),
  tag_ids: z.array(z.string()),
  address_zh: z.string(),
  address_en: z.string(),
  location: CoordinatesSchema,
  business_hours_zh: z.string(),
  business_hours_en: z.string(),
  intro_zh: z.string(),
  intro_en: z.string(),
  gallery_media: z.array(PlaceGalleryMediaSchema),
  gallery_urls: z.array(z.string().url()),
  is_recommended: z.boolean(),
  recommended_reason_zh: z.string().nullable(),
  recommended_reason_en: z.string().nullable(),
  supports_navigation: z.boolean(),
  supports_favorite: z.boolean(),
  supports_share: z.boolean(),
  navigation: PlaceNavigationSchema,
  share: PlaceShareSchema
});

export const PlaceListQuerySchema = PageQuerySchema.extend({
  category: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  recommended: z.coerce.boolean().optional(),
  sort: PlaceListSortSchema.default("recommended")
});

export const CreatePlaceInputSchema = PlaceSchema.pick({
  name_zh: true,
  name_en: true,
  cover_file_id: true,
  cover_url: true,
  category_level_1: true,
  category_level_2: true,
  tag_ids: true,
  address_zh: true,
  address_en: true,
  location: true,
  business_hours_zh: true,
  business_hours_en: true,
  intro_zh: true,
  intro_en: true,
  recommended_reason_zh: true,
  recommended_reason_en: true,
  is_recommended: true,
  recommended_rank: true,
  gallery_file_ids: true,
  gallery_urls: true,
  tencent_map_poi_id: true,
  supports_navigation: true,
  supports_favorite: true,
  supports_share: true,
  status: true,
  import_review: true
}).extend({
  cover_file_id: z.string().nullable().default(null),
  cover_url: z.string().url().nullable().default(null),
  tag_ids: z.array(z.string()).default([]),
  recommended_reason_zh: z.string().nullable().default(null),
  recommended_reason_en: z.string().nullable().default(null),
  is_recommended: z.boolean().default(false),
  recommended_rank: z.number().int().min(0).default(0),
  gallery_file_ids: z.array(z.string()).default([]),
  gallery_urls: z.array(z.string().url()).default([]),
  tencent_map_poi_id: z.string().nullable().default(null),
  supports_navigation: z.boolean().default(true),
  supports_favorite: z.boolean().default(true),
  supports_share: z.boolean().default(true),
  status: z.enum(PLACE_STATUSES).default("draft"),
  import_review: PlaceSchema.shape.import_review.default(null)
});

export const UpdatePlaceInputSchema = CreatePlaceInputSchema.partial();
