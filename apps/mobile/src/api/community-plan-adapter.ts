import {
  ApiClientError,
  communityPlanOfflineBundle,
  type CommunityPlan,
  type NewResidentPreference
} from "@community-map/shared";

import {
  createMobileGuestClient,
  mobileGuestUsesOfflineBundle
} from "./client";

export type CommunityPlanGenerationStatus =
  | "loading"
  | "success"
  | "api_error"
  | "fallback";

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
  /** True when the plan came from the offline bundle rather than the API. */
  offline: boolean;
}

export const INITIAL_GENERATION_STATE: CommunityPlanGenerationState = {
  status: "loading",
  plan: null,
  errorKey: null,
  requestId: null,
  offline: false
};

/**
 * Generates a Community Plan through the guest judge client.
 *
 * State mapping:
 * - 200 from API → `status: "success"`, `offline: false`
 * - 400 VALIDATION_ERROR → `status: "validation_error"` with server message
 * - 401/403/404/5xx, transport failure, timeout → `status: "fallback"` using
 *   the canonical offline bundle so the judge demo never dead-ends. The UI
 *   surfaces an "offline demo" notice. Network errors that are clearly
 *   transient also surface `status: "network_error"` with a retry option
 *   when the caller distinguishes via `offline` === false.
 *
 * The adapter never throws — callers receive a normalized state object.
 */
export const generateCommunityPlanForGuest = async (
  preference: NewResidentPreference
): Promise<CommunityPlanGenerationState> => {
  if (mobileGuestUsesOfflineBundle) {
    return {
      status: "fallback",
      plan: communityPlanOfflineBundle.plan,
      errorKey: null,
      requestId: null,
      offline: true
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
        offline: false
      };
    }

    // Non-success envelopes from the guest client indicate a transport-level
    // issue; fall back to the offline bundle.
    return {
      status: "fallback",
      plan: communityPlanOfflineBundle.plan,
      errorKey: null,
      requestId: null,
      offline: true
    };
  } catch (error) {
    if (error instanceof ApiClientError) {
      if (error.status !== undefined && error.status >= 500) {
        return {
          status: "fallback",
          plan: communityPlanOfflineBundle.plan,
          errorKey: null,
          requestId: error.requestId ?? null,
          offline: true
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
        offline: false
      };
    }

    // Transport / network failure (DNS, timeout, CORS) → offline fallback.
    return {
      status: "fallback",
      plan: communityPlanOfflineBundle.plan,
      errorKey: null,
      requestId: null,
      offline: true
    };
  }
};
