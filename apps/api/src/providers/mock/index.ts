import { randomUUID } from "node:crypto";

import {
  PENDING_PLACE_GALLERY_BIZ_ID,
  createMockService,
  isMockServiceError
} from "@community-map/shared";

import { apiError } from "../../lib/errors";
import { assertAdminLogin, createAdminSession } from "../../lib/admin-auth";
import type { ApiProvider } from "../types";

const withMockErrors = async <TValue>(
  operation: () => TValue | Promise<TValue>
) => {
  try {
    return await operation();
  } catch (error) {
    if (isMockServiceError(error)) {
      throw apiError(error.code, error.message, error.status, error.details);
    }

    throw error;
  }
};

export const createMockProvider = (): ApiProvider => {
  const service = createMockService();

  return {
    auth: {
      async resolveActor(userId) {
        return withMockErrors(() => service.auth.me(userId).user);
      },
      async login(input) {
        return withMockErrors(() => service.auth.login(input));
      },
      async adminLogin(input) {
        await assertAdminLogin(input);
        const adminUserId = process.env.API_ADMIN_USER_ID?.trim() || "user_001";
        return withMockErrors(() =>
          createAdminSession(service.auth.me(adminUserId).user)
        );
      },
      async me(userId) {
        return withMockErrors(() => service.auth.me(userId));
      },
      async wechatMiniappSession(input) {
        return withMockErrors(() =>
          service.auth.login({
            mock_user_id: "user_001",
            preferred_language: input.preferred_language
          })
        );
      }
    },
    events: {
      async list(input) {
        return withMockErrors(() => service.events.list(input));
      },
      async listAdmin() {
        return withMockErrors(() => service.events.listAdmin());
      },
      async detail(id) {
        return withMockErrors(() => service.events.detail(id));
      },
      async listRegistrationsForAdmin(eventId) {
        return withMockErrors(() =>
          service.events.listRegistrationsForAdmin(eventId)
        );
      },
      async createRegistration(eventId, input, actorId) {
        return withMockErrors(() =>
          service.events.createRegistration(eventId, input, actorId)
        );
      },
      async listMyRegistrations(actorId) {
        return withMockErrors(() =>
          service.events.listMyRegistrations(actorId)
        );
      },
      async getTicketByRegistration(registrationId, actorId) {
        return withMockErrors(() =>
          service.events.getTicketByRegistration(registrationId, actorId)
        );
      },
      async create(input, actorId) {
        return withMockErrors(() => service.events.create(input, actorId));
      },
      async update(id, input) {
        return withMockErrors(() => service.events.update(id, input));
      },
      async delete(id) {
        return withMockErrors(() => service.events.delete(id));
      },
      async uploadCoverFile(id, input, actorId) {
        return withMockErrors(() =>
          service.events.uploadCoverFile(id, input, actorId)
        );
      },
      async review(id, input) {
        return withMockErrors(() => service.events.review(id, input));
      },
      async checkin(id, ticketId) {
        return withMockErrors(() => service.events.checkin(id, ticketId));
      }
    },
    posts: {
      async list(input) {
        return withMockErrors(() => service.posts.list(input));
      },
      async listMine(input, actorId) {
        return withMockErrors(() => service.posts.listMine(input, actorId));
      },
      async listLiked(input, actorId) {
        return withMockErrors(() => service.posts.listLiked(input, actorId));
      },
      async listFavorited(input, actorId) {
        return withMockErrors(() =>
          service.posts.listFavorited(input, actorId)
        );
      },
      async listRelatedByPlace(input) {
        return withMockErrors(() =>
          service.posts.listRelatedByPlace(input.placeId, input)
        );
      },
      async listRelatedByEvent(input) {
        return withMockErrors(() =>
          service.posts.listRelatedByEvent(input.eventId, input)
        );
      },
      async meGovernance(actorId) {
        return withMockErrors(() => service.posts.meGovernance(actorId));
      },
      async listAdmin(input, actorId) {
        return withMockErrors(() => service.posts.listAdmin(input, actorId));
      },
      async detail(id) {
        return withMockErrors(() => service.posts.detail(id));
      },
      async interaction(id, actorId) {
        return withMockErrors(() => service.posts.interaction(id, actorId));
      },
      async setLike(id, input, actorId) {
        return withMockErrors(() => service.posts.setLike(id, input, actorId));
      },
      async setFavorite(id, input, actorId) {
        return withMockErrors(() =>
          service.posts.setFavorite(id, input, actorId)
        );
      },
      async recordShare(id, input, actorId) {
        return withMockErrors(() =>
          service.posts.recordShare(id, input, actorId)
        );
      },
      async profile(userId, actorId) {
        return withMockErrors(() => service.posts.profile(userId, actorId));
      },
      async setProfileFollow(userId, input, actorId) {
        return withMockErrors(() =>
          service.posts.setProfileFollow(userId, input, actorId)
        );
      },
      async listProfileFollowers(userId, input, actorId) {
        return withMockErrors(() =>
          service.posts.listProfileFollowers(userId, input, actorId)
        );
      },
      async listProfileFollowing(userId, input, actorId) {
        return withMockErrors(() =>
          service.posts.listProfileFollowing(userId, input, actorId)
        );
      },
      async listPublicTags(input) {
        return withMockErrors(() => service.posts.listPublicTags(input));
      },
      async createTag(input, actorId) {
        return withMockErrors(() => service.posts.createTag(input, actorId));
      },
      async listComments(postId, input) {
        return withMockErrors(() => service.posts.listComments(postId, input));
      },
      async listAdminComments(input, actorId) {
        return withMockErrors(() =>
          service.posts.listAdminComments(input, actorId)
        );
      },
      async listMyComments(input, actorId) {
        return withMockErrors(() =>
          service.posts.listMyComments(input, actorId)
        );
      },
      async detailMyComment(id, actorId) {
        return withMockErrors(() => service.posts.detailMyComment(id, actorId));
      },
      async create(input, actorId) {
        return withMockErrors(() => service.posts.create(input, actorId));
      },
      async createComment(postId, input, actorId) {
        return withMockErrors(() =>
          service.posts.createComment(postId, input, actorId)
        );
      },
      async report(id, input, actorId) {
        return withMockErrors(() => service.posts.report(id, input, actorId));
      },
      async reportComment(postId, commentId, input, actorId) {
        return withMockErrors(() =>
          service.posts.reportComment(postId, commentId, input, actorId)
        );
      },
      async moderate(id, input, actorId) {
        return withMockErrors(() => service.posts.moderate(id, input, actorId));
      },
      async updateOps(id, input, actorId) {
        return withMockErrors(() => service.posts.updateOps(id, input, actorId));
      },
      async listTags(actorId) {
        return withMockErrors(() => service.posts.listTags(actorId));
      },
      async upsertTag(id, input, actorId) {
        return withMockErrors(() => service.posts.upsertTag(id, input, actorId));
      },
      async moderateComment(id, input, actorId) {
        return withMockErrors(() =>
          service.posts.moderateComment(id, input, actorId)
        );
      },
      async listReportCases(input, actorId) {
        return withMockErrors(() =>
          service.posts.listReportCases(input, actorId)
        );
      },
      async listMyReportCases(input, actorId) {
        return withMockErrors(() =>
          service.posts.listMyReportCases(input, actorId)
        );
      },
      async detailMyReportCase(id, actorId) {
        return withMockErrors(() =>
          service.posts.detailMyReportCase(id, actorId)
        );
      },
      async detailReportCase(id, actorId) {
        return withMockErrors(() =>
          service.posts.detailReportCase(id, actorId)
        );
      },
      async resolveReportCase(id, input, actorId) {
        return withMockErrors(() =>
          service.posts.resolveReportCase(id, input, actorId)
        );
      },
      async listGovernanceUsers(input, actorId) {
        return withMockErrors(() =>
          service.posts.listGovernanceUsers(input, actorId)
        );
      },
      async detailGovernanceUser(id, actorId) {
        return withMockErrors(() =>
          service.posts.detailGovernanceUser(id, actorId)
        );
      },
      async enforceUser(id, input, actorId) {
        return withMockErrors(() =>
          service.posts.enforceUser(id, input, actorId)
        );
      },
      async listAuditRecords(input, actorId) {
        return withMockErrors(() =>
          service.posts.listAuditRecords(input, actorId)
        );
      },
      async analytics(input, actorId) {
        return withMockErrors(() => service.posts.analytics(input, actorId));
      }
    },
    places: {
      async list(input) {
        return service.places.list(input);
      },
      async listAdmin() {
        return service.places.listAdmin();
      },
      async detail(id) {
        return service.places.detail(id);
      },
      async mapMarkers() {
        return service.places.mapMarkers();
      },
      async create(input) {
        return service.places.create(input);
      },
      async update(id, input) {
        return service.places.update(id, input);
      },
      async delete(id) {
        return service.places.delete(id);
      },
      async uploadGalleryFile(id, input, actorId) {
        return withMockErrors(() => {
          const place = id
            ? service._state.places.find((item) => item._id === id)
            : null;
          if (id && !place) {
            return null;
          }

          const safeFileName = input.file_name.replace(/[^\w.-]+/g, "-");
          const targetPath = id ?? `_pending/${randomUUID()}`;
          const cloudPath = `public/places/${targetPath}/${randomUUID()}-${safeFileName}`;
          const asset = service.files.complete(
            {
              biz_type: "place_gallery",
              biz_id: id ?? PENDING_PLACE_GALLERY_BIZ_ID,
              file_id: `cloud://${cloudPath}`,
              cloud_path: cloudPath,
              visibility: "public"
            },
            actorId
          );

          if (place) {
            place.gallery_file_ids = [...place.gallery_file_ids, asset.file_id];
          }

          return {
            file_asset: asset,
            gallery_file_ids: place?.gallery_file_ids ?? [asset.file_id]
          };
        });
      }
    },
    announcements: {
      async list(input) {
        return service.announcements.list(input);
      },
      async detail(id) {
        return service.announcements.detail(id);
      }
    },
    notifications: {
      async list(actorId) {
        return withMockErrors(() => service.notifications.list(actorId));
      },
      async markRead(id, actorId) {
        return withMockErrors(() =>
          service.notifications.markRead(id, actorId)
        );
      }
    },
    files: {
      async createUploadRequest(input) {
        return withMockErrors(() => service.files.createUploadRequest(input));
      },
      async complete(input, actorId) {
        return withMockErrors(() => service.files.complete(input, actorId));
      },
      async privateUrl(input, actorId) {
        return withMockErrors(() => service.files.privateUrl(input, actorId));
      },
      async uploadPostMedia(input, actorId) {
        return withMockErrors(() => {
          const safeFileName = input.file_name.replace(/[^\w.-]+/g, "-");
          const pendingId = `_pending/${randomUUID()}`;
          const cloudPath = `public/posts/${pendingId}/${randomUUID()}-${safeFileName}`;
          return service.files.complete(
            {
              biz_type: input.kind === "video" ? "post_video" : "post_image",
              biz_id: "__pending_post_media__",
              file_id: `cloud://${cloudPath}`,
              cloud_path: cloudPath,
              visibility: "public"
            },
            actorId
          );
        });
      },
      async uploadReportEvidence(input, actorId) {
        return withMockErrors(() => {
          const safeFileName = input.file_name.replace(/[^\w.-]+/g, "-");
          const bizId = input.biz_id ?? `pending_report_${randomUUID()}`;
          const cloudPath = `private/reports/${bizId}/${randomUUID()}-${safeFileName}`;
          return service.files.complete(
            {
              biz_type: "report_evidence",
              biz_id: bizId,
              file_id: `cloud://${cloudPath}`,
              cloud_path: cloudPath,
              visibility: "private"
            },
            actorId
          );
        });
      }
    }
  };
};
