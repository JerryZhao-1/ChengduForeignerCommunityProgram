import Router from "@koa/router";
import { NewResidentPreferenceSchema } from "@community-map/shared";

import { parseOrThrow, sendSuccess } from "../lib/http";
import { createGuestPlanRateLimitMiddleware } from "../lib/community-plan-rate-limit";
import { enhanceCommunityPlanNarration } from "../lib/community-plan-ai";
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
      const deterministicPlan =
        await ctx.state.provider.communityPlan.generate(input);
      const plan = await enhanceCommunityPlanNarration(
        deterministicPlan,
        input
      );
      sendSuccess(ctx, plan, 200);
    }
  );
};
