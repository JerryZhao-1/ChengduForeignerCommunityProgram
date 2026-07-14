import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiClientError,
  type NewResidentPreference
} from "@community-map/shared";

import {
  generateCommunityPlanForGuest,
  INITIAL_GENERATION_STATE
} from "./community-plan-adapter";

vi.mock("./client", () => ({
  createMobileGuestClient: vi.fn(),
  mobileGuestUsesOfflineBundle: false
}));

import { createMobileGuestClient } from "./client";

const validPreference: NewResidentPreference = {
  preferred_language: "zh",
  interests: ["community-service", "food-drink"],
  arrival_context: "first-week",
  household_type: "solo",
  accessibility_needs: []
};

const fakePlan = {
  plan_id: "plan_test",
  community_id: "tongzilin",
  generated_at: "2027-04-02T09:00:00+08:00",
  items: [],
  total_duration_minutes: 120,
  route_kind: "place_event",
  generation_source: "rule_based",
  ai_status: "not_configured",
  generated_by: "test-engine"
} as never;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("community-plan adapter", () => {
  it("returns success state when the API returns a valid plan", async () => {
    const mockGenerate = vi.fn().mockResolvedValue({
      success: true,
      data: fakePlan,
      requestId: "req_1"
    });
    vi.mocked(createMobileGuestClient).mockReturnValue({
      communityPlan: { generate: mockGenerate }
    } as never);

    const state = await generateCommunityPlanForGuest(validPreference);

    expect(state.status).toBe("success");
    expect(state.plan).toBe(fakePlan);
    expect(state.offline).toBe(false);
    expect(state.errorKey).toBeNull();
    expect(state.requestId).toBe("req_1");
    expect(mockGenerate).toHaveBeenCalledWith(validPreference);
  });

  it("returns validation_error state for 400 VALIDATION_ERROR", async () => {
    const error = new ApiClientError(
      {
        code: "VALIDATION_ERROR",
        message: "interests must not be empty",
        details: { field: "interests" }
      },
      { status: 400, requestId: "req_2" }
    );
    const mockGenerate = vi.fn().mockRejectedValue(error);
    vi.mocked(createMobileGuestClient).mockReturnValue({
      communityPlan: { generate: mockGenerate }
    } as never);

    const state = await generateCommunityPlanForGuest(validPreference);

    expect(state.status).toBe("api_error");
    expect(state.plan).toBeNull();
    expect(state.errorKey).toBe("validationError");
    expect(state.requestId).toBe("req_2");
    expect(state.offline).toBe(false);
  });

  it("falls back to the offline bundle on 5xx server errors", async () => {
    const error = new ApiClientError(
      { code: "UPSTREAM_ERROR", message: "Database unavailable" },
      { status: 503, requestId: "req_3" }
    );
    const mockGenerate = vi.fn().mockRejectedValue(error);
    vi.mocked(createMobileGuestClient).mockReturnValue({
      communityPlan: { generate: mockGenerate }
    } as never);

    const state = await generateCommunityPlanForGuest(validPreference);

    expect(state.status).toBe("fallback");
    expect(state.plan).not.toBeNull();
    expect(state.plan?.plan_id).toBe("offline_tongzilin_120");
    expect(state.offline).toBe(true);
    expect(state.errorKey).toBeNull();
  });

  it("falls back to the offline bundle on transport/network failures", async () => {
    const mockGenerate = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));
    vi.mocked(createMobileGuestClient).mockReturnValue({
      communityPlan: { generate: mockGenerate }
    } as never);

    const state = await generateCommunityPlanForGuest(validPreference);

    expect(state.status).toBe("fallback");
    expect(state.plan).not.toBeNull();
    expect(state.plan?.plan_id).toBe("offline_tongzilin_120");
    expect(state.offline).toBe(true);
    expect(state.errorKey).toBeNull();
  });

  it("exposes an initial loading state constant for the UI", () => {
    expect(INITIAL_GENERATION_STATE.status).toBe("loading");
    expect(INITIAL_GENERATION_STATE.plan).toBeNull();
    expect(INITIAL_GENERATION_STATE.offline).toBe(false);
  });

  it.each([
    [403, "FORBIDDEN", "forbiddenError"],
    [404, "NOT_FOUND", "notFoundError"],
    [409, "CONFLICT", "conflictError"],
    [429, "RATE_LIMITED", "rateLimitedError"]
  ] as const)(
    "keeps HTTP %s as a localized API error without offline fallback",
    async (status, code, errorKey) => {
      const mockGenerate = vi
        .fn()
        .mockRejectedValue(
          new ApiClientError(
            { code, message: "raw server text must not be rendered" },
            { status, requestId: "req_4xx" }
          )
        );
      vi.mocked(createMobileGuestClient).mockReturnValue({
        communityPlan: { generate: mockGenerate }
      } as never);

      const state = await generateCommunityPlanForGuest(validPreference);

      expect(state.status).toBe("api_error");
      expect(state.errorKey).toBe(errorKey);
      expect(state.plan).toBeNull();
      expect(state.offline).toBe(false);
    }
  );
});
