import {
  ApiClientError,
  ApiFailureResultSchema,
  type ApiError
} from "@community-map/shared";

const createHttpStatusError = (status: number, payload: unknown): ApiError => ({
  code: "UPSTREAM_ERROR",
  message: `HTTP request failed with status ${status}.`,
  details: payload
});

export const normalizeApiPayload = (payload: unknown) => {
  if (typeof payload !== "string") {
    return payload;
  }

  try {
    return JSON.parse(payload) as unknown;
  } catch {
    return payload;
  }
};

export const assertSuccessfulApiResponse = (
  payload: unknown,
  status?: number
) => {
  const normalizedPayload = normalizeApiPayload(payload);
  const parsed = ApiFailureResultSchema.safeParse(normalizedPayload);

  if (parsed.success) {
    throw new ApiClientError(parsed.data.error, {
      requestId: parsed.data.requestId,
      status
    });
  }

  if (status !== undefined && (status < 200 || status >= 300)) {
    throw new ApiClientError(createHttpStatusError(status, normalizedPayload), {
      status
    });
  }
};
