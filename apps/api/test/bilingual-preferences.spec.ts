import { createServer } from "node:http";

import { createMockService } from "@community-map/shared";
import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app";
import { createCloudbaseProvider } from "../src/providers/cloudbase";
import { createMockProvider } from "../src/providers/mock";

const servers: Array<ReturnType<typeof createServer>> = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        })
    )
  );
});

const startApi = async () => {
  const server = createServer(createApp("mock").callback());
  servers.push(server);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start test API.");
  }
  return `http://127.0.0.1:${address.port}`;
};

const actorHeaders = (actorId: string) => ({
  "content-type": "application/json",
  "x-mock-user-id": actorId
});

describe("authenticated locale preferences", () => {
  it("round-trips two actors independently through standard API envelopes", async () => {
    const baseUrl = await startApi();

    const user1Update = await fetch(`${baseUrl}/auth/preferences`, {
      method: "PATCH",
      headers: actorHeaders("user_001"),
      body: JSON.stringify({ preferred_language: "en" })
    });
    const user2Update = await fetch(`${baseUrl}/auth/preferences`, {
      method: "PATCH",
      headers: actorHeaders("user_002"),
      body: JSON.stringify({ preferred_language: "zh" })
    });
    const user1Read = await fetch(`${baseUrl}/auth/preferences`, {
      headers: actorHeaders("user_001")
    });
    const user2Read = await fetch(`${baseUrl}/auth/preferences`, {
      headers: actorHeaders("user_002")
    });

    expect(user1Update.status).toBe(200);
    expect(user2Update.status).toBe(200);
    expect(await user1Read.json()).toMatchObject({
      success: true,
      data: { preferred_language: "en" }
    });
    expect(await user2Read.json()).toMatchObject({
      success: true,
      data: { preferred_language: "zh" }
    });
  });

  it("accepts uni-app's POST transport with a PATCH method override", async () => {
    const baseUrl = await startApi();
    const response = await fetch(`${baseUrl}/auth/preferences`, {
      method: "POST",
      headers: {
        ...actorHeaders("user_001"),
        "x-http-method-override": "PATCH"
      },
      body: JSON.stringify({ preferred_language: "en" })
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: { preferred_language: "en" }
    });
  });

  it("rejects unauthenticated and unsupported locale preference requests", async () => {
    const baseUrl = await startApi();
    const unauthenticated = await fetch(`${baseUrl}/auth/preferences`);
    const invalid = await fetch(`${baseUrl}/auth/preferences`, {
      method: "PATCH",
      headers: actorHeaders("user_001"),
      body: JSON.stringify({ preferred_language: "fr" })
    });
    const invalidBody = await invalid.json();

    expect(unauthenticated.status).toBe(401);
    expect(invalid.status).toBe(400);
    expect(invalidBody).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" }
    });
  });

  it("does not overwrite a stored preference when login omits the field", async () => {
    const provider = createMockProvider();
    await provider.auth.updatePreferences("user_001", "en");
    const session = await provider.auth.login({ mock_user_id: "user_001" });
    expect(session.user.preferred_language).toBe("en");
  });
});

describe("bilingual provider normalization", () => {
  it("normalizes legacy Event addresses in mock and CloudBase fallback adapters", async () => {
    const previousMode = process.env.CLOUDBASE_PROVIDER_MODE;
    const previousEnv = process.env.CLOUDBASE_ENV_ID;
    delete process.env.CLOUDBASE_PROVIDER_MODE;
    delete process.env.CLOUDBASE_ENV_ID;
    try {
      const mock = createMockProvider();
      const cloudbase = createCloudbaseProvider();
      const [mockEvents, cloudbaseEvents] = await Promise.all([
        mock.events.list({ communityId: "tongzilin", pageSize: 10 }),
        cloudbase.events.list({ communityId: "tongzilin", pageSize: 10 })
      ]);

      for (const result of [mockEvents, cloudbaseEvents]) {
        const event = result.items.find((item) => item._id === "event_001");
        expect(event).toMatchObject({
          address_text: "桐梓林社区中心一楼活动厅",
          address_zh: "桐梓林社区中心一楼活动厅",
          address_en: "Tongzilin Community Center, First-floor Event Hall"
        });
      }
    } finally {
      if (previousMode === undefined) {
        delete process.env.CLOUDBASE_PROVIDER_MODE;
      } else {
        process.env.CLOUDBASE_PROVIDER_MODE = previousMode;
      }
      if (previousEnv === undefined) {
        delete process.env.CLOUDBASE_ENV_ID;
      } else {
        process.env.CLOUDBASE_ENV_ID = previousEnv;
      }
    }
  });

  it("writes bilingual system notifications and preserves legacy ownership/read state", () => {
    const service = createMockService();
    service.posts.createComment(
      "post_001",
      { content: "Thanks for sharing", language: "en" },
      "user_002"
    );

    const user1Notifications = service.notifications.list("user_001");
    const generated = user1Notifications[0];
    const legacy = service.notifications.list("user_002").find(
      (item) => item._id === "notification_002"
    );

    expect(generated).toMatchObject({
      title_zh: "帖子收到新评论",
      title_en: "New Comment on Your Post"
    });
    expect(generated.body_zh).toContain("评论了你的帖子");
    expect(generated.body_en).toContain("commented on your post");
    expect(legacy).toMatchObject({
      title: "Comment reply",
      title_zh: null,
      title_en: null
    });
    expect(
      service.notifications.markRead("notification_002", "user_001")
    ).toBeNull();
    expect(
      service.notifications.markRead("notification_002", "user_002")?.status
    ).toBe("read");
  });
});
