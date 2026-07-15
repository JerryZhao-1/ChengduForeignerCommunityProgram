import Router from "@koa/router";
import { NewResidentPreferenceSchema } from "@community-map/shared";

import { parseOrThrow, sendSuccess } from "../lib/http";
import { createGuestPlanRateLimitMiddleware } from "../lib/community-plan-rate-limit";
import { apiError } from "../lib/errors";

export const registerCommunityPlanRoutes = (router: Router) => {
  // POST /community-plan/generate
  // Guest-accessible only when auth resolves `x-guest-mode: judge`. The
  // provider is responsible for deterministic, PII-free output.
  const rateLimit = createGuestPlanRateLimitMiddleware();

  router.post(
    "/community-plan/generate",
    async (ctx, next) => {
      if (ctx.state.authenticatedVia !== "guest") {
        throw apiError(
          "FORBIDDEN",
          "Community Plan generation is available only in guest judge mode.",
          403
        );
      }
      await next();
    },
    rateLimit,
    async (ctx) => {
      const input = parseOrThrow(NewResidentPreferenceSchema, ctx.request.body);
      const startedAt = Date.now();
      const plan = await ctx.state.provider.communityPlan.generate(input);
      console.info(
        "community_plan_generated",
        JSON.stringify({
          requestId: ctx.state.requestId,
          actor_kind: ctx.state.authenticatedVia,
          community_id: plan.community_id,
          catalog_version: plan.catalog_version,
          duration_ms: Date.now() - startedAt,
          timestamp: new Date().toISOString()
        })
      );
      sendSuccess(ctx, plan, 200);
    }
  );
};
