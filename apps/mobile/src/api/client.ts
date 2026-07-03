import {
  createFetchRequester,
  createHttpClient,
  createMockClient,
  type HttpRequester
} from "@community-map/shared";

import { mobileEnv } from "@/config/env";
import { resolveCloudbaseFunctionPath } from "./cloudbase-path";

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
        success: (result) => resolve(result.data as any),
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
    const path = resolveCloudbaseFunctionPath(url);

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

export const mobileApi =
  mobileEnv.apiMode === "mock"
    ? createMockClient({ actorId: mobileEnv.actorId })
    : createHttpClient({
        actorId: mobileEnv.actorId,
        baseUrl: mobileEnv.apiBaseUrl,
        requester:
          mobileEnv.apiMode === "cloudbase-function"
            ? createCloudbaseFunctionRequester()
            : createUniRequester()
      });
