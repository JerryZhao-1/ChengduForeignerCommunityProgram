export const LOCALES = ["zh", "en"] as const;
export const ROLE_FLAGS = [
  "user",
  "organizer",
  "community_admin",
  "system_admin"
] as const;
export const API_ERROR_CODES = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "VALIDATION_ERROR",
  "CONFIGURATION_ERROR",
  "UPSTREAM_ERROR",
  "NOT_FOUND",
  "CONFLICT",
  "NOT_IMPLEMENTED",
  "INTERNAL_ERROR"
] as const;
export const FILE_VISIBILITIES = ["public", "private"] as const;
export const NOTIFICATION_STATUSES = ["unread", "read"] as const;

export type Locale = (typeof LOCALES)[number];
export type RoleFlag = (typeof ROLE_FLAGS)[number];
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];
export type FileVisibility = (typeof FILE_VISIBILITIES)[number];
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];
