import type {
  ApiResult,
  EventRegistration,
  PageResult
} from "@community-map/shared";
import { describe, expect, it, vi } from "vitest";

import { loadEventIndexData } from "./event-index-loader";

const emptyEvents: ApiResult<PageResult<never>> = {
  success: true,
  data: {
    items: [],
    page: 1,
    pageSize: 50,
    total: 0
  },
  requestId: "req_events"
};

const emptyRegistrations: ApiResult<EventRegistration[]> = {
  success: true,
  data: [],
  requestId: "req_registrations"
};

describe("event index loader", () => {
  it("does not request registrations for an anonymous visitor", async () => {
    const list = vi.fn().mockResolvedValue(emptyEvents);
    const myRegistrations = vi
      .fn()
      .mockRejectedValue(new Error("Authentication is required."));

    await expect(
      loadEventIndexData({
        api: { events: { list, myRegistrations } },
        authenticated: false,
        query: { communityId: "tongzilin", pageSize: 50 }
      })
    ).resolves.toEqual({ events: [], registrations: [] });

    expect(list).toHaveBeenCalledWith({
      communityId: "tongzilin",
      pageSize: 50
    });
    expect(myRegistrations).not.toHaveBeenCalled();
  });

  it("loads registrations for an authenticated visitor", async () => {
    const list = vi.fn().mockResolvedValue(emptyEvents);
    const myRegistrations = vi.fn().mockResolvedValue(emptyRegistrations);

    await expect(
      loadEventIndexData({
        api: { events: { list, myRegistrations } },
        authenticated: true,
        query: { communityId: "tongzilin", pageSize: 50 }
      })
    ).resolves.toEqual({ events: [], registrations: [] });

    expect(list).toHaveBeenCalledOnce();
    expect(myRegistrations).toHaveBeenCalledOnce();
  });
});
