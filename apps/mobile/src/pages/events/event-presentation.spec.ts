import type { Event } from "@community-map/shared";
import { describe, expect, it } from "vitest";

import {
  formatEventCapacity,
  formatEventTimeRange,
  resolveEventAddress,
  resolveEventCoverSource,
  resolveEventCoverUrl
} from "./event-presentation";

const event = {
  address_text: "旧中文地址",
  address_zh: "桐梓林社区中心",
  address_en: "Tongzilin Community Center"
} as Event;

describe("event presentation", () => {
  it("selects bilingual addresses and preserves legacy fallback metadata", () => {
    expect(resolveEventAddress(event, "en")).toMatchObject({
      value: "Tongzilin Community Center",
      usedFallback: false,
      resolvedLocale: "en"
    });
    expect(
      resolveEventAddress({ ...event, address_en: "" }, "en")
    ).toMatchObject({
      value: "桐梓林社区中心",
      usedFallback: true,
      resolvedLocale: "zh"
    });
    expect(
      resolveEventAddress(
        { ...event, address_zh: undefined, address_en: "" },
        "en"
      ).value
    ).toBe("旧中文地址");
  });

  it("formats locale-aware date ranges and capacities", () => {
    expect(
      formatEventTimeRange(
        "en",
        "2030-04-02T10:00:00+08:00",
        "2030-04-02T12:00:00+08:00"
      )
    ).toMatch(/Apr|April/);
    expect(formatEventCapacity("en", "{count} spots", 1234)).toBe(
      "1,234 spots"
    );
  });

  it("does not request known mock placeholder covers", () => {
    expect(
      resolveEventCoverUrl("https://example.com/public/events/event_001/cover.jpg")
    ).toBeNull();
    expect(resolveEventCoverUrl("https://cdn.example.org/cover.jpg")).toBe(
      "https://cdn.example.org/cover.jpg"
    );
  });

  it("prefers CloudBase file ids in mini programs and falls back to HTTPS", () => {
    const coveredEvent = {
      cover_file_id: "cloud://env.bucket/public/events/event_001/cover.jpg",
      cover_url: "https://cdn.example.org/cover.jpg"
    };

    expect(
      resolveEventCoverSource(coveredEvent, { preferCloudFileId: true })
    ).toBe(coveredEvent.cover_file_id);
    expect(
      resolveEventCoverSource(coveredEvent, {
        preferCloudFileId: true,
        failedSources: [coveredEvent.cover_file_id]
      })
    ).toBe(coveredEvent.cover_url);
    expect(
      resolveEventCoverSource(coveredEvent, {
        preferCloudFileId: true,
        failedSources: [coveredEvent.cover_file_id, coveredEvent.cover_url]
      })
    ).toBeNull();
  });

  it("uses only HTTPS covers outside the mini program", () => {
    const coveredEvent = {
      cover_file_id: "cloud://env.bucket/public/events/event_001/cover.jpg",
      cover_url: "https://cdn.example.org/cover.jpg"
    };

    expect(
      resolveEventCoverSource(coveredEvent, { preferCloudFileId: false })
    ).toBe(coveredEvent.cover_url);
  });

  it("keeps cover failure state isolated per event", () => {
    const firstEvent = {
      cover_file_id: "cloud://env.bucket/public/events/first/cover.jpg",
      cover_url: "https://cdn.example.org/first.jpg"
    };
    const secondEvent = {
      cover_file_id: "cloud://env.bucket/public/events/second/cover.jpg",
      cover_url: "https://cdn.example.org/second.jpg"
    };
    const failures = {
      first: [firstEvent.cover_file_id],
      second: []
    };

    expect(
      resolveEventCoverSource(firstEvent, {
        preferCloudFileId: true,
        failedSources: failures.first
      })
    ).toBe(firstEvent.cover_url);
    expect(
      resolveEventCoverSource(secondEvent, {
        preferCloudFileId: true,
        failedSources: failures.second
      })
    ).toBe(secondEvent.cover_file_id);
  });
});
