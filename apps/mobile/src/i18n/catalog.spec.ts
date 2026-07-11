import { describe, expect, it } from "vitest";

import type { Event } from "@community-map/shared";
import { getEventSignupState } from "../pages/events/event-signup-state";

import { getMobileCopy, mobileCatalog } from "./catalog";
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  interpolate,
  pickLocalized,
  resolveLocalized
} from "./localized";

const leafPaths = (value: unknown, prefix = ""): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      leafPaths(item, `${prefix}[${index}]`)
    );
  }

  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      leafPaths(child, prefix ? `${prefix}.${key}` : key)
    );
  }

  return [prefix];
};

const eventFixture = (overrides: Partial<Event> = {}): Event => ({
  _id: "event_locale_001",
  community_id: "tongzilin",
  title_zh: "社区活动",
  title_en: "Community Event",
  summary_zh: "中文摘要",
  summary_en: "English summary",
  content_zh: "中文详情",
  content_en: "English details",
  cover_file_id: null,
  cover_cloud_path: null,
  cover_url: "https://example.com/event.jpg",
  address_text: "桐梓林社区中心",
  location: { latitude: 30.6, longitude: 104.06 },
  start_time: "2030-01-01T10:00:00.000Z",
  end_time: "2030-01-01T12:00:00.000Z",
  signup_deadline: "2029-12-31T10:00:00.000Z",
  capacity: 20,
  organizer_user_id: "user_001",
  review_status: "approved",
  publish_status: "published",
  ...overrides
});

describe("mobile locale catalog", () => {
  it("keeps recursive Chinese and English leaf-key parity", () => {
    expect(leafPaths(mobileCatalog.en).sort()).toEqual(
      leafPaths(mobileCatalog.zh).sort()
    );
    expect(getMobileCopy("en").places.detail.address).toBe("Address");
    expect(getMobileCopy("zh").discover.feedTitle).toBe("社区发现");
  });

  it("interpolates named values without removing unknown placeholders", () => {
    expect(interpolate("{count} spots for {name}", { count: 2, name: "Lee" }))
      .toBe("2 spots for Lee");
    expect(interpolate("Hello {missing}", {})).toBe("Hello {missing}");
  });
});

describe("localized formal content", () => {
  it("trims and selects the preferred language", () => {
    expect(resolveLocalized("en", { zh: " 中文 ", en: " English " })).toEqual({
      value: "English",
      requestedLocale: "en",
      resolvedLocale: "en",
      usedFallback: false,
      unavailable: false
    });
  });

  it("reports counterpart fallback in either direction", () => {
    expect(resolveLocalized("en", { zh: " 中文 ", en: "  " })).toMatchObject({
      value: "中文",
      resolvedLocale: "zh",
      usedFallback: true,
      unavailable: false
    });
    expect(resolveLocalized("zh", { zh: null, en: " English " })).toMatchObject({
      value: "English",
      resolvedLocale: "en",
      usedFallback: true,
      unavailable: false
    });
  });

  it("returns localized unavailable copy or an intentional empty optional value", () => {
    expect(resolveLocalized("en", { zh: "", en: "" }).value).toBe(
      "Unavailable"
    );
    expect(resolveLocalized("zh", {}, { optional: true }).value).toBe("");
    expect(
      pickLocalized("en", { zh: "", en: "" }, { unavailable: { en: "N/A" } })
    ).toBe("N/A");
  });

  it("formats dates and numbers with an explicit locale", () => {
    expect(
      formatLocalizedDate("en", "2030-01-02T00:00:00.000Z", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      })
    ).toMatch(/2030/);
    expect(formatLocalizedNumber("en", 1234)).toMatch(/1,234/);
  });
});

describe("domain codes remain separate from localized copy", () => {
  it("maps stable Event state codes through the active catalog", () => {
    const state = getEventSignupState(eventFixture(), new Date("2029-01-01"));
    expect(state).toEqual({ canSignup: true, code: "available" });
    expect(mobileCatalog.en.events.signupStates[state.code].label).toBe(
      "Register Now"
    );
    expect(mobileCatalog.zh.events.signupStates[state.code].label).toBe(
      "立即报名"
    );
  });

  it("keeps UGC content unchanged while localizing its language label", () => {
    const post = { title: "今晚有人打羽毛球吗？", language: "zh" as const };
    expect(post.title).toBe("今晚有人打羽毛球吗？");
    expect(mobileCatalog.en.discover.languageZh).toBe("Chinese");
  });
});
