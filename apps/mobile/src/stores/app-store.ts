import { reactive, readonly } from "vue";

const state = reactive({
  locale: "zh" as "zh" | "en",
  communityId: "tongzilin",
  userId: "user_001"
});

export const useAppStore = () => {
  const setLocale = (locale: "zh" | "en") => {
    state.locale = locale;
  };

  const setUserId = (userId: string) => {
    state.userId = userId;
  };

  return {
    state: readonly(state),
    setLocale,
    setUserId
  };
};

export const pickLocalized = (
  locale: "zh" | "en",
  zhText: string,
  enText: string
) => (locale === "zh" ? zhText : enText);
