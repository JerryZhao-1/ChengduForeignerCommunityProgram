import type { Context, Next } from "koa";
import { z, type ZodTypeAny } from "zod";

import { randomUUID } from "node:crypto";

import {
  API_ERROR_CODES,
  ApiFailureResultSchema,
  type ApiErrorCode
} from "@community-map/shared";

import { ApiAppError, apiError } from "./errors";

export const requestIdMiddleware = async (ctx: Context, next: Next) => {
  ctx.state.requestId = randomUUID();
  await next();
};

export const parseOrThrow = <TSchema extends ZodTypeAny>(
  schema: TSchema,
  payload: unknown
): z.infer<TSchema> => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw apiError("VALIDATION_ERROR", "Request validation failed.", 400, {
      issues: result.error.issues
    });
  }
  return result.data;
};

export const sendSuccess = <TData>(ctx: Context, data: TData, status = 200) => {
  ctx.status = status;
  ctx.body = {
    success: true,
    data,
    requestId: ctx.state.requestId
  };
};

const toKnownError = (error: unknown) => {
  if (error instanceof ApiAppError) {
    return error;
  }

  if (
    error instanceof Error &&
    "code" in error &&
    "status" in error &&
    typeof error.code === "string" &&
    typeof error.status === "number" &&
    isApiErrorCode(error.code)
  ) {
    return apiError(
      error.code,
      error.message,
      error.status,
      "details" in error ? error.details : undefined
    );
  }

  return apiError("INTERNAL_ERROR", "Unexpected server error.", 500);
};

const isApiErrorCode = (value: string): value is ApiErrorCode =>
  API_ERROR_CODES.includes(value as ApiErrorCode);

export const errorMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    const knownError = toKnownError(error);
    const payload = {
      success: false,
      error: {
        code: knownError.code,
        message: knownError.message,
        details: knownError.details
      },
      requestId: ctx.state.requestId ?? randomUUID()
    };

    ApiFailureResultSchema.parse(payload);
    ctx.status = knownError.status;
    ctx.body = payload;
  }
};
