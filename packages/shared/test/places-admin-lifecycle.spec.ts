import { createMockService } from "@community-map/shared";
import { describe, expect, it } from "vitest";

describe("shared mock place admin lifecycle", () => {
  it("updates only defined fields while preserving place identity and omissions", () => {
    const service = createMockService();
    const before = service._state.places.find(
      (place) => place._id === "place_001"
    );

    expect(before).toBeDefined();

    const updated = service.places.update("place_001", {
      name_en: "Edited Community Center",
      cover_url: null,
      tag_ids: ["edited", "service"],
      gallery_file_ids: [],
      recommended_reason_en: null
    });

    expect(updated).toMatchObject({
      _id: "place_001",
      community_id: "tongzilin",
      name_zh: before?.name_zh,
      name_en: "Edited Community Center",
      cover_file_id: before?.cover_file_id,
      cover_url: null,
      tag_ids: ["edited", "service"],
      gallery_file_ids: [],
      recommended_reason_en: null
    });
  });

  it("returns null for missing updates and deletes without mutating other places", () => {
    const service = createMockService();
    const before = service._state.places.map((place) => ({ ...place }));

    expect(
      service.places.update("place_missing", { name_en: "Missing" })
    ).toBeNull();
    expect(service.places.delete("place_missing")).toBeNull();
    expect(service._state.places).toEqual(before);
  });

  it("hard deletes places from admin and public reads", () => {
    const service = createMockService();

    expect(service.places.detail("place_001")).not.toBeNull();
    expect(
      service.places.listAdmin().items.map((place) => place._id)
    ).toContain("place_001");

    const result = service.places.delete("place_001");

    expect(result).toEqual({ deleted_id: "place_001" });
    expect(service.places.delete("place_001")).toBeNull();
    expect(
      service.places.listAdmin().items.map((place) => place._id)
    ).not.toContain("place_001");
    expect(
      service.places.list({ pageSize: 20 }).items.map((place) => place._id)
    ).not.toContain("place_001");
    expect(service.places.mapMarkers().map((place) => place._id)).not.toContain(
      "place_001"
    );
    expect(service.places.detail("place_001")).toBeNull();
  });
});
