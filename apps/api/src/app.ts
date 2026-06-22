import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";

import { actorMiddleware } from "./lib/auth";
import { corsMiddleware, errorMiddleware, requestIdMiddleware } from "./lib/http";
import { createProvider } from "./providers";
import { registerAnnouncementRoutes } from "./routes/announcements";
import { registerAuthRoutes } from "./routes/auth";
import { registerDiscoverRoutes } from "./routes/discover";
import { registerEventRoutes } from "./routes/events";
import { registerFileRoutes } from "./routes/files";
import { registerNotificationRoutes } from "./routes/notifications";
import { registerPlaceRoutes } from "./routes/places";

const stripApiPrefix = (path: string) => {
  if (path === "/api") {
    return "/";
  }

  if (path.startsWith("/api/")) {
    return path.slice(4);
  }

  return path;
};

export const createApp = (mode?: string) => {
  const app = new Koa();
  const router = new Router();
  const provider = createProvider(mode, { fresh: true });

  app.context.state = {
    provider
  };

  app.use(corsMiddleware);
  app.use(errorMiddleware);
  app.use(requestIdMiddleware);
  app.use(bodyParser());
  app.use(async (ctx, next) => {
    ctx.path = stripApiPrefix(ctx.path);
    await next();
  });
  app.use(async (ctx, next) => {
    ctx.state.provider = provider;
    await next();
  });
  app.use(actorMiddleware);

  registerAuthRoutes(router);
  registerEventRoutes(router);
  registerDiscoverRoutes(router);
  registerPlaceRoutes(router);
  registerAnnouncementRoutes(router);
  registerNotificationRoutes(router);
  registerFileRoutes(router);

  router.get("/health", (ctx) => {
    ctx.body = {
      ok: true
    };
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
};
