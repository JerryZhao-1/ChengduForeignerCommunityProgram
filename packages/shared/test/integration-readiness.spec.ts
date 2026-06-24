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

    expect(dataset.users.find((user) => user._id === "user_001")?.role_flags).toEqual(
      expect.arrayContaining(["community_admin", "system_admin"])
    );
    expect(dataset.users.find((user) => user._id === "user_002")?.role_flags).not.toContain(
      "community_admin"
    );
    expect(dataset.users.find((user) => user._id === "user_inactive")?.status).toBe(
      "inactive"
    );
    expect(dataset.events.map((event) => event._id)).toEqual(
      expect.arrayContaining(["event_001", "event_draft", "event_full", "event_closed"])
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
      expect.arrayContaining(["UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "CONFLICT"])
    );
  });

  it("enforces public visibility and actor ownership in the shared mock service", () => {
    const service = createMockService();

    const events = service.events.list({ communityId: "tongzilin", pageSize: 20 });
    expect(events.items.map((event) => event._id)).toContain("event_001");
    expect(events.items.map((event) => event._id)).not.toContain("event_draft");
    expect(service.events.detail("event_draft")).toBeNull();

    const posts = service.posts.list({ communityId: "tongzilin", pageSize: 20 });
    expect(posts.items.map((post) => post._id)).toEqual(["post_001", "post_002"]);
    expect(service.posts.detail("post_hidden")).toBeNull();

    expect(service.notifications.list("user_001").map((item) => item._id)).toEqual([
      "notification_001"
    ]);
    expect(service.notifications.markRead("notification_002", "user_001")).toBeNull();

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
});
