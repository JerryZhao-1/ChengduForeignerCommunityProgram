import { FILE_PATH_RULES } from "@community-map/shared";

const protectedPrefixes: string[] = [
  FILE_PATH_RULES.placeGallery,
  FILE_PATH_RULES.tickets,
  FILE_PATH_RULES.exports,
  FILE_PATH_RULES.admin
];

const protectedBizTypes = new Set([
  "place_gallery",
  "event_ticket",
  "ticket",
  "export",
  "admin_file"
]);

export const isProtectedGalleryUploadRequest = (input: {
  biz_type: string;
  target_prefix: string;
}) =>
  protectedBizTypes.has(input.biz_type) ||
  protectedPrefixes.includes(input.target_prefix);

export const isProtectedGalleryCompletion = (input: {
  biz_type: string;
  cloud_path: string;
}) =>
  protectedBizTypes.has(input.biz_type) ||
  protectedPrefixes.some((prefix) => input.cloud_path.startsWith(prefix));
