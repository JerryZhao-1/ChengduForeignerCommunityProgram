import type { ApiProvider } from "./types";

import { createCloudbaseProvider } from "./cloudbase";

const providerCache = new Map<string, ApiProvider>();

export const createProvider = (
  _mode = "cloudbase",
  options?: {
    fresh?: boolean;
  }
): ApiProvider => {
  void _mode;

  if (options?.fresh) {
    return createCloudbaseProvider();
  }

  const cachedProvider = providerCache.get("cloudbase");
  if (cachedProvider) {
    return cachedProvider;
  }

  const provider = createCloudbaseProvider();
  providerCache.set("cloudbase", provider);
  return provider;
};
