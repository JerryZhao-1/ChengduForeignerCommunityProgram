import type { Context, Next } from "koa";

import { apiError } from "./errors";

const LIMIT = 10;
const WINDOW_MS = 60_000;
const BUCKET_TTL_MS = 120_000;
const MAX_BUCKETS = 10_000;

interface RateLimitBucket {
  timestamps: number[];
  expiresAt: number;
}

const normalizeSource = (source: string) => {
  const normalized = source.trim().toLowerCase();
  return normalized.startsWith("::ffff:") ? normalized.slice(7) : normalized;
};

const resolveSource = (ctx: Context) => {
  const remoteAddress = normalizeSource(
    ctx.req.socket.remoteAddress || ctx.ip || "unknown"
  );
  const trustedProxies = new Set(
    (process.env.API_TRUSTED_PROXY_IPS ?? "")
      .split(",")
      .map(normalizeSource)
      .filter(Boolean)
  );

  if (!trustedProxies.has(remoteAddress)) {
    return remoteAddress;
  }

  const forwarded = ctx
    .get("x-forwarded-for")
    .split(",")
    .map(normalizeSource)
    .filter(Boolean);
  for (let index = forwarded.length - 1; index >= 0; index -= 1) {
    if (!trustedProxies.has(forwarded[index])) {
      return forwarded[index];
    }
  }
  return remoteAddress;
};

export const createGuestPlanRateLimitMiddleware = () => {
  const buckets = new Map<string, RateLimitBucket>();

  const cleanup = (now: number) => {
    for (const [source, bucket] of buckets) {
      if (bucket.expiresAt <= now) {
        buckets.delete(source);
      }
    }

    while (buckets.size >= MAX_BUCKETS) {
      const oldest = [...buckets.entries()].sort(
        ([leftSource, left], [rightSource, right]) =>
          left.expiresAt - right.expiresAt ||
          leftSource.localeCompare(rightSource)
      )[0];
      if (!oldest) {
        break;
      }
      buckets.delete(oldest[0]);
    }
  };

  return async (ctx: Context, next: Next) => {
    const now = Date.now();
    const source = resolveSource(ctx);
    let bucket = buckets.get(source);

    if (!bucket) {
      cleanup(now);
      bucket = { timestamps: [], expiresAt: now + BUCKET_TTL_MS };
      buckets.set(source, bucket);
    }

    bucket.timestamps = bucket.timestamps.filter(
      (timestamp) => timestamp > now - WINDOW_MS
    );
    const resetAt = (bucket.timestamps[0] ?? now) + WINDOW_MS;
    const remaining = Math.max(0, LIMIT - bucket.timestamps.length - 1);

    ctx.set("X-RateLimit-Limit", String(LIMIT));
    ctx.set("X-RateLimit-Remaining", String(remaining));
    ctx.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

    if (bucket.timestamps.length >= LIMIT) {
      ctx.set("X-RateLimit-Remaining", "0");
      throw apiError(
        "RATE_LIMITED",
        "Too many Community Plan generation requests.",
        429
      );
    }

    bucket.timestamps.push(now);
    bucket.expiresAt = now + BUCKET_TTL_MS;
    await next();
  };
};
