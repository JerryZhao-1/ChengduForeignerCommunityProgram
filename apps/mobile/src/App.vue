<script lang="ts">
import { watch } from "vue";

import { mobileApi } from "@/api/client";
import { mobileEnv } from "@/config/env";
import { updateRuntimeNavigation } from "@/i18n";
import { useAppStore } from "@/stores/app-store";

declare const wx:
  | {
      cloud?: {
        init?: (input: { env: string; traceUser?: boolean }) => void;
      };
    }
  | undefined;

export default {
  onLaunch() {
    const store = useAppStore();
    store.configureLocaleSync((locale) =>
      mobileApi.auth.updatePreferences({ preferred_language: locale })
    );
    store.initializeLocale();
    updateRuntimeNavigation(store.state.locale);
    watch(
      () => store.state.locale,
      (locale) => updateRuntimeNavigation(locale)
    );

    if (
      mobileEnv.apiMode === "cloudbase-function" &&
      typeof wx !== "undefined" &&
      wx.cloud &&
      typeof wx.cloud.init === "function"
    ) {
      wx.cloud.init({
        env: mobileEnv.cloudbaseEnvId,
        traceUser: true
      });
    }

    const sessionRequest =
      mobileEnv.apiMode === "cloudbase-function"
        ? mobileApi.auth.wechatMiniappSession()
        : mobileApi.auth.me();
    void sessionRequest
      .then((result) =>
        store.setAuthenticatedUser(
          result.data.user._id,
          result.data.user.preferred_language
        )
      )
      .catch((error) => {
        console.warn("Session initialization failed; locale remains local.", error);
      });
  }
};
</script>

<style>
page {
  background: #f3f4f6;
  color: #111827;
  font-family:
    "PingFang SC",
    "Microsoft YaHei",
    sans-serif;
}
</style>
