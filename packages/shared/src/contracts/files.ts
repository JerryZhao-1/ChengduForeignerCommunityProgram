import { defineContract } from "./define-contract";
import {
  CompleteUploadInputSchema,
  CreateUploadRequestInputSchema,
  DirectEventCoverUploadResponseSchema,
  FileCompletionResponseSchema,
  DirectPlaceGalleryUploadResponseSchema,
  PrivateUrlRequestInputSchema,
  PrivateUrlResponseSchema,
  UploadRequestResponseSchema
} from "../schemas/files";

export const fileContracts = {
  createUploadRequest: defineContract({
    method: "POST",
    path: "/files/upload-requests",
    request: CreateUploadRequestInputSchema,
    response: UploadRequestResponseSchema
  }),
  completeUpload: defineContract({
    method: "POST",
    path: "/files/complete",
    request: CompleteUploadInputSchema,
    response: FileCompletionResponseSchema
  }),
  privateUrl: defineContract({
    method: "POST",
    path: "/files/private-url",
    request: PrivateUrlRequestInputSchema,
    response: PrivateUrlResponseSchema
  }),
  directPlaceGalleryUpload: defineContract({
    method: "POST",
    path: "/admin/places/:id/gallery-files",
    response: DirectPlaceGalleryUploadResponseSchema
  }),
  directPendingPlaceGalleryUpload: defineContract({
    method: "POST",
    path: "/admin/places/gallery-files",
    response: DirectPlaceGalleryUploadResponseSchema
  }),
  directEventCoverUpload: defineContract({
    method: "POST",
    path: "/admin/events/:id/cover-file",
    response: DirectEventCoverUploadResponseSchema
  }),
  directPendingEventCoverUpload: defineContract({
    method: "POST",
    path: "/admin/events/cover-file",
    response: DirectEventCoverUploadResponseSchema
  })
};
