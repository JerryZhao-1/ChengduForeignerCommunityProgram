import Router from "@koa/router";
import {
  CheckinInputSchema,
  CreateEventInputSchema,
  CreateEventRegistrationInputSchema,
  EventListQuerySchema,
  ReviewEventInputSchema,
  UpdateEventInputSchema
} from "@community-map/shared";

import { requireRole } from "../lib/auth";
import { apiError } from "../lib/errors";
import { parseOrThrow, sendSuccess } from "../lib/http";

export const registerEventRoutes = (router: Router) => {
  router.get("/events", async (ctx) => {
    const query = parseOrThrow(EventListQuerySchema, ctx.query);
    const data = await ctx.state.provider.events.list(query);
    sendSuccess(ctx, data);
  });

  router.get("/events/:id", async (ctx) => {
    const event = await ctx.state.provider.events.detail(ctx.params.id);
    if (!event) {
      throw apiError("NOT_FOUND", "Event not found.", 404);
    }
    sendSuccess(ctx, event);
  });

  router.post("/events/:id/registrations", async (ctx) => {
    const input = parseOrThrow(CreateEventRegistrationInputSchema, ctx.request.body);
    const data = await ctx.state.provider.events.createRegistration(
      ctx.params.id,
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data, 201);
  });

  router.get("/events/me/registrations", async (ctx) => {
    const data = await ctx.state.provider.events.listMyRegistrations(ctx.state.actor._id);
    sendSuccess(ctx, data);
  });

  router.get("/events/registrations/:id/ticket", async (ctx) => {
    const ticket = await ctx.state.provider.events.getTicketByRegistration(
      ctx.params.id,
      ctx.state.actor._id
    );
    if (!ticket) {
      throw apiError("NOT_FOUND", "Ticket not found.", 404);
    }
    sendSuccess(ctx, ticket);
  });

  router.post("/admin/events", requireRole("community_admin", "system_admin"), async (ctx) => {
    const input = parseOrThrow(CreateEventInputSchema, ctx.request.body);
    const event = await ctx.state.provider.events.create(input, ctx.state.actor._id);
    sendSuccess(ctx, event, 201);
  });

  router.patch(
    "/admin/events/:id",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(UpdateEventInputSchema, ctx.request.body);
      const event = await ctx.state.provider.events.update(ctx.params.id, input);
      if (!event) {
        throw apiError("NOT_FOUND", "Event not found.", 404);
      }
      sendSuccess(ctx, event);
    }
  );

  router.post(
    "/admin/events/:id/review",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(ReviewEventInputSchema, ctx.request.body);
      const event = await ctx.state.provider.events.review(ctx.params.id, input);
      if (!event) {
        throw apiError("NOT_FOUND", "Event not found.", 404);
      }
      sendSuccess(ctx, event);
    }
  );

  router.post(
    "/admin/events/:id/checkin",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(CheckinInputSchema, ctx.request.body);
      const ticket = await ctx.state.provider.events.checkin(ctx.params.id, input.ticket_id);
      if (!ticket) {
        throw apiError("NOT_FOUND", "Ticket not found.", 404);
      }
      sendSuccess(ctx, ticket);
    }
  );
};
