import type { Context, Next } from "koa";
import { z, type ZodTypeAny } from "zod";

import { randomUUID } from "node:crypto";

import { ApiFailureResultSchema } from "@community-map/shared";

import { ApiAppError, apiError } from "./errors";

export const corsMiddleware = async (ctx: Context, next: Next) => {
  ctx.set("Access-Control-Allow-Origin", ctx.get("origin") || "*");
  ctx.set("Vary", "Origin");
  ctx.set("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
  ctx.set(
    "Access-Control-Allow-Headers",
    "content-type,x-mock-user-id,x-requested-with"
  );

  if (ctx.method === "OPTIONS") {
    ctx.status = 204;
    return;
  }

  await next();
};

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

export const errorMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    const knownError =
      error instanceof ApiAppError
        ? error
        : apiError("INTERNAL_ERROR", "Unexpected server error.", 500);
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
