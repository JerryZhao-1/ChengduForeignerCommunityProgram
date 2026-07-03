import type { Context } from "koa";

import { apiError } from "./errors";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_IMAGE_BYTES + 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

export interface UploadedImageFile {
  file_name: string;
  content_type: string;
  buffer: Buffer;
}

const readRequestBuffer = async (ctx: Context) => {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of ctx.req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;

    if (totalBytes > MAX_MULTIPART_BYTES) {
      throw apiError("VALIDATION_ERROR", "Gallery upload is too large.", 400, {
        max_bytes: MAX_MULTIPART_BYTES
      });
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
};

const splitBuffer = (buffer: Buffer, separator: Buffer) => {
  const parts: Buffer[] = [];
  let start = 0;
  let index = buffer.indexOf(separator, start);

  while (index >= 0) {
    parts.push(buffer.subarray(start, index));
    start = index + separator.length;
    index = buffer.indexOf(separator, start);
  }

  parts.push(buffer.subarray(start));
  return parts;
};

const parseContentDisposition = (value: string) => {
  const params = new Map<string, string>();

  for (const part of value.split(";").slice(1)) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey || rawValue.length === 0) {
      continue;
    }
    params.set(rawKey, rawValue.join("=").replace(/^"|"$/g, ""));
  }

  return params;
};

const stripTrailingCrlf = (buffer: Buffer) =>
  buffer.subarray(
    0,
    buffer.length >= 2 && buffer.subarray(-2).toString() === "\r\n"
      ? -2
      : undefined
  );

export const parseMultipartImageUpload = async (
  ctx: Context
): Promise<UploadedImageFile> => {
  const contentType = ctx.get("content-type");
  const boundary = contentType.match(/boundary=([^;]+)/)?.[1];
  const contentLength = Number(ctx.get("content-length"));

  if (!boundary) {
    throw apiError(
      "VALIDATION_ERROR",
      "Multipart form boundary is required.",
      400
    );
  }

  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
    throw apiError("VALIDATION_ERROR", "Gallery upload is too large.", 400, {
      max_bytes: MAX_MULTIPART_BYTES
    });
  }

  const body = await readRequestBuffer(ctx);
  const parts = splitBuffer(body, Buffer.from(`--${boundary}`));

  for (const rawPart of parts) {
    let part = rawPart;
    if (part.subarray(0, 2).toString() === "\r\n") {
      part = part.subarray(2);
    }
    if (part.length === 0 || part.subarray(0, 2).toString() === "--") {
      continue;
    }

    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd < 0) {
      continue;
    }

    const headerLines = part
      .subarray(0, headerEnd)
      .toString("utf8")
      .split("\r\n");
    const headers = new Map(
      headerLines.map((line) => {
        const [name, ...valueParts] = line.split(":");
        return [name.toLowerCase(), valueParts.join(":").trim()];
      })
    );
    const disposition = headers.get("content-disposition");
    if (!disposition) {
      continue;
    }

    const params = parseContentDisposition(disposition);
    if (params.get("name") !== "file") {
      continue;
    }

    const fileName = params.get("filename")?.trim();
    const fileBody = stripTrailingCrlf(part.subarray(headerEnd + 4));
    const fileContentType =
      headers.get("content-type")?.toLowerCase() || "application/octet-stream";

    if (!fileName || fileBody.length === 0) {
      throw apiError(
        "VALIDATION_ERROR",
        "Uploaded image file is required.",
        400
      );
    }

    if (!SUPPORTED_IMAGE_TYPES.has(fileContentType)) {
      throw apiError(
        "VALIDATION_ERROR",
        "Unsupported gallery image type.",
        400,
        {
          content_type: fileContentType
        }
      );
    }

    if (fileBody.length > MAX_IMAGE_BYTES) {
      throw apiError("VALIDATION_ERROR", "Gallery image is too large.", 400, {
        max_bytes: MAX_IMAGE_BYTES
      });
    }

    return {
      file_name: fileName,
      content_type: fileContentType,
      buffer: fileBody
    };
  }

  throw apiError("VALIDATION_ERROR", "Uploaded image file is required.", 400);
};
