import {
  type CommunityMapApiClient,
  createFetchRequester,
  createHttpClient,
  createMockClient,
  type HttpRequester
} from "@community-map/shared";

import { mobileEnv } from "@/config/env";

declare const wx:
  | {
      cloud?: {
        callHTTPFunction?: (input: {
          name: string;
          path: string;
          method: string;
          data?: Record<string, unknown>;
          header?: Record<string, string>;
        }) => Promise<{ data: unknown; statusCode: number; header?: unknown }>;
        callFunction?: (input: {
          name: string;
          data: Record<string, unknown>;
        }) => Promise<{ result: unknown }>;
      };
    }
  | undefined;

const appendQueryToPath = (path: string, url: string) => {
  const queryIndex = url.indexOf("?");
  return queryIndex === -1 ? path : `${path}${url.slice(queryIndex)}`;
};

const createUniRequester = (): HttpRequester => {
  if (typeof uni === "undefined" || typeof uni.request !== "function") {
    return createFetchRequester();
  }

  return (method, url, body, headers = {}) =>
    new Promise((resolve, reject) => {
      const uniMethod = method === "PATCH" ? "POST" : method;
      uni.request({
        url,
        method: uniMethod,
        data: body as Record<string, unknown> | undefined,
        header: headers,
        success: (result) => {
          const statusCode = result.statusCode ?? 500;

          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`HTTP ${statusCode}`));
            return;
          }

          resolve(result.data as any);
        },
        fail: reject
      });
    });
};

const createCloudbaseFunctionRequester = (): HttpRequester => {
  const callHTTPFunction =
    typeof wx === "undefined" ? undefined : wx.cloud?.callHTTPFunction;
  const callFunction =
    typeof wx === "undefined" ? undefined : wx.cloud?.callFunction;

  if (
    typeof callHTTPFunction !== "function" &&
    typeof callFunction !== "function"
  ) {
    return createUniRequester();
  }

  return async (method, url, body, headers = {}) => {
    const parsedUrl = new URL(url, "http://localhost");
    const path = appendQueryToPath(parsedUrl.pathname, parsedUrl.search);

    if (typeof callHTTPFunction === "function") {
      const result = await callHTTPFunction({
        name: mobileEnv.cloudFunctionName,
        path,
        method,
        data: body as Record<string, unknown> | undefined,
        header: headers
      });

      return result.data as any;
    }

    if (typeof callFunction !== "function") {
      throw new Error("CloudBase function API is unavailable.");
    }

    const result = await callFunction({
      name: mobileEnv.cloudFunctionName,
      data: {
        ...((body as Record<string, unknown> | undefined) ?? {}),
        $url: path,
        $method: method,
        $headers: headers
      }
    });

    return result.result as any;
  };
};

const mockClient = createMockClient({ actorId: mobileEnv.actorId });

const createRemoteClient = (): CommunityMapApiClient => {
  const httpClient = createHttpClient({
    actorId: mobileEnv.actorId,
    baseUrl: mobileEnv.apiBaseUrl,
    requester:
      mobileEnv.apiMode === "cloudbase-function"
        ? createCloudbaseFunctionRequester()
        : createUniRequester()
  });

  return {
    ...httpClient,
    // The deployed CloudBase HTTP API does not expose Profile/points yet.
    // Keep these local so Profile tabs can work while public content uses HTTP.
    profile: mockClient.profile,
    points: mockClient.points
  };
};

export const mobileApi =
  mobileEnv.apiMode === "mock" ? mockClient : createRemoteClient();
