<script lang="ts">
import { mobileApi } from "@/api/client";
import { mobileEnv } from "@/config/env";
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
    const { setUserId } = useAppStore();
    if (
      mobileEnv.apiMode === "cloudbase-function" &&
      typeof wx !== "undefined" &&
      typeof wx.cloud?.init === "function"
    ) {
      wx.cloud.init({
        env: mobileEnv.cloudbaseEnvId,
        traceUser: true
      });

      void mobileApi.auth
        .wechatMiniappSession()
        .then((result) => {
          setUserId(result.data.user._id);
        })
        .catch((error) => {
          console.warn("Mini Program session initialization failed.", error);
        });
    }

    console.log("Community map mobile app launched.");
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
