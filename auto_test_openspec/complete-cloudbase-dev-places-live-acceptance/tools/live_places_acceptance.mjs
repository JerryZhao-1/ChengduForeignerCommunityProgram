#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DEFAULT_BASE_URL =
  "https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api";
const DEFAULT_ACTOR_ID = "user_001";
const ACCEPTANCE_NAME_EN = "CloudBase Live Acceptance Place";
const ACCEPTANCE_NAME_ZH = "CloudBase Dev 验收点位";
const FORBIDDEN_LIST_FIELDS = [
  "gallery_media",
  "gallery_urls",
  "navigation",
  "share",
  "import_review",
  "gallery_file_ids"
];
const FORBIDDEN_MARKER_FIELDS = [
  "gallery_media",
  "gallery_urls",
  "navigation",
  "share",
  "import_review",
  "gallery_file_ids",
  "address_zh",
  "address_en",
  "intro_zh",
  "intro_en"
];

const toolDir = dirname(fileURLToPath(import.meta.url));
const changeDir = resolve(toolDir, "..");
const repoRoot = resolve(changeDir, "..", "..");
const runDir = process.cwd();
const command = process.argv[2];
const baseUrl = (process.env.API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
const actorId = process.env.ACTOR_ID ?? DEFAULT_ACTOR_ID;

const ensureDirs = () => {
  for (const name of ["logs", "outputs", "expected", "tests"]) {
    mkdirSync(resolve(runDir, name), { recursive: true });
  }
};

const writeJson = (relativePath, value) => {
  const target = resolve(runDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};

const writeText = (relativePath, value) => {
  const target = resolve(runDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, value.endsWith("\n") ? value : `${value}\n`);
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const requestJson = async (label, path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.admin ? { "x-mock-user-id": actorId } : {}),
      ...(options.headers ?? {})
    }
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { parse_error: text };
  }
  const capture = {
    label,
    method: options.method ?? "GET",
    url: `${baseUrl}${path}`,
    status: response.status,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries()),
    body
  };
  writeJson(`outputs/${label}.json`, capture);
  return capture;
};

const isSuccess = (capture) =>
  capture.status >= 200 && capture.status < 300 && capture.body?.success !== false;

const envelopeData = (capture) => capture.body?.data ?? capture.body;

const summarizePage = (capture) => {
  const data = envelopeData(capture);
  return {
    status: capture.status,
    success: capture.body?.success ?? null,
    requestId: capture.body?.requestId ?? null,
    total: data?.total ?? null,
    item_count: Array.isArray(data?.items) ? data.items.length : null,
    ids: Array.isArray(data?.items) ? data.items.map((item) => item._id) : []
  };
};

const summarizeArray = (capture) => {
  const data = envelopeData(capture);
  return {
    status: capture.status,
    success: capture.body?.success ?? null,
    requestId: capture.body?.requestId ?? null,
    item_count: Array.isArray(data) ? data.length : null,
    ids: Array.isArray(data) ? data.map((item) => item._id) : []
  };
};

const getAdminPlaces = async () => {
  const capture = await requestJson("admin-places", "/admin/places", {
    admin: true
  });
  assert(isSuccess(capture), "admin places list must succeed");
  const items = envelopeData(capture)?.items ?? [];
  assert(Array.isArray(items), "admin places data.items must be an array");
  return { capture, items };
};

const findAcceptancePlace = async () => {
  const { items } = await getAdminPlaces();
  return items.find(
    (place) =>
      place.name_en === ACCEPTANCE_NAME_EN || place.name_zh === ACCEPTANCE_NAME_ZH
  );
};

const findDraftPlace = async () => {
  const { items } = await getAdminPlaces();
  return items.find(
    (place) =>
      place.status === "draft" &&
      place.import_review?.source_import_id &&
      place.import_review?.source_type === "volunteer_spreadsheet"
  );
};

const acceptancePayload = (overrides = {}) => ({
  community_id: "tongzilin",
  name_zh: ACCEPTANCE_NAME_ZH,
  name_en: ACCEPTANCE_NAME_EN,
  cover_file_id: null,
  cover_url: null,
  category_level_1: "community",
  category_level_2: "live-acceptance",
  tag_ids: ["acceptance", "cloudbase-dev"],
  address_zh: "成都市武侯区桐梓林片区 CloudBase dev 验收点位",
  address_en: "CloudBase dev acceptance place, Tongzilin, Chengdu",
  location: {
    latitude: 30.615902,
    longitude: 104.06594
  },
  tencent_map_poi_id: null,
  business_hours_zh: "周一至周日 09:00-18:00",
  business_hours_en: "Mon-Sun 09:00-18:00",
  intro_zh: "用于 CloudBase dev Places 真实数据验收的受控公开点位。",
  intro_en:
    "Controlled published place for CloudBase dev Places live-data acceptance.",
  recommended_reason_zh: "CloudBase dev 验收样例",
  recommended_reason_en: "CloudBase dev acceptance sample",
  is_recommended: true,
  recommended_rank: 10,
  gallery_file_ids: [],
  gallery_urls: [],
  supports_navigation: true,
  supports_favorite: true,
  supports_share: true,
  status: "published",
  import_review: null,
  ...overrides
});

const createOrUpdateAcceptancePlace = async () => {
  const existing = await findAcceptancePlace();
  const payload = acceptancePayload();
  const path = existing
    ? `/admin/places/${encodeURIComponent(existing._id)}`
    : "/admin/places";
  const method = existing ? "PATCH" : "POST";
  const capture = await requestJson("acceptance-place-write", path, {
    method,
    admin: true,
    body: JSON.stringify(payload)
  });
  assert(isSuccess(capture), `${method} acceptance place must succeed`);
  const place = envelopeData(capture);
  assert(place.status === "published", "acceptance place must be published");
  assert(
    Number.isFinite(place.location?.latitude) &&
      Number.isFinite(place.location?.longitude),
    "acceptance place must have finite coordinates"
  );
  return { action: existing ? "updated" : "created", place, capture };
};

const assertNoForbiddenFields = (label, item, forbiddenFields) => {
  for (const field of forbiddenFields) {
    assert(!(field in item), `${label} must not expose ${field}`);
  }
};

const verifyPublicReadsForPlace = async (placeId) => {
  const list = await requestJson("public-list", "/places?page=1&pageSize=50");
  const markers = await requestJson("public-markers", "/places/map-markers");
  const detail = await requestJson(
    "public-detail",
    `/places/${encodeURIComponent(placeId)}`
  );
  assert(isSuccess(list), "public places list must succeed");
  assert(isSuccess(markers), "public markers must succeed");
  assert(isSuccess(detail), "public detail must succeed");

  const listItem = envelopeData(list)?.items?.find((item) => item._id === placeId);
  const marker = envelopeData(markers)?.find((item) => item._id === placeId);
  const detailPlace = envelopeData(detail);
  assert(listItem, "published acceptance place must appear in public list");
  assert(marker, "published acceptance place must appear in map markers");
  assert(detailPlace?._id === placeId, "detail id must match acceptance place");
  assertNoForbiddenFields("list item", listItem, FORBIDDEN_LIST_FIELDS);
  assertNoForbiddenFields("marker", marker, FORBIDDEN_MARKER_FIELDS);
  assert(!("import_review" in detailPlace), "detail must not expose import_review");
  assert(detailPlace.navigation, "detail must include navigation");
  assert(detailPlace.share, "detail must include share");
  return { list, markers, detail, listItem, marker, detailPlace };
};

const runBaseline = async () => {
  const health = await requestJson("health", "/health");
  const list = await requestJson("public-list", "/places?page=1&pageSize=50");
  const markers = await requestJson("public-markers", "/places/map-markers");
  const admin = await requestJson("admin-places", "/admin/places", {
    admin: true
  });
  assert(health.status === 200 && health.body?.ok === true, "health must be ok");
  assert(isSuccess(list), "public list must succeed");
  assert(isSuccess(markers), "public markers must succeed");
  assert(isSuccess(admin), "admin list must succeed");
  const summary = {
    api_base_url: baseUrl,
    actor_id: actorId,
    health: {
      status: health.status,
      ok: health.body?.ok ?? null
    },
    public_list: summarizePage(list),
    public_markers: summarizeArray(markers),
    admin_places: summarizePage(admin),
    baseline_state:
      (envelopeData(admin)?.total ?? 0) === 0 ? "empty" : "non-empty"
  };
  writeJson("outputs/baseline-summary.json", summary);
  writeJson("outputs/assertions.json", {
    pass: true,
    assertions: [
      "CloudBase dev API health returned 200",
      "Public list returned a success envelope",
      "Map markers returned a success envelope",
      "Admin list returned a success envelope",
      "Baseline data state was explicitly recorded"
    ]
  });
  console.log(JSON.stringify(summary, null, 2));
};

const runImport = async () => {
  const importModule = await import(
    pathToFileURL(resolve(repoRoot, "scripts/places_volunteer_import.mjs"))
  );
  const result = importModule.buildVolunteerImport(
    resolve(repoRoot, "docs/志愿者点位采集表.xlsx")
  );
  result.execution = {
    mode: "admin_api",
    api_base_url: baseUrl,
    actor_id: actorId,
    results: await importModule.postDrafts(
      baseUrl,
      actorId,
      result.draft_places
    )
  };
  writeJson("outputs/import-execution.json", result);

  const { items } = await getAdminPlaces();
  const importedIds = new Set(
    result.draft_places.map((item) => item.source_import_id)
  );
  const imported = items.filter((place) =>
    importedIds.has(place.import_review?.source_import_id)
  );
  writeJson("outputs/imported-admin-drafts.json", {
    count: imported.length,
    items: imported.map((place) => ({
      _id: place._id,
      status: place.status,
      source_import_id: place.import_review?.source_import_id,
      review_blockers: place.import_review?.review_blockers ?? []
    }))
  });
  assert(result.summary.draft_count > 0, "import must map at least one draft");
  assert(result.summary.public_count === 0, "import must not publish records");
  assert(
    result.execution.results.every((item) => item.success),
    "all import API writes must succeed"
  );
  assert(
    imported.length === result.summary.draft_count,
    "all imported source ids must be visible in admin list"
  );
  assert(
    imported.every((place) => place.status === "draft"),
    "all imported records must remain draft"
  );
  writeJson("outputs/assertions.json", {
    pass: true,
    draft_count: imported.length,
    created: result.execution.results.filter((item) => item.action === "created")
      .length,
    updated: result.execution.results.filter((item) => item.action === "updated")
      .length
  });
  console.log(
    JSON.stringify(
      {
        draft_count: imported.length,
        created: result.execution.results.filter(
          (item) => item.action === "created"
        ).length,
        updated: result.execution.results.filter(
          (item) => item.action === "updated"
        ).length
      },
      null,
      2
    )
  );
};

const runPublishedPlace = async () => {
  const result = await createOrUpdateAcceptancePlace();
  const { items } = await getAdminPlaces();
  const stored = items.find((place) => place._id === result.place._id);
  assert(stored, "acceptance place must be present in admin list");
  assert(stored.status === "published", "admin list place must be published");
  writeJson("outputs/acceptance-place-summary.json", {
    action: result.action,
    id: result.place._id,
    name_en: result.place.name_en,
    name_zh: result.place.name_zh,
    status: result.place.status,
    location: result.place.location,
    category_level_1: result.place.category_level_1,
    category_level_2: result.place.category_level_2
  });
  writeJson("outputs/assertions.json", {
    pass: true,
    action: result.action,
    id: result.place._id
  });
  console.log(JSON.stringify({ action: result.action, id: result.place._id }));
};

const runPublicVerify = async () => {
  const place = await findAcceptancePlace();
  assert(place, "acceptance place must exist before public verification");
  const result = await verifyPublicReadsForPlace(place._id);
  writeJson("outputs/public-verification-summary.json", {
    id: place._id,
    list_item_keys: Object.keys(result.listItem),
    marker_keys: Object.keys(result.marker),
    detail_keys: Object.keys(result.detailPlace),
    request_ids: {
      list: result.list.body?.requestId ?? null,
      markers: result.markers.body?.requestId ?? null,
      detail: result.detail.body?.requestId ?? null
    }
  });
  writeJson("outputs/assertions.json", {
    pass: true,
    id: place._id,
    checks: [
      "published place appears in public list",
      "published place appears in map markers",
      "published place detail is readable",
      "public field boundaries are preserved"
    ]
  });
  console.log(JSON.stringify({ id: place._id, pass: true }));
};

const runDraftDenial = async () => {
  const draft = await findDraftPlace();
  assert(draft, "a draft imported place must exist before draft denial check");
  const list = await requestJson("public-list", "/places?page=1&pageSize=50");
  const markers = await requestJson("public-markers", "/places/map-markers");
  const detail = await requestJson(
    "draft-public-detail",
    `/places/${encodeURIComponent(draft._id)}`
  );
  const listItems = envelopeData(list)?.items ?? [];
  const markerItems = envelopeData(markers) ?? [];
  assert(isSuccess(list), "public list must succeed");
  assert(isSuccess(markers), "public markers must succeed");
  assert(
    !listItems.some((item) => item._id === draft._id),
    "draft must not appear in public list"
  );
  assert(
    !markerItems.some((item) => item._id === draft._id),
    "draft must not appear in markers"
  );
  assert(detail.status === 404, "draft public detail must return 404");
  assert(detail.body?.success === false, "draft detail must return error envelope");
  assert(
    !JSON.stringify(detail.body).includes("import_review"),
    "draft detail error must not leak review metadata"
  );
  writeJson("outputs/draft-denial-summary.json", {
    draft_id: draft._id,
    source_import_id: draft.import_review?.source_import_id,
    admin_status: draft.status,
    public_detail_status: detail.status,
    public_detail_error: detail.body?.error ?? null
  });
  writeJson("outputs/assertions.json", {
    pass: true,
    draft_id: draft._id,
    checks: [
      "draft visible in admin",
      "draft absent from public list",
      "draft absent from markers",
      "draft detail returns not found envelope"
    ]
  });
  console.log(JSON.stringify({ draft_id: draft._id, pass: true }));
};

const runAdminUpdate = async () => {
  let place = await findAcceptancePlace();
  if (!place) {
    place = (await createOrUpdateAcceptancePlace()).place;
  }
  const before = await verifyPublicReadsForPlace(place._id);
  const stamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const patch = {
    intro_zh: `用于 CloudBase dev Places 真实数据验收的受控公开点位。更新验收时间 ${stamp}`,
    intro_en: `Controlled published place for CloudBase dev Places live-data acceptance. Update verification ${stamp}`,
    recommended_reason_zh: `CloudBase dev 验收样例 ${stamp}`,
    recommended_reason_en: `CloudBase dev acceptance sample ${stamp}`,
    recommended_rank: 9,
    is_recommended: true,
    status: "published"
  };
  const patchCapture = await requestJson(
    "admin-update-response",
    `/admin/places/${encodeURIComponent(place._id)}`,
    {
      method: "PATCH",
      admin: true,
      body: JSON.stringify(patch)
    }
  );
  assert(isSuccess(patchCapture), "admin patch must succeed");
  const after = await verifyPublicReadsForPlace(place._id);
  assert(
    after.detailPlace.intro_en === patch.intro_en,
    "public detail must reflect updated intro"
  );
  assert(
    after.listItem.recommended_reason_en === patch.recommended_reason_en,
    "public list must reflect updated recommended reason"
  );
  assert(
    after.marker.name_en === ACCEPTANCE_NAME_EN,
    "marker must preserve updated place identity"
  );
  writeJson("outputs/admin-update-summary.json", {
    id: place._id,
    before_detail_intro_en: before.detailPlace.intro_en,
    after_detail_intro_en: after.detailPlace.intro_en,
    after_list_recommended_reason_en: after.listItem.recommended_reason_en,
    patch
  });
  writeJson("outputs/assertions.json", {
    pass: true,
    id: place._id,
    stamp
  });
  console.log(JSON.stringify({ id: place._id, stamp, pass: true }));
};

const runGallery = async () => {
  const place = await findAcceptancePlace();
  assert(place, "acceptance place must exist before gallery verification");
  const detail = await requestJson(
    "public-detail",
    `/places/${encodeURIComponent(place._id)}`
  );
  assert(isSuccess(detail), "public detail must be readable");
  const detailPlace = envelopeData(detail);
  const hasResolvedCloudbaseMedia =
    Array.isArray(detailPlace.gallery_media) &&
    detailPlace.gallery_media.some(
      (media) =>
        typeof media.file_id === "string" &&
        media.file_id.startsWith("cloud://") &&
        typeof media.url === "string" &&
        media.url.startsWith("https://")
    );
  const blocker = {
    blocker_type: "missing_cloudbase_gallery_file_id",
    status: "blocked",
    place_id: place._id,
    place_gallery_file_ids: place.gallery_file_ids ?? [],
    detail_gallery_media_count: detailPlace.gallery_media?.length ?? 0,
    reason:
      "No real CloudBase gallery file id is attached to the published acceptance place. The current CloudBase provider resolves places live data, but file upload/complete routes still use the fallback mock files provider, so this run cannot honestly claim CloudBase storage media acceptance.",
    required_follow_up:
      "Upload or provide a real CloudBase storage file id under public/places/{place_id}/ and attach it through admin place update, then rerun this task."
  };
  if (hasResolvedCloudbaseMedia) {
    writeJson("outputs/gallery-success.json", {
      status: "accepted",
      id: place._id,
      gallery_media: detailPlace.gallery_media,
      gallery_urls: detailPlace.gallery_urls
    });
    writeJson("outputs/assertions.json", {
      pass: true,
      gallery_acceptance: "accepted"
    });
  } else {
    writeJson("outputs/gallery-blocker.json", blocker);
    writeJson("outputs/assertions.json", {
      pass: true,
      gallery_acceptance: "blocked",
      blocker: blocker.blocker_type
    });
  }
  console.log(
    JSON.stringify(
      hasResolvedCloudbaseMedia
        ? { gallery_acceptance: "accepted", id: place._id }
        : { gallery_acceptance: "blocked", id: place._id },
      null,
      2
    )
  );
};

const runDocsVerify = async () => {
  const docs = [
    "docs/plan.md",
    "docs/cloudbase-dev-api-deployment.md",
    "docs/week8-places-cloudbase-integration.md"
  ];
  const required = [
    "2026-06-23",
    "cloud1-d7gxdk8t43bd639c0",
    "https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api",
    "CloudBase Live Acceptance Place",
    "gallery"
  ];
  const results = docs.map((doc) => {
    const content = execFileSync("sed", ["-n", "1,260p", doc], {
      cwd: repoRoot,
      encoding: "utf8"
    });
    return {
      doc,
      required: Object.fromEntries(
        required.map((needle) => [needle, content.includes(needle)])
      )
    };
  });
  writeJson("outputs/docs-verification.json", results);
  for (const result of results) {
    for (const [needle, found] of Object.entries(result.required)) {
      assert(found, `${result.doc} must mention ${needle}`);
    }
  }
  writeJson("outputs/assertions.json", {
    pass: true,
    docs,
    required
  });
  console.log(JSON.stringify({ pass: true, docs }, null, 2));
};

const runFinalValidation = async () => {
  const commands = [
    {
      label: "openspec-validate",
      command: "openspec",
      args: [
        "validate",
        "complete-cloudbase-dev-places-live-acceptance",
        "--strict",
        "--no-interactive"
      ]
    },
    {
      label: "shared-volunteer-import-test",
      command: "pnpm",
      args: [
        "exec",
        "vitest",
        "run",
        "packages/shared/test/volunteer-import.spec.ts"
      ]
    },
    {
      label: "api-cloudbase-test",
      command: "pnpm",
      args: ["exec", "vitest", "run", "apps/api/test/cloudbase.spec.ts"]
    },
    {
      label: "shared-typecheck",
      command: "pnpm",
      args: ["--filter", "@community-map/shared", "typecheck"]
    },
    {
      label: "api-typecheck",
      command: "pnpm",
      args: ["--filter", "@community-map/api", "typecheck"]
    }
  ];
  const results = [];
  for (const item of commands) {
    const startedAt = new Date().toISOString();
    const result = spawnSync(item.command, item.args, {
      cwd: repoRoot,
      encoding: "utf8"
    });
    const endedAt = new Date().toISOString();
    writeText(`logs/${item.label}.stdout.log`, result.stdout ?? "");
    writeText(`logs/${item.label}.stderr.log`, result.stderr ?? "");
    results.push({
      label: item.label,
      command: [item.command, ...item.args].join(" "),
      status: result.status,
      signal: result.signal,
      error: result.error?.message ?? null,
      started_at: startedAt,
      ended_at: endedAt
    });
  }
  writeJson("outputs/final-validation.json", results);
  const failed = results.filter((item) => item.status !== 0);
  assert(failed.length === 0, `validation failures: ${failed.map((item) => item.label).join(", ")}`);
  writeJson("outputs/assertions.json", {
    pass: true,
    commands: results
  });
  console.log(JSON.stringify({ pass: true, commands: results }, null, 2));
};

const main = async () => {
  ensureDirs();
  if (command === "baseline") {
    await runBaseline();
  } else if (command === "import") {
    await runImport();
  } else if (command === "published-place") {
    await runPublishedPlace();
  } else if (command === "public-verify") {
    await runPublicVerify();
  } else if (command === "draft-denial") {
    await runDraftDenial();
  } else if (command === "admin-update") {
    await runAdminUpdate();
  } else if (command === "gallery") {
    await runGallery();
  } else if (command === "docs-verify") {
    await runDocsVerify();
  } else if (command === "final-validation") {
    await runFinalValidation();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
};

main().catch((error) => {
  writeJson("outputs/error.json", {
    message: error.message,
    stack: error.stack
  });
  console.error(error);
  process.exitCode = 1;
});
