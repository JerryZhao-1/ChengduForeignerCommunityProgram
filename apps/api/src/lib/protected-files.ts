import { FILE_PATH_RULES } from "@community-map/shared";

export const isProtectedGalleryUploadRequest = (input: {
  biz_type: string;
  target_prefix: string;
}) =>
  input.biz_type === "place_gallery" ||
  input.target_prefix === FILE_PATH_RULES.placeGallery;

export const isProtectedGalleryCompletion = (input: {
  biz_type: string;
  cloud_path: string;
}) =>
  input.biz_type === "place_gallery" ||
  input.cloud_path.startsWith(FILE_PATH_RULES.placeGallery);
