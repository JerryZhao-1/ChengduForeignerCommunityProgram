import {
  ApiClientError,
  createFetchRequester,
  createHttpClient,
  createMockClient,
  createMockService,
  apiPaths,
  type HttpRequester,
  type NewResidentPreference
} from "@community-map/shared";
import { describe, expect, it, vi } from "vitest";

describe("shared api clients", () => {
  it("throws typed client errors for API failure envelopes", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Insufficient permission.",
              details: { role: "community_admin" }
            },
            requestId: "req_forbidden"
          }),
          {
            status: 403,
            headers: { "content-type": "application/json" }
          }
        )
    ) as unknown as typeof fetch;
    const requester = createFetchRequester(fetchImpl);

    await expect(
      requester("GET", "http://localhost/admin/places")
    ).rejects.toMatchObject({
      name: "ApiClientError",
      code: "FORBIDDEN",
      message: "Insufficient permission.",
      details: { role: "community_admin" },
      requestId: "req_forbidden",
      status: 403
    });
  });

  it("throws typed client errors for non-envelope HTTP failures", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "Proxy failed" }), {
          status: 502,
          headers: { "content-type": "application/json" }
        })
    ) as unknown as typeof fetch;
    const requester = createFetchRequester(fetchImpl);

    await expect(
      requester("GET", "http://localhost/upstream")
    ).rejects.toBeInstanceOf(ApiClientError);
    await expect(
      requester("GET", "http://localhost/upstream")
    ).rejects.toMatchObject({
      code: "UPSTREAM_ERROR",
      status: 502
    });
  });

  it("keeps mock and http client signatures aligned for events list", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_001",
      data: {
        items: [
          {
            _id: "event_http_001",
            community_id: "tongzilin",
            title_zh: "HTTP 活动",
            title_en: "HTTP Event",
            summary_zh: "简介",
            summary_en: "Summary",
            content_zh: "正文",
            content_en: "Body",
            cover_file_id: "cloud://cover",
            cover_cloud_path: "public/events/event_http_001/cover.jpg",
            cover_url: "https://example.com/cover.jpg",
            place_id: "place_001",
            address_text: "Address",
            location: { latitude: 30.6, longitude: 104.0 },
            start_time: "2026-03-28T10:00:00+08:00",
            end_time: "2026-03-28T12:00:00+08:00",
            signup_deadline: "2026-03-27T18:00:00+08:00",
            capacity: 20,
            organizer_user_id: "user_001",
            review_status: "approved",
            publish_status: "published"
          }
        ],
        page: 1,
        pageSize: 10,
        total: 1
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.events.list();
    const httpResult = await httpClient.events.list();

    expect(mockResult.success).toBe(true);
    expect(httpResult.success).toBe(true);
    expect(Array.isArray(mockResult.data.items)).toBe(true);
    expect(Array.isArray(httpResult.data.items)).toBe(true);
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/events",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for discover comments and my posts", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async (_method: string, url: string) => {
      if (String(url).includes("/comments")) {
        return {
          success: true,
          requestId: "req_comments",
          data: {
            items: [
              {
                _id: "comment_http_001",
                post_id: "post_http_001",
                author_user_id: "user_001",
                content: "HTTP comment",
                language: "en",
                status: "visible",
                created_at: "2026-03-28T09:30:00+08:00"
              }
            ],
            page: 1,
            pageSize: 20,
            total: 1
          }
        };
      }

      return {
        success: true,
        requestId: "req_my_posts",
        data: {
          items: [],
          page: 1,
          pageSize: 10,
          total: 0
        }
      };
    });
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockComments = await mockClient.discover.listComments("post_001");
    const mockMine = await mockClient.discover.myPosts();
    const httpComments =
      await httpClient.discover.listComments("post_http_001");
    const httpMine = await httpClient.discover.myPosts();

    expect(mockComments.data.items[0]).toHaveProperty("status", "visible");
    expect(mockMine.data.items.map((post) => post._id)).toContain(
      "post_hidden"
    );
    expect(httpComments.data.items[0].content).toBe("HTTP comment");
    expect(httpMine.data.total).toBe(0);
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/posts/post_http_001/comments",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/me/posts",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for discover interactions", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(
      async (method: string, url: string, body: unknown) => ({
        success: true,
        requestId: "req_interaction",
        data: {
          post_id: String(url).includes("/post_http_001/")
            ? "post_http_001"
            : "post_001",
          actor_user_id: "user_001",
          liked:
            method === "POST" && String(url).endsWith("/like")
              ? (body as { liked?: boolean }).liked === true
              : false,
          favorited:
            method === "POST" && String(url).endsWith("/favorite")
              ? (body as { favorited?: boolean }).favorited === true
              : false,
          like_count: 1,
          favorite_count: 1,
          share_count: String(url).endsWith("/share") ? 2 : 1
        }
      })
    );
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockInteraction = await mockClient.discover.postInteraction(
      "post_001"
    );
    const mockLike = await mockClient.discover.setPostLike("post_001", {
      liked: true
    });
    const httpInteraction =
      await httpClient.discover.postInteraction("post_http_001");
    const httpLike = await httpClient.discover.setPostLike("post_http_001", {
      liked: true
    });
    await httpClient.discover.setPostFavorite("post_http_001", {
      favorited: false
    });
    await httpClient.discover.recordPostShare("post_http_001", {
      channel: "wechat"
    });
    await httpClient.discover.profile("user_002");
    await httpClient.discover.setProfileFollow("user_002", {
      following: true
    });

    expect(mockInteraction.data.post_id).toBe("post_001");
    expect(mockLike.data.liked).toBe(true);
    expect(httpInteraction.data.post_id).toBe("post_http_001");
    expect(httpLike.data.liked).toBe(true);
    expect(apiPaths.discover.postInteraction("post_001")).toBe(
      "/discover/posts/post_001/interaction"
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/posts/post_http_001/interaction",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/discover/posts/post_http_001/like",
      { liked: true },
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/discover/posts/post_http_001/favorite",
      { favorited: false },
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/discover/posts/post_http_001/share",
      { channel: "wechat" },
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/profiles/user_002",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/discover/profiles/user_002/follow",
      { following: true },
      { "x-mock-user-id": "user_001" }
    );
  });

  it("supports discover search sorting, public tags, my content, and follow lists", async () => {
    const service = createMockService();

    const likesBefore = service.posts.list({
      sort: "likes",
      pageSize: 3
    });
    expect(likesBefore.items[0]._id).toBe("post_006");

    service.posts.updateOps("post_001", { is_pinned: true }, "user_001");
    const likesAfterPin = service.posts.list({
      sort: "likes",
      pageSize: 3
    });
    expect(likesAfterPin.items[0]._id).toBe("post_001");

    const filteredPinned = service.posts.list({
      keyword: "tennis",
      sort: "likes",
      pageSize: 3
    });
    expect(filteredPinned.items.map((post) => post._id)).not.toContain(
      "post_001"
    );
    expect(filteredPinned.items[0]._id).toBe("post_002");

    const coffeeTags = service.posts.listPublicTags({
      keyword: "cof"
    });
    expect(coffeeTags.items.map((tag) => tag._id)).toContain("coffee");

    const createdTag = service.posts.createTag(
      {
        label: "#book club"
      },
      "user_002"
    );
    expect(createdTag).toMatchObject({
      _id: "book-club",
      status: "active"
    });

    const myComments = service.posts.listMyComments({}, "user_002");
    expect(myComments.items[0]._id).toBe("comment_001");
    const myComment = service.posts.detailMyComment("comment_001", "user_002");
    expect(myComment?.post_id).toBe("post_001");

    const myReports = service.posts.listMyReportCases({}, "user_002");
    expect(myReports.items[0]._id).toBe("report_001");
    const myReport = service.posts.detailMyReportCase("report_001", "user_002");
    expect(myReport?.reporter_user_id).toBe("user_002");

    service.posts.setProfileFollow(
      "user_001",
      {
        following: true
      },
      "user_002"
    );
    service.posts.setProfileFollow(
      "user_002",
      {
        following: true
      },
      "user_001"
    );
    const followers = service.posts.listProfileFollowers(
      "user_001",
      {},
      "user_001"
    );
    expect(followers?.items[0]).toMatchObject({
      mutual: true,
      followed_by_actor: true,
      follows_actor: true
    });
  });

  it("serializes new discover query and profile utility endpoints", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_discover_new",
      data: { items: [], page: 1, pageSize: 20, total: 0 }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.discover.listPosts({
      keyword: "coffee",
      tag: "coffee",
      sort: "favorites"
    });
    await httpClient.discover.listTags({ keyword: "cof" });
    await httpClient.discover.listProfileFollowers("user_002");
    await httpClient.discover.listProfileFollowing("user_002", {
      page: 2
    });
    await httpClient.discover.myComments();
    await httpClient.discover.myReports();

    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/posts?keyword=coffee&tag=coffee&sort=favorites",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/tags?keyword=cof",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/profiles/user_002/followers",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/profiles/user_002/following?page=2",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/me/comments",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/me/reports",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("serializes discover related post queries for places and events", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_related_posts",
      data: {
        items: [],
        page: 1,
        pageSize: 5,
        total: 0
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockPlaceRelated =
      await mockClient.discover.listPlaceRelatedPosts("place_001");
    await httpClient.discover.listPlaceRelatedPosts("place_001", {
      pageSize: 4,
      communityId: "tongzilin"
    });
    await httpClient.discover.listEventRelatedPosts("event_001", {
      page: 2
    });

    expect(mockPlaceRelated.data.items.map((post) => post.place_id)).toContain(
      "place_001"
    );
    await expect(
      mockClient.discover.listPlaceRelatedPosts("place_does_not_exist")
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Place not found.",
      status: 404
    });
    await expect(
      mockClient.discover.listEventRelatedPosts("event_does_not_exist")
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Event not found.",
      status: 404
    });
    expect(apiPaths.discover.listPlaceRelatedPosts("place_001")).toBe(
      "/discover/places/place_001/posts"
    );
    expect(apiPaths.discover.listEventRelatedPosts("event_001")).toBe(
      "/discover/events/event_001/posts"
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/places/place_001/posts?pageSize=4&communityId=tongzilin",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/events/event_001/posts?page=2",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for discover governance", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async (method: string, url: string) => {
      if (String(url).includes("/admin/discover/reports/report_http/resolve")) {
        expect(method).toBe("POST");
        return {
          success: true,
          requestId: "req_resolve",
          data: {
            _id: "report_http",
            community_id: "tongzilin",
            target_type: "post",
            target_id: "post_http",
            post_id: "post_http",
            comment_id: null,
            reporter_user_id: "user_002",
            reason: "spam",
            description: null,
            evidence_file_ids: [],
            evidence: [],
            status: "actioned",
            handler_user_id: "user_001",
            resolution_note: "Resolved",
            created_at: "2026-04-03T09:15:00+08:00",
            updated_at: "2026-04-03T09:20:00+08:00",
            resolved_at: "2026-04-03T09:20:00+08:00"
          }
        };
      }

      if (String(url).includes("/admin/discover/reports")) {
        return {
          success: true,
          requestId: "req_reports",
          data: { items: [], page: 1, pageSize: 20, total: 0 }
        };
      }

      if (String(url).includes("/discover/me/governance")) {
        return {
          success: true,
          requestId: "req_me_governance",
          data: {
            user: {
              _id: "user_001",
              nickname: "Jerry",
              avatar_url: null,
              preferred_language: "zh",
              role_flags: ["community_admin"],
              status: "active"
            },
            enforcement: {
              status: "active",
              reason: null,
              notes: null,
              expires_at: null,
              updated_at: null,
              updated_by: null
            },
            post_count: 0,
            comment_count: 0,
            report_count: 0,
            violation_count: 0,
            liked_post_count: 0,
            favorited_post_count: 0,
            unread_notification_count: 0
          }
        };
      }

      return {
        success: true,
        requestId: "req_posts",
        data: { items: [], page: 1, pageSize: 20, total: 0 }
      };
    });
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockPosts = await mockClient.admin.listDiscoverPosts({
      status: "hidden"
    });
    const mockReports = await mockClient.admin.listDiscoverReports({
      status: "open"
    });
    const httpPosts = await httpClient.admin.listDiscoverPosts({
      status: "reported",
      keyword: "tennis"
    });
    const httpReports = await httpClient.admin.listDiscoverReports({
      status: "open"
    });
    const mockMeGovernance = await mockClient.discover.meGovernance();
    const httpMeGovernance = await httpClient.discover.meGovernance();
    const resolved = await httpClient.admin.resolveDiscoverReport(
      "report_http",
      {
        status: "actioned",
        reason: "Resolved",
        moderation_action: "hide"
      }
    );

    expect(mockPosts.data.items[0]?.review_status).toBe("hidden");
    expect(mockReports.data.items[0]?.status).toBe("open");
    expect(httpPosts.data.total).toBe(0);
    expect(httpReports.data.total).toBe(0);
    expect(mockMeGovernance.data).toHaveProperty("unread_notification_count");
    expect(httpMeGovernance.data.enforcement.status).toBe("active");
    expect(resolved.data.status).toBe("actioned");
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/admin/discover/posts?status=reported&keyword=tennis",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/discover/me/governance",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("uploads report evidence through the shared files client", async () => {
    const mockClient = createMockClient({ actorId: "user_002" });
    const requester = vi.fn(async (method: string, url: string, body) => {
      expect(method).toBe("POST");
      expect(url).toBe("http://localhost:8787/files/report-evidence");
      expect(body).toBeInstanceOf(FormData);
      expect((body as FormData).get("biz_id")).toBe("pending_report_post_003");

      return {
        success: true,
        requestId: "req_report_evidence",
        data: {
          _id: "file_report_http",
          file_id:
            "cloud://test-env/private/reports/pending_report_post_003/evidence.jpg",
          cloud_path: "private/reports/pending_report_post_003/evidence.jpg",
          visibility: "private",
          biz_type: "report_evidence",
          biz_id: "pending_report_post_003",
          uploaded_by: "user_002",
          status: "active"
        }
      };
    });
    const httpClient = createHttpClient({
      actorId: "user_002",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockUpload = await mockClient.files.uploadReportEvidence({
      file: new Blob(["fake evidence"], { type: "image/jpeg" }),
      file_name: "evidence.jpg",
      content_type: "image/jpeg",
      biz_id: "pending_report_post_003"
    });
    const httpUpload = await httpClient.files.uploadReportEvidence({
      file: new Blob(["fake evidence"], { type: "image/jpeg" }),
      file_name: "evidence.jpg",
      content_type: "image/jpeg",
      biz_id: "pending_report_post_003"
    });

    expect(mockUpload.data.biz_type).toBe("report_evidence");
    expect(mockUpload.data.visibility).toBe("private");
    expect(httpUpload.data.file_id).toContain("private/reports");
    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/files/report-evidence",
      expect.any(FormData),
      { "x-mock-user-id": "user_002" }
    );
  });

  it("keeps mock and http client signatures aligned for admin event management", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async (_method: string, url: string) => {
      if (String(url).endsWith("/registrations")) {
        return {
          success: true,
          requestId: "req_admin_event_registrations",
          data: [
            {
              _id: "reg_http_001",
              event_id: "event_http_001",
              user_id: "user_001",
              contact_name: "Jerry",
              contact_phone: "13800000000",
              attendee_count: 2,
              registration_status: "confirmed",
              ticket_id: "ticket_http_001",
              source_channel: "miniapp",
              ticket_code: "TZL-HTTP-001",
              ticket_status: "valid",
              ticket_used_at: null
            }
          ]
        };
      }

      return {
        success: true,
        requestId: "req_admin_events",
        data: {
          items: [
            {
              _id: "event_http_001",
              community_id: "tongzilin",
              title_zh: "HTTP 后台活动",
              title_en: "HTTP Admin Event",
              summary_zh: "简介",
              summary_en: "Summary",
              content_zh: "正文",
              content_en: "Body",
              cover_file_id: "cloud://cover",
              cover_cloud_path: "public/events/event_http_001/cover.jpg",
              cover_url: "https://example.com/admin-event.jpg",
              address_text: "Address",
              location: { latitude: 30.6, longitude: 104.0 },
              start_time: "2027-03-28T10:00:00+08:00",
              end_time: "2027-03-28T12:00:00+08:00",
              signup_deadline: "2027-03-27T18:00:00+08:00",
              capacity: 20,
              organizer_user_id: "user_001",
              review_status: "draft",
              publish_status: "draft",
              active_registration_count: 0,
              confirmed_attendee_count: 0,
              remaining_capacity: 20,
              is_full: false
            }
          ],
          page: 1,
          pageSize: 10,
          total: 1
        }
      };
    });
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockEvents = await mockClient.admin.listEvents();
    const httpEvents = await httpClient.admin.listEvents();
    const mockRegistrations =
      await mockClient.admin.listEventRegistrations("event_001");
    const httpRegistrations =
      await httpClient.admin.listEventRegistrations("event_http_001");

    expect(mockEvents.success).toBe(true);
    expect(mockEvents.data.items.map((event) => event._id)).toContain(
      "event_draft"
    );
    expect(mockEvents.data.items[0]).toHaveProperty(
      "active_registration_count"
    );
    expect(httpEvents.data.items[0].remaining_capacity).toBe(20);
    expect(mockRegistrations.data[0]).toHaveProperty("ticket_code");
    expect(httpRegistrations.data[0].ticket_status).toBe("valid");
    expect(apiPaths.admin.listEvents).toBe("/admin/events");
    expect(apiPaths.admin.eventRegistrations("event_http_001")).toBe(
      "/admin/events/event_http_001/registrations"
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/admin/events",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/admin/events/event_http_001/registrations",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for place markers", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_002",
      data: [
        {
          _id: "place_http_001",
          name_zh: "社区中心",
          name_en: "Community Center",
          cover_url: "https://example.com/place-http-cover.jpg",
          category_level_1: "public-service",
          is_recommended: true,
          location: { latitude: 30.615, longitude: 104.0625 }
        }
      ]
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.places.mapMarkers();
    const httpResult = await httpClient.places.mapMarkers();

    expect(mockResult.success).toBe(true);
    expect(httpResult.success).toBe(true);
    expect(mockResult.data[0]).toHaveProperty("category_level_1");
    expect(mockResult.data[0]).toHaveProperty("cover_url");
    expect(httpResult.data[0]).toHaveProperty("category_level_1");
    expect(httpResult.data[0]).toHaveProperty(
      "cover_url",
      "https://example.com/place-http-cover.jpg"
    );
    expect(httpResult.data[0]).toHaveProperty("is_recommended");
    expect(httpResult.data[0]).not.toHaveProperty("address_zh");
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/places/map-markers",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for place detail", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_004",
      data: {
        _id: "place_http_001",
        community_id: "tongzilin",
        name_zh: "社区中心",
        name_en: "Community Center",
        cover_url: "https://example.com/place.jpg",
        category_level_1: "public-service",
        category_level_2: "community-center",
        tag_ids: ["service"],
        address_zh: "成都",
        address_en: "Chengdu",
        location: { latitude: 30.615, longitude: 104.0625 },
        business_hours_zh: "周一至周日",
        business_hours_en: "Every day",
        intro_zh: "简介",
        intro_en: "Intro",
        gallery_media: [
          {
            file_id: "cloud://place-http-001-1",
            cloud_path: "public/places/place_http_001/1.jpg",
            url: "https://example.com/gallery.jpg",
            alt_zh: "社区中心 图集 1",
            alt_en: "Community Center gallery 1"
          }
        ],
        gallery_urls: ["https://example.com/gallery.jpg"],
        is_recommended: true,
        recommended_reason_zh: "推荐理由",
        recommended_reason_en: "Reason",
        supports_navigation: true,
        supports_favorite: true,
        supports_share: true,
        navigation: {
          latitude: 30.615,
          longitude: 104.0625,
          name_zh: "社区中心",
          name_en: "Community Center",
          address_zh: "成都",
          address_en: "Chengdu"
        },
        share: {
          title_zh: "社区中心",
          title_en: "Community Center",
          summary_zh: "简介",
          summary_en: "Intro"
        }
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.places.detail("place_001");
    const httpResult = await httpClient.places.detail("place_http_001");

    expect(mockResult.success).toBe(true);
    expect(httpResult.success).toBe(true);
    expect(mockResult.data).toHaveProperty("navigation");
    expect(mockResult.data).toHaveProperty("gallery_media");
    expect(mockResult.data.gallery_media[0].url).toContain(
      "images.unsplash.com"
    );
    expect(mockResult.data.gallery_urls).toEqual(
      mockResult.data.gallery_media.map((media) => media.url)
    );
    expect(httpResult.data).toHaveProperty("gallery_media");
    expect(httpResult.data).toHaveProperty("gallery_urls");
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/places/place_http_001",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("serializes place list query for recommended filtering", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_003",
      data: {
        items: [],
        page: 1,
        pageSize: 10,
        total: 0
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.places.list({
      category: "public-service",
      tag: "service",
      page: 2,
      pageSize: 5,
      recommended: true,
      sort: "recommended",
      keyword: "community"
    });

    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/places?category=public-service&tag=service&page=2&pageSize=5&recommended=true&sort=recommended&keyword=community",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for admin place delete", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_delete_place",
      data: {
        deleted_id: "place_http_001"
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.admin.deletePlace("place_003");
    const httpResult = await httpClient.admin.deletePlace("place_http_001");

    expect(apiPaths.admin.deletePlace("place_http_001")).toBe(
      "/admin/places/place_http_001"
    );
    expect(mockResult.success).toBe(true);
    expect(mockResult.data.deleted_id).toBe("place_003");
    expect(httpResult.success).toBe(true);
    expect(httpResult.data.deleted_id).toBe("place_http_001");
    expect(requester).toHaveBeenCalledWith(
      "DELETE",
      "http://localhost:8787/admin/places/place_http_001",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("keeps mock and http client signatures aligned for admin event delete", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_delete_event",
      data: {
        deleted_id: "event_http_001"
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.admin.deleteEvent("event_pending");
    const httpResult = await httpClient.admin.deleteEvent("event_http_001");

    expect(apiPaths.admin.deleteEvent("event_http_001")).toBe(
      "/admin/events/event_http_001"
    );
    expect(mockResult.success).toBe(true);
    expect(mockResult.data.deleted_id).toBe("event_pending");
    expect(httpResult.success).toBe(true);
    expect(httpResult.data.deleted_id).toBe("event_http_001");
    expect(requester).toHaveBeenCalledWith(
      "DELETE",
      "http://localhost:8787/admin/events/event_http_001",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("serializes admin place POI search through shared client", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_poi_search",
      data: [
        {
          id: "poi_http_001",
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
      ]
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.admin.searchPlacePoi({
      keyword: "桐梓林"
    });
    const httpResult = await httpClient.admin.searchPlacePoi({
      keyword: "桐梓林"
    });

    expect(mockResult.data[0].title).toBe("桐梓林");
    expect(httpResult.data[0].id).toBe("poi_http_001");
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/admin/places/poi-search?keyword=%E6%A1%90%E6%A2%93%E6%9E%97",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("serializes admin Amap media search through shared client", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_amap_media_search",
      data: []
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const mockResult = await mockClient.admin.searchPlaceAmapMedia({
      keyword: "桐梓林"
    });
    const httpResult = await httpClient.admin.searchPlaceAmapMedia({
      keyword: "桐梓林",
      city: "成都"
    });

    expect(mockResult.success).toBe(true);
    expect(mockResult.data[0].image_candidates[0].source).toBe("amap");
    expect(httpResult.success).toBe(true);
    expect(requester).toHaveBeenCalledWith(
      "GET",
      "http://localhost:8787/admin/places/amap-media-search?keyword=%E6%A1%90%E6%A2%93%E6%9E%97&city=%E6%88%90%E9%83%BD",
      undefined,
      { "x-mock-user-id": "user_001" }
    );
  });

  it("sends direct admin place gallery uploads as FormData", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_gallery_upload",
      data: {
        file_asset: {
          _id: "file_001",
          file_id: "cloud://public/places/place_001/1.jpg",
          cloud_path: "public/places/place_001/1.jpg",
          visibility: "public",
          biz_type: "place_gallery",
          biz_id: "place_001",
          uploaded_by: "user_001",
          status: "active"
        },
        gallery_file_ids: ["cloud://public/places/place_001/1.jpg"]
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.admin.uploadPlaceGalleryFile("place_001", {
      file: new Blob(["image-bytes"], { type: "image/jpeg" }),
      file_name: "entrance.jpg",
      content_type: "image/jpeg"
    });

    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/admin/places/place_001/gallery-files",
      expect.any(FormData),
      { "x-mock-user-id": "user_001" }
    );
  });

  it("sends direct admin event cover uploads as FormData", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_event_cover_upload",
      data: {
        file_asset: {
          _id: "file_event_cover_001",
          file_id: "cloud://public/events/event_001/cover.jpg",
          cloud_path: "public/events/event_001/cover.jpg",
          visibility: "public",
          biz_type: "event_cover",
          biz_id: "event_001",
          uploaded_by: "user_001",
          status: "active"
        },
        cover_file_id: "cloud://public/events/event_001/cover.jpg",
        cover_cloud_path: "public/events/event_001/cover.jpg",
        cover_url: "https://example.com/public/events/event_001/cover.jpg"
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.admin.uploadEventCoverFile("event_001", {
      file: new Blob(["image-bytes"], { type: "image/jpeg" }),
      file_name: "cover.jpg",
      content_type: "image/jpeg"
    });

    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/admin/events/event_001/cover-file",
      expect.any(FormData),
      { "x-mock-user-id": "user_001" }
    );
  });

  it("sends pending admin event cover uploads as FormData", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_pending_event_cover_upload",
      data: {
        file_asset: {
          _id: "file_pending_event_cover_001",
          file_id: "cloud://public/events/_pending/pending_001/cover.jpg",
          cloud_path: "public/events/_pending/pending_001/cover.jpg",
          visibility: "public",
          biz_type: "event_cover",
          biz_id: "__pending_event_cover__",
          uploaded_by: "user_001",
          status: "active"
        },
        cover_file_id: "cloud://public/events/_pending/pending_001/cover.jpg",
        cover_cloud_path: "public/events/_pending/pending_001/cover.jpg",
        cover_url:
          "https://example.com/public/events/_pending/pending_001/cover.jpg"
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.admin.uploadPendingEventCoverFile({
      file: new Blob(["image-bytes"], { type: "image/jpeg" }),
      file_name: "cover.jpg",
      content_type: "image/jpeg"
    });

    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/admin/events/cover-file",
      expect.any(FormData),
      { "x-mock-user-id": "user_001" }
    );
  });

  it("sends pending admin place gallery uploads as FormData", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_http_pending_gallery_upload",
      data: {
        file_asset: {
          _id: "file_pending_001",
          file_id: "cloud://public/places/_pending/pending_001/1.jpg",
          cloud_path: "public/places/_pending/pending_001/1.jpg",
          visibility: "public",
          biz_type: "place_gallery",
          biz_id: "__pending_place_gallery__",
          uploaded_by: "user_001",
          status: "active"
        },
        gallery_file_ids: ["cloud://public/places/_pending/pending_001/1.jpg"]
      }
    }));
    const httpClient = createHttpClient({
      actorId: "user_001",
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.admin.uploadPendingPlaceGalleryFile({
      file: new Blob(["image-bytes"], { type: "image/jpeg" }),
      file_name: "entrance.jpg",
      content_type: "image/jpeg"
    });

    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/admin/places/gallery-files",
      expect.any(FormData),
      { "x-mock-user-id": "user_001" }
    );
  });

  it("mock client generates a deterministic community plan for valid preferences", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const preference: NewResidentPreference = {
      preferred_language: "zh",
      interests: ["community-service", "social"],
      arrival_context: "first-week",
      household_type: "solo",
      accessibility_needs: []
    };

    const result = await mockClient.communityPlan.generate(preference);

    expect(result.success).toBe(true);
    expect(result.data.community_id).toBe("tongzilin");
    expect(result.data.items).toHaveLength(2);
    expect(result.data.total_duration_minutes).toBe(120);
    expect(result.data.generation_source).toBe("rule_based");
    expect(result.data.ai_status).toBe("not_configured");
    expect(result.data.items.map((item) => item.type)).toEqual([
      "place_visit",
      "event_attend"
    ]);
  });

  it("mock client produces identical plans for identical preferences", async () => {
    const mockClient = createMockClient({ actorId: "user_001" });
    const preference: NewResidentPreference = {
      preferred_language: "en",
      interests: ["family-kids", "outdoor-sports"],
      arrival_context: "first-month",
      household_type: "family-with-kids",
      accessibility_needs: []
    };

    const first = await mockClient.communityPlan.generate(preference);
    const second = await mockClient.communityPlan.generate(preference);

    expect(first.data.plan_id).toBe(second.data.plan_id);
    expect(first.data.items.map((item) => item.ref_id)).toEqual(
      second.data.items.map((item) => item.ref_id)
    );
  });

  it("http client posts preferences to /community-plan/generate", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_plan_001",
      data: {
        plan_id: "plan_http_001",
        community_id: "tongzilin",
        generated_at: "2027-04-02T09:00:00+08:00",
        items: [],
        total_duration_minutes: 120,
        route_kind: "place_event",
        generation_source: "rule_based",
        ai_status: "not_configured",
        generated_by: "tongzilin-rule-engine-v1"
      }
    }));
    const httpClient = createHttpClient({
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    const preference: NewResidentPreference = {
      preferred_language: "zh",
      interests: ["social"],
      arrival_context: "first-week",
      household_type: "solo",
      accessibility_needs: []
    };

    const result = await httpClient.communityPlan.generate(preference);

    expect(result.success).toBe(true);
    expect(result.data.plan_id).toBe("plan_http_001");
    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/community-plan/generate",
      preference,
      undefined
    );
  });

  it("http client communityPlan.generate does not send a mock actor header by default", async () => {
    const requester = vi.fn(async () => ({
      success: true,
      requestId: "req_plan_guest",
      data: {
        plan_id: "plan_guest_001",
        community_id: "tongzilin",
        generated_at: "2027-04-02T09:00:00+08:00",
        items: [],
        total_duration_minutes: 120,
        route_kind: "place_event",
        generation_source: "rule_based",
        ai_status: "not_configured",
        generated_by: "tongzilin-rule-engine-v1"
      }
    }));
    const httpClient = createHttpClient({
      baseUrl: "http://localhost:8787",
      requester: requester as unknown as HttpRequester
    });

    await httpClient.communityPlan.generate({
      preferred_language: "zh",
      interests: ["social"],
      arrival_context: "first-week",
      household_type: "solo",
      accessibility_needs: []
    });

    expect(requester).toHaveBeenCalledWith(
      "POST",
      "http://localhost:8787/community-plan/generate",
      expect.objectContaining({ preferred_language: "zh" }),
      undefined
    );
  });
});
