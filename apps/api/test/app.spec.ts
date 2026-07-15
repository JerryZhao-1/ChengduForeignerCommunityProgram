import { createServer } from "node:http";

import Koa from "koa";
import Router from "@koa/router";
import { FILE_PATH_RULES } from "@community-map/shared";
import { vi } from "vitest";

import { createApp } from "../src/app";
import { actorMiddleware, requireRole } from "../src/lib/auth";
import { createAdminPasswordHash } from "../src/lib/admin-auth";
import { errorMiddleware, requestIdMiddleware } from "../src/lib/http";

const createTestBaseUrl = async () => {
  const app = createApp("mock");
  const server = createServer(app.callback());

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to create test server.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      })
  };
};

describe("api routes", () => {
  it("logs unknown server errors without exposing them in the response", async () => {
    const app = new Koa();
    const router = new Router();
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    app.use(errorMiddleware);
    app.use(requestIdMiddleware);
    router.get("/boom", () => {
      throw Object.assign(new Error("private database detail"), {
        code: "DATABASE_FAILURE"
      });
    });
    app.use(router.routes());

    const server = createServer(app.callback());
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to create test server.");
    }

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/boom`, {
        headers: { authorization: "Bearer must-not-be-logged" }
      });
      const body = (await response.json()) as {
        error: { code: string; message: string };
      };

      expect(response.status).toBe(500);
      expect(body.error).toEqual({
        code: "INTERNAL_ERROR",
        message: "Unexpected server error."
      });
      expect(JSON.stringify(body)).not.toContain("private database detail");
      expect(logSpy).toHaveBeenCalledWith(
        "server_error",
        expect.stringContaining('"path":"/boom"')
      );
      const logOutput = logSpy.mock.calls.flat().join(" ");
      expect(logOutput).toContain("private database detail");
      expect(logOutput).toContain("DATABASE_FAILURE");
      expect(logOutput).not.toContain("must-not-be-logged");
    } finally {
      logSpy.mockRestore();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  it("allows anonymous public routes without resolving a live actor", async () => {
    const previousProviderMode = process.env.CLOUDBASE_PROVIDER_MODE;
    const previousAllowMock = process.env.API_ALLOW_MOCK_ACTOR_HEADER;
    const resolveActorCalls: Array<{ userId?: string }> = [];
    const app = new Koa();
    const router = new Router();

    process.env.CLOUDBASE_PROVIDER_MODE = "live";
    delete process.env.API_ALLOW_MOCK_ACTOR_HEADER;

    app.use(errorMiddleware);
    app.use(requestIdMiddleware);
    app.use(async (ctx, next) => {
      ctx.state.provider = {
        auth: {
          async resolveActor(userId?: string) {
            resolveActorCalls.push({ userId });
            if (!userId) {
              throw new Error("Anonymous actor should not be resolved.");
            }
            return {
              _id: userId,
              nickname: "Admin",
              avatar_url: null,
              preferred_language: "zh",
              role_flags: ["user", "community_admin", "system_admin"],
              status: "active"
            };
          }
        }
      };
      await next();
    });
    app.use(actorMiddleware);

    for (const path of ["/health", "/places", "/events", "/discover/posts"]) {
      router.get(path, (ctx) => {
        ctx.body = { ok: true, path };
      });
    }
    router.get(
      "/admin/events",
      requireRole("community_admin", "system_admin"),
      (ctx) => {
        ctx.body = { ok: true };
      }
    );
    app.use(router.routes());

    const server = createServer(app.callback());
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to create test server.");
    }
    const baseUrl = `http://127.0.0.1:${address.port}`;

    try {
      for (const path of [
        "/health",
        "/places",
        "/events",
        "/discover/posts"
      ]) {
        const response = await fetch(`${baseUrl}${path}`);
        expect(response.status).toBe(200);
      }

      expect(resolveActorCalls).toHaveLength(0);

      const protectedResponse = await fetch(`${baseUrl}/admin/events`);
      expect(protectedResponse.status).toBe(401);
      expect(resolveActorCalls).toHaveLength(0);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });

      if (previousProviderMode === undefined) {
        delete process.env.CLOUDBASE_PROVIDER_MODE;
      } else {
        process.env.CLOUDBASE_PROVIDER_MODE = previousProviderMode;
      }
      if (previousAllowMock === undefined) {
        delete process.env.API_ALLOW_MOCK_ACTOR_HEADER;
      } else {
        process.env.API_ALLOW_MOCK_ACTOR_HEADER = previousAllowMock;
      }
    }
  });

  it("sets local CORS headers without duplicating CloudBase-managed CORS", async () => {
    const previousDisableAppCors = process.env.DISABLE_APP_CORS;
    const previousTencentRunEnv = process.env.TENCENTCLOUD_RUNENV;
    const previousScfFunctionName = process.env.SCF_FUNCTIONNAME;

    delete process.env.DISABLE_APP_CORS;
    delete process.env.TENCENTCLOUD_RUNENV;
    delete process.env.SCF_FUNCTIONNAME;

    const localServer = await createTestBaseUrl();

    try {
      const localResponse = await fetch(`${localServer.baseUrl}/health`, {
        headers: {
          Origin:
            "https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com"
        }
      });

      expect(localResponse.headers.get("access-control-allow-origin")).toBe(
        "https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com"
      );
    } finally {
      await localServer.close();
    }

    process.env.TENCENTCLOUD_RUNENV = "SCF";
    const cloudbaseServer = await createTestBaseUrl();

    try {
      const cloudbaseResponse = await fetch(
        `${cloudbaseServer.baseUrl}/health`,
        {
          headers: {
            Origin:
              "https://cloud1-d7gxdk8t43bd639c0-1441004938.tcloudbaseapp.com"
          }
        }
      );

      expect(
        cloudbaseResponse.headers.get("access-control-allow-origin")
      ).toBeNull();

      const vercelOrigin =
        "https://trae-h5-demo-orc4nqh4x-jerryzhaoranjie-5014s-projects.vercel.app";
      const vercelResponse = await fetch(`${cloudbaseServer.baseUrl}/health`, {
        headers: {
          Origin: vercelOrigin
        }
      });

      expect(vercelResponse.headers.get("access-control-allow-origin")).toBe(
        vercelOrigin
      );
      expect(vercelResponse.headers.get("vary")).toContain("Origin");

      const vercelPreflight = await fetch(
        `${cloudbaseServer.baseUrl}/community-plan/generate`,
        {
          method: "OPTIONS",
          headers: {
            Origin: "https://trae-h5-demo.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-guest-mode"
          }
        }
      );

      expect(vercelPreflight.status).toBe(204);
      expect(
        vercelPreflight.headers.get("access-control-allow-origin")
      ).toBe("https://trae-h5-demo.vercel.app");
      expect(
        vercelPreflight.headers.get("access-control-allow-methods")
      ).toContain("POST");
      expect(
        vercelPreflight.headers.get("access-control-allow-headers")
      ).toContain("x-guest-mode");

      const insecureVercelResponse = await fetch(
        `${cloudbaseServer.baseUrl}/health`,
        {
          headers: {
            Origin: "http://trae-h5-demo.vercel.app"
          }
        }
      );

      expect(
        insecureVercelResponse.headers.get("access-control-allow-origin")
      ).toBeNull();

      const unrelatedVercelResponse = await fetch(
        `${cloudbaseServer.baseUrl}/health`,
        {
          headers: {
            Origin: "https://unrelated-project.vercel.app"
          }
        }
      );

      expect(
        unrelatedVercelResponse.headers.get("access-control-allow-origin")
      ).toBeNull();
    } finally {
      await cloudbaseServer.close();

      if (previousDisableAppCors === undefined) {
        delete process.env.DISABLE_APP_CORS;
      } else {
        process.env.DISABLE_APP_CORS = previousDisableAppCors;
      }

      if (previousTencentRunEnv === undefined) {
        delete process.env.TENCENTCLOUD_RUNENV;
      } else {
        process.env.TENCENTCLOUD_RUNENV = previousTencentRunEnv;
      }

      if (previousScfFunctionName === undefined) {
        delete process.env.SCF_FUNCTIONNAME;
      } else {
        process.env.SCF_FUNCTIONNAME = previousScfFunctionName;
      }
    }
  });

  it("supports self-managed admin login and bearer-protected admin routes", async () => {
    const previousUsername = process.env.API_ADMIN_USERNAME;
    const previousPassword = process.env.API_ADMIN_PASSWORD_SCRYPT;
    const previousSecret = process.env.API_ADMIN_SESSION_SECRET;
    const previousUserId = process.env.API_ADMIN_USER_ID;

    process.env.API_ADMIN_USERNAME = "admin";
    process.env.API_ADMIN_PASSWORD_SCRYPT =
      await createAdminPasswordHash("correct horse battery staple");
    process.env.API_ADMIN_SESSION_SECRET = "test-admin-session-secret";
    process.env.API_ADMIN_USER_ID = "user_001";

    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const noTokenResponse = await fetch(`${baseUrl}/admin/events`);
      expect(noTokenResponse.status).toBe(401);

      const loginResponse = await fetch(`${baseUrl}/auth/admin/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: "correct horse battery staple"
        })
      });
      const loginData = await loginResponse.json();

      expect(loginResponse.status).toBe(200);
      expect(loginData.data.token).toEqual(expect.any(String));

      const adminResponse = await fetch(`${baseUrl}/admin/events`, {
        headers: {
          authorization: `Bearer ${loginData.data.token}`
        }
      });
      expect(adminResponse.status).toBe(200);

      const badTokenResponse = await fetch(`${baseUrl}/admin/events`, {
        headers: {
          authorization: "Bearer invalid.token.value"
        }
      });
      expect(badTokenResponse.status).toBe(401);
    } finally {
      await close();

      if (previousUsername === undefined) {
        delete process.env.API_ADMIN_USERNAME;
      } else {
        process.env.API_ADMIN_USERNAME = previousUsername;
      }
      if (previousPassword === undefined) {
        delete process.env.API_ADMIN_PASSWORD_SCRYPT;
      } else {
        process.env.API_ADMIN_PASSWORD_SCRYPT = previousPassword;
      }
      if (previousSecret === undefined) {
        delete process.env.API_ADMIN_SESSION_SECRET;
      } else {
        process.env.API_ADMIN_SESSION_SECRET = previousSecret;
      }
      if (previousUserId === undefined) {
        delete process.env.API_ADMIN_USER_ID;
      } else {
        process.env.API_ADMIN_USER_ID = previousUserId;
      }
    }
  });

  it("returns current actor liked and favorited posts", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const likeResponse = await fetch(`${baseUrl}/discover/posts/post_001/like`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_002"
        },
        body: JSON.stringify({ liked: true })
      });
      expect(likeResponse.status).toBe(200);

      const favoriteResponse = await fetch(
        `${baseUrl}/discover/posts/post_001/favorite`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_002"
          },
          body: JSON.stringify({ favorited: true })
        }
      );
      expect(favoriteResponse.status).toBe(200);

      const likedPostsResponse = await fetch(
        `${baseUrl}/discover/me/liked-posts`,
        {
          headers: { "x-mock-user-id": "user_002" }
        }
      );
      const likedPostsData = await likedPostsResponse.json();
      const favoritedPostsResponse = await fetch(
        `${baseUrl}/discover/me/favorited-posts`,
        {
          headers: { "x-mock-user-id": "user_002" }
        }
      );
      const favoritedPostsData = await favoritedPostsResponse.json();
      const governanceResponse = await fetch(
        `${baseUrl}/discover/me/governance`,
        {
          headers: { "x-mock-user-id": "user_002" }
        }
      );
      const governanceData = await governanceResponse.json();

      expect(likedPostsResponse.status).toBe(200);
      expect(favoritedPostsResponse.status).toBe(200);
      expect(likedPostsData.data.items.map((post: { _id: string }) => post._id))
        .toContain("post_001");
      expect(
        favoritedPostsData.data.items.map((post: { _id: string }) => post._id)
      ).toContain("post_001");
      expect(governanceData.data.liked_post_count).toBeGreaterThanOrEqual(1);
      expect(governanceData.data.favorited_post_count).toBeGreaterThanOrEqual(1);
    } finally {
      await close();
    }
  });

  it("serves events list, detail, registration, posts, places, announcements, and validation errors", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const eventsResponse = await fetch(`${baseUrl}/events`);
      const eventsData = await eventsResponse.json();
      expect(eventsResponse.status).toBe(200);
      expect(eventsData.data.items.length).toBeGreaterThan(0);

      const eventId = eventsData.data.items[0]._id;
      const detailResponse = await fetch(`${baseUrl}/events/${eventId}`);
      expect(detailResponse.status).toBe(200);

      const registerResponse = await fetch(
        `${baseUrl}/events/${eventId}/registrations`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_002"
          },
          body: JSON.stringify({
            contact_name: "Jerry",
            contact_phone: "13800000000",
            attendee_count: 1,
            source_channel: "miniapp"
          })
        }
      );
      const registerData = await registerResponse.json();
      expect(registerResponse.status).toBe(201);
      expect(registerData.data.ticket.ticket_code).toContain("TZL");

      const invalidRegistration = await fetch(
        `${baseUrl}/events/${eventId}/registrations`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_002"
          },
          body: JSON.stringify({
            contact_name: "",
            contact_phone: "1",
            attendee_count: 0
          })
        }
      );
      expect(invalidRegistration.status).toBe(400);

      const postsResponse = await fetch(`${baseUrl}/discover/posts`);
      expect(postsResponse.status).toBe(200);

      const createPostResponse = await fetch(`${baseUrl}/discover/posts`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_002"
        },
        body: JSON.stringify({
          title: "Need a local dentist recommendation",
          content: "Prefer around Tongzilin station.",
          language: "en",
          tag_ids: ["help"],
          location_text: "Tongzilin",
          image_file_ids: [],
          image_urls: []
        })
      });
      expect(createPostResponse.status).toBe(200);

      const placesResponse = await fetch(`${baseUrl}/places`);
      const placesData = await placesResponse.json();
      expect(placesResponse.status).toBe(200);
      expect(placesData.data.items.length).toBeGreaterThan(0);
      expect(placesData.data.items[0]).toHaveProperty("short_address_zh");
      expect(placesData.data.items[0]).not.toHaveProperty("gallery_urls");
      expect(placesData.data.items[0]).not.toHaveProperty("gallery_media");
      expect(placesData.data.items[0]).not.toHaveProperty("navigation");
      expect(placesData.data.items[0]).not.toHaveProperty("address_zh");

      const placeDetailResponse = await fetch(
        `${baseUrl}/places/${placesData.data.items[0]._id}`
      );
      const placeDetailData = await placeDetailResponse.json();
      expect(placeDetailResponse.status).toBe(200);
      expect(placeDetailData.data).toHaveProperty("navigation");
      expect(placeDetailData.data).toHaveProperty("share");
      expect(placeDetailData.data.gallery_media.length).toBeGreaterThan(0);
      expect(placeDetailData.data.gallery_media[0].url).toContain(
        "images.unsplash.com"
      );
      expect(placeDetailData.data.gallery_urls).toEqual(
        placeDetailData.data.gallery_media.map(
          (media: { url: string }) => media.url
        )
      );

      const markersBeforeResponse = await fetch(
        `${baseUrl}/places/map-markers`
      );
      const markersBeforeData = await markersBeforeResponse.json();
      expect(markersBeforeResponse.status).toBe(200);
      expect(markersBeforeData.data.length).toBeGreaterThan(0);
      expect(markersBeforeData.data[0]).toHaveProperty("category_level_1");
      expect(markersBeforeData.data[0]).toHaveProperty("cover_url");
      expect(markersBeforeData.data[0]).toHaveProperty("is_recommended");
      expect(markersBeforeData.data[0]).not.toHaveProperty("address_zh");
      expect(markersBeforeData.data[0]).not.toHaveProperty("cover_source");
      expect(markersBeforeData.data[0]).not.toHaveProperty(
        "external_gallery_media"
      );
      expect(markersBeforeData.data[0]).not.toHaveProperty("gallery_media");

      const recommendedResponse = await fetch(
        `${baseUrl}/places?recommended=true`
      );
      const recommendedData = await recommendedResponse.json();
      expect(recommendedResponse.status).toBe(200);
      expect(
        recommendedData.data.items.every(
          (item: { is_recommended: boolean }) => item.is_recommended
        )
      ).toBe(true);

      const taggedResponse = await fetch(`${baseUrl}/places?tag=service`);
      const taggedData = await taggedResponse.json();
      expect(taggedResponse.status).toBe(200);
      expect(
        taggedData.data.items.every((item: { tag_ids: string[] }) =>
          item.tag_ids.includes("service")
        )
      ).toBe(true);
      expect(taggedData.data.items[0]).not.toHaveProperty("gallery_media");

      const createDraftPlaceResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "地图草稿地点",
          name_en: "Draft Map Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "public-service",
          category_level_2: "community",
          tag_ids: ["service"],
          address_zh: "成都",
          address_en: "Chengdu",
          location: { latitude: 30.616, longitude: 104.063 },
          business_hours_zh: "周一至周日",
          business_hours_en: "Mon-Sun",
          intro_zh: "草稿",
          intro_en: "Draft",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: null,
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "draft"
        })
      });
      const draftPlaceData = await createDraftPlaceResponse.json();
      expect(createDraftPlaceResponse.status).toBe(201);

      const publicDraftListResponse = await fetch(
        `${baseUrl}/places?keyword=Draft%20Map%20Place`
      );
      const publicDraftListData = await publicDraftListResponse.json();
      expect(publicDraftListResponse.status).toBe(200);
      expect(publicDraftListData.data.items).toEqual([]);
      expect(publicDraftListData.data.total).toBe(0);

      const markersAfterResponse = await fetch(`${baseUrl}/places/map-markers`);
      const markersAfterData = await markersAfterResponse.json();
      expect(markersAfterResponse.status).toBe(200);
      expect(
        markersAfterData.data.some(
          (item: { _id: string }) => item._id === draftPlaceData.data._id
        )
      ).toBe(false);

      const draftDetailResponse = await fetch(
        `${baseUrl}/places/${draftPlaceData.data._id}`
      );
      expect(draftDetailResponse.status).toBe(404);

      const adminPlacesResponse = await fetch(`${baseUrl}/admin/places`, {
        headers: {
          "x-mock-user-id": "user_001"
        }
      });
      const adminPlacesData = await adminPlacesResponse.json();
      expect(adminPlacesResponse.status).toBe(200);
      expect(
        adminPlacesData.data.items.some(
          (item: { _id: string }) => item._id === draftPlaceData.data._id
        )
      ).toBe(true);

      const announcementsResponse = await fetch(`${baseUrl}/announcements`);
      expect(announcementsResponse.status).toBe(200);
    } finally {
      await close();
    }
  });

  it("serves admin event list and registration inspection with envelopes", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const adminEventsResponse = await fetch(`${baseUrl}/admin/events`, {
        headers: {
          "x-mock-user-id": "user_001"
        }
      });
      const adminEventsData = await adminEventsResponse.json();
      expect(adminEventsResponse.status).toBe(200);
      expect(adminEventsData.success).toBe(true);
      expect(
        adminEventsData.data.items.map((event: { _id: string }) => event._id)
      ).toEqual(
        expect.arrayContaining([
          "event_001",
          "event_draft",
          "event_pending",
          "event_offline",
          "event_ended"
        ])
      );
      expect(adminEventsData.data.items[0]).toHaveProperty(
        "active_registration_count"
      );
      expect(adminEventsData.data.items[0]).toHaveProperty(
        "confirmed_attendee_count"
      );
      expect(adminEventsData.data.items[0]).toHaveProperty(
        "remaining_capacity"
      );
      expect(adminEventsData.data.items[0]).toHaveProperty("is_full");

      const publicEventsResponse = await fetch(`${baseUrl}/events`);
      const publicEventsData = await publicEventsResponse.json();
      expect(
        publicEventsData.data.items.map((event: { _id: string }) => event._id)
      ).not.toEqual(
        expect.arrayContaining(["event_draft", "event_offline", "event_ended"])
      );

      const registrationsResponse = await fetch(
        `${baseUrl}/admin/events/event_001/registrations`,
        {
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const registrationsData = await registrationsResponse.json();
      expect(registrationsResponse.status).toBe(200);
      expect(registrationsData.success).toBe(true);
      expect(registrationsData.data[0]).toMatchObject({
        _id: "reg_001",
        ticket_id: "ticket_001",
        ticket_code: "TZL-20260402-001",
        ticket_status: "valid",
        ticket_used_at: null
      });

      const missingResponse = await fetch(
        `${baseUrl}/admin/events/event_missing/registrations`,
        {
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const missingData = await missingResponse.json();
      expect(missingResponse.status).toBe(404);
      expect(missingData.error.code).toBe("NOT_FOUND");

      const missingDeleteResponse = await fetch(
        `${baseUrl}/admin/events/event_missing_delete`,
        {
          method: "DELETE",
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const missingDeleteData = await missingDeleteResponse.json();
      expect(missingDeleteResponse.status).toBe(404);
      expect(missingDeleteData.error.code).toBe("NOT_FOUND");

      const deleteResponse = await fetch(`${baseUrl}/admin/events/event_001`, {
        method: "DELETE",
        headers: {
          "x-mock-user-id": "user_001"
        }
      });
      const deleteData = await deleteResponse.json();
      expect(deleteResponse.status).toBe(200);
      expect(deleteData.data).toEqual({ deleted_id: "event_001" });

      const adminAfterDeleteResponse = await fetch(`${baseUrl}/admin/events`, {
        headers: {
          "x-mock-user-id": "user_001"
        }
      });
      const adminAfterDeleteData = await adminAfterDeleteResponse.json();
      expect(
        adminAfterDeleteData.data.items.map(
          (event: { _id: string }) => event._id
        )
      ).not.toContain("event_001");

      const publicAfterDeleteResponse = await fetch(`${baseUrl}/events`);
      const publicAfterDeleteData = await publicAfterDeleteResponse.json();
      expect(
        publicAfterDeleteData.data.items.map(
          (event: { _id: string }) => event._id
        )
      ).not.toContain("event_001");
    } finally {
      await close();
    }
  });

  it("supports direct admin event cover uploads without mutating until save", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const pendingForm = new FormData();
      pendingForm.set(
        "file",
        new Blob(["pending-event-cover"], { type: "image/jpeg" }),
        "pending-cover.jpg"
      );

      const pendingUploadResponse = await fetch(
        `${baseUrl}/admin/events/cover-file`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: pendingForm
        }
      );
      const pendingUploadBody = await pendingUploadResponse.json();

      expect(pendingUploadResponse.status).toBe(201);
      expect(pendingUploadBody.data.file_asset).toMatchObject({
        visibility: "public",
        biz_type: "event_cover",
        biz_id: "__pending_event_cover__",
        uploaded_by: "user_001",
        status: "active"
      });
      expect(pendingUploadBody.data.cover_cloud_path).toContain(
        "public/events/_pending/"
      );

      const createResponse = await fetch(`${baseUrl}/admin/events`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          title_zh: "封面上传活动",
          title_en: "Cover Upload Event",
          summary_zh: "简介",
          summary_en: "Summary",
          content_zh: "正文",
          content_en: "Body",
          address_text: "Tongzilin",
          address_zh: "桐梓林",
          address_en: "Tongzilin",
          location: { latitude: 30.615, longitude: 104.062 },
          start_time: "2027-08-02T10:00:00+08:00",
          end_time: "2027-08-02T12:00:00+08:00",
          signup_deadline: "2027-08-01T18:00:00+08:00",
          capacity: 20,
          cover_file_id: pendingUploadBody.data.cover_file_id,
          cover_cloud_path: pendingUploadBody.data.cover_cloud_path,
          cover_url: pendingUploadBody.data.cover_url
        })
      });
      const createBody = await createResponse.json();
      const eventId = createBody.data._id;

      expect(createResponse.status).toBe(201);
      expect(createBody.data.cover_file_id).toBe(
        pendingUploadBody.data.cover_file_id
      );

      const existingForm = new FormData();
      existingForm.set(
        "file",
        new Blob(["existing-event-cover"], { type: "image/png" }),
        "existing-cover.png"
      );
      const existingUploadResponse = await fetch(
        `${baseUrl}/admin/events/${eventId}/cover-file`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: existingForm
        }
      );
      const existingUploadBody = await existingUploadResponse.json();

      expect(existingUploadResponse.status).toBe(201);
      expect(existingUploadBody.data.file_asset).toMatchObject({
        visibility: "public",
        biz_type: "event_cover",
        biz_id: eventId,
        uploaded_by: "user_001",
        status: "active"
      });

      const adminBeforeSaveResponse = await fetch(`${baseUrl}/admin/events`, {
        headers: {
          "x-mock-user-id": "user_001"
        }
      });
      const adminBeforeSaveBody = await adminBeforeSaveResponse.json();
      const eventBeforeSave = adminBeforeSaveBody.data.items.find(
        (item: { _id: string }) => item._id === eventId
      );

      expect(eventBeforeSave.cover_file_id).toBe(
        pendingUploadBody.data.cover_file_id
      );

      const updateResponse = await fetch(`${baseUrl}/admin/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          cover_file_id: existingUploadBody.data.cover_file_id,
          cover_cloud_path: existingUploadBody.data.cover_cloud_path,
          cover_url: existingUploadBody.data.cover_url
        })
      });
      const updateBody = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateBody.data.cover_file_id).toBe(
        existingUploadBody.data.cover_file_id
      );

      await fetch(`${baseUrl}/admin/events/${eventId}/review`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          review_status: "approved",
          publish_status: "published"
        })
      });

      const publicDetailResponse = await fetch(`${baseUrl}/events/${eventId}`);
      const publicDetailBody = await publicDetailResponse.json();

      expect(publicDetailResponse.status).toBe(200);
      expect(publicDetailBody.data.cover_url).toBe(
        existingUploadBody.data.cover_url
      );

      const forbiddenForm = new FormData();
      forbiddenForm.set(
        "file",
        new Blob(["forbidden-cover"], { type: "image/jpeg" }),
        "forbidden.jpg"
      );
      const forbiddenResponse = await fetch(
        `${baseUrl}/admin/events/${eventId}/cover-file`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_002"
          },
          body: forbiddenForm
        }
      );
      const forbiddenBody = await forbiddenResponse.json();

      expect(forbiddenResponse.status).toBe(403);
      expect(forbiddenBody.error.code).toBe("FORBIDDEN");

      const missingEventForm = new FormData();
      missingEventForm.set(
        "file",
        new Blob(["missing-cover"], { type: "image/jpeg" }),
        "missing.jpg"
      );
      const missingEventResponse = await fetch(
        `${baseUrl}/admin/events/event_missing_cover/cover-file`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: missingEventForm
        }
      );
      const missingEventBody = await missingEventResponse.json();

      expect(missingEventResponse.status).toBe(404);
      expect(missingEventBody.error.code).toBe("NOT_FOUND");

      const invalidTypeForm = new FormData();
      invalidTypeForm.set(
        "file",
        new Blob(["not an image"], { type: "text/plain" }),
        "note.txt"
      );
      const invalidTypeResponse = await fetch(
        `${baseUrl}/admin/events/cover-file`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: invalidTypeForm
        }
      );
      const invalidTypeBody = await invalidTypeResponse.json();

      expect(invalidTypeResponse.status).toBe(400);
      expect(invalidTypeBody.error.code).toBe("VALIDATION_ERROR");

      const missingFileResponse = await fetch(
        `${baseUrl}/admin/events/cover-file`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: new FormData()
        }
      );
      const missingFileBody = await missingFileResponse.json();

      expect(missingFileResponse.status).toBe(400);
      expect(missingFileBody.error.code).toBe("VALIDATION_ERROR");
    } finally {
      await close();
    }
  });

  it("keeps URL-only covers on drafts but rejects publishing them", async () => {
    const { baseUrl, close } = await createTestBaseUrl();
    const externalCoverUrl =
      "https://store.is.autonavi.com/showpic/event-external-cover.jpg";

    try {
      const createResponse = await fetch(`${baseUrl}/admin/events`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          title_zh: "外链封面活动",
          title_en: "External Cover Event",
          summary_zh: "简介",
          summary_en: "Summary",
          content_zh: "正文",
          content_en: "Body",
          address_text: "成都市武侯区桐梓林国际社区",
          address_zh: "成都市武侯区桐梓林国际社区",
          address_en: "Tongzilin International Community, Wuhou, Chengdu",
          location: { latitude: 30.618887, longitude: 104.065468 },
          start_time: "2027-04-10T10:00:00+08:00",
          end_time: "2027-04-10T12:00:00+08:00",
          signup_deadline: "2027-04-09T18:00:00+08:00",
          capacity: 30,
          cover_file_id: null,
          cover_cloud_path: null,
          cover_url: externalCoverUrl
        })
      });
      const createBody = await createResponse.json();
      const eventId = createBody.data._id;

      expect(createResponse.status).toBe(201);
      expect(createBody.data.cover_file_id).toBeNull();
      expect(createBody.data.cover_cloud_path).toBeNull();
      expect(createBody.data.cover_url).toBe(externalCoverUrl);

      const reviewResponse = await fetch(
        `${baseUrl}/admin/events/${eventId}/review`,
        {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          review_status: "approved",
          publish_status: "published"
        })
        }
      );
      const reviewBody = await reviewResponse.json();

      expect(reviewResponse.status).toBe(400);
      expect(reviewBody.error).toMatchObject({ code: "VALIDATION_ERROR" });
      expect(reviewBody.error.details.fields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: "cover_file_id" })
        ])
      );

      const publicDetailResponse = await fetch(`${baseUrl}/events/${eventId}`);
      const publicDetailBody = await publicDetailResponse.json();

      expect(publicDetailResponse.status).toBe(404);
      expect(publicDetailBody.error.code).toBe("NOT_FOUND");
    } finally {
      await close();
    }
  });

  it("serves health and places routes with the CloudBase /api prefix", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      const healthData = await healthResponse.json();
      expect(healthResponse.status).toBe(200);
      expect(healthData).toEqual({ ok: true });

      const placesResponse = await fetch(
        `${baseUrl}/api/places?page=1&pageSize=1`
      );
      const placesData = await placesResponse.json();
      expect(placesResponse.status).toBe(200);
      expect(placesData.success).toBe(true);
      expect(placesData.data.items).toHaveLength(1);

      const markersResponse = await fetch(`${baseUrl}/api/places/map-markers`);
      const markersData = await markersResponse.json();
      expect(markersResponse.status).toBe(200);
      expect(markersData.success).toBe(true);
      expect(markersData.data.length).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });

  it("blocks admin routes for non-admin actors", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const response = await fetch(`${baseUrl}/admin/events`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_002"
        },
        body: JSON.stringify({
          title_zh: "无权限活动",
          title_en: "Forbidden Event",
          summary_zh: "简介",
          summary_en: "Summary",
          content_zh: "正文",
          content_en: "Body",
          address_text: "Address",
          location: { latitude: 30.6, longitude: 104.0 },
          start_time: "2026-03-28T10:00:00+08:00",
          end_time: "2026-03-28T12:00:00+08:00",
          signup_deadline: "2026-03-27T18:00:00+08:00",
          capacity: 20
        })
      });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error.code).toBe("FORBIDDEN");

      const adminListResponse = await fetch(`${baseUrl}/admin/events`, {
        headers: {
          "x-mock-user-id": "user_002"
        }
      });
      const adminListBody = await adminListResponse.json();

      expect(adminListResponse.status).toBe(403);
      expect(adminListBody.error.code).toBe("FORBIDDEN");

      const deleteEventResponse = await fetch(
        `${baseUrl}/admin/events/event_001`,
        {
          method: "DELETE",
          headers: {
            "x-mock-user-id": "user_002"
          }
        }
      );
      const deleteEventBody = await deleteEventResponse.json();

      expect(deleteEventResponse.status).toBe(403);
      expect(deleteEventBody.error.code).toBe("FORBIDDEN");

      const placeGalleryResponse = await fetch(
        `${baseUrl}/admin/places/place_001`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_002"
          },
          body: JSON.stringify({
            gallery_file_ids: ["cloud://forbidden-place-gallery"]
          })
        }
      );
      const placeGalleryBody = await placeGalleryResponse.json();

      expect(placeGalleryResponse.status).toBe(403);
      expect(placeGalleryBody.error.code).toBe("FORBIDDEN");

      const createPlaceResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "无权限图集测试地点",
          name_en: "Forbidden Gallery Test Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: [],
          address_zh: "成都",
          address_en: "Chengdu",
          location: { latitude: 30.616, longitude: 104.064 },
          business_hours_zh: "周一至周日",
          business_hours_en: "Every day",
          intro_zh: "图集权限测试",
          intro_en: "Gallery permission test",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: null,
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "published"
        })
      });
      const createPlaceBody = await createPlaceResponse.json();
      expect(createPlaceResponse.status).toBe(201);

      const forbiddenCloudPath = `${FILE_PATH_RULES.placeGallery}${createPlaceBody.data._id}/forbidden.jpg`;
      const forbiddenFileId = `cloud://${forbiddenCloudPath}`;
      const forbiddenUploadRequest = await fetch(
        `${baseUrl}/files/upload-requests`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_002"
          },
          body: JSON.stringify({
            biz_type: "place_gallery",
            biz_id: createPlaceBody.data._id,
            file_name: "forbidden.jpg",
            visibility: "public",
            target_prefix: FILE_PATH_RULES.placeGallery
          })
        }
      );
      const forbiddenUploadBody = await forbiddenUploadRequest.json();

      expect(forbiddenUploadRequest.status).toBe(403);
      expect(forbiddenUploadBody.error.code).toBe("FORBIDDEN");

      const forbiddenCompleteResponse = await fetch(
        `${baseUrl}/files/complete`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_002"
          },
          body: JSON.stringify({
            biz_type: "place_gallery",
            biz_id: createPlaceBody.data._id,
            file_id: forbiddenFileId,
            cloud_path: forbiddenCloudPath,
            visibility: "public"
          })
        }
      );
      const forbiddenCompleteBody = await forbiddenCompleteResponse.json();

      expect(forbiddenCompleteResponse.status).toBe(403);
      expect(forbiddenCompleteBody.error.code).toBe("FORBIDDEN");

      const attachForbiddenFileResponse = await fetch(
        `${baseUrl}/admin/places/${createPlaceBody.data._id}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            gallery_file_ids: [forbiddenFileId],
            gallery_urls: []
          })
        }
      );
      expect(attachForbiddenFileResponse.status).toBe(200);

      const detailResponse = await fetch(
        `${baseUrl}/places/${createPlaceBody.data._id}`
      );
      const detailBody = await detailResponse.json();

      expect(detailResponse.status).toBe(200);
      expect(detailBody.data.gallery_media).toEqual([]);
      expect(detailBody.data.gallery_urls).toEqual([]);
    } finally {
      await close();
    }
  });

  it("supports direct admin place gallery upload and validation errors", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const createPlaceResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "直接上传地点",
          name_en: "Direct Upload Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: [],
          address_zh: "成都",
          address_en: "Chengdu",
          location: { latitude: 30.616, longitude: 104.064 },
          business_hours_zh: "周一至周日",
          business_hours_en: "Every day",
          intro_zh: "直接上传测试",
          intro_en: "Direct upload test",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: null,
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "published"
        })
      });
      const createPlaceBody = await createPlaceResponse.json();
      const placeId = createPlaceBody.data._id;
      const uploadForm = new FormData();
      uploadForm.set(
        "file",
        new Blob(["fake-jpeg-bytes"], { type: "image/jpeg" }),
        "entrance.jpg"
      );

      const uploadResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}/gallery-files`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: uploadForm
        }
      );
      const uploadBody = await uploadResponse.json();

      expect(uploadResponse.status).toBe(201);
      expect(uploadBody.data.file_asset).toMatchObject({
        visibility: "public",
        biz_type: "place_gallery",
        biz_id: placeId,
        uploaded_by: "user_001",
        status: "active"
      });
      expect(uploadBody.data.file_asset.cloud_path).toContain(
        `public/places/${placeId}/`
      );
      expect(uploadBody.data.gallery_file_ids).toEqual([
        uploadBody.data.file_asset.file_id
      ]);

      const detailResponse = await fetch(`${baseUrl}/places/${placeId}`);
      const detailBody = await detailResponse.json();

      expect(detailResponse.status).toBe(200);
      expect(detailBody.data.gallery_media).toHaveLength(1);
      expect(detailBody.data.gallery_media[0].file_id).toBe(
        uploadBody.data.file_asset.file_id
      );
      expect(detailBody.data.gallery_urls).toEqual([
        detailBody.data.gallery_media[0].url
      ]);

      const forbiddenForm = new FormData();
      forbiddenForm.set(
        "file",
        new Blob(["fake-jpeg-bytes"], { type: "image/jpeg" }),
        "forbidden.jpg"
      );
      const forbiddenResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}/gallery-files`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_002"
          },
          body: forbiddenForm
        }
      );
      const forbiddenBody = await forbiddenResponse.json();

      expect(forbiddenResponse.status).toBe(403);
      expect(forbiddenBody.error.code).toBe("FORBIDDEN");

      const missingPlaceForm = new FormData();
      missingPlaceForm.set(
        "file",
        new Blob(["fake-jpeg-bytes"], { type: "image/jpeg" }),
        "missing.jpg"
      );
      const missingPlaceResponse = await fetch(
        `${baseUrl}/admin/places/place_missing_upload/gallery-files`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: missingPlaceForm
        }
      );
      const missingPlaceBody = await missingPlaceResponse.json();

      expect(missingPlaceResponse.status).toBe(404);
      expect(missingPlaceBody.error.code).toBe("NOT_FOUND");

      const invalidTypeForm = new FormData();
      invalidTypeForm.set(
        "file",
        new Blob(["not an image"], { type: "text/plain" }),
        "note.txt"
      );
      const invalidTypeResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}/gallery-files`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: invalidTypeForm
        }
      );
      const invalidTypeBody = await invalidTypeResponse.json();

      expect(invalidTypeResponse.status).toBe(400);
      expect(invalidTypeBody.error.code).toBe("VALIDATION_ERROR");

      const missingFileResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}/gallery-files`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: new FormData()
        }
      );
      const missingFileBody = await missingFileResponse.json();

      expect(missingFileResponse.status).toBe(400);
      expect(missingFileBody.error.code).toBe("VALIDATION_ERROR");

      const detailAfterInvalidResponse = await fetch(
        `${baseUrl}/places/${placeId}`
      );
      const detailAfterInvalidBody = await detailAfterInvalidResponse.json();

      expect(detailAfterInvalidBody.data.gallery_media).toHaveLength(1);
    } finally {
      await close();
    }
  });

  it("binds pending gallery uploads when creating a place", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const pendingForm = new FormData();
      pendingForm.set(
        "file",
        new Blob(["pending-jpeg-bytes"], { type: "image/jpeg" }),
        "pending-entrance.jpg"
      );

      const pendingUploadResponse = await fetch(
        `${baseUrl}/admin/places/gallery-files`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_001"
          },
          body: pendingForm
        }
      );
      const pendingUploadBody = await pendingUploadResponse.json();

      expect(pendingUploadResponse.status).toBe(201);
      expect(pendingUploadBody.data.file_asset).toMatchObject({
        visibility: "public",
        biz_type: "place_gallery",
        biz_id: "__pending_place_gallery__",
        uploaded_by: "user_001",
        status: "active"
      });
      expect(pendingUploadBody.data.gallery_file_ids).toEqual([
        pendingUploadBody.data.file_asset.file_id
      ]);

      const createResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "创建前上传地点",
          name_en: "Precreate Upload Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: [],
          address_zh: "成都",
          address_en: "Chengdu",
          location: { latitude: 30.616, longitude: 104.064 },
          business_hours_zh: "周一至周日",
          business_hours_en: "Every day",
          intro_zh: "创建前上传测试",
          intro_en: "Precreate upload test",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [pendingUploadBody.data.file_asset.file_id],
          gallery_urls: [],
          tencent_map_poi_id: null,
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "published"
        })
      });
      const createBody = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createBody.data.gallery_file_ids).toEqual([
        pendingUploadBody.data.file_asset.file_id
      ]);

      const detailResponse = await fetch(
        `${baseUrl}/places/${createBody.data._id}`
      );
      const detailBody = await detailResponse.json();

      expect(detailResponse.status).toBe(200);
      expect(detailBody.data.gallery_media).toHaveLength(1);
      expect(detailBody.data.gallery_media[0].file_id).toBe(
        pendingUploadBody.data.file_asset.file_id
      );
      expect(detailBody.data.gallery_urls).toEqual([
        detailBody.data.gallery_media[0].url
      ]);
    } finally {
      await close();
    }
  });

  it("supports admin places metadata create, update, and publish visibility", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const createResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "共享分类地点",
          name_en: "Shared Taxonomy Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: ["community"],
          address_zh: "成都高新区",
          address_en: "Chengdu High-tech Zone",
          location: { latitude: 30.617, longitude: 104.0635 },
          business_hours_zh: "周一至周五",
          business_hours_en: "Mon-Fri",
          intro_zh: "初始草稿",
          intro_en: "Initial draft",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: "poi_admin_001",
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "draft"
        })
      });
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData.data.category_level_1).toBe("community");
      expect(createData.data.tencent_map_poi_id).toBe("poi_admin_001");
      expect(createData.data.status).toBe("draft");

      const updateResponse = await fetch(
        `${baseUrl}/admin/places/${createData.data._id}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            category_level_1: "health-wellness",
            category_level_2: "clinic",
            location: { latitude: 30.6182, longitude: 104.0651 },
            tencent_map_poi_id: "poi_admin_002",
            is_recommended: true,
            recommended_reason_zh: "后台推荐理由",
            recommended_reason_en: "Admin recommendation reason",
            recommended_rank: 3,
            status: "published"
          })
        }
      );
      const updateData = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateData.data.category_level_1).toBe("health-wellness");
      expect(updateData.data.category_level_2).toBe("clinic");
      expect(updateData.data.location).toEqual({
        latitude: 30.6182,
        longitude: 104.0651
      });
      expect(updateData.data.tencent_map_poi_id).toBe("poi_admin_002");
      expect(updateData.data.is_recommended).toBe(true);
      expect(updateData.data.recommended_reason_en).toBe(
        "Admin recommendation reason"
      );
      expect(updateData.data.recommended_rank).toBe(3);
      expect(updateData.data.status).toBe("published");

      const adminListResponse = await fetch(`${baseUrl}/admin/places`, {
        headers: {
          "x-mock-user-id": "user_001"
        }
      });
      const adminListData = await adminListResponse.json();

      expect(adminListResponse.status).toBe(200);
      expect(
        adminListData.data.items.some(
          (item: { _id: string; category_level_1: string; status: string }) =>
            item._id === createData.data._id &&
            item.category_level_1 === "health-wellness" &&
            item.status === "published"
        )
      ).toBe(true);

      const detailResponse = await fetch(
        `${baseUrl}/places/${createData.data._id}`
      );
      const detailData = await detailResponse.json();

      expect(detailResponse.status).toBe(200);
      expect(detailData.data.category_level_1).toBe("health-wellness");
      expect(detailData.data.recommended_reason_zh).toBe("后台推荐理由");

      const markerResponse = await fetch(`${baseUrl}/places/map-markers`);
      const markerData = await markerResponse.json();

      expect(markerResponse.status).toBe(200);
      expect(
        markerData.data.some(
          (item: { _id: string; category_level_1: string }) =>
            item._id === createData.data._id &&
            item.category_level_1 === "health-wellness"
        )
      ).toBe(true);
    } finally {
      await close();
    }
  });

  it("proxies admin place POI search through Tencent Map configuration", async () => {
    const previousTencentMapKey = process.env.TENCENT_MAP_KEY;
    const previousTencentMapSecretKey = process.env.TENCENT_MAP_SECRET_KEY;
    const originalFetch = globalThis.fetch;
    process.env.TENCENT_MAP_KEY = "test-map-key";
    process.env.TENCENT_MAP_SECRET_KEY = "test-secret-key";
    const fetchMock = vi.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        const url = input instanceof Request ? input.url : String(input);

        if (!url.startsWith("https://apis.map.qq.com/")) {
          return originalFetch(input, init);
        }

        expect(url).toContain("https://apis.map.qq.com/ws/place/v1/search");
        expect(url).toContain("keyword=%E6%A1%90%E6%A2%93%E6%9E%97");
        expect(url).toContain("boundary=region%28%E6%88%90%E9%83%BD%2C0%29");
        expect(url).toContain("page_size=10");
        expect(url).toContain("sig=");

        return new Response(
          JSON.stringify({
            status: 0,
            message: "query ok",
            data: [
              {
                id: "poi_tongzilin",
                title: "桐梓林",
                address: "四川省成都市武侯区桐梓林路",
                category: "交通设施",
                location: {
                  lat: 30.615,
                  lng: 104.062
                },
                ad_info: {
                  province: "四川省",
                  city: "成都市",
                  district: "武侯区"
                }
              }
            ]
          }),
          {
            headers: {
              "content-type": "application/json"
            }
          }
        );
      }
    );
    vi.stubGlobal("fetch", fetchMock);
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const response = await fetch(
        `${baseUrl}/admin/places/poi-search?keyword=${encodeURIComponent("桐梓林")}`,
        {
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toEqual([
        {
          id: "poi_tongzilin",
          title: "桐梓林",
          address: "四川省成都市武侯区桐梓林路",
          category: "交通设施",
          location: {
            latitude: 30.615,
            longitude: 104.062
          },
          province: "四川省",
          city: "成都市",
          district: "武侯区"
        }
      ]);
      const tencentCalls = fetchMock.mock.calls.filter(([input]) => {
        const url = input instanceof Request ? input.url : String(input);
        return url.startsWith("https://apis.map.qq.com/");
      });

      expect(tencentCalls).toHaveLength(1);
    } finally {
      await close();
      vi.unstubAllGlobals();

      if (previousTencentMapKey === undefined) {
        delete process.env.TENCENT_MAP_KEY;
      } else {
        process.env.TENCENT_MAP_KEY = previousTencentMapKey;
      }

      if (previousTencentMapSecretKey === undefined) {
        delete process.env.TENCENT_MAP_SECRET_KEY;
      } else {
        process.env.TENCENT_MAP_SECRET_KEY = previousTencentMapSecretKey;
      }
    }
  });

  it("returns clear admin place POI search errors for missing key and upstream failures", async () => {
    const previousTencentMapKey = process.env.TENCENT_MAP_KEY;
    const previousTencentMapSecretKey = process.env.TENCENT_MAP_SECRET_KEY;
    const originalFetch = globalThis.fetch;
    delete process.env.TENCENT_MAP_KEY;
    delete process.env.TENCENT_MAP_SECRET_KEY;
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const missingKeyResponse = await fetch(
        `${baseUrl}/admin/places/poi-search?keyword=${encodeURIComponent("桐梓林")}`,
        {
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const missingKeyBody = await missingKeyResponse.json();

      expect(missingKeyResponse.status).toBe(500);
      expect(missingKeyBody.error.code).toBe("CONFIGURATION_ERROR");

      process.env.TENCENT_MAP_KEY = "test-map-key";
      vi.stubGlobal(
        "fetch",
        vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
          const url = input instanceof Request ? input.url : String(input);

          if (!url.startsWith("https://apis.map.qq.com/")) {
            return originalFetch(input, init);
          }

          return new Response(
            JSON.stringify({
              status: 121,
              message: "key校验失败"
            })
          );
        })
      );

      const upstreamResponse = await fetch(
        `${baseUrl}/admin/places/poi-search?keyword=${encodeURIComponent("桐梓林")}`,
        {
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const upstreamBody = await upstreamResponse.json();

      expect(upstreamResponse.status).toBe(502);
      expect(upstreamBody.error.code).toBe("UPSTREAM_ERROR");
      expect(upstreamBody.error.message).toBe("key校验失败");
    } finally {
      await close();
      vi.unstubAllGlobals();

      if (previousTencentMapKey === undefined) {
        delete process.env.TENCENT_MAP_KEY;
      } else {
        process.env.TENCENT_MAP_KEY = previousTencentMapKey;
      }

      if (previousTencentMapSecretKey === undefined) {
        delete process.env.TENCENT_MAP_SECRET_KEY;
      } else {
        process.env.TENCENT_MAP_SECRET_KEY = previousTencentMapSecretKey;
      }
    }
  });

  it("proxies admin Amap media search with normalized image candidates", async () => {
    const previousAmapKey = process.env.AMAP_WEB_SERVICE_KEY;
    const originalFetch = globalThis.fetch;
    process.env.AMAP_WEB_SERVICE_KEY = "test-amap-key";
    const fetchMock = vi.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        const url = input instanceof Request ? input.url : String(input);

        if (!url.startsWith("https://restapi.amap.com/")) {
          return originalFetch(input, init);
        }

        expect(url).toContain("https://restapi.amap.com/v3/place/text");
        expect(url).toContain("keywords=%E6%A1%90%E6%A2%93%E6%9E%97");
        expect(url).toContain("extensions=all");

        return new Response(
          JSON.stringify({
            status: "1",
            info: "OK",
            pois: [
              {
                id: "B001",
                name: "桐梓林",
                address: "四川省成都市武侯区桐梓林路",
                type: "生活服务",
                location: "104.062,30.615",
                pname: "四川省",
                cityname: "成都市",
                adname: "武侯区",
                photos: [
                  {
                    title: "门头",
                    url: "https://store.is.autonavi.com/showpic/B001.jpg"
                  },
                  {
                    title: [],
                    url: "https://store.is.autonavi.com/showpic/B001-empty-title.jpg"
                  }
                ]
              },
              {
                id: "B002",
                name: "无图地点",
                address: [],
                type: "生活服务",
                location: "104.063,30.616",
                photos: []
              }
            ]
          }),
          {
            headers: {
              "content-type": "application/json"
            }
          }
        );
      }
    );
    vi.stubGlobal("fetch", fetchMock);
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const response = await fetch(
        `${baseUrl}/admin/places/amap-media-search?keyword=${encodeURIComponent("桐梓林")}`,
        {
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(2);
      expect(body.data[0].image_candidates[0]).toMatchObject({
        source: "amap",
        source_place_id: "B001",
        image_url: "https://store.is.autonavi.com/showpic/B001.jpg",
        image_title: "门头",
        attribution: {
          label: "Image source: Amap",
          provider_name: "Amap"
        }
      });
      expect(body.data[0].image_candidates[1].image_title).toBeNull();
      expect(body.data[1].image_candidates).toEqual([]);

      const forbiddenResponse = await fetch(
        `${baseUrl}/admin/places/amap-media-search?keyword=${encodeURIComponent("桐梓林")}`,
        {
          headers: {
            "x-mock-user-id": "user_002"
          }
        }
      );
      const forbiddenBody = await forbiddenResponse.json();

      expect(forbiddenResponse.status).toBe(403);
      expect(forbiddenBody.error.code).toBe("FORBIDDEN");
    } finally {
      await close();
      vi.unstubAllGlobals();

      if (previousAmapKey === undefined) {
        delete process.env.AMAP_WEB_SERVICE_KEY;
      } else {
        process.env.AMAP_WEB_SERVICE_KEY = previousAmapKey;
      }
    }
  });

  it("returns clear admin Amap media search errors", async () => {
    const previousAmapKey = process.env.AMAP_WEB_SERVICE_KEY;
    const originalFetch = globalThis.fetch;
    delete process.env.AMAP_WEB_SERVICE_KEY;
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const missingKeyResponse = await fetch(
        `${baseUrl}/admin/places/amap-media-search?keyword=${encodeURIComponent("桐梓林")}`,
        {
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const missingKeyBody = await missingKeyResponse.json();

      expect(missingKeyResponse.status).toBe(500);
      expect(missingKeyBody.error.code).toBe("CONFIGURATION_ERROR");

      process.env.AMAP_WEB_SERVICE_KEY = "test-amap-key";
      vi.stubGlobal(
        "fetch",
        vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
          const url = input instanceof Request ? input.url : String(input);

          if (!url.startsWith("https://restapi.amap.com/")) {
            return originalFetch(input, init);
          }

          return new Response(
            JSON.stringify({ status: "0", info: "INVALID_USER_KEY" })
          );
        })
      );

      const upstreamResponse = await fetch(
        `${baseUrl}/admin/places/amap-media-search?keyword=${encodeURIComponent("桐梓林")}`,
        {
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const upstreamBody = await upstreamResponse.json();

      expect(upstreamResponse.status).toBe(502);
      expect(upstreamBody.error.code).toBe("UPSTREAM_ERROR");
      expect(upstreamBody.error.message).toBe("INVALID_USER_KEY");
    } finally {
      await close();
      vi.unstubAllGlobals();

      if (previousAmapKey === undefined) {
        delete process.env.AMAP_WEB_SERVICE_KEY;
      } else {
        process.env.AMAP_WEB_SERVICE_KEY = previousAmapKey;
      }
    }
  });

  it("persists external place media through admin create and update", async () => {
    const { baseUrl, close } = await createTestBaseUrl();
    const externalMedia = {
      source: "amap",
      source_place_id: "B001",
      image_url: "https://store.is.autonavi.com/showpic/B001.jpg",
      image_title: "门头",
      attribution: {
        label: "Image source: Amap",
        provider_name: "Amap"
      }
    };

    try {
      const createResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "外部图片地点",
          name_en: "External Media Place",
          cover_file_id: null,
          cover_url: externalMedia.image_url,
          cover_source: externalMedia,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: ["community"],
          address_zh: "成都",
          address_en: "Chengdu",
          location: { latitude: 30.621, longitude: 104.068 },
          business_hours_zh: "周一至周日",
          business_hours_en: "Every day",
          intro_zh: "外部图片测试",
          intro_en: "External media test",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          external_gallery_media: [externalMedia],
          gallery_urls: [],
          tencent_map_poi_id: null,
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "published"
        })
      });
      const createBody = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createBody.data.external_gallery_media).toHaveLength(1);
      expect(createBody.data.gallery_file_ids).toEqual([]);

      const detailResponse = await fetch(
        `${baseUrl}/places/${createBody.data._id}`
      );
      const detailBody = await detailResponse.json();

      expect(detailResponse.status).toBe(200);
      expect(detailBody.data.cover_source.source).toBe("amap");
      expect(detailBody.data.external_gallery_media).toEqual([externalMedia]);
      expect(detailBody.data.gallery_media).toEqual([]);
      expect(detailBody.data.gallery_urls).toEqual([]);

      const listResponse = await fetch(
        `${baseUrl}/places?keyword=External%20Media%20Place`
      );
      const listBody = await listResponse.json();
      const markerResponse = await fetch(`${baseUrl}/places/map-markers`);
      const markerBody = await markerResponse.json();
      const marker = markerBody.data.find(
        (item: { _id: string }) => item._id === createBody.data._id
      );

      expect(listResponse.status).toBe(200);
      expect(listBody.data.items[0]).not.toHaveProperty(
        "external_gallery_media"
      );
      expect(listBody.data.items[0]).not.toHaveProperty("cover_source");
      expect(marker.cover_url).toBe(externalMedia.image_url);
      expect(marker).not.toHaveProperty("external_gallery_media");
      expect(marker).not.toHaveProperty("cover_source");

      const invalidUpdateResponse = await fetch(
        `${baseUrl}/admin/places/${createBody.data._id}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            external_gallery_media: [
              {
                ...externalMedia,
                source: "unsupported"
              }
            ]
          })
        }
      );
      const invalidUpdateBody = await invalidUpdateResponse.json();

      expect(invalidUpdateResponse.status).toBe(400);
      expect(invalidUpdateBody.error.code).toBe("VALIDATION_ERROR");

      const removeResponse = await fetch(
        `${baseUrl}/admin/places/${createBody.data._id}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            cover_source: null,
            external_gallery_media: []
          })
        }
      );
      const removeBody = await removeResponse.json();

      expect(removeResponse.status).toBe(200);
      expect(removeBody.data.cover_source).toBeNull();
      expect(removeBody.data.external_gallery_media).toEqual([]);
      expect(removeBody.data.gallery_file_ids).toEqual([]);
    } finally {
      await close();
    }
  });

  it("hardens admin place edit and delete routes and visibility", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const createResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "生命周期地点",
          name_en: "Lifecycle Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: ["community"],
          address_zh: "成都高新区",
          address_en: "Chengdu High-tech Zone",
          location: { latitude: 30.621, longitude: 104.068 },
          business_hours_zh: "周一至周日",
          business_hours_en: "Every day",
          intro_zh: "生命周期测试",
          intro_en: "Lifecycle test",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: null,
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "published"
        })
      });
      const createData = await createResponse.json();
      const placeId = createData.data._id;

      expect(createResponse.status).toBe(201);

      const unauthorizedEditResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_002"
          },
          body: JSON.stringify({
            name_en: "Unauthorized Edit"
          })
        }
      );
      const unauthorizedEditBody = await unauthorizedEditResponse.json();

      expect(unauthorizedEditResponse.status).toBe(403);
      expect(unauthorizedEditBody.success).toBe(false);
      expect(unauthorizedEditBody.error.code).toBe("FORBIDDEN");

      const invalidEditResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            category_level_1: "not-a-category"
          })
        }
      );
      const invalidEditBody = await invalidEditResponse.json();

      expect(invalidEditResponse.status).toBe(400);
      expect(invalidEditBody.success).toBe(false);
      expect(invalidEditBody.error.code).toBe("VALIDATION_ERROR");

      const unchangedDetailResponse = await fetch(
        `${baseUrl}/places/${placeId}`
      );
      const unchangedDetailData = await unchangedDetailResponse.json();

      expect(unchangedDetailResponse.status).toBe(200);
      expect(unchangedDetailData.data.name_en).toBe("Lifecycle Place");
      expect(unchangedDetailData.data.category_level_1).toBe("community");

      const missingEditResponse = await fetch(
        `${baseUrl}/admin/places/place_missing_edit`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            name_en: "Missing Edit"
          })
        }
      );
      const missingEditBody = await missingEditResponse.json();

      expect(missingEditResponse.status).toBe(404);
      expect(missingEditBody.error.code).toBe("NOT_FOUND");

      const draftEditResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            name_en: "Lifecycle Place Draft",
            tag_ids: ["edited"],
            status: "draft"
          })
        }
      );
      const draftEditBody = await draftEditResponse.json();

      expect(draftEditResponse.status).toBe(200);
      expect(draftEditBody.success).toBe(true);
      expect(draftEditBody.data._id).toBe(placeId);
      expect(draftEditBody.data.community_id).toBe("tongzilin");
      expect(draftEditBody.data.name_zh).toBe("生命周期地点");
      expect(draftEditBody.data.name_en).toBe("Lifecycle Place Draft");
      expect(draftEditBody.data.tag_ids).toEqual(["edited"]);
      expect(draftEditBody.data.address_en).toBe("Chengdu High-tech Zone");
      expect(draftEditBody.data.status).toBe("draft");

      const publicDraftListResponse = await fetch(
        `${baseUrl}/places?keyword=Lifecycle%20Place%20Draft`
      );
      const publicDraftListBody = await publicDraftListResponse.json();
      const publicDraftDetailResponse = await fetch(
        `${baseUrl}/places/${placeId}`
      );
      const publicDraftMarkersResponse = await fetch(
        `${baseUrl}/places/map-markers`
      );
      const publicDraftMarkersBody = await publicDraftMarkersResponse.json();

      expect(publicDraftListResponse.status).toBe(200);
      expect(publicDraftListBody.data.items).toEqual([]);
      expect(publicDraftListBody.data.total).toBe(0);
      expect(publicDraftDetailResponse.status).toBe(404);
      expect(
        publicDraftMarkersBody.data.some(
          (item: { _id: string }) => item._id === placeId
        )
      ).toBe(false);

      const publishEditResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            status: "published",
            category_level_1: "health-wellness",
            category_level_2: "clinic",
            recommended_reason_zh: "生命周期推荐理由",
            recommended_reason_en: "Lifecycle reason",
            is_recommended: true
          })
        }
      );
      const publishEditBody = await publishEditResponse.json();

      expect(publishEditResponse.status).toBe(200);
      expect(publishEditBody.data.status).toBe("published");
      expect(publishEditBody.data.category_level_1).toBe("health-wellness");

      const publicListResponse = await fetch(
        `${baseUrl}/places?keyword=Lifecycle%20Place%20Draft`
      );
      const publicListBody = await publicListResponse.json();
      const publicDetailResponse = await fetch(`${baseUrl}/places/${placeId}`);
      const publicDetailBody = await publicDetailResponse.json();
      const publicMarkersResponse = await fetch(
        `${baseUrl}/places/map-markers`
      );
      const publicMarkersBody = await publicMarkersResponse.json();

      expect(publicListResponse.status).toBe(200);
      expect(publicListBody.data.items).toHaveLength(1);
      expect(publicListBody.data.items[0]).not.toHaveProperty("address_zh");
      expect(publicListBody.data.items[0]).not.toHaveProperty("gallery_media");
      expect(publicDetailResponse.status).toBe(200);
      expect(publicDetailBody.data.category_level_1).toBe("health-wellness");
      expect(publicDetailBody.data).not.toHaveProperty("import_review");
      expect(
        publicMarkersBody.data.some(
          (item: { _id: string; category_level_1: string }) =>
            item._id === placeId && item.category_level_1 === "health-wellness"
        )
      ).toBe(true);
      expect(publicMarkersBody.data[0]).not.toHaveProperty("address_zh");
      expect(publicMarkersBody.data[0]).not.toHaveProperty("gallery_media");

      const unauthorizedDeleteResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}`,
        {
          method: "DELETE",
          headers: {
            "x-mock-user-id": "user_002"
          }
        }
      );
      const unauthorizedDeleteBody = await unauthorizedDeleteResponse.json();

      expect(unauthorizedDeleteResponse.status).toBe(403);
      expect(unauthorizedDeleteBody.error.code).toBe("FORBIDDEN");
      expect((await fetch(`${baseUrl}/places/${placeId}`)).status).toBe(200);

      const missingDeleteResponse = await fetch(
        `${baseUrl}/admin/places/place_missing_delete`,
        {
          method: "DELETE",
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const missingDeleteBody = await missingDeleteResponse.json();

      expect(missingDeleteResponse.status).toBe(404);
      expect(missingDeleteBody.error.code).toBe("NOT_FOUND");

      const deleteResponse = await fetch(
        `${baseUrl}/api/admin/places/${placeId}`,
        {
          method: "DELETE",
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      const deleteBody = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteBody.success).toBe(true);
      expect(deleteBody.data).toEqual({ deleted_id: placeId });

      const repeatDeleteResponse = await fetch(
        `${baseUrl}/admin/places/${placeId}`,
        {
          method: "DELETE",
          headers: {
            "x-mock-user-id": "user_001"
          }
        }
      );
      expect(repeatDeleteResponse.status).toBe(404);

      const adminListResponse = await fetch(`${baseUrl}/admin/places`, {
        headers: {
          "x-mock-user-id": "user_001"
        }
      });
      const adminListBody = await adminListResponse.json();
      const deletedListResponse = await fetch(
        `${baseUrl}/places?keyword=Lifecycle%20Place%20Draft`
      );
      const deletedListBody = await deletedListResponse.json();
      const deletedMarkersResponse = await fetch(
        `${baseUrl}/places/map-markers`
      );
      const deletedMarkersBody = await deletedMarkersResponse.json();

      expect(
        adminListBody.data.items.some(
          (item: { _id: string }) => item._id === placeId
        )
      ).toBe(false);
      expect(deletedListBody.data.items).toEqual([]);
      expect(deletedListBody.data.total).toBe(0);
      expect(
        deletedMarkersBody.data.some(
          (item: { _id: string }) => item._id === placeId
        )
      ).toBe(false);
      expect((await fetch(`${baseUrl}/places/${placeId}`)).status).toBe(404);
    } finally {
      await close();
    }
  });

  it("supports the places v1 query baseline", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const keywordResponse = await fetch(`${baseUrl}/places?keyword=cafe`);
      const keywordData = await keywordResponse.json();

      expect(keywordResponse.status).toBe(200);
      expect(keywordData.data.items).toHaveLength(1);
      expect(keywordData.data.items[0].name_en).toBe("Global Corner Cafe");
      expect(keywordData.data.items[0]).not.toHaveProperty("gallery_urls");
      expect(keywordData.data.items[0]).not.toHaveProperty("gallery_media");
      expect(keywordData.data.items[0]).not.toHaveProperty("navigation");
      expect(keywordData.data.items[0]).not.toHaveProperty("address_zh");

      const filteredResponse = await fetch(
        `${baseUrl}/places?communityId=tongzilin&category=public-service&tag=service&recommended=true&sort=recommended`
      );
      const filteredData = await filteredResponse.json();

      expect(filteredResponse.status).toBe(200);
      expect(filteredData.data.page).toBe(1);
      expect(filteredData.data.items.length).toBeGreaterThan(0);
      expect(
        filteredData.data.items.every(
          (item: {
            category_level_1: string;
            tag_ids: string[];
            is_recommended: boolean;
          }) =>
            item.category_level_1 === "public-service" &&
            item.tag_ids.includes("service") &&
            item.is_recommended
        )
      ).toBe(true);

      const emptyTagResponse = await fetch(`${baseUrl}/places?tag=missing-tag`);
      const emptyTagData = await emptyTagResponse.json();

      expect(emptyTagResponse.status).toBe(200);
      expect(emptyTagData.data.items).toEqual([]);
      expect(emptyTagData.data.total).toBe(0);

      const nameSortResponse = await fetch(`${baseUrl}/places?sort=name`);
      const nameSortData = await nameSortResponse.json();

      expect(nameSortResponse.status).toBe(200);
      // The dataset now contains 11 published Tongzilin places. We assert
      // the sort order only on the first two entries (alphabetically
      // earliest) and verify the total count matches the dataset.
      const nameSortNames = nameSortData.data.items.map(
        (item: { name_en: string }) => item.name_en
      );
      expect(nameSortNames[0]).toBe("Global Corner Cafe");
      expect(nameSortNames[1]).toBe("Tongzilin Community Center");
      expect(nameSortData.data.total).toBe(11);

      const pagedResponse = await fetch(
        `${baseUrl}/places?page=2&pageSize=1&sort=name`
      );
      const pagedData = await pagedResponse.json();

      expect(pagedResponse.status).toBe(200);
      expect(pagedData.data.items).toHaveLength(1);
      expect(pagedData.data.page).toBe(2);
      expect(pagedData.data.pageSize).toBe(1);
      expect(pagedData.data.total).toBe(11);
      expect(pagedData.data.items[0].name_en).toBe(
        "Tongzilin Community Center"
      );

      const emptyResponse = await fetch(
        `${baseUrl}/places?communityId=other-community&page=1&pageSize=5`
      );
      const emptyData = await emptyResponse.json();

      expect(emptyResponse.status).toBe(200);
      expect(emptyData.data.items).toEqual([]);
      expect(emptyData.data.page).toBe(1);
      expect(emptyData.data.pageSize).toBe(5);
      expect(emptyData.data.total).toBe(0);

      const markerResponse = await fetch(`${baseUrl}/places/map-markers`);
      const markerData = await markerResponse.json();

      expect(markerResponse.status).toBe(200);
      expect(markerData.data).toHaveLength(11);
      expect(Object.keys(markerData.data[0]).sort()).toEqual([
        "_id",
        "category_level_1",
        "cover_url",
        "is_recommended",
        "location",
        "name_en",
        "name_zh"
      ]);
      expect(markerData.data[0].cover_url).toBe(
        "https://images.unsplash.com/photo-1494526585095-c41746248156"
      );
      // Marker order is stable but the dataset has grown; verify that the
      // canonical first two markers are still place_001 and place_002 and
      // that the remaining markers are all valid place IDs.
      const markerIds = markerData.data.map((item: { _id: string }) => item._id);
      expect(markerIds[0]).toBe("place_001");
      expect(markerIds[1]).toBe("place_002");
      expect(new Set(markerIds).size).toBe(markerIds.length);
      expect(markerData.data[0]).not.toHaveProperty("gallery_urls");
      expect(markerData.data[0]).not.toHaveProperty("gallery_media");
      expect(markerData.data[0]).not.toHaveProperty("external_gallery_media");
      expect(markerData.data[0]).not.toHaveProperty("cover_source");
      expect(markerData.data[0]).not.toHaveProperty("navigation");
      expect(markerData.data[0]).not.toHaveProperty("address_zh");

      const invalidSortResponse = await fetch(`${baseUrl}/places?sort=latest`);
      const invalidSortData = await invalidSortResponse.json();

      expect(invalidSortResponse.status).toBe(400);
      expect(invalidSortData.error.code).toBe("VALIDATION_ERROR");
    } finally {
      await close();
    }
  });
});
