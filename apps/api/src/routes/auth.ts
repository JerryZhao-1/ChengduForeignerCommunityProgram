import Router from "@koa/router";
import {
  AdminLoginRequestSchema,
  LoginRequestSchema,
  WechatMiniappSessionRequestSchema
} from "@community-map/shared";

import { parseOrThrow, sendSuccess } from "../lib/http";

export const registerAuthRoutes = (router: Router) => {
  router.post("/auth/login", async (ctx) => {
    const input = parseOrThrow(LoginRequestSchema, ctx.request.body);
    const session = await ctx.state.provider.auth.login(input);
    sendSuccess(ctx, session);
  });

  router.post("/auth/admin/login", async (ctx) => {
    const input = parseOrThrow(AdminLoginRequestSchema, ctx.request.body);
    const session = await ctx.state.provider.auth.adminLogin(input);
    sendSuccess(ctx, session);
  });

  router.get("/auth/me", async (ctx) => {
    const actor = ctx.state.actor;
    const session = await ctx.state.provider.auth.me(actor?._id);
    sendSuccess(ctx, session);
  });

  router.post("/auth/wechat-miniapp/session", async (ctx) => {
    const input = parseOrThrow(
      WechatMiniappSessionRequestSchema,
      ctx.request.body
    );
    const session = await ctx.state.provider.auth.wechatMiniappSession({
      preferred_language: input.preferred_language,
      identity: ctx.state.wechatMiniappIdentity
    });
    sendSuccess(ctx, session);
  });
};
