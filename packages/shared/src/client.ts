import type { CommunityMapApiClient } from "./mock/client";

import { apiPaths } from "./contracts/paths";
import { ApiFailureResultSchema } from "./schemas/common";
import type { ApiError, ApiFailureResult } from "./types/common";

type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE";
type RequestBody = unknown;

export interface HttpRequester {
  <TResponse>(
    method: RequestMethod,
    url: string,
    body?: RequestBody,
    headers?: Record<string, string>
  ): Promise<TResponse>;
}

export interface HttpClientOptions {
  baseUrl: string;
  actorId?: string;
  requester: HttpRequester;
}

export class ApiClientError extends Error {
  readonly code: ApiError["code"];
  readonly details?: unknown;
  readonly requestId?: string;
  readonly status?: number;

  constructor(
    error: ApiError,
    options: { requestId?: string; status?: number } = {}
  ) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.details = error.details;
    this.requestId = options.requestId;
    this.status = options.status;
  }
}

const buildUrl = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/$/, "")}${path}`;

const buildQuerySuffix = (query?: Record<string, unknown>) => {
  const entries = Object.entries(query ?? {}).filter(
    ([, value]) => value !== undefined && value !== null
  );

  if (entries.length === 0) {
    return "";
  }

  return `?${entries
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join("&")}`;
};

const buildImageUploadFormData = (input: {
  file: Blob;
  file_name?: string;
  content_type?: string;
  biz_id?: string;
}) => {
  const formData = new FormData();
  formData.append(
    "file",
    input.file,
    input.file_name ?? "place-gallery-upload"
  );
  if (input.content_type) {
    formData.append("content_type", input.content_type);
  }
  if (input.biz_id) {
    formData.append("biz_id", input.biz_id);
  }
  return formData;
};

const isApiFailureResult = (value: unknown): value is ApiFailureResult =>
  ApiFailureResultSchema.safeParse(value).success;

const createHttpStatusError = (status: number, payload: unknown): ApiError => ({
  code: "UPSTREAM_ERROR",
  message: `HTTP request failed with status ${status}.`,
  details: payload
});

export const createFetchRequester = (
  fetchImpl: typeof fetch = fetch
): HttpRequester => {
  return async (method, url, body, headers = {}) => {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    const response = await fetchImpl(url, {
      method,
      headers: isFormData
        ? headers
        : {
            "content-type": "application/json",
            ...headers
          },
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body)
    });
    const payload = (await response.json()) as unknown;

    if (isApiFailureResult(payload)) {
      throw new ApiClientError(payload.error, {
        requestId: payload.requestId,
        status: response.status
      });
    }

    if (!response.ok) {
      throw new ApiClientError(
        createHttpStatusError(response.status, payload),
        {
          status: response.status
        }
      );
    }

    return payload as any;
  };
};

export const createHttpClient = (
  options: HttpClientOptions
): CommunityMapApiClient => {
  const request = <TResponse>(
    method: RequestMethod,
    path: string,
    body?: RequestBody
  ) =>
    options.requester<TResponse>(
      method,
      buildUrl(options.baseUrl, path),
      body,
      options.actorId ? { "x-mock-user-id": options.actorId } : undefined
    );

  return {
    auth: {
      login: (input) => request("POST", apiPaths.auth.login, input),
      me: () => request("GET", apiPaths.auth.me)
    },
    events: {
      list: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.events.list}${suffix}`);
      },
      detail: (id) => request("GET", apiPaths.events.detail(id)),
      register: (id, input) =>
        request("POST", apiPaths.events.createRegistration(id), input),
      myRegistrations: () => request("GET", apiPaths.events.myRegistrations),
      registrationTicket: (id) =>
        request("GET", apiPaths.events.registrationTicket(id))
    },
    discover: {
      listPosts: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.discover.listPosts}${suffix}`);
      },
      detailPost: (id) => request("GET", apiPaths.discover.detailPost(id)),
      postInteraction: (id) =>
        request("GET", apiPaths.discover.postInteraction(id)),
      setPostLike: (id, input) =>
        request("POST", apiPaths.discover.likePost(id), input),
      setPostFavorite: (id, input) =>
        request("POST", apiPaths.discover.favoritePost(id), input),
      recordPostShare: (id, input = {}) =>
        request("POST", apiPaths.discover.sharePost(id), input),
      profile: (userId) => request("GET", apiPaths.discover.profile(userId)),
      setProfileFollow: (userId, input) =>
        request("POST", apiPaths.discover.followProfile(userId), input),
      listProfileFollowers: (userId, query) => {
        const suffix = buildQuerySuffix(query);
        return request(
          "GET",
          `${apiPaths.discover.profileFollowers(userId)}${suffix}`
        );
      },
      listProfileFollowing: (userId, query) => {
        const suffix = buildQuerySuffix(query);
        return request(
          "GET",
          `${apiPaths.discover.profileFollowing(userId)}${suffix}`
        );
      },
      listTags: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.discover.listTags}${suffix}`);
      },
      createTag: (input) =>
        request("POST", apiPaths.discover.createTag, input),
      createPost: (input) =>
        request("POST", apiPaths.discover.createPost, input),
      myPosts: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.discover.myPosts}${suffix}`);
      },
      myComments: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.discover.myComments}${suffix}`);
      },
      myCommentDetail: (id) =>
        request("GET", apiPaths.discover.myCommentDetail(id)),
      myReports: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.discover.myReports}${suffix}`);
      },
      myReportDetail: (id) =>
        request("GET", apiPaths.discover.myReportDetail(id)),
      listPlaceRelatedPosts: (placeId, query) => {
        const suffix = buildQuerySuffix(query);
        return request(
          "GET",
          `${apiPaths.discover.listPlaceRelatedPosts(placeId)}${suffix}`
        );
      },
      listEventRelatedPosts: (eventId, query) => {
        const suffix = buildQuerySuffix(query);
        return request(
          "GET",
          `${apiPaths.discover.listEventRelatedPosts(eventId)}${suffix}`
        );
      },
      meGovernance: () => request("GET", apiPaths.discover.meGovernance),
      listComments: (id, query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.discover.listComments(id)}${suffix}`);
      },
      createComment: (id, input) =>
        request("POST", apiPaths.discover.createComment(id), input),
      reportPost: (id, input) =>
        request("POST", apiPaths.discover.reportPost(id), input),
      reportComment: (postId, commentId, input) =>
        request(
          "POST",
          apiPaths.discover.reportComment(postId, commentId),
          input
        )
    },
    places: {
      list: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.places.list}${suffix}`);
      },
      detail: (id) => request("GET", apiPaths.places.detail(id)),
      mapMarkers: () => request("GET", apiPaths.places.mapMarkers)
    },
    announcements: {
      list: () => request("GET", apiPaths.announcements.list),
      detail: (id) => request("GET", apiPaths.announcements.detail(id))
    },
    notifications: {
      list: () => request("GET", apiPaths.notifications.list),
      markRead: (id) => request("POST", apiPaths.notifications.markRead(id), {})
    },
    files: {
      createUploadRequest: (input) =>
        request("POST", apiPaths.files.createUploadRequest, input),
      complete: (input) =>
        request("POST", apiPaths.files.completeUpload, input),
      privateUrl: (input) => request("POST", apiPaths.files.privateUrl, input),
      uploadPostMedia: (input) =>
        request(
          "POST",
          apiPaths.files.uploadPostMedia,
          buildImageUploadFormData(input)
        ),
      uploadReportEvidence: (input) =>
        request(
          "POST",
          apiPaths.files.uploadReportEvidence,
          buildImageUploadFormData(input)
        )
    },
    admin: {
      listEvents: () => request("GET", apiPaths.admin.listEvents),
      listPlaces: () => request("GET", apiPaths.admin.listPlaces),
      createEvent: (input) =>
        request("POST", apiPaths.admin.createEvent, input),
      updateEvent: (id, input) =>
        request("PATCH", apiPaths.admin.updateEvent(id), input),
      deleteEvent: (id) => request("DELETE", apiPaths.admin.deleteEvent(id)),
      reviewEvent: (id, input) =>
        request("POST", apiPaths.admin.reviewEvent(id), input),
      checkinEvent: (id, input) =>
        request("POST", apiPaths.admin.checkinEvent(id), input),
      listEventRegistrations: (id) =>
        request("GET", apiPaths.admin.eventRegistrations(id)),
      uploadEventCoverFile: (id, input) =>
        request(
          "POST",
          apiPaths.admin.uploadEventCoverFile(id),
          buildImageUploadFormData(input)
        ),
      uploadPendingEventCoverFile: (input) =>
        request(
          "POST",
          apiPaths.admin.uploadPendingEventCoverFile,
          buildImageUploadFormData(input)
        ),
      moderatePost: (id, input) =>
        request("POST", apiPaths.admin.moderatePost(id), input),
      updateDiscoverPostOps: (id, input) =>
        request("POST", apiPaths.admin.updateDiscoverPostOps(id), input),
      listDiscoverTags: () => request("GET", apiPaths.admin.listDiscoverTags),
      upsertDiscoverTag: (id, input) =>
        request("POST", apiPaths.admin.upsertDiscoverTag(id), input),
      listDiscoverPosts: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.admin.listDiscoverPosts}${suffix}`);
      },
      listDiscoverComments: (query) => {
        const suffix = buildQuerySuffix(query);
        return request(
          "GET",
          `${apiPaths.admin.listDiscoverComments}${suffix}`
        );
      },
      moderateComment: (id, input) =>
        request("POST", apiPaths.admin.moderateComment(id), input),
      listDiscoverReports: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.admin.listDiscoverReports}${suffix}`);
      },
      detailDiscoverReport: (id) =>
        request("GET", apiPaths.admin.detailDiscoverReport(id)),
      resolveDiscoverReport: (id, input) =>
        request("POST", apiPaths.admin.resolveDiscoverReport(id), input),
      listDiscoverUsers: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.admin.listDiscoverUsers}${suffix}`);
      },
      detailDiscoverUser: (id) =>
        request("GET", apiPaths.admin.detailDiscoverUser(id)),
      enforceDiscoverUser: (id, input) =>
        request("POST", apiPaths.admin.enforceDiscoverUser(id), input),
      listDiscoverAudit: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.admin.listDiscoverAudit}${suffix}`);
      },
      discoverAnalytics: (query) => {
        const suffix = buildQuerySuffix(query);
        return request("GET", `${apiPaths.admin.discoverAnalytics}${suffix}`);
      },
      createPlace: (input) =>
        request("POST", apiPaths.admin.createPlace, input),
      updatePlace: (id, input) =>
        request("PATCH", apiPaths.admin.updatePlace(id), input),
      deletePlace: (id) => request("DELETE", apiPaths.admin.deletePlace(id)),
      searchPlacePoi: (input) => {
        const suffix = buildQuerySuffix(input);
        return request("GET", `${apiPaths.admin.searchPlacePoi}${suffix}`);
      },
      searchPlaceAmapMedia: (input) => {
        const suffix = buildQuerySuffix(input);
        return request(
          "GET",
          `${apiPaths.admin.searchPlaceAmapMedia}${suffix}`
        );
      },
      uploadPlaceGalleryFile: (id, input) => {
        return request(
          "POST",
          apiPaths.admin.uploadPlaceGalleryFile(id),
          buildImageUploadFormData(input)
        );
      },
      uploadPendingPlaceGalleryFile: (input) => {
        return request(
          "POST",
          apiPaths.admin.uploadPendingPlaceGalleryFile,
          buildImageUploadFormData(input)
        );
      }
    }
  };
};
