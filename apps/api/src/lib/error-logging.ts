type ServerErrorLogContext = {
  source: "koa" | "cloudbase" | "cloudbase-provider";
  requestId?: string;
  method?: string;
  path?: string;
  operation?: string;
  stage?: string;
  targetId?: string;
};

const errorField = (error: unknown, field: string) => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  return (error as Record<string, unknown>)[field];
};

export const serializeServerError = (error: unknown) => {
  const name = errorField(error, "name");
  const message = errorField(error, "message");
  const code = errorField(error, "code") ?? errorField(error, "errCode");
  const stack = errorField(error, "stack");

  return {
    name: typeof name === "string" ? name : "UnknownError",
    message:
      typeof message === "string"
        ? message
        : typeof error === "string"
          ? error
          : "Unknown server error",
    ...(typeof code === "string" || typeof code === "number" ? { code } : {}),
    ...(typeof stack === "string" ? { stack } : {})
  };
};

export const logServerError = (
  context: ServerErrorLogContext,
  error: unknown
) => {
  console.error(
    "server_error",
    JSON.stringify({
      ...context,
      error: serializeServerError(error)
    })
  );
};
