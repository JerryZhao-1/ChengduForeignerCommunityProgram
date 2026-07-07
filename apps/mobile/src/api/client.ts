import {
  ApiClientError,
  ApiFailureResultSchema,
  createFetchRequester,
  createHttpClient,
  createMockClient,
  type ApiError,
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

const createHttpStatusError = (status: number, payload: unknown): ApiError => ({
  code: "UPSTREAM_ERROR",
  message: `HTTP request failed with status ${status}.`,
  details: payload
});

const assertSuccessfulApiResponse = (payload: unknown, status?: number) => {
  const parsed = ApiFailureResultSchema.safeParse(payload);

  if (parsed.success) {
    throw new ApiClientError(parsed.data.error, {
      requestId: parsed.data.requestId,
      status
    });
  }

  if (status !== undefined && (status < 200 || status >= 300)) {
    throw new ApiClientError(createHttpStatusError(status, payload), {
      status
    });
  }
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

          try {
            assertSuccessfulApiResponse(result.data, statusCode);
            resolve(result.data as any);
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
