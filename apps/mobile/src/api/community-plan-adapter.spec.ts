import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiClientError,
  createCompetitionDemoEngineInput,
  enumerateCommunityPlanScenarios,
  generateCommunityPlan,
  generateJudgeScenarioPlan,
  type NewResidentPreference
} from "@community-map/shared";

import {
  generateCommunityPlanForGuest,
  INITIAL_GENERATION_STATE
} from "./community-plan-adapter";

const clientMode = vi.hoisted(() => ({ usesLocalMatcher: false }));

vi.mock("./client", () => ({
  createMobileGuestClient: vi.fn(),
  get mobileGuestUsesLocalMatcher() {
    return clientMode.usesLocalMatcher;
  }
}));

import { createMobileGuestClient } from "./client";

const validPreference: NewResidentPreference = {
  preferred_language: "zh",
  primary_interest: "community-service",
  arrival_context: "first-week",
  household_type: "solo",
  accessibility_need: "none"
};

const fakePlan = generateJudgeScenarioPlan(0);

beforeEach(() => {
  vi.clearAllMocks();
  clientMode.usesLocalMatcher = false;
});

describe("community-plan adapter", () => {
  it("keeps API and local semantic fingerprints equal for all 576 preferences", async () => {
    const fingerprint = (plan: typeof fakePlan) => ({
      scenario_key: plan.scenario_key,
      catalog_version: plan.catalog_version,
      selection_explanation: plan.selection_explanation,
      items: plan.items.map((item) => ({
        ref_id: item.ref_id,
        ref_type: item.ref_type,
        summary_zh: item.summary_zh,
        summary_en: item.summary_en,
        tips_zh: item.tips_zh,
        tips_en: item.tips_en
      }))
    });

    for (const preference of enumerateCommunityPlanScenarios()) {
      const apiPlan = generateCommunityPlan(
        createCompetitionDemoEngineInput(preference)
      );
      vi.mocked(createMobileGuestClient).mockReturnValueOnce({
        communityPlan: {
          generate: vi.fn().mockResolvedValue({
            success: true,
            data: apiPlan,
            requestId: "req_parity"
          })
        }
      } as never);
      const online = await generateCommunityPlanForGuest(preference);

      vi.mocked(createMobileGuestClient).mockReturnValueOnce({
        communityPlan: {
          generate: vi.fn().mockRejectedValue(new TypeError("offline"))
        }
      } as never);
      const offline = await generateCommunityPlanForGuest(preference);

      expect(online.deliveryMode).toBe("online");
      expect(offline.deliveryMode).toBe("offline");
      expect(fingerprint(offline.plan as typeof fakePlan)).toEqual(
        fingerprint(online.plan as typeof fakePlan)
      );
    }
  });

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
    expect(state.deliveryMode).toBe("online");
    expect(state.errorKey).toBeNull();
    expect(state.requestId).toBe("req_1");
    expect(mockGenerate).toHaveBeenCalledWith(validPreference);
  });

  it("labels mock-mode local matching as offline delivery", async () => {
    clientMode.usesLocalMatcher = true;

    const state = await generateCommunityPlanForGuest(validPreference);

    expect(state.status).toBe("success");
    expect(state.plan?.scenario_key).toBe(fakePlan.scenario_key);
    expect(state.deliveryMode).toBe("offline");
    expect(createMobileGuestClient).not.toHaveBeenCalled();
  });

  it("returns validation_error state for 400 VALIDATION_ERROR", async () => {
    const error = new ApiClientError(
      {
        code: "VALIDATION_ERROR",
        message: "primary_interest is required",
        details: { field: "primary_interest" }
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
    expect(state.deliveryMode).toBe("online");
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
    expect(state.plan?.scenario_key).toBe(fakePlan.scenario_key);
    expect(state.plan?.selection_explanation).toEqual(
      fakePlan.selection_explanation
    );
    expect(state.deliveryMode).toBe("offline");
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
    expect(state.plan?.scenario_key).toBe(fakePlan.scenario_key);
    expect(state.plan?.items).toEqual(fakePlan.items);
    expect(state.deliveryMode).toBe("offline");
    expect(state.errorKey).toBeNull();
  });

  it("exposes an initial loading state constant for the UI", () => {
    expect(INITIAL_GENERATION_STATE.status).toBe("loading");
    expect(INITIAL_GENERATION_STATE.plan).toBeNull();
    expect(INITIAL_GENERATION_STATE.deliveryMode).toBe("online");
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
      expect(state.deliveryMode).toBe("online");
    }
  );
});
