import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "node:crypto";

import type { AuthSession, User } from "@community-map/shared";

import { apiError } from "./errors";

const SCRYPT_KEY_LENGTH = 64;
const TOKEN_TYPE = "admin";

interface AdminTokenPayload {
  sub: string;
  typ: typeof TOKEN_TYPE;
  iat: number;
  exp: number;
}

interface ScryptHashConfig {
  n: number;
  r: number;
  p: number;
  salt: Buffer;
  key: Buffer;
}

const base64UrlEncode = (value: Buffer | string) =>
  Buffer.from(value).toString("base64url");

const base64UrlJson = (value: unknown) =>
  base64UrlEncode(JSON.stringify(value));

const getAdminSessionSecret = () => {
  const secret = process.env.API_ADMIN_SESSION_SECRET;
  if (!secret) {
    throw apiError(
      "INTERNAL_ERROR",
      "Admin session secret is not configured.",
      500
    );
  }
  return secret;
};

const getAdminSessionTtlSeconds = () => {
  const raw = process.env.API_ADMIN_SESSION_TTL_SECONDS;
  const parsed = raw ? Number(raw) : 86400;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 86400;
};

export const getAdminUserId = () =>
  process.env.API_ADMIN_USER_ID?.trim() || "admin_001";

export const getAdminUsername = () =>
  process.env.API_ADMIN_USERNAME?.trim() || "";

const parseScryptHash = (value: string): ScryptHashConfig => {
  const [algorithm, n, r, p, salt, key] = value.split("$");
  if (algorithm !== "scrypt" || !n || !r || !p || !salt || !key) {
    throw apiError(
      "INTERNAL_ERROR",
      "Admin password hash is not configured correctly.",
      500
    );
  }

  return {
    n: Number(n),
    r: Number(r),
    p: Number(p),
    salt: Buffer.from(salt, "base64url"),
    key: Buffer.from(key, "base64url")
  };
};

export const createAdminPasswordHash = async (password: string) => {
  const n = 16384;
  const r = 8;
  const p = 1;
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, SCRYPT_KEY_LENGTH, {
    N: n,
    r,
    p
  });

  return `scrypt$${n}$${r}$${p}$${salt.toString("base64url")}$${key.toString("base64url")}`;
};

export const verifyAdminPassword = async (password: string) => {
  const configuredHash = process.env.API_ADMIN_PASSWORD_SCRYPT;
  if (!configuredHash) {
    throw apiError(
      "INTERNAL_ERROR",
      "Admin password hash is not configured.",
      500
    );
  }

  const config = parseScryptHash(configuredHash);
  const actual = scryptSync(password, config.salt, config.key.length, {
    N: config.n,
    r: config.r,
    p: config.p
  });

  return (
    actual.length === config.key.length && timingSafeEqual(actual, config.key)
  );
};

export const assertAdminLogin = async (input: {
  username: string;
  password: string;
}) => {
  const username = getAdminUsername();
  if (!username) {
    throw apiError(
      "INTERNAL_ERROR",
      "Admin username is not configured.",
      500
    );
  }

  const usernameMatches = input.username.trim() === username;
  const passwordMatches = await verifyAdminPassword(input.password);
  if (!usernameMatches || !passwordMatches) {
    throw apiError("UNAUTHORIZED", "Invalid username or password.", 401);
  }
};

export const createAdminToken = (userId = getAdminUserId()) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    sub: userId,
    typ: TOKEN_TYPE,
    iat: issuedAt,
    exp: issuedAt + getAdminSessionTtlSeconds()
  };
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlJson(header);
  const encodedPayload = base64UrlJson(payload);
  const signature = createHmac("sha256", getAdminSessionSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyAdminBearerToken = (authorizationHeader: string) => {
  const [scheme, token] = authorizationHeader.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return undefined;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw apiError("UNAUTHORIZED", "Invalid admin session.", 401);
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expected = createHmac("sha256", getAdminSessionSecret())
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    throw apiError("UNAUTHORIZED", "Invalid admin session.", 401);
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8")
  ) as Partial<AdminTokenPayload>;
  const now = Math.floor(Date.now() / 1000);
  if (
    payload.typ !== TOKEN_TYPE ||
    !payload.sub ||
    typeof payload.exp !== "number" ||
    payload.exp <= now
  ) {
    throw apiError("UNAUTHORIZED", "Admin session expired.", 401);
  }

  return payload.sub;
};

export const createAdminSession = (user: User): AuthSession => ({
  user,
  token: createAdminToken(user._id)
});
