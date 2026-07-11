import {
  createFetchRequester,
  createHttpClient,
  createMockClient,
  type HttpRequester
} from "@community-map/shared";

import { mobileEnv } from "@/config/env";
import { resolveCloudbaseFunctionPath } from "./cloudbase-path";
import { assertSuccessfulApiResponse, normalizeApiPayload } from "./response";
import { resolveUniRequestTransport } from "./uni-request-transport";

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
      const transport = resolveUniRequestTransport(method, headers);
      uni.request({
        url,
        method: transport.method,
        data: body as Record<string, unknown> | undefined,
        header: transport.headers,
        success: (result) => {
          const statusCode = result.statusCode ?? 500;

          try {
            assertSuccessfulApiResponse(result.data, statusCode);
            resolve(normalizeApiPayload(result.data) as any);
          } catch (err) {
            reject(err);
          }
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
    const path = resolveCloudbaseFunctionPath(url);

    if (typeof callHTTPFunction === "function") {
      const result = await callHTTPFunction({
        name: mobileEnv.cloudFunctionName,
        path,
        method,
        data: body as Record<string, unknown> | undefined,
        header: headers
      });

      assertSuccessfulApiResponse(result.data, result.statusCode);
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

    assertSuccessfulApiResponse(result.result);
    return result.result as any;
  };
};

const developmentHeaders =
  import.meta.env.DEV && mobileEnv.actorId
    ? { "x-mock-user-id": mobileEnv.actorId }
    : undefined;

export const mobileApi =
  mobileEnv.apiMode === "mock"
    ? createMockClient({ actorId: mobileEnv.actorId })
    : createHttpClient({
        baseUrl: mobileEnv.apiBaseUrl,
        defaultHeaders: developmentHeaders,
        requester:
          mobileEnv.apiMode === "cloudbase-function"
            ? createCloudbaseFunctionRequester()
            : createUniRequester()
      });
