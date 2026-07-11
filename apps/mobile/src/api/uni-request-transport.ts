import type { HttpRequester } from "@community-map/shared";

export const resolveUniRequestTransport = (
  method: Parameters<HttpRequester>[0],
  headers: Record<string, string>
) =>
  method === "PATCH"
    ? {
        method: "POST" as const,
        headers: { ...headers, "x-http-method-override": "PATCH" }
      }
    : { method, headers };
