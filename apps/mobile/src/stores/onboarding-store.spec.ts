import { beforeEach, describe, expect, it, vi } from "vitest";

import { communityPlanOfflineBundle } from "@community-map/shared";

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
    expect(store.state.draft.interests).toEqual(EXAMPLE_PREFERENCE.interests);
  });

  it("never persists preferences or transitional state", () => {
    const setStorageSync = vi.fn();
    vi.stubGlobal("uni", { setStorageSync });
    const store = useOnboardingStore();

    store.startOnboarding();
    store.updateDraft({ interests: ["community-service"] });
    store.setGenerating();

    expect(setStorageSync).not.toHaveBeenCalled();
  });
});

describe("onboarding completion state", () => {
  it("requires a visited place and locally confirmed demo event", () => {
    const store = useOnboardingStore();
    store.setPlan(communityPlanOfflineBundle.plan, true);
    const [placeItem, eventItem] = communityPlanOfflineBundle.plan.items;

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
    store.setPlan(communityPlanOfflineBundle.plan, false);
    const [placeItem, eventItem] = communityPlanOfflineBundle.plan.items;

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
    store.setPlan(communityPlanOfflineBundle.plan, true);
    store.setGenerationError("rateLimitedError", "req_1");
    store.reset();

    expect(store.state.step).toBe("welcome");
    expect(store.state.plan).toBeNull();
    expect(store.state.itemStatuses).toEqual({});
    expect(store.state.planOffline).toBe(false);
    expect(store.state.planErrorKey).toBeNull();
  });
});

describe("preference validation helpers", () => {
  it("rejects missing required fields", () => {
    expect(isPreferenceComplete({ ...EXAMPLE_PREFERENCE, interests: [] })).toBe(
      false
    );
    expect(
      isPreferenceComplete({ ...EXAMPLE_PREFERENCE, arrival_context: null })
    ).toBe(false);
    expect(
      isPreferenceComplete({ ...EXAMPLE_PREFERENCE, household_type: null })
    ).toBe(false);
  });

  it("builds only the strict API preference fields", () => {
    const preference = buildPreferenceFromDraft(EXAMPLE_PREFERENCE);
    expect(preference).toEqual({
      preferred_language: "zh",
      interests: ["community-service", "food-drink", "social"],
      arrival_context: "first-week",
      household_type: "solo",
      accessibility_needs: []
    });
    expect(preference).not.toHaveProperty("communityId");
  });
});
