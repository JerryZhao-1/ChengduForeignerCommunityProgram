import { reactive, readonly } from "vue";

import {
  pickLocalized as pickLocalizedValue,
  type MobileLocale
} from "../i18n/localized";

export const LOCALE_STORAGE_KEY = "community-map-mobile-locale";

export interface LocaleResolutionInput {
  storedPreference?: unknown;
  authenticatedPreference?: unknown;
  deviceLanguage?: unknown;
}

type LocaleSync = (locale: MobileLocale) => Promise<unknown>;

export const buildLocalePreferenceInput = (
  locale: MobileLocale,
  hasExplicitLocale: boolean
): { preferred_language?: MobileLocale } =>
  hasExplicitLocale ? { preferred_language: locale } : {};

const isMobileLocale = (value: unknown): value is MobileLocale =>
  value === "zh" || value === "en";

export const deviceLanguageToLocale = (value: unknown): MobileLocale | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("en")) {
    return "en";
  }
  if (normalized.startsWith("zh")) {
    return "zh";
  }
  return null;
};

export const resolveInitialLocale = ({
  storedPreference,
  authenticatedPreference,
  deviceLanguage
}: LocaleResolutionInput): MobileLocale => {
  if (isMobileLocale(storedPreference)) {
    return storedPreference;
  }
  if (isMobileLocale(authenticatedPreference)) {
    return authenticatedPreference;
  }
  return deviceLanguageToLocale(deviceLanguage) ?? "zh";
};

const readStoredPreference = (): MobileLocale | null => {
  if (typeof uni === "undefined" || typeof uni.getStorageSync !== "function") {
    return null;
  }
  const value = uni.getStorageSync(LOCALE_STORAGE_KEY);
  return isMobileLocale(value) ? value : null;
};

const writeStoredPreference = (locale: MobileLocale) => {
  if (typeof uni !== "undefined" && typeof uni.setStorageSync === "function") {
    uni.setStorageSync(LOCALE_STORAGE_KEY, locale);
  }
};

export const readDeviceLanguage = () => {
  if (
    typeof uni === "undefined" ||
    typeof uni.getSystemInfoSync !== "function"
  ) {
    return undefined;
  }
  const info = uni.getSystemInfoSync() as {
    language?: string;
    deviceLanguage?: string;
  };
  return info.deviceLanguage || info.language;
};

const state = reactive({
  locale: "zh" as MobileLocale,
  localeInitialized: false,
  hasExplicitLocale: false,
  localeSyncPending: false,
  communityId: "tongzilin",
  userId: "user_001",
  authenticated: false
});

let syncPreference: LocaleSync | null = null;
let localeSyncQueue: Promise<void> = Promise.resolve();
let latestLocaleSyncRevision = 0;

const syncLocalePreference = (locale = state.locale) => {
  if (!state.authenticated || !syncPreference) {
    return Promise.resolve();
  }

  const sync = syncPreference;
  const revision = ++latestLocaleSyncRevision;
  const runSync = async () => {
    try {
      await sync(locale);
      if (revision === latestLocaleSyncRevision) {
        state.localeSyncPending = false;
      }
    } catch (error) {
      if (revision === latestLocaleSyncRevision) {
        state.localeSyncPending = true;
      }
      console.warn("Language preference synchronization failed.", error);
    }
  };

  localeSyncQueue = localeSyncQueue.then(runSync, runSync);
  return localeSyncQueue;
};

export const useAppStore = () => {
  const configureLocaleSync = (sync: LocaleSync) => {
    syncPreference = sync;
  };

  const initializeLocale = (input: LocaleResolutionInput = {}) => {
    const storedPreference =
      input.storedPreference === undefined
        ? readStoredPreference()
        : input.storedPreference;
    state.hasExplicitLocale = isMobileLocale(storedPreference);
    state.locale = resolveInitialLocale({
      storedPreference,
      authenticatedPreference: input.authenticatedPreference,
      deviceLanguage: input.deviceLanguage ?? readDeviceLanguage()
    });
    state.localeInitialized = true;
    return state.locale;
  };

  const setLocale = async (locale: MobileLocale) => {
    state.locale = locale;
    state.hasExplicitLocale = true;
    writeStoredPreference(locale);
    await syncLocalePreference(locale);
  };

  const setAuthenticatedUser = async (
    userId: string,
    preferredLanguage?: MobileLocale
  ) => {
    state.userId = userId;
    state.authenticated = true;
    if (!state.hasExplicitLocale && preferredLanguage) {
      state.locale = preferredLanguage;
    }
    if (state.hasExplicitLocale || state.localeSyncPending) {
      await syncLocalePreference(state.locale);
    }
  };

  const setUserId = (userId: string) => {
    state.userId = userId;
  };

  const retryLocaleSync = () => syncLocalePreference(state.locale);

  return {
    state: readonly(state),
    configureLocaleSync,
    initializeLocale,
    retryLocaleSync,
    setAuthenticatedUser,
    setLocale,
    setUserId
  };
};

export const resetAppStoreForTests = () => {
  state.locale = "zh";
  state.localeInitialized = false;
  state.hasExplicitLocale = false;
  state.localeSyncPending = false;
  state.userId = "user_001";
  state.authenticated = false;
  syncPreference = null;
  localeSyncQueue = Promise.resolve();
  latestLocaleSyncRevision = 0;
};

export const pickLocalized = pickLocalizedValue;
