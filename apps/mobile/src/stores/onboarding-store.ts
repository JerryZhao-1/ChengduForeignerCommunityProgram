import { reactive, readonly } from "vue";

import {
  COMMUNITY_PLAN_ACCESSIBILITY_NEEDS,
  COMMUNITY_PLAN_ARRIVAL_CONTEXTS,
  COMMUNITY_PLAN_HOUSEHOLD_TYPES,
  COMMUNITY_PLAN_INTERESTS,
  type CommunityPlanAccessibilityNeed,
  type CommunityPlanArrivalContext,
  type CommunityPlanHouseholdType,
  type CommunityPlanInterest,
  type CommunityPlanItem,
  type CommunityPlan,
  type NewResidentPreference
} from "@community-map/shared";

import type { CommunityPlanErrorKey } from "../api/community-plan-adapter";
import type { DeliveryMode } from "../api/community-plan-adapter";
import type { MobileLocale } from "../i18n/localized";

export type OnboardingStep =
  | "welcome"
  | "preferences-1"
  | "preferences-2"
  | "preferences-3"
  | "preferences-4"
  | "generating"
  | "plan"
  | "route-map"
  | "complete";

export type LocalPlanItemStatus =
  | "pending"
  | "visited"
  | "demo_confirmed"
  | "unavailable";

export interface OnboardingPreferenceDraft {
  preferred_language: MobileLocale;
  communityId: string;
  primary_interest: CommunityPlanInterest | null;
  arrival_context: CommunityPlanArrivalContext | null;
  household_type: CommunityPlanHouseholdType | null;
  accessibility_need: CommunityPlanAccessibilityNeed | null;
}

export interface OnboardingState {
  step: OnboardingStep;
  draft: OnboardingPreferenceDraft;
  plan: CommunityPlan | null;
  itemStatuses: Record<string, LocalPlanItemStatus>;
  planDeliveryMode: DeliveryMode;
  planErrorKey: CommunityPlanErrorKey | null;
  planErrorRequestId: string | null;
}

export interface CompletionProgress {
  visitedPlaces: number;
  availablePlaces: number;
  confirmedEvents: number;
  totalEvents: number;
  canFinish: boolean;
}

export const EXAMPLE_PREFERENCE: OnboardingPreferenceDraft = {
  preferred_language: "zh",
  communityId: "tongzilin",
  primary_interest: "community-service",
  arrival_context: "first-week",
  household_type: "solo",
  accessibility_need: "none"
};

const PREFERENCE_STEPS: OnboardingStep[] = [
  "preferences-1",
  "preferences-2",
  "preferences-3",
  "preferences-4"
];

const createInitialDraft = (): OnboardingPreferenceDraft => ({
  preferred_language: "zh",
  communityId: "tongzilin",
  primary_interest: null,
  arrival_context: null,
  household_type: null,
  accessibility_need: null
});

const createInitialState = (): OnboardingState => ({
  step: "welcome",
  draft: createInitialDraft(),
  plan: null,
  itemStatuses: {},
  planDeliveryMode: "online",
  planErrorKey: null,
  planErrorRequestId: null
});

const state = reactive<OnboardingState>(createInitialState());

export const getCompletionProgress = (currentState: {
  readonly plan: { readonly items: readonly CommunityPlanItem[] } | null;
  readonly itemStatuses: Readonly<Record<string, LocalPlanItemStatus>>;
}): CompletionProgress => {
  const items = currentState.plan?.items ?? [];
  const placeItems = items.filter((item) => item.type === "place_visit");
  const availablePlaces = placeItems.filter(
    (item) => currentState.itemStatuses[item.item_id] !== "unavailable"
  );
  const visitedPlaces = availablePlaces.filter(
    (item) => currentState.itemStatuses[item.item_id] === "visited"
  );
  const eventItems = items.filter((item) => item.type === "event_attend");
  const confirmedEvents = eventItems.filter(
    (item) => currentState.itemStatuses[item.item_id] === "demo_confirmed"
  );

  return {
    visitedPlaces: visitedPlaces.length,
    availablePlaces: availablePlaces.length,
    confirmedEvents: confirmedEvents.length,
    totalEvents: eventItems.length,
    canFinish:
      items.length > 0 &&
      visitedPlaces.length === availablePlaces.length &&
      confirmedEvents.length === eventItems.length
  };
};

export const useOnboardingStore = () => {
  const goToStep = (step: OnboardingStep) => {
    state.step = step;
  };

  const startOnboarding = () => {
    state.step = "preferences-1";
    state.draft = createInitialDraft();
    state.plan = null;
    state.itemStatuses = {};
    state.planDeliveryMode = "online";
    state.planErrorKey = null;
    state.planErrorRequestId = null;
  };

  const useExamplePreference = () => {
    state.draft = { ...EXAMPLE_PREFERENCE };
    state.step = "preferences-4";
  };

  const nextStep = () => {
    const currentIndex = PREFERENCE_STEPS.indexOf(state.step);
    if (currentIndex === -1 || currentIndex >= PREFERENCE_STEPS.length - 1) {
      return;
    }
    state.step = PREFERENCE_STEPS[currentIndex + 1];
  };

  const previousStep = () => {
    const currentIndex = PREFERENCE_STEPS.indexOf(state.step);
    if (currentIndex > 0) {
      state.step = PREFERENCE_STEPS[currentIndex - 1];
    } else if (currentIndex === 0) {
      state.step = "welcome";
    }
  };

  const updateDraft = (partial: Partial<OnboardingPreferenceDraft>) => {
    state.draft = { ...state.draft, ...partial };
  };

  const setPlan = (plan: CommunityPlan, deliveryMode: DeliveryMode) => {
    state.plan = plan;
    state.itemStatuses = Object.fromEntries(
      plan.items.map((item) => [item.item_id, "pending" as const])
    );
    state.planDeliveryMode = deliveryMode;
    state.planErrorKey = null;
    state.planErrorRequestId = null;
    state.step = "plan";
  };

  const setGenerationError = (
    errorKey: CommunityPlanErrorKey,
    requestId: string | null
  ) => {
    state.planErrorKey = errorKey;
    state.planErrorRequestId = requestId;
    state.step = "preferences-4";
  };

  const setGenerating = () => {
    state.step = "generating";
    state.planErrorKey = null;
    state.planErrorRequestId = null;
  };

  const markPlaceVisited = (itemId: string) => {
    const item = state.plan?.items.find(
      (candidate) => candidate.item_id === itemId
    );
    if (item?.type === "place_visit") {
      state.itemStatuses[itemId] = "visited";
    }
  };

  const markPlaceUnavailable = (itemId: string) => {
    const item = state.plan?.items.find(
      (candidate) => candidate.item_id === itemId
    );
    if (item?.type === "place_visit") {
      state.itemStatuses[itemId] = "unavailable";
    }
  };

  const confirmDemoEvent = (itemId: string) => {
    const item = state.plan?.items.find(
      (candidate) => candidate.item_id === itemId
    );
    if (item?.type === "event_attend") {
      state.itemStatuses[itemId] = "demo_confirmed";
    }
  };

  const finish = () => {
    if (!getCompletionProgress(state).canFinish) {
      return false;
    }
    state.step = "complete";
    return true;
  };

  const reset = () => {
    Object.assign(state, createInitialState());
  };

  return {
    state: readonly(state),
    goToStep,
    startOnboarding,
    useExamplePreference,
    nextStep,
    previousStep,
    updateDraft,
    setPlan,
    setGenerationError,
    setGenerating,
    markPlaceVisited,
    markPlaceUnavailable,
    confirmDemoEvent,
    finish,
    reset
  };
};

export const isPreferenceComplete = (
  draft: OnboardingPreferenceDraft
): boolean =>
  draft.primary_interest !== null &&
  draft.arrival_context !== null &&
  draft.household_type !== null &&
  draft.accessibility_need !== null;

export const buildPreferenceFromDraft = (
  draft: OnboardingPreferenceDraft
): NewResidentPreference => ({
  preferred_language: draft.preferred_language,
  primary_interest: draft.primary_interest as CommunityPlanInterest,
  arrival_context: draft.arrival_context as CommunityPlanArrivalContext,
  household_type: draft.household_type as CommunityPlanHouseholdType,
  accessibility_need:
    draft.accessibility_need as CommunityPlanAccessibilityNeed
});

export const INTEREST_OPTIONS = COMMUNITY_PLAN_INTERESTS;
export const ARRIVAL_CONTEXT_OPTIONS = COMMUNITY_PLAN_ARRIVAL_CONTEXTS;
export const HOUSEHOLD_TYPE_OPTIONS = COMMUNITY_PLAN_HOUSEHOLD_TYPES;
export const ACCESSIBILITY_NEED_OPTIONS = COMMUNITY_PLAN_ACCESSIBILITY_NEEDS;

export const resetOnboardingStoreForTests = () => {
  Object.assign(state, createInitialState());
};
