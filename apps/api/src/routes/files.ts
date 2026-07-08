import Router from "@koa/router";
import {
  CompleteUploadInputSchema,
  CreateUploadRequestInputSchema,
  PrivateUrlRequestInputSchema
} from "@community-map/shared";

import { requireRole } from "../lib/auth";
import { parseOrThrow, sendSuccess } from "../lib/http";
import {
  isProtectedGalleryCompletion,
  isProtectedGalleryUploadRequest
} from "../lib/protected-files";
import {
  parseMultipartPostMediaUpload,
  parseMultipartReportEvidenceUpload
} from "../lib/multipart";

export const registerFileRoutes = (router: Router) => {
  const requireAdminRole = requireRole("community_admin", "system_admin");

  router.post("/files/upload-requests", async (ctx) => {
    const input = parseOrThrow(
      CreateUploadRequestInputSchema,
      ctx.request.body
    );

    if (isProtectedGalleryUploadRequest(input)) {
      await requireAdminRole(ctx, async () => undefined);
    }

    const data = await ctx.state.provider.files.createUploadRequest(input);
    sendSuccess(ctx, data, 201);
  });

  router.post("/files/complete", async (ctx) => {
    const input = parseOrThrow(CompleteUploadInputSchema, ctx.request.body);

    if (isProtectedGalleryCompletion(input)) {
      await requireAdminRole(ctx, async () => undefined);
    }

    const data = await ctx.state.provider.files.complete(
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data, 201);
  });

  router.post("/files/private-url", async (ctx) => {
    const input = parseOrThrow(PrivateUrlRequestInputSchema, ctx.request.body);
    const data = await ctx.state.provider.files.privateUrl(
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.post("/files/post-media", async (ctx) => {
    const file = await parseMultipartPostMediaUpload(ctx);
    const data = await ctx.state.provider.files.uploadPostMedia(
      file,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data, 201);
  });

  router.post("/files/report-evidence", async (ctx) => {
    const file = await parseMultipartReportEvidenceUpload(ctx);
    const data = await ctx.state.provider.files.uploadReportEvidence(
      {
        ...file,
        biz_id: file.fields.biz_id || undefined
      },
      ctx.state.actor._id
    );
    sendSuccess(ctx, data, 201);
  });
};
