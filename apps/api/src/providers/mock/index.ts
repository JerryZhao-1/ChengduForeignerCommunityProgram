import { randomUUID } from "node:crypto";

import {
  PENDING_PLACE_GALLERY_BIZ_ID,
  createMockService,
  isMockServiceError
} from "@community-map/shared";

import { apiError } from "../../lib/errors";
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
      async me(userId) {
        return withMockErrors(() => service.auth.me(userId));
      }
    },
    events: {
      async list(input) {
        return withMockErrors(() => service.events.list(input));
      },
      async detail(id) {
        return withMockErrors(() => service.events.detail(id));
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
      async detail(id) {
        return withMockErrors(() => service.posts.detail(id));
      },
      async create(input, actorId) {
        return withMockErrors(() => service.posts.create(input, actorId));
      },
      async createComment(postId, input, actorId) {
        return withMockErrors(() =>
          service.posts.createComment(postId, input, actorId)
        );
      },
      async report(id) {
        return withMockErrors(() => service.posts.report(id));
      },
      async moderate(id, input) {
        return withMockErrors(() => service.posts.moderate(id, input));
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
      }
    }
  };
};
