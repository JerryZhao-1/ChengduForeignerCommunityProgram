#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const DEFAULT_INPUT = "docs/志愿者点位采集表.xlsx";
const DEFAULT_COMMUNITY_ID = "tongzilin";
const MISSING_COORDINATE = {
  latitude: 999,
  longitude: 999
};

const VOLUNTEER_CATEGORY_MAP = new Map([
  ["社区服务", "public-service"],
  ["餐饮", "food-drink"],
  ["酒类", "food-drink"],
  ["咖啡", "food-drink"],
  ["服饰", "shopping"],
  ["购物", "shopping"],
  ["生活服务", "lifestyle"],
  ["教育", "education"],
  ["医疗健康", "health-wellness"],
  ["休闲娱乐", "entertainment"],
  ["娱乐", "entertainment"],
  ["户外运动", "outdoor-sports"],
  ["交通", "transport"],
  ["社区/公共空间", "community"],
  ["社区", "community"]
]);

const INTERNAL_CATEGORIES = new Set([
  "public-service",
  "food-drink",
  "shopping",
  "lifestyle",
  "education",
  "health-wellness",
  "entertainment",
  "outdoor-sports",
  "transport",
  "community"
]);

const FIELD_ALIASES = {
  点位类型: "volunteer_category_raw",
  点位类型__row3: "volunteer_category_raw",
  点位类型__row6: "category_code_candidate_raw",
  中文名: "name_zh",
  "英文名/英文别称": "name_en",
  "别名/旧名/常⽤名": "alias",
  详细地址: "address_zh",
  位置凭证: "position_evidence",
  入口说明: "entrance_note",
  线路补充备注: "route_note",
  "主要服务/\n是做什么的": "main_service_zh",
  "营业/开放时间": "business_hours_zh",
  联系方式: "contact",
  适合人群: "audience",
  费用信息: "cost_note",
  语言支持: "language_support",
  无障碍情况: "accessibility",
  标签: "tags",
  "门头/入口照片": "entrance_photo",
  环境照片: "environment_photo",
  补充备注: "extra_note"
};

const decodeXml = (value) =>
  value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    );

const stripTags = (value) => value.replace(/<[^>]*>/g, "");

const normalizeCellText = (value) =>
  String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/_x000d_/gi, "\n")
    .replace(/\u3000/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();

const columnIndexFromRef = (cellRef) => {
  const letters = cellRef.replace(/[0-9]/g, "");
  let index = 0;

  for (const letter of letters) {
    index = index * 26 + letter.charCodeAt(0) - 64;
  }

  return index;
};

const unzipFile = (workbookPath, archivePath) => {
  try {
    return execFileSync("unzip", ["-p", workbookPath, archivePath], {
      encoding: "utf8"
    });
  } catch (error) {
    if (process.platform !== "win32") {
      throw error;
    }

    const tempDir = mkdtempSync(join(tmpdir(), "places-xlsx-"));
    try {
      execFileSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          `Expand-Archive -LiteralPath '${workbookPath.replaceAll("'", "''")}' -DestinationPath '${tempDir.replaceAll("'", "''")}' -Force`
        ],
        { stdio: "ignore" }
      );
      return readFileSync(join(tempDir, archivePath), "utf8");
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
};

const parseSharedStrings = (workbookPath) => {
  let xml = "";
  try {
    xml = unzipFile(workbookPath, "xl/sharedStrings.xml");
  } catch {
    return [];
  }

  return [...xml.matchAll(/<si\b[\s\S]*?<\/si>/g)].map(([item]) => {
    const text = [...item.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
      .map((match) => decodeXml(match[1]))
      .join("");
    return normalizeCellText(text);
  });
};

const parseSheetRows = (workbookPath) => {
  const sharedStrings = parseSharedStrings(workbookPath);
  const sheetXml = unzipFile(workbookPath, "xl/worksheets/sheet1.xml");
  const rows = new Map();

  for (const match of sheetXml.matchAll(
    /<c\b([^>/]*?)\/>|<c\b([^>/]*?)>([\s\S]*?)<\/c>/g
  )) {
    const attrs = match[1] ?? match[2];
    const body = match[3] ?? "";
    const ref = attrs.match(/\br="([^"]+)"/)?.[1];
    if (!ref) {
      continue;
    }

    const rowIndex = Number(ref.replace(/[A-Z]/g, ""));
    const columnIndex = columnIndexFromRef(ref);
    const type = attrs.match(/\bt="([^"]+)"/)?.[1];
    const rawValue = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
    const inlineValue = body.match(/<t\b[^>]*>([\s\S]*?)<\/t>/)?.[1];
    let value = "";

    if (type === "s" && rawValue !== undefined) {
      value = sharedStrings[Number(rawValue)] ?? "";
    } else if (inlineValue !== undefined) {
      value = decodeXml(inlineValue);
    } else if (rawValue !== undefined) {
      value = decodeXml(stripTags(rawValue));
    }

    if (!rows.has(rowIndex)) {
      rows.set(rowIndex, new Map());
    }
    rows.get(rowIndex).set(columnIndex, normalizeCellText(value));
  }

  return rows;
};

const cell = (rows, rowIndex, columnIndex) =>
  normalizeCellText(rows.get(rowIndex)?.get(columnIndex) ?? "");

export const parseVolunteerWorkbook = (workbookPath = DEFAULT_INPUT) => {
  const rows = parseSheetRows(workbookPath);
  const sheetName = "工作表1";
  const pointColumns = [];

  for (const [columnIndex, value] of rows.get(2) ?? new Map()) {
    if (/^点位\d+$/.test(value)) {
      pointColumns.push({ columnIndex, point_label: value });
    }
  }

  const fieldRows = [];
  const labelCounts = new Map();
  for (const [rowIndex, values] of [...rows.entries()].sort(
    (a, b) => a[0] - b[0]
  )) {
    const label = normalizeCellText(values.get(3) ?? "");
    if (!label) {
      continue;
    }

    const count = (labelCounts.get(label) ?? 0) + 1;
    labelCounts.set(label, count);
    fieldRows.push({
      rowIndex,
      section: normalizeCellText(values.get(1) ?? ""),
      label,
      field_key: count > 1 ? `${label}__row${rowIndex}` : label,
      required_hint: normalizeCellText(values.get(4) ?? "")
    });
  }

  const records = pointColumns
    .map((pointColumn) => {
      const fields = {};
      const raw_rows = {};

      for (const field of fieldRows) {
        const value = cell(rows, field.rowIndex, pointColumn.columnIndex);
        const key =
          FIELD_ALIASES[field.field_key] ?? FIELD_ALIASES[field.label];
        const rawKey = `${field.field_key}__${field.rowIndex}`;
        raw_rows[rawKey] = value;
        if (key) {
          fields[key] = value;
        }
      }

      return {
        source_file: basename(workbookPath),
        source_sheet: sheetName,
        source_column: pointColumn.point_label,
        source_column_index: pointColumn.columnIndex,
        fields,
        raw_rows
      };
    })
    .filter((record) =>
      Object.values(record.fields).some((value) => normalizeCellText(value))
    );

  return {
    workbook: workbookPath,
    sheet_name: sheetName,
    point_count: records.length,
    records,
    duplicate_labels: [...labelCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([label, count]) => ({ label, count }))
  };
};

const stableId = (record) => {
  const hash = createHash("sha1")
    .update(
      [
        record.source_file,
        record.source_sheet,
        record.source_column,
        record.fields.name_zh ?? "",
        record.fields.address_zh ?? ""
      ].join("|")
    )
    .digest("hex")
    .slice(0, 10);
  return `place_import_${hash}`;
};

const splitTags = (value) =>
  normalizeCellText(value)
    .split(/[，,、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const resolveCategory = (record) => {
  const candidate = normalizeCellText(
    record.fields.category_code_candidate_raw
  );
  if (INTERNAL_CATEGORIES.has(candidate)) {
    return {
      category: candidate,
      blocker: null
    };
  }

  const volunteerCategory = normalizeCellText(
    record.fields.volunteer_category_raw
  );
  const mapped = VOLUNTEER_CATEGORY_MAP.get(volunteerCategory);
  if (mapped) {
    return {
      category: mapped,
      blocker: null
    };
  }

  return {
    category: "community",
    blocker: `unsupported_category:${volunteerCategory || candidate || "missing"}`
  };
};

export const mapVolunteerRecordsToDraftPlaces = (parseResult) =>
  parseResult.records.map((record) => {
    const { category, blocker } = resolveCategory(record);
    const blockers = [];
    const notes = [];
    const nameZh = normalizeCellText(record.fields.name_zh);
    const nameEn = normalizeCellText(record.fields.name_en);
    const addressZh = normalizeCellText(record.fields.address_zh);
    const mainServiceZh = normalizeCellText(record.fields.main_service_zh);
    const businessHoursZh = normalizeCellText(record.fields.business_hours_zh);
    const tags = splitTags(record.fields.tags);

    if (!nameZh) {
      blockers.push("missing_name_zh");
    }
    if (!nameEn) {
      blockers.push("needs_english_name_review");
    }
    if (!addressZh) {
      blockers.push("missing_address_zh");
    }
    if (!record.fields.position_evidence) {
      blockers.push("missing_position_evidence");
    }
    if (!record.fields.entrance_photo) {
      blockers.push("missing_media");
    }
    if (!record.fields.category_code_candidate_raw) {
      notes.push("no_internal_category_candidate");
    }
    if (!tags.length) {
      blockers.push("needs_tag_review");
    }
    blockers.push("needs_coordinate_review");
    if (blocker) {
      blockers.push(blocker);
    }

    const sourceImportId = `${record.source_file}:${record.source_sheet}:${record.source_column}`;

    return {
      source_import_id: sourceImportId,
      place: {
        _id: stableId(record),
        community_id: DEFAULT_COMMUNITY_ID,
        name_zh: nameZh || `待审核点位 ${record.source_column}`,
        name_en: nameEn || "Pending English name",
        cover_file_id: null,
        cover_url: null,
        category_level_1: category,
        category_level_2:
          normalizeCellText(record.fields.volunteer_category_raw) ||
          "pending-review",
        tag_ids: tags,
        address_zh: addressZh,
        address_en: "",
        location: MISSING_COORDINATE,
        tencent_map_poi_id: null,
        business_hours_zh: businessHoursZh,
        business_hours_en: "",
        intro_zh: mainServiceZh,
        intro_en: "",
        recommended_reason_zh: null,
        recommended_reason_en: null,
        is_recommended: false,
        recommended_rank: 0,
        gallery_file_ids: [],
        gallery_urls: [],
        supports_navigation: false,
        supports_favorite: true,
        supports_share: true,
        status: "draft",
        import_review: {
          source_type: "volunteer_spreadsheet",
          source_file: record.source_file,
          source_sheet: record.source_sheet,
          source_column: record.source_column,
          source_import_id: sourceImportId,
          volunteer_category_raw:
            normalizeCellText(record.fields.volunteer_category_raw) || null,
          category_code_candidate_raw:
            normalizeCellText(record.fields.category_code_candidate_raw) ||
            null,
          raw_fields: Object.fromEntries(
            Object.entries(record.fields).map(([key, value]) => [
              key,
              normalizeCellText(value)
            ])
          ),
          review_blockers: [...new Set(blockers)],
          review_notes: notes
        }
      }
    };
  });

export const buildVolunteerImport = (workbookPath = DEFAULT_INPUT) => {
  const parsed = parseVolunteerWorkbook(workbookPath);
  const draft_places = mapVolunteerRecordsToDraftPlaces(parsed);

  return {
    source: {
      workbook: workbookPath,
      sheet_name: parsed.sheet_name
    },
    parsed: {
      point_count: parsed.point_count,
      duplicate_labels: parsed.duplicate_labels
    },
    draft_places,
    summary: {
      draft_count: draft_places.length,
      public_count: draft_places.filter(
        (item) => item.place.status === "published"
      ).length,
      records_with_category_blockers: draft_places.filter((item) =>
        item.place.import_review?.review_blockers.some((blocker) =>
          blocker.startsWith("unsupported_category:")
        )
      ).length,
      records_needing_coordinate_review: draft_places.filter((item) =>
        item.place.import_review?.review_blockers.includes(
          "needs_coordinate_review"
        )
      ).length
    }
  };
};

const parseArgs = (argv) => {
  const args = {
    input: DEFAULT_INPUT,
    output: "",
    apiBaseUrl: "",
    actorId: "user_001",
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") {
      args.input = argv[++index];
    } else if (arg === "--output") {
      args.output = argv[++index];
    } else if (arg === "--api-base-url") {
      args.apiBaseUrl = argv[++index].replace(/\/+$/, "");
    } else if (arg === "--actor-id") {
      args.actorId = argv[++index];
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    }
  }

  return args;
};

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const body = await response.json();

  return { response, body };
};

const loadExistingImportedPlaces = async (apiBaseUrl, actorId) => {
  const { response, body } = await requestJson(`${apiBaseUrl}/admin/places`, {
    method: "GET",
    headers: {
      "x-mock-user-id": actorId
    }
  });

  if (!response.ok || body.success !== true) {
    throw new Error(
      `Failed to load existing imported places: ${response.status} ${JSON.stringify(body.error ?? body)}`
    );
  }

  return new Map(
    (body.data?.items ?? [])
      .filter((place) => place.import_review?.source_import_id)
      .map((place) => [place.import_review.source_import_id, place])
  );
};

export const postDrafts = async (apiBaseUrl, actorId, draftPlaces) => {
  const existingBySourceImportId = await loadExistingImportedPlaces(
    apiBaseUrl,
    actorId
  );
  const results = [];
  for (const item of draftPlaces) {
    const existing = existingBySourceImportId.get(item.source_import_id);

    if (existing && existing.status !== "draft") {
      results.push({
        source_import_id: item.source_import_id,
        action: "skipped",
        status: 200,
        success: true,
        id: existing._id,
        reason: `existing_import_status:${existing.status}`,
        error: null
      });
      continue;
    }

    const method = existing ? "PATCH" : "POST";
    const path = existing
      ? `${apiBaseUrl}/admin/places/${encodeURIComponent(existing._id)}`
      : `${apiBaseUrl}/admin/places`;
    const payload = existing
      ? {
          import_review: item.place.import_review
        }
      : item.place;
    const { response, body } = await requestJson(path, {
      method,
      headers: {
        "content-type": "application/json",
        "x-mock-user-id": actorId
      },
      body: JSON.stringify(payload)
    });
    if (body.success === true && body.data?.import_review?.source_import_id) {
      existingBySourceImportId.set(
        body.data.import_review.source_import_id,
        body.data
      );
    }
    results.push({
      source_import_id: item.source_import_id,
      action: existing ? "updated" : "created",
      status: response.status,
      success: body.success === true,
      id: body.data?._id,
      reason: null,
      error: body.error ?? null
    });
  }
  return results;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const result = buildVolunteerImport(args.input);

  if (args.apiBaseUrl && !args.dryRun) {
    result.execution = {
      mode: "admin_api",
      api_base_url: args.apiBaseUrl,
      results: await postDrafts(
        args.apiBaseUrl,
        args.actorId,
        result.draft_places
      )
    };
  } else {
    result.execution = {
      mode: "dry_run"
    };
  }

  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (args.output) {
    mkdirSync(args.output.split("/").slice(0, -1).join("/") || ".", {
      recursive: true
    });
    writeFileSync(args.output, json);
  } else {
    process.stdout.write(json);
  }

  process.stderr.write(
    `Parsed ${result.parsed.point_count} records; mapped ${result.summary.draft_count} draft places.\n`
  );
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
