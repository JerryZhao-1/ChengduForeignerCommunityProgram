import { Readable } from "node:stream";

import type { Context } from "koa";

import {
  parseMultipartImageUpload,
  parseMultipartReportEvidenceUpload
} from "../src/lib/multipart";

const createContext = (
  headers: Record<string, string>,
  chunks: Buffer[]
): Context =>
  ({
    get(name: string) {
      return headers[name.toLowerCase()] ?? "";
    },
    req: Readable.from(chunks)
  }) as unknown as Context;

describe("multipart image upload parser", () => {
  it("rejects oversized uploads from content-length before reading the stream", async () => {
    const req = new Readable({
      read() {
        throw new Error("request stream should not be consumed");
      }
    });
    const ctx = {
      get(name: string) {
        const headers: Record<string, string> = {
          "content-type": "multipart/form-data; boundary=test-boundary",
          "content-length": String(52 * 1024 * 1024)
        };
        return headers[name.toLowerCase()] ?? "";
      },
      req
    } as unknown as Context;

    await expect(parseMultipartImageUpload(ctx)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "image is too large.",
      status: 400
    });
  });

  it("stops reading once the multipart body exceeds the hard cap", async () => {
    const oneMegabyte = Buffer.alloc(1024 * 1024, "x");
    const ctx = createContext(
      {
        "content-type": "multipart/form-data; boundary=test-boundary"
      },
      Array.from({ length: 52 }, () => oneMegabyte)
    );

    await expect(parseMultipartImageUpload(ctx)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Gallery upload is too large.",
      status: 400
    });
  });

  it("parses report evidence file uploads with form fields", async () => {
    const boundary = "test-boundary";
    const body = Buffer.from(
      [
        `--${boundary}`,
        'Content-Disposition: form-data; name="biz_id"',
        "",
        "pending_report_post_003",
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"; filename="evidence.jpg"',
        "Content-Type: image/jpeg",
        "",
        "fake evidence bytes",
        `--${boundary}--`,
        ""
      ].join("\r\n")
    );
    const ctx = createContext(
      {
        "content-type": `multipart/form-data; boundary=${boundary}`,
        "content-length": String(body.length)
      },
      [body]
    );

    const file = await parseMultipartReportEvidenceUpload(ctx);

    expect(file.file_name).toBe("evidence.jpg");
    expect(file.content_type).toBe("image/jpeg");
    expect(file.kind).toBe("image");
    expect(file.buffer.toString("utf8")).toBe("fake evidence bytes");
    expect(file.fields.biz_id).toBe("pending_report_post_003");
  });
});
