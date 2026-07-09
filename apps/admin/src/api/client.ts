import {
  ApiClientError,
  FILE_PATH_RULES,
  createFetchRequester,
  createHttpClient,
  createMockClient,
  type HttpRequester
} from "@community-map/shared";

import { adminAuthToken } from "./auth-token";

const apiMode = import.meta.env.VITE_API_MODE ?? "mock";
const actorId = import.meta.env.VITE_MOCK_ACTOR_ID ?? "user_001";
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

const createAdminRequester = (): HttpRequester => {
  const requester = createFetchRequester();

  return async (method, url, body, headers) => {
    try {
      return await requester(method, url, body, headers);
    } catch (error) {
      if (
        error instanceof ApiClientError &&
        error.status === 401 &&
        window.location.pathname !== "/login"
      ) {
        adminAuthToken.clear();
        window.location.assign("/login");
      }
      throw error;
    }
  };
};

export const adminApi =
  apiMode === "mock"
    ? createMockClient({ actorId })
    : createHttpClient({
        baseUrl,
        getAuthToken: () => adminAuthToken.get(),
        requester: createAdminRequester()
      });

export { FILE_PATH_RULES };
