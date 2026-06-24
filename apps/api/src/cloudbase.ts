import {
  AnnouncementListQuerySchema,
  CheckinInputSchema,
  CompleteUploadInputSchema,
  CreateCommentInputSchema,
  CreateEventInputSchema,
  CreateEventRegistrationInputSchema,
  CreatePlaceInputSchema,
  CreatePostInputSchema,
  CreateUploadRequestInputSchema,
  EventListQuerySchema,
  LoginRequestSchema,
  ModeratePostInputSchema,
  PlaceListQuerySchema,
  PostListQuerySchema,
  PrivateUrlRequestInputSchema,
  ReportPostInputSchema,
  ReviewEventInputSchema,
  UpdateEventInputSchema,
  UpdatePlaceInputSchema
} from "@community-map/shared";

import { apiError, ApiAppError } from "./lib/errors";
import { parseOrThrow } from "./lib/http";
import {
  isProtectedGalleryCompletion,
  isProtectedGalleryUploadRequest
} from "./lib/protected-files";
import { createProvider } from "./providers";
import type { ApiProvider } from "./providers/types";

type HttpMethod = "GET" | "POST" | "PATCH";
type CloudbaseEventHandler = (
  event: unknown,
  context: Partial<CloudbaseContextLike>
) => Promise<IntegrationResponse>;

interface IntegrationResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
}

interface CloudbaseContextLike {
  eventID: string;
  httpContext: {
    url: string;
    httpMethod: string;
    headers?: Record<string, string | string[] | undefined>;
  };
}

interface CloudbaseFunctionEvent {
  $url?: string;
  $method?: string;
  $headers?: Record<string, string | string[] | undefined>;
  [key: string]: unknown;
}

interface RouteMatch {
  matched: boolean;
  params: Record<string, string>;
}

const matchRoute = (pattern: string, pathname: string): RouteMatch => {
  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  if (patternSegments.length !== pathSegments.length) {
    return { matched: false, params: {} };
  }

  const params: Record<string, string> = {};

  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index];
    const pathSegment = pathSegments[index];

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = pathSegment;
      continue;
    }

    if (patternSegment !== pathSegment) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
};

const stripApiPrefix = (path: string) => {
  if (path === "/api") {
    return "/";
  }

  if (path.startsWith("/api/")) {
    return path.slice(4);
  }

  return path;
};

const getActorId = (context: CloudbaseContextLike) => {
  const headerValue = context.httpContext.headers?.["x-mock-user-id"];

  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return headerValue;
};

const ok = (
  body: unknown,
  requestId: string,
  statusCode = 200
): IntegrationResponse => ({
  statusCode,
  headers: {
    "content-type": "application/json"
  },
  body: {
    success: true,
    data: body,
    requestId
  }
});

const fail = (error: ApiAppError, requestId: string): IntegrationResponse => ({
  statusCode: error.status,
  headers: {
    "content-type": "application/json"
  },
  body: {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    },
    requestId
  }
});

const requireRole = async (
  provider: ApiProvider,
  context: CloudbaseContextLike,
  roles: Array<"community_admin" | "system_admin">
) => {
  const actor = await provider.auth.resolveActor(getActorId(context));

  if (!roles.some((role) => actor.role_flags.includes(role))) {
    throw apiError("FORBIDDEN", "Insufficient permission.", 403);
  }

  return actor;
};

const isFunctionEvent = (event: unknown): event is CloudbaseFunctionEvent =>
  typeof event === "object" && event !== null;

const normalizeRequest = (
  event: unknown,
  context: Partial<CloudbaseContextLike>
) => {
  const functionEvent = isFunctionEvent(event) ? event : {};
  const httpContext =
    context.httpContext ??
    ({
      url: functionEvent.$url ?? "/",
      httpMethod: functionEvent.$method ?? "GET",
      headers: functionEvent.$headers
    } satisfies CloudbaseContextLike["httpContext"]);
  const body =
    context.httpContext || !isFunctionEvent(event)
      ? event
      : Object.fromEntries(
          Object.entries(event).filter(([key]) => !key.startsWith("$"))
        );

  return {
    requestId: context.eventID ?? "req_cloudbase_function",
    httpContext,
    body
  };
};

export const main: CloudbaseEventHandler = async (event, context) => {
  const { requestId, httpContext, body } = normalizeRequest(event, context);
  const url = new URL(httpContext.url, "http://localhost");
  const pathname = stripApiPrefix(url.pathname);
  const method = httpContext.httpMethod.toUpperCase() as HttpMethod;
  const actorId = getActorId({
    eventID: requestId,
    httpContext
  });
  const provider = createProvider(process.env.API_PROVIDER);

  try {
    if (method === "GET" && pathname === "/health") {
      return ok({ ok: true }, requestId);
    }

    if (method === "POST" && pathname === "/auth/login") {
      const input = parseOrThrow(LoginRequestSchema, body);
      return ok(await provider.auth.login(input), requestId);
    }

    if (method === "GET" && pathname === "/auth/me") {
      return ok(await provider.auth.me(actorId), requestId);
    }

    if (method === "GET" && pathname === "/events") {
      const query = parseOrThrow(
        EventListQuerySchema,
        Object.fromEntries(url.searchParams.entries())
      );
      return ok(await provider.events.list(query), requestId);
    }

    {
      const match = matchRoute("/events/:id", pathname);

      if (method === "GET" && match.matched) {
        const eventItem = await provider.events.detail(match.params.id);

        if (!eventItem) {
          throw apiError("NOT_FOUND", "Event not found.", 404);
        }

        return ok(eventItem, requestId);
      }
    }

    {
      const match = matchRoute("/events/:id/registrations", pathname);

      if (method === "POST" && match.matched) {
        const input = parseOrThrow(CreateEventRegistrationInputSchema, body);
        return ok(
          await provider.events.createRegistration(match.params.id, input, actorId),
          requestId,
          201
        );
      }
    }

    if (method === "GET" && pathname === "/events/me/registrations") {
      return ok(await provider.events.listMyRegistrations(actorId), requestId);
    }

    {
      const match = matchRoute("/events/registrations/:id/ticket", pathname);

      if (method === "GET" && match.matched) {
        const ticket = await provider.events.getTicketByRegistration(
          match.params.id,
          actorId
        );

        if (!ticket) {
          throw apiError("NOT_FOUND", "Ticket not found.", 404);
        }

        return ok(ticket, requestId);
      }
    }

    if (method === "GET" && pathname === "/discover/posts") {
      const query = parseOrThrow(
        PostListQuerySchema,
        Object.fromEntries(url.searchParams.entries())
      );
      return ok(await provider.posts.list(query), requestId);
    }

    {
      const match = matchRoute("/discover/posts/:id", pathname);

      if (method === "GET" && match.matched) {
        const post = await provider.posts.detail(match.params.id);

        if (!post) {
          throw apiError("NOT_FOUND", "Post not found.", 404);
        }

        return ok(post, requestId);
      }
    }

    if (method === "POST" && pathname === "/discover/posts") {
      const input = parseOrThrow(CreatePostInputSchema, body);
      return ok(await provider.posts.create(input, actorId), requestId, 201);
    }

    {
      const commentMatch = matchRoute("/discover/posts/:id/comments", pathname);

      if (method === "POST" && commentMatch.matched) {
        const input = parseOrThrow(CreateCommentInputSchema, body);
        return ok(
          await provider.posts.createComment(commentMatch.params.id, input, actorId),
          requestId,
          201
        );
      }
    }

    {
      const match = matchRoute("/discover/posts/:id/report", pathname);

      if (method === "POST" && match.matched) {
        parseOrThrow(ReportPostInputSchema, body);
        const post = await provider.posts.report(match.params.id);

        if (!post) {
          throw apiError("NOT_FOUND", "Post not found.", 404);
        }

        return ok(post, requestId);
      }
    }

    if (method === "GET" && pathname === "/places") {
      const query = parseOrThrow(
        PlaceListQuerySchema,
        Object.fromEntries(url.searchParams.entries())
      );
      return ok(await provider.places.list(query), requestId);
    }

    if (method === "GET" && pathname === "/places/map-markers") {
      return ok(await provider.places.mapMarkers(), requestId);
    }

    {
      const match = matchRoute("/places/:id", pathname);

      if (method === "GET" && match.matched) {
        const place = await provider.places.detail(match.params.id);

        if (!place) {
          throw apiError("NOT_FOUND", "Place not found.", 404);
        }

        return ok(place, requestId);
      }
    }

    if (method === "GET" && pathname === "/announcements") {
      const query = parseOrThrow(
        AnnouncementListQuerySchema,
        Object.fromEntries(url.searchParams.entries())
      );
      return ok(await provider.announcements.list(query), requestId);
    }

    {
      const match = matchRoute("/announcements/:id", pathname);

      if (method === "GET" && match.matched) {
        const announcement = await provider.announcements.detail(match.params.id);

        if (!announcement) {
          throw apiError("NOT_FOUND", "Announcement not found.", 404);
        }

        return ok(announcement, requestId);
      }
    }

    if (method === "GET" && pathname === "/notifications") {
      return ok(await provider.notifications.list(actorId), requestId);
    }

    {
      const match = matchRoute("/notifications/:id/read", pathname);

      if (method === "POST" && match.matched) {
        const item = await provider.notifications.markRead(
          match.params.id,
          actorId
        );

        if (!item) {
          throw apiError("NOT_FOUND", "Notification not found.", 404);
        }

        return ok(item, requestId);
      }
    }

    if (method === "POST" && pathname === "/files/upload-requests") {
      const input = parseOrThrow(CreateUploadRequestInputSchema, body);
      if (isProtectedGalleryUploadRequest(input)) {
        await requireRole(provider, { eventID: requestId, httpContext }, [
          "community_admin",
          "system_admin"
        ]);
      }
      return ok(await provider.files.createUploadRequest(input), requestId, 201);
    }

    if (method === "POST" && pathname === "/files/complete") {
      const input = parseOrThrow(CompleteUploadInputSchema, body);
      const actor = isProtectedGalleryCompletion(input)
        ? await requireRole(provider, { eventID: requestId, httpContext }, [
            "community_admin",
            "system_admin"
          ])
        : null;
      return ok(
        await provider.files.complete(input, actor?._id ?? actorId),
        requestId,
        201
      );
    }

    if (method === "POST" && pathname === "/files/private-url") {
      const input = parseOrThrow(PrivateUrlRequestInputSchema, body);
      return ok(await provider.files.privateUrl(input, actorId), requestId);
    }

    if (method === "POST" && pathname === "/admin/events") {
      const actor = await requireRole(provider, { eventID: requestId, httpContext }, [
        "community_admin",
        "system_admin"
      ]);
      const input = parseOrThrow(CreateEventInputSchema, body);
      return ok(await provider.events.create(input, actor._id), requestId, 201);
    }

    {
      const match = matchRoute("/admin/events/:id", pathname);

      if (method === "PATCH" && match.matched) {
        await requireRole(provider, { eventID: requestId, httpContext }, [
          "community_admin",
          "system_admin"
        ]);
        const input = parseOrThrow(UpdateEventInputSchema, body);
        const item = await provider.events.update(match.params.id, input);

        if (!item) {
          throw apiError("NOT_FOUND", "Event not found.", 404);
        }

        return ok(item, requestId);
      }
    }

    {
      const match = matchRoute("/admin/events/:id/review", pathname);

      if (method === "POST" && match.matched) {
        await requireRole(provider, { eventID: requestId, httpContext }, [
          "community_admin",
          "system_admin"
        ]);
        const input = parseOrThrow(ReviewEventInputSchema, body);
        const item = await provider.events.review(match.params.id, input);

        if (!item) {
          throw apiError("NOT_FOUND", "Event not found.", 404);
        }

        return ok(item, requestId);
      }
    }

    {
      const match = matchRoute("/admin/events/:id/checkin", pathname);

      if (method === "POST" && match.matched) {
        await requireRole(provider, { eventID: requestId, httpContext }, [
          "community_admin",
          "system_admin"
        ]);
        const input = parseOrThrow(CheckinInputSchema, body);
        const ticket = await provider.events.checkin(
          match.params.id,
          input.ticket_id
        );

        if (!ticket) {
          throw apiError("NOT_FOUND", "Ticket not found.", 404);
        }

        return ok(ticket, requestId);
      }
    }

    {
      const match = matchRoute("/admin/discover/posts/:id/moderation", pathname);

      if (method === "POST" && match.matched) {
        await requireRole(provider, { eventID: requestId, httpContext }, [
          "community_admin",
          "system_admin"
        ]);
        const input = parseOrThrow(ModeratePostInputSchema, body);
        const post = await provider.posts.moderate(match.params.id, input);

        if (!post) {
          throw apiError("NOT_FOUND", "Post not found.", 404);
        }

        return ok(post, requestId);
      }
    }

    if (method === "POST" && pathname === "/admin/places") {
      await requireRole(provider, { eventID: requestId, httpContext }, [
        "community_admin",
        "system_admin"
      ]);
      const input = parseOrThrow(CreatePlaceInputSchema, body);
      return ok(await provider.places.create(input), requestId, 201);
    }

    if (method === "GET" && pathname === "/admin/places") {
      await requireRole(provider, { eventID: requestId, httpContext }, [
        "community_admin",
        "system_admin"
      ]);
      return ok(await provider.places.listAdmin(), requestId);
    }

    {
      const match = matchRoute("/admin/places/:id", pathname);

      if (method === "PATCH" && match.matched) {
        await requireRole(provider, { eventID: requestId, httpContext }, [
          "community_admin",
          "system_admin"
        ]);
        const input = parseOrThrow(UpdatePlaceInputSchema, body);
        const item = await provider.places.update(match.params.id, input);

        if (!item) {
          throw apiError("NOT_FOUND", "Place not found.", 404);
        }

        return ok(item, requestId);
      }
    }

    throw apiError("NOT_FOUND", `No handler for ${method} ${pathname}`, 404);
  } catch (error) {
    if (error instanceof ApiAppError) {
      return fail(error, requestId);
    }

    return fail(
      apiError("INTERNAL_ERROR", "Unexpected server error.", 500),
      requestId
    );
  }
};
