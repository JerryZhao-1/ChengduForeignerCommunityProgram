import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  CreatePlaceInputSchema,
  PlaceDetailSchema,
  PlaceListItemSchema,
  PlaceMapMarkerSchema,
  PlaceSchema,
  createMockService
} from "@community-map/shared";
import { afterEach, describe, expect, it, vi } from "vitest";

const runImportCli = () => {
  const tempDir = mkdtempSync(join(tmpdir(), "volunteer-import-test-"));
  const outputPath = join(tempDir, "drafts.json");

  try {
    execFileSync(
      process.execPath,
      [
        "scripts/places_volunteer_import.mjs",
        "--input",
        "docs/志愿者点位采集表.xlsx",
        "--output",
        outputPath,
        "--dry-run"
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8"
      }
    );

    return {
      tempDir,
      data: JSON.parse(readFileSync(outputPath, "utf8")) as {
        parsed: {
          point_count: number;
          duplicate_labels: Array<{ label: string; count: number }>;
        };
        draft_places: Array<{
          source_import_id: string;
          place: unknown;
        }>;
        summary: {
          draft_count: number;
          public_count: number;
          records_needing_coordinate_review: number;
        };
      }
    };
  } catch (error) {
    rmSync(tempDir, { recursive: true, force: true });
    throw error;
  }
};

describe("volunteer places spreadsheet import", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses all point columns and preserves duplicate category rows", () => {
    const { tempDir, data } = runImportCli();

    try {
      expect(data.parsed.point_count).toBe(19);
      expect(data.draft_places).toHaveLength(19);
      expect(data.parsed.duplicate_labels).toContainEqual({
        label: "点位类型",
        count: 2
      });

      const firstPlace = PlaceSchema.parse(data.draft_places[0].place);

      expect(firstPlace.name_zh).toBe("欧焙联");
      expect(firstPlace.name_en).toBe("Obelian");
      expect(firstPlace.category_level_1).toBe("food-drink");
      expect(firstPlace.import_review?.volunteer_category_raw).toBe("餐饮");
      expect(firstPlace.import_review?.category_code_candidate_raw).toBeNull();
      expect(firstPlace.import_review?.raw_fields).toHaveProperty(
        "volunteer_category_raw",
        "餐饮"
      );
      expect(firstPlace.import_review?.raw_fields).toHaveProperty(
        "category_code_candidate_raw",
        ""
      );
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("maps volunteer records to draft-only place inputs with review blockers", () => {
    const { tempDir, data } = runImportCli();

    try {
      expect(data.summary.draft_count).toBe(19);
      expect(data.summary.public_count).toBe(0);
      expect(data.summary.records_needing_coordinate_review).toBe(19);

      for (const item of data.draft_places) {
        const place = PlaceSchema.parse(item.place);
        const input = CreatePlaceInputSchema.parse(item.place);

        expect(place.status).toBe("draft");
        expect(input.status).toBe("draft");
        expect(place.is_recommended).toBe(false);
        expect(place.supports_navigation).toBe(false);
        expect(place.location).toEqual({ latitude: 999, longitude: 999 });
        expect(place.import_review?.source_import_id).toBe(item.source_import_id);
        expect(place.import_review?.review_blockers).toContain(
          "needs_coordinate_review"
        );
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("keeps import review metadata out of public list, marker, and detail payloads", () => {
    const { tempDir, data } = runImportCli();

    try {
      const importedPlace = PlaceSchema.parse(data.draft_places[0].place);
      const service = createMockService({
        places: [importedPlace],
        fileAssets: []
      });

      expect(service.places.list({ keyword: importedPlace.name_zh }).items).toEqual(
        []
      );
      expect(service.places.mapMarkers()).toEqual([]);
      expect(service.places.detail(importedPlace._id)).toBeNull();

      const published = service.places.update(importedPlace._id, {
        status: "published",
        location: { latitude: 30.61, longitude: 104.06 },
        supports_navigation: true
      });
      expect(published).not.toBeNull();

      const publicItem = service.places.list({ keyword: importedPlace.name_zh })
        .items[0];
      const marker = service.places.mapMarkers()[0];
      const detail = service.places.detail(importedPlace._id);

      expect(publicItem).not.toHaveProperty("import_review");
      expect(marker).not.toHaveProperty("import_review");
      expect(detail).not.toHaveProperty("import_review");
      expect(PlaceListItemSchema.parse(publicItem)).toEqual(publicItem);
      expect(PlaceMapMarkerSchema.parse(marker)).toEqual(marker);
      expect(PlaceDetailSchema.parse(detail)).toEqual(detail);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("upserts imported drafts by source identity instead of creating duplicates", async () => {
    const { tempDir, data } = runImportCli();

    try {
      const existingPlace = PlaceSchema.parse(data.draft_places[0].place);
      const newPlace = PlaceSchema.parse(data.draft_places[1].place);
      const apiBaseUrl = "http://127.0.0.1:8787";
      const fetchMock = vi
        .spyOn(globalThis, "fetch")
        .mockImplementation(async (input, init) => {
          const url = String(input);
          const method = init?.method ?? "GET";

          if (url === `${apiBaseUrl}/admin/places` && method === "GET") {
            return new Response(
              JSON.stringify({
                success: true,
                data: { items: [existingPlace] }
              })
            );
          }

          if (
            url === `${apiBaseUrl}/admin/places/${existingPlace._id}` &&
            method === "PATCH"
          ) {
            return new Response(
              JSON.stringify({
                success: true,
                data: existingPlace
              })
            );
          }

          if (url === `${apiBaseUrl}/admin/places` && method === "POST") {
            return new Response(
              JSON.stringify({
                success: true,
                data: { ...newPlace, _id: "place_created_by_api" }
              }),
              { status: 201 }
            );
          }

          return new Response(
            JSON.stringify({
              success: false,
              error: { code: "UNEXPECTED_REQUEST", message: `${method} ${url}` }
            }),
            { status: 500 }
          );
        });

      const importScriptPath = "../../../scripts/places_volunteer_import.mjs";
      const { postDrafts } = await import(importScriptPath);
      const results = await postDrafts(apiBaseUrl, "user_001", [
        data.draft_places[0],
        data.draft_places[1]
      ]);

      expect(results).toEqual([
        {
          source_import_id: data.draft_places[0].source_import_id,
          action: "updated",
          status: 200,
          success: true,
          id: existingPlace._id,
          error: null
        },
        {
          source_import_id: data.draft_places[1].source_import_id,
          action: "created",
          status: 201,
          success: true,
          id: "place_created_by_api",
          error: null
        }
      ]);
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        `${apiBaseUrl}/admin/places/${existingPlace._id}`,
        expect.objectContaining({ method: "PATCH" })
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        `${apiBaseUrl}/admin/places`,
        expect.objectContaining({ method: "POST" })
      );
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
