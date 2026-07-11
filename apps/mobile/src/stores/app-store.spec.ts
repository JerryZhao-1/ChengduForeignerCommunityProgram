import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LOCALE_STORAGE_KEY,
  buildLocalePreferenceInput,
  deviceLanguageToLocale,
  resetAppStoreForTests,
  resolveInitialLocale,
  useAppStore
} from "./app-store";

const storage = new Map<string, unknown>();

beforeEach(() => {
  storage.clear();
  resetAppStoreForTests();
  vi.stubGlobal("uni", {
    getStorageSync: (key: string) => storage.get(key),
    setStorageSync: (key: string, value: unknown) => storage.set(key, value),
    getSystemInfoSync: () => ({ language: "en-US" })
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("locale precedence", () => {
  it.each([
    ["en", "zh", "zh-CN", "en"],
    ["zh", "en", "en-US", "zh"],
    [undefined, "en", "zh-CN", "en"],
    [undefined, "zh", "en-US", "zh"],
    [undefined, undefined, "en-US", "en"],
    [undefined, undefined, "zh-Hans", "zh"],
    ["invalid", undefined, "fr-FR", "zh"]
  ])(
    "resolves stored=%s server=%s device=%s to %s",
    (storedPreference, authenticatedPreference, deviceLanguage, expected) => {
      expect(
        resolveInitialLocale({
          storedPreference,
          authenticatedPreference,
          deviceLanguage
        })
      ).toBe(expected);
    }
  );

  it("normalizes only supported device languages", () => {
    expect(deviceLanguageToLocale("en-GB")).toBe("en");
    expect(deviceLanguageToLocale("zh-Hans")).toBe("zh");
    expect(deviceLanguageToLocale("fr-FR")).toBeNull();
  });

  it("only sends a locale with login when the user explicitly selected it", () => {
    expect(buildLocalePreferenceInput("en", false)).toEqual({});
    expect(buildLocalePreferenceInput("en", true)).toEqual({
      preferred_language: "en"
    });
  });

  it("ignores invalid storage and uses the next valid source", () => {
    storage.set(LOCALE_STORAGE_KEY, "fr");
    const store = useAppStore();
    expect(
      store.initializeLocale({
        authenticatedPreference: "en",
        deviceLanguage: "zh-CN"
      })
    ).toBe("en");
    expect(store.state.hasExplicitLocale).toBe(false);
  });
});

describe("offline-first selection and synchronization", () => {
  it("updates and persists immediately before authenticated sync finishes", async () => {
    const store = useAppStore();
    let finishSync: (() => void) | undefined;
    store.initializeLocale({ storedPreference: null, deviceLanguage: "zh-CN" });
    store.configureLocaleSync(
      () =>
        new Promise<void>((resolve) => {
          finishSync = resolve;
        })
    );
    await store.setAuthenticatedUser("user_001", "zh");
    const selection = store.setLocale("en");

    expect(store.state.locale).toBe("en");
    expect(storage.get(LOCALE_STORAGE_KEY)).toBe("en");
    await vi.waitFor(() => expect(finishSync).toBeTypeOf("function"));
    finishSync?.();
    await selection;
    expect(store.state.localeSyncPending).toBe(false);
  });

  it("does not roll back the UI when synchronization fails", async () => {
    const store = useAppStore();
    store.initializeLocale({ storedPreference: null, deviceLanguage: "zh-CN" });
    store.configureLocaleSync(async () => {
      throw new Error("offline");
    });
    await store.setAuthenticatedUser("user_001", "zh");
    await store.setLocale("en");

    expect(store.state.locale).toBe("en");
    expect(storage.get(LOCALE_STORAGE_KEY)).toBe("en");
    expect(store.state.localeSyncPending).toBe(true);
  });

  it("keeps an explicit local choice and synchronizes it after authentication", async () => {
    storage.set(LOCALE_STORAGE_KEY, "en");
    const synced: string[] = [];
    const store = useAppStore();
    store.initializeLocale({ authenticatedPreference: "zh" });
    store.configureLocaleSync(async (locale) => synced.push(locale));
    await store.setAuthenticatedUser("user_001", "zh");

    expect(store.state.locale).toBe("en");
    expect(synced).toEqual(["en"]);
  });

  it("serializes rapid preference changes so the latest choice reaches the server last", async () => {
    const store = useAppStore();
    const calls: string[] = [];
    const completions: Array<() => void> = [];
    store.initializeLocale({ storedPreference: null, deviceLanguage: "zh-CN" });
    store.configureLocaleSync(
      (locale) =>
        new Promise<void>((resolve) => {
          calls.push(locale);
          completions.push(resolve);
        })
    );
    await store.setAuthenticatedUser("user_001", "zh");

    const englishSelection = store.setLocale("en");
    const chineseSelection = store.setLocale("zh");
    await vi.waitFor(() => expect(calls).toEqual(["en"]));

    completions[0]?.();
    await vi.waitFor(() => expect(calls).toEqual(["en", "zh"]));
    completions[1]?.();
    await Promise.all([englishSelection, chineseSelection]);

    expect(store.state.locale).toBe("zh");
    expect(store.state.localeSyncPending).toBe(false);
  });
});
