import type { Context, Next } from "koa";
import type { RoleFlag, User } from "@community-map/shared";

import { apiError } from "./errors";
import { verifyAdminBearerToken } from "./admin-auth";
import type { WechatMiniappIdentity } from "../providers/types";

export interface AuthenticatedState {
  actor?: User;
  requestId: string;
  wechatMiniappIdentity?: WechatMiniappIdentity;
  authenticatedVia?: "bearer" | "wechat-miniapp" | "mock" | "guest";
}

const isMockActorHeaderAllowed = () =>
  process.env.CLOUDBASE_PROVIDER_MODE !== "live" ||
  process.env.API_ALLOW_MOCK_ACTOR_HEADER === "true";

export const resolveWechatMiniappIdentity = (
  headers: (name: string) => string
): WechatMiniappIdentity | undefined => {
  const openid = headers("x-wx-openid").trim();
  const appid = headers("x-wx-appid").trim();
  const unionid = headers("x-wx-unionid").trim();

  if (!openid || !appid) {
    return undefined;
  }

  return {
    openid,
    appid,
    unionid: unionid || undefined
  };
};

const isAnonymousPublicRoute = (method: string, path: string) => {
  if (method === "GET" && path === "/health") {
    return true;
  }

  if (method === "POST" && path === "/auth/login") {
    return true;
  }

  if (method === "POST" && path === "/auth/wechat-miniapp/session") {
    return true;
  }

  if (method !== "GET" && method !== "HEAD") {
    return false;
  }

  return (
    path === "/announcements" ||
    /^\/announcements\/[^/]+$/.test(path) ||
    path === "/events" ||
    /^\/events\/[^/]+$/.test(path) ||
    path === "/places" ||
    path === "/places/map-markers" ||
    /^\/places\/[^/]+$/.test(path) ||
    path === "/discover/tags" ||
    path === "/discover/posts" ||
    /^\/discover\/posts\/[^/]+$/.test(path) ||
    /^\/discover\/posts\/[^/]+\/comments$/.test(path) ||
    /^\/discover\/places\/[^/]+\/posts$/.test(path) ||
    /^\/discover\/events\/[^/]+\/posts$/.test(path)
  );
};

const isGuestModeRequest = (ctx: Context) => {
  const guestMode = ctx.get("x-guest-mode").trim().toLowerCase();
  return guestMode === "judge";
};

const isGuestAllowedRoute = (method: string, path: string) => {
  if (method === "POST" && path === "/community-plan/generate") {
    return true;
  }

  return isAnonymousPublicRoute(method, path);
};

export const actorMiddleware = async (ctx: Context, next: Next) => {
  if (ctx.path === "/auth/admin/login") {
    await next();
    return;
  }

  const bearerActorId = verifyAdminBearerToken(ctx.get("authorization"));
  const identity = resolveWechatMiniappIdentity((name) => ctx.get(name));
  const mockActorId = ctx.get("x-mock-user-id") || undefined;
  const guestMode = isGuestModeRequest(ctx);
  const actorId =
    bearerActorId ?? (isMockActorHeaderAllowed() ? mockActorId : undefined);
  ctx.state.wechatMiniappIdentity = identity;
  ctx.state.authenticatedVia = bearerActorId
    ? "bearer"
    : identity
      ? "wechat-miniapp"
      : actorId
        ? "mock"
        : guestMode
          ? "guest"
          : undefined;

  if (guestMode && !actorId && !identity) {
    if (!isGuestAllowedRoute(ctx.method, ctx.path)) {
      throw apiError(
        "FORBIDDEN",
        "Guest access is not allowed for this action.",
        403
      );
    }
    ctx.state.actor = undefined;
    await next();
    return;
  }

  if (!actorId && !identity) {
    if (!isAnonymousPublicRoute(ctx.method, ctx.path)) {
      throw apiError("UNAUTHORIZED", "Authentication is required.", 401);
    }
    ctx.state.actor = undefined;
    await next();
    return;
  }

  const actor = await ctx.state.provider.auth.resolveActor(
    actorId,
    bearerActorId ? undefined : identity
  );
  ctx.state.actor = actor;
  await next();
};

export const requireRole =
  (...roles: RoleFlag[]) =>
  async (ctx: Context, next: Next) => {
    const actor = ctx.state.actor as User | undefined;
    if (!actor || !ctx.state.authenticatedVia) {
      throw apiError("UNAUTHORIZED", "Authentication is required.", 401);
    }
    if (!roles.some((role) => actor.role_flags.includes(role))) {
      throw apiError("FORBIDDEN", "Insufficient permission.", 403);
    }
    await next();
  };
