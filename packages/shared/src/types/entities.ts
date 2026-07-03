import type { z } from "zod";

import type {
  AnnouncementSchema,
  AuthSessionSchema,
  CommentSchema,
  EventRegistrationSchema,
  EventSchema,
  EventTicketSchema,
  FileAssetSchema,
  NotificationSchema,
  PlaceCoverSourceSchema,
  PlaceExternalMediaSchema,
  PlaceSchema,
  PostSchema,
  UserSchema
} from "../schemas/entities";
import type { DirectPlaceGalleryUploadResponseSchema } from "../schemas/files";
import type {
  PlaceDetailSchema,
  DeletePlaceResponseSchema,
  PlaceAmapImageCandidateSchema,
  PlaceAmapMediaSearchItemSchema,
  PlaceGalleryMediaSchema,
  PlaceListItemSchema,
  PlaceMapMarkerSchema,
  PlacePoiSearchItemSchema
} from "../schemas/places";

export type User = z.infer<typeof UserSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type Event = z.infer<typeof EventSchema>;
export type EventRegistration = z.infer<typeof EventRegistrationSchema>;
export type EventTicket = z.infer<typeof EventTicketSchema>;
export type Place = z.infer<typeof PlaceSchema>;
export type PlaceExternalMedia = z.infer<typeof PlaceExternalMediaSchema>;
export type PlaceCoverSource = z.infer<typeof PlaceCoverSourceSchema>;
export type PlaceListItem = z.infer<typeof PlaceListItemSchema>;
export type PlaceGalleryMedia = z.infer<typeof PlaceGalleryMediaSchema>;
export type PlaceDetail = z.infer<typeof PlaceDetailSchema>;
export type PlaceMapMarker = z.infer<typeof PlaceMapMarkerSchema>;
export type PlacePoiSearchItem = z.infer<typeof PlacePoiSearchItemSchema>;
export type PlaceAmapImageCandidate = z.infer<
  typeof PlaceAmapImageCandidateSchema
>;
export type PlaceAmapMediaSearchItem = z.infer<
  typeof PlaceAmapMediaSearchItemSchema
>;
export type DeletePlaceResponse = z.infer<typeof DeletePlaceResponseSchema>;
export type Post = z.infer<typeof PostSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type Announcement = z.infer<typeof AnnouncementSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type FileAsset = z.infer<typeof FileAssetSchema>;
export type DirectPlaceGalleryUploadResponse = z.infer<
  typeof DirectPlaceGalleryUploadResponseSchema
>;
