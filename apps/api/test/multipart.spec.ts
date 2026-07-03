import { Readable } from "node:stream";

import type { Context } from "koa";

import { parseMultipartImageUpload } from "../src/lib/multipart";

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
          "content-length": String(7 * 1024 * 1024)
        };
        return headers[name.toLowerCase()] ?? "";
      },
      req
    } as unknown as Context;

    await expect(parseMultipartImageUpload(ctx)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Gallery upload is too large.",
      status: 400
    });
  });

  it("stops reading once the multipart body exceeds the hard cap", async () => {
    const oneMegabyte = Buffer.alloc(1024 * 1024, "x");
    const ctx = createContext(
      {
        "content-type": "multipart/form-data; boundary=test-boundary"
      },
      Array.from({ length: 7 }, () => oneMegabyte)
    );

    await expect(parseMultipartImageUpload(ctx)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Gallery upload is too large.",
      status: 400
    });
  });
});
