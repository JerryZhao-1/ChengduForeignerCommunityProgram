import { beforeEach, describe, expect, it, vi } from "vitest";

import { generateJudgeScenarioPlan } from "@community-map/shared";

import {
  buildPreferenceFromDraft,
  EXAMPLE_PREFERENCE,
  getCompletionProgress,
  isPreferenceComplete,
  resetOnboardingStoreForTests,
  useOnboardingStore
} from "./onboarding-store";

beforeEach(() => {
  resetOnboardingStoreForTests();
});

const examplePlan = generateJudgeScenarioPlan(0);

describe("onboarding store step navigation", () => {
  it("moves through preference steps and back to welcome", () => {
    const store = useOnboardingStore();
    store.startOnboarding();
    expect(store.state.step).toBe("preferences-1");

    store.nextStep();
    store.nextStep();
    store.nextStep();
    expect(store.state.step).toBe("preferences-4");

    store.previousStep();
    store.previousStep();
    store.previousStep();
    store.previousStep();
    expect(store.state.step).toBe("welcome");
  });

  it("applies the example preference at the review step", () => {
    const store = useOnboardingStore();
    store.startOnboarding();
    store.useExamplePreference();
    expect(store.state.step).toBe("preferences-4");
    expect(store.state.draft.primary_interest).toBe(
      EXAMPLE_PREFERENCE.primary_interest
    );
  });

  it("never persists preferences or transitional state", () => {
    const setStorageSync = vi.fn();
    vi.stubGlobal("uni", { setStorageSync });
    const store = useOnboardingStore();

    store.startOnboarding();
    store.updateDraft({ primary_interest: "community-service" });
    store.setGenerating();

    expect(setStorageSync).not.toHaveBeenCalled();
  });
});

describe("onboarding completion state", () => {
  it("requires a visited place and locally confirmed demo event", () => {
    const store = useOnboardingStore();
    store.setPlan(examplePlan, "offline");
    const [placeItem, eventItem] = examplePlan.items;

    expect(getCompletionProgress(store.state).canFinish).toBe(false);
    expect(store.finish()).toBe(false);

    store.markPlaceVisited(placeItem.item_id);
    store.confirmDemoEvent(eventItem.item_id);

    expect(getCompletionProgress(store.state)).toMatchObject({
      visitedPlaces: 1,
      availablePlaces: 1,
      confirmedEvents: 1,
      totalEvents: 1,
      canFinish: true
    });
    expect(store.finish()).toBe(true);
    expect(store.state.step).toBe("complete");
  });

  it("removes an unavailable place from the completion denominator", () => {
    const store = useOnboardingStore();
    store.setPlan(examplePlan, "online");
    const [placeItem, eventItem] = examplePlan.items;

    store.markPlaceUnavailable(placeItem.item_id);
    store.confirmDemoEvent(eventItem.item_id);

    expect(getCompletionProgress(store.state)).toMatchObject({
      visitedPlaces: 0,
      availablePlaces: 0,
      canFinish: true
    });
  });

  it("reset clears plan, statuses, errors, and offline state", () => {
    const store = useOnboardingStore();
    store.setPlan(examplePlan, "offline");
    store.setGenerationError("rateLimitedError", "req_1");
    store.reset();

    expect(store.state.step).toBe("welcome");
    expect(store.state.plan).toBeNull();
    expect(store.state.itemStatuses).toEqual({});
    expect(store.state.planDeliveryMode).toBe("online");
    expect(store.state.planErrorKey).toBeNull();
  });
});

describe("preference validation helpers", () => {
  it("rejects missing required fields", () => {
    expect(
      isPreferenceComplete({ ...EXAMPLE_PREFERENCE, primary_interest: null })
    ).toBe(false);
    expect(
      isPreferenceComplete({ ...EXAMPLE_PREFERENCE, arrival_context: null })
    ).toBe(false);
    expect(
      isPreferenceComplete({ ...EXAMPLE_PREFERENCE, household_type: null })
    ).toBe(false);
    expect(
      isPreferenceComplete({ ...EXAMPLE_PREFERENCE, accessibility_need: null })
    ).toBe(false);
  });

  it("builds only the strict API preference fields", () => {
    const preference = buildPreferenceFromDraft(EXAMPLE_PREFERENCE);
    expect(preference).toEqual({
      preferred_language: "zh",
      primary_interest: "community-service",
      arrival_context: "first-week",
      household_type: "solo",
      accessibility_need: "none"
    });
    expect(preference).not.toHaveProperty("communityId");
  });
});
