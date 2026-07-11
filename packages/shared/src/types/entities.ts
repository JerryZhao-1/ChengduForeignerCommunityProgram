import type { z } from "zod";

import type {
  DeleteEventResponseSchema,
  EventAdminListItemSchema,
  EventAdminRegistrationRowSchema
} from "../schemas/events";
import type {
  AnnouncementSchema,
  AuthSessionSchema,
  CommentSchema,
  EventRegistrationSchema,
  EventSchema,
  EventTicketSchema,
  FileAssetSchema,
  DiscoverAuditRecordSchema,
  DiscoverMeGovernanceSchema,
  DiscoverReportCaseSchema,
  DiscoverUserGovernanceDetailSchema,
  DiscoverUserGovernanceSummarySchema,
  ReportEvidenceReferenceSchema,
  UserEnforcementStateSchema,
  NotificationSchema,
  PlaceCoverSourceSchema,
  PlaceExternalMediaSchema,
  PlaceSchema,
  PostSchema,
  UserSchema
} from "../schemas/entities";
import type {
  DirectEventCoverUploadResponseSchema,
  DirectPlaceGalleryUploadResponseSchema
} from "../schemas/files";
import type {
  PostInteractionRecordSchema,
  PostInteractionStateSchema,
  PermanentDeletePostResponseSchema,
  ProfileFollowListItemSchema,
  ProfileFollowStateSchema,
  DiscoverAnalyticsSchema,
  DiscoverTagSchema,
  PublicProfileSchema,
  UserFollowRecordSchema
} from "../schemas/discover";
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
export type EventAdminListItem = z.infer<typeof EventAdminListItemSchema>;
export type EventAdminRegistrationRow = z.infer<
  typeof EventAdminRegistrationRowSchema
>;
export type DeleteEventResponse = z.infer<typeof DeleteEventResponseSchema>;
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
export type PostInteractionState = z.infer<typeof PostInteractionStateSchema>;
export type PostInteractionRecord = z.infer<
  typeof PostInteractionRecordSchema
>;
export type PermanentDeletePostResponse = z.infer<
  typeof PermanentDeletePostResponseSchema
>;
export type UserFollowRecord = z.infer<typeof UserFollowRecordSchema>;
export type ProfileFollowListItem = z.infer<
  typeof ProfileFollowListItemSchema
>;
export type ProfileFollowState = z.infer<typeof ProfileFollowStateSchema>;
export type DiscoverAnalytics = z.infer<typeof DiscoverAnalyticsSchema>;
export type DiscoverTag = z.infer<typeof DiscoverTagSchema>;
export type PublicProfile = z.infer<typeof PublicProfileSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type ReportEvidenceReference = z.infer<
  typeof ReportEvidenceReferenceSchema
>;
export type DiscoverReportCase = z.infer<typeof DiscoverReportCaseSchema>;
export type DiscoverAuditRecord = z.infer<typeof DiscoverAuditRecordSchema>;
export type UserEnforcementState = z.infer<typeof UserEnforcementStateSchema>;
export type DiscoverUserGovernanceSummary = z.infer<
  typeof DiscoverUserGovernanceSummarySchema
>;
export type DiscoverUserGovernanceDetail = z.infer<
  typeof DiscoverUserGovernanceDetailSchema
>;
export type DiscoverMeGovernance = z.infer<typeof DiscoverMeGovernanceSchema>;
export type Announcement = z.infer<typeof AnnouncementSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type FileAsset = z.infer<typeof FileAssetSchema>;
export type DirectPlaceGalleryUploadResponse = z.infer<
  typeof DirectPlaceGalleryUploadResponseSchema
>;
export type DirectEventCoverUploadResponse = z.infer<
  typeof DirectEventCoverUploadResponseSchema
>;
