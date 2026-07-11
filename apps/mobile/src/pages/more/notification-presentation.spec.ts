import type { Notification } from "@community-map/shared";
import { describe, expect, it } from "vitest";

import { resolveNotificationPresentation } from "./notification-presentation";

const notification = (overrides: Partial<Notification>): Notification => ({
  _id: "notification_001",
  user_id: "user_001",
  title: "Legacy title",
  body: "Legacy body",
  target_type: "event",
  post_id: null,
  comment_id: null,
  place_id: null,
  event_id: "event_001",
  report_id: null,
  status: "unread",
  created_at: "2026-03-28T10:05:00+08:00",
  ...overrides
});

describe("notification presentation", () => {
  it("selects bilingual notification copy by locale", () => {
    const result = resolveNotificationPresentation(
      notification({
        title_zh: "报名成功",
        title_en: "Registration Confirmed",
        body_zh: "报名成功。",
        body_en: "Registration succeeded."
      }),
      "en"
    );

    expect(result.title.value).toBe("Registration Confirmed");
    expect(result.body.value).toBe("Registration succeeded.");
    expect(result.title.usedLegacy).toBe(false);
  });

  it("preserves legacy notification copy without blank content", () => {
    const result = resolveNotificationPresentation(notification({}), "en");

    expect(result.title.value).toBe("Legacy title");
    expect(result.body.value).toBe("Legacy body");
    expect(result.title.usedLegacy).toBe(true);
  });
});
