import App from "./App.vue";
import { createSSRApp } from "vue";
import { updateRuntimeNavigation } from "./i18n";
import { useAppStore } from "./stores/app-store";

export function createApp() {
  const app = createSSRApp(App);
  app.mixin({
    onShow() {
      const locale = useAppStore().state.locale;
      updateRuntimeNavigation(locale);
      setTimeout(() => updateRuntimeNavigation(locale), 0);
    }
  });
  return {
    app
  };
}
