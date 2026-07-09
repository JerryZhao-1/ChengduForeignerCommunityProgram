import { describe, expect, it } from "vitest";

import {
  API_ERROR_CODES,
  FILE_PATH_RULES,
  createMockDataset,
  createMockService,
  isMockServiceError
} from "../src";

const expectMockError = (
  action: () => unknown,
  code: string,
  status: number
) => {
  try {
    action();
  } catch (error) {
    expect(isMockServiceError(error)).toBe(true);
    if (isMockServiceError(error)) {
      expect(error.code).toBe(code);
      expect(error.status).toBe(status);
    }
    return;
  }

  throw new Error(`Expected ${code} mock error.`);
};

describe("launch-readiness shared mock fixtures", () => {
  it("seeds deterministic actors, states, files, notifications, and error codes", () => {
    const dataset = createMockDataset();

    expect(
      dataset.users.find((user) => user._id === "user_001")?.role_flags
    ).toEqual(expect.arrayContaining(["community_admin", "system_admin"]));
    expect(
      dataset.users.find((user) => user._id === "user_002")?.role_flags
    ).not.toContain("community_admin");
    expect(
      dataset.users.find((user) => user._id === "user_inactive")?.status
    ).toBe("inactive");
    expect(dataset.events.map((event) => event._id)).toEqual(
      expect.arrayContaining([
        "event_001",
        "event_draft",
        "event_full",
        "event_closed"
      ])
    );
    expect(dataset.posts.map((post) => post._id)).toEqual(
      expect.arrayContaining(["post_001", "post_hidden", "post_deleted"])
    );
    expect(dataset.notifications.map((item) => item.user_id)).toEqual(
      expect.arrayContaining(["user_001", "user_002"])
    );
    expect(dataset.fileAssets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file_id: "cloud://private-ticket-001",
          visibility: "private",
          uploaded_by: "user_001"
        })
      ])
    );
    expect(API_ERROR_CODES).toEqual(
      expect.arrayContaining([
        "UNAUTHORIZED",
        "FORBIDDEN",
        "NOT_FOUND",
        "CONFLICT"
      ])
    );
  });

  it("enforces public visibility and actor ownership in the shared mock service", () => {
    const service = createMockService();

    const events = service.events.list({
      communityId: "tongzilin",
      pageSize: 20
    });
    expect(events.items.map((event) => event._id)).toContain("event_001");
    expect(events.items.map((event) => event._id)).not.toContain("event_draft");
    expect(service.events.detail("event_draft")).toBeNull();

    const posts = service.posts.list({
      communityId: "tongzilin",
      pageSize: 20
    });
    expect(posts.items.map((post) => post._id)).toEqual([
      "post_007",
      "post_006",
      "post_005",
      "post_004",
      "post_003",
      "post_002",
      "post_001"
    ]);
    expect(service.posts.detail("post_hidden")).toBeNull();

    expect(
      service.notifications.list("user_001").map((item) => item._id)
    ).toEqual(["notification_001"]);
    expect(
      service.notifications.markRead("notification_002", "user_001")
    ).toBeNull();

    expectMockError(() => service.auth.me("missing_user"), "UNAUTHORIZED", 401);
    expectMockError(
      () =>
        service.files.privateUrl(
          { file_id: "cloud://private-ticket-001" },
          "user_002"
        ),
      "FORBIDDEN",
      403
    );

    const upload = service.files.createUploadRequest({
      biz_type: "post_image",
      biz_id: "post_001",
      file_name: "image.jpg",
      target_prefix: FILE_PATH_RULES.postImages
    });
    const asset = service.files.complete(
      {
        biz_type: "post_image",
        biz_id: "post_001",
        file_id: "cloud://public/posts/post_001/image.jpg",
        cloud_path: upload.cloud_path,
        visibility: "public"
      },
      "user_002"
    );

    expect(asset).toMatchObject({
      visibility: "public",
      biz_type: "post_image",
      biz_id: "post_001",
      uploaded_by: "user_002",
      status: "active"
    });
  });

  it("classifies profile video posts from media URLs instead of tags", () => {
    const dataset = createMockDataset();
    const service = createMockService({
      posts: [
        ...dataset.posts,
        {
          ...dataset.posts[1],
          _id: "post_media_video",
          author_user_id: "user_002",
          tag_ids: ["coffee"],
          image_urls: ["https://example.com/uploads/community-clip.mp4"],
          image_file_ids: []
        }
      ]
    });

    const profile = service.posts.profile("user_002", "user_001");

    expect(profile?.video_posts.map((post) => post._id)).toContain(
      "post_media_video"
    );
    expect(profile?.stats.video_post_count).toBe(
      profile?.video_posts.length
    );
  });

  it("exposes admin event rows with management states and ticket joins", () => {
    const service = createMockService();

    const adminEvents = service.events.listAdmin();
    const adminIds = adminEvents.items.map((event) => event._id);
    const publicIds = service.events
      .list({ communityId: "tongzilin", pageSize: 20 })
      .items.map((event) => event._id);
    const fullEvent = adminEvents.items.find(
      (event) => event._id === "event_full"
    );
    const draftEvent = adminEvents.items.find(
      (event) => event._id === "event_draft"
    );
    const registrations = service.events.listRegistrationsForAdmin("event_001");

    expect(adminIds).toEqual(
      expect.arrayContaining([
        "event_001",
        "event_draft",
        "event_pending",
        "event_offline",
        "event_ended"
      ])
    );
    expect(publicIds).not.toEqual(
      expect.arrayContaining([
        "event_draft",
        "event_pending",
        "event_offline",
        "event_ended"
      ])
    );
    expect(draftEvent).toMatchObject({
      review_status: "draft",
      publish_status: "draft",
      active_registration_count: 0,
      confirmed_attendee_count: 0,
      remaining_capacity: 20,
      is_full: false
    });
    expect(fullEvent).toMatchObject({
      active_registration_count: 1,
      confirmed_attendee_count: 2,
      remaining_capacity: 0,
      is_full: true
    });
    expect(registrations).toEqual([
      expect.objectContaining({
        _id: "reg_001",
        contact_name: "Jerry",
        ticket_id: "ticket_001",
        ticket_code: "TZL-20260402-001",
        ticket_status: "valid",
        ticket_used_at: null
      })
    ]);
    expect(
      service.events.listRegistrationsForAdmin("event_missing")
    ).toBeNull();
  });

  it("hard deletes events without cascading registrations or tickets", () => {
    const service = createMockService();

    expect(
      service.events
        .list({ communityId: "tongzilin", pageSize: 20 })
        .items.map((event) => event._id)
    ).toContain("event_001");
    expect(service.events.delete("event_missing")).toBeNull();

    const result = service.events.delete("event_001");

    expect(result).toEqual({ deleted_id: "event_001" });
    expect(service.events.detail("event_001")).toBeNull();
    expect(
      service.events
        .listAdmin()
        .items.map((event) => event._id)
    ).not.toContain("event_001");
    expect(
      service.events
        .list({ communityId: "tongzilin", pageSize: 20 })
        .items.map((event) => event._id)
    ).not.toContain("event_001");
    expect(service.events.listRegistrationsForAdmin("event_001")).toBeNull();
    expect(
      service.events
        .listMyRegistrations("user_001")
        .map((registration) => registration._id)
    ).toContain("reg_001");
    expect(
      service.events.getTicketByRegistration("reg_001", "user_001")?._id
    ).toBe("ticket_001");
  });
});
