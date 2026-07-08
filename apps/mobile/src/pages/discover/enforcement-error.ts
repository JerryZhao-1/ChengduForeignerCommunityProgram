type EnforcementStatus = "muted" | "banned";
type EnforcementAction =
  | "create_post"
  | "create_comment"
  | "report"
  | "read_mine";

interface EnforcementDetails {
  enforcement_status?: EnforcementStatus;
  action?: EnforcementAction;
}

interface ApiErrorLike {
  code?: unknown;
  details?: unknown;
}

interface ApiFailureEnvelope {
  success: false;
  error: ApiErrorLike;
}

interface DiscoverErrorCopy {
  accountMutedPost: string;
  accountMutedComment: string;
  accountBannedAction: string;
}

const parseMaybeJson = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

const isEnforcementDetails = (value: unknown): value is EnforcementDetails => {
  const normalizedValue = parseMaybeJson(value);

  if (!normalizedValue || typeof normalizedValue !== "object") {
    return false;
  }

  const details = normalizedValue as Record<string, unknown>;
  return (
    typeof details.enforcement_status === "string" ||
    typeof details.action === "string"
  );
};

const isApiFailureEnvelope = (value: unknown): value is ApiFailureEnvelope => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const envelope = value as Record<string, unknown>;
  return envelope.success === false && typeof envelope.error === "object";
};

const normalizeError = (value: unknown): ApiErrorLike | null => {
  const normalizedValue = parseMaybeJson(value);

  if (!normalizedValue || typeof normalizedValue !== "object") {
    return null;
  }

  if (isApiFailureEnvelope(normalizedValue)) {
    return normalizedValue.error;
  }

  const error = normalizedValue as Record<string, unknown>;
  if (error.code === "UPSTREAM_ERROR") {
    return normalizeError(error.details) ?? (error as ApiErrorLike);
  }

  return error as ApiErrorLike;
};

const isForbiddenApiError = (value: unknown): value is ApiErrorLike => {
  const error = normalizeError(value);
  return error?.code === "FORBIDDEN";
};

const getErrorDetails = (value: unknown) => {
  const error = normalizeError(value);
  return error?.details;
};

export const getDiscoverEnforcementMessage = (
  err: unknown,
  copy: DiscoverErrorCopy
) => {
  if (!isForbiddenApiError(err)) {
    return "";
  }

  const errorDetails = getErrorDetails(err);
  const details = isEnforcementDetails(errorDetails)
    ? (parseMaybeJson(errorDetails) as EnforcementDetails)
    : {};

  if (details.enforcement_status === "muted") {
    return details.action === "create_comment"
      ? copy.accountMutedComment
      : copy.accountMutedPost;
  }

  if (details.enforcement_status === "banned") {
    return copy.accountBannedAction;
  }

  return "";
};
