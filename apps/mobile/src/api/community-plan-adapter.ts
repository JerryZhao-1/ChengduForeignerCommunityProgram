import {
  ApiClientError,
  createCompetitionDemoEngineInput,
  generateCommunityPlan,
  type CommunityPlan,
  type NewResidentPreference
} from "@community-map/shared";

import {
  createMobileGuestClient,
  mobileGuestUsesLocalMatcher
} from "./client";

export type CommunityPlanGenerationStatus =
  | "loading"
  | "success"
  | "api_error"
  | "fallback";

export type DeliveryMode = "online" | "offline";

export type CommunityPlanErrorKey =
  | "validationError"
  | "forbiddenError"
  | "notFoundError"
  | "conflictError"
  | "rateLimitedError"
  | "genericError";

export interface CommunityPlanGenerationState {
  status: CommunityPlanGenerationStatus;
  plan: CommunityPlan | null;
  errorKey: CommunityPlanErrorKey | null;
  requestId: string | null;
  deliveryMode: DeliveryMode;
}

export const INITIAL_GENERATION_STATE: CommunityPlanGenerationState = {
  status: "loading",
  plan: null,
  errorKey: null,
  requestId: null,
  deliveryMode: "online"
};

export const generateLocalCommunityPlan = (
  preference: NewResidentPreference
): CommunityPlan =>
  generateCommunityPlan(createCompetitionDemoEngineInput(preference));

/**
 * Generates a Community Plan through the guest judge client.
 *
 * State mapping:
 * - 200 from API → `status: "success"`, `deliveryMode: "online"`
 * - 400/403/404/409/429 → localized `status: "api_error"` without fallback
 * - 5xx, transport failure, or timeout → `status: "fallback"` using the
 *   canonical local matcher. The UI surfaces an "offline demo" notice.
 * The adapter never throws — callers receive a normalized state object.
 */
export const generateCommunityPlanForGuest = async (
  preference: NewResidentPreference
): Promise<CommunityPlanGenerationState> => {
  if (mobileGuestUsesLocalMatcher) {
    return {
      status: "success",
      plan: generateLocalCommunityPlan(preference),
      errorKey: null,
      requestId: null,
      deliveryMode: "offline"
    };
  }

  try {
    const client = createMobileGuestClient();
    const result = await client.communityPlan.generate(preference);

    if (result.success) {
      return {
        status: "success",
        plan: result.data,
        errorKey: null,
        requestId: result.requestId,
        deliveryMode: "online"
      };
    }

    // Non-success envelopes from the guest client indicate a transport-level
    // issue; fall back to the offline bundle.
    return {
      status: "fallback",
      plan: generateLocalCommunityPlan(preference),
      errorKey: null,
      requestId: null,
      deliveryMode: "offline"
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.status !== undefined && error.status >= 500) {
        return {
          status: "fallback",
          plan: generateLocalCommunityPlan(preference),
          errorKey: null,
          requestId: error.requestId ?? null,
          deliveryMode: "offline"
        };
      }

      const errorKeys: Partial<
        Record<typeof error.code, CommunityPlanErrorKey>
      > = {
        VALIDATION_ERROR: "validationError",
        FORBIDDEN: "forbiddenError",
        NOT_FOUND: "notFoundError",
        CONFLICT: "conflictError",
        RATE_LIMITED: "rateLimitedError"
      };
      return {
        status: "api_error",
        plan: null,
        errorKey: errorKeys[error.code] ?? "genericError",
        requestId: error.requestId ?? null,
        deliveryMode: "online"
      };
    }

    // Transport / network failure (DNS, timeout, CORS) → offline fallback.
    return {
      status: "fallback",
      plan: generateLocalCommunityPlan(preference),
      errorKey: null,
      requestId: null,
      deliveryMode: "offline"
    };
  }
};
