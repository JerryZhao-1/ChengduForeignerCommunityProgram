import { z } from "zod";

import { FileVisibilitySchema } from "./common";
import { FileAssetSchema } from "./entities";

export const FILE_PATH_RULES = {
  eventCovers: "public/events/",
  placeGallery: "public/places/",
  postImages: "public/posts/",
  announcementImages: "public/announcements/",
  tickets: "private/tickets/",
  exports: "private/exports/",
  admin: "private/admin/"
} as const;

export const CreateUploadRequestInputSchema = z.object({
  biz_type: z.string(),
  biz_id: z.string(),
  file_name: z.string(),
  visibility: FileVisibilitySchema,
  target_prefix: z.enum([
    FILE_PATH_RULES.eventCovers,
    FILE_PATH_RULES.placeGallery,
    FILE_PATH_RULES.postImages,
    FILE_PATH_RULES.announcementImages,
    FILE_PATH_RULES.tickets,
    FILE_PATH_RULES.exports,
    FILE_PATH_RULES.admin
  ])
});

export const CompleteUploadInputSchema = z.object({
  biz_type: z.string(),
  biz_id: z.string(),
  file_id: z.string(),
  cloud_path: z.string(),
  visibility: FileVisibilitySchema
});

export const PrivateUrlRequestInputSchema = z.object({
  file_id: z.string()
});

export const UploadRequestResponseSchema = z.object({
  cloud_path: z.string(),
  upload_url: z.string().url(),
  expires_in: z.number().int().positive()
});

export const FileCompletionResponseSchema = FileAssetSchema;

export const PrivateUrlResponseSchema = z.object({
  temp_url: z.string().url(),
  expires_at: z.string()
});

export const DirectPlaceGalleryUploadResponseSchema = z.object({
  file_asset: FileAssetSchema,
  gallery_file_ids: z.array(z.string())
});
