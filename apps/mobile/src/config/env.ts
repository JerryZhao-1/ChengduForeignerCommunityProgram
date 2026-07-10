const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:8787" : "");
const actorId = import.meta.env.DEV
  ? (import.meta.env.VITE_MOCK_ACTOR_ID ?? "user_001")
  : undefined;

export const mobileEnv = {
  apiMode: import.meta.env.VITE_API_MODE ?? "mock",
  apiBaseUrl,
  cloudbaseEnvId:
    import.meta.env.VITE_CLOUDBASE_ENV_ID ?? "cloud1-d7gxdk8t43bd639c0",
  cloudFunctionName:
    import.meta.env.VITE_CLOUDBASE_FUNCTION_NAME ?? "community-map-api",
  actorId
};
