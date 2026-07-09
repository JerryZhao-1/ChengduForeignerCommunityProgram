import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const runDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(runDir, "../../..");
const target = JSON.parse(
  fs.readFileSync(path.join(runDir, "inputs", "target.json"), "utf8")
);
const expected = JSON.parse(
  fs.readFileSync(path.join(runDir, "expected", "assertions.json"), "utf8")
);
const outputsDir = path.join(runDir, "outputs");
fs.mkdirSync(outputsDir, { recursive: true });

const output = (name, value) => {
  fs.writeFileSync(
    path.join(outputsDir, `${name}.json`),
    `${JSON.stringify(value, null, 2)}\n`
  );
};

const assertions = [];
const created = {};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
  assertions.push(message);
};

const targetUrl = new URL(target.apiBaseUrl);
assert(targetUrl.protocol === "https:", "target_url_is_https");
assert(
  !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(
    targetUrl.hostname
  ),
  "target_url_is_not_localhost_or_lan"
);
assert(
  targetUrl.hostname === "cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com",
  "cloudbase_gateway_domain_is_used"
);

const mpConfigPath = path.join(
  repoRoot,
  "apps/mobile/dist/build/mp-weixin/config/env.js"
);
const mpClientPath = path.join(
  repoRoot,
  "apps/mobile/dist/build/mp-weixin/api/client.js"
);
const mpConfig = fs.readFileSync(mpConfigPath, "utf8");
const mpClient = fs.readFileSync(mpClientPath, "utf8");
const artifactText = `${mpConfig}\n${mpClient}`;
const forbiddenMatches = expected.forbiddenEndpointPatterns.filter((pattern) =>
  artifactText.includes(pattern)
);

assert(
  mpConfig.includes(target.apiBaseUrl) &&
    mpConfig.includes(target.cloudbaseEnvId) &&
    mpConfig.includes(target.cloudFunctionName),
  "mini_program_build_has_cloudbase_target_config"
);
assert(mpClient.includes("callHTTPFunction"), "mini_program_build_uses_cloudbase_function_requester");
assert(forbiddenMatches.length === 0, "mini_program_build_has_no_local_api_endpoint");
output("build-config", {
  configPath: path.relative(repoRoot, mpConfigPath),
  clientPath: path.relative(repoRoot, mpClientPath),
  apiBaseUrl: target.apiBaseUrl,
  cloudbaseEnvId: target.cloudbaseEnvId,
  cloudFunctionName: target.cloudFunctionName,
  forbiddenMatches
});

let requestIndex = 0;
const request = async (name, method, route, body, actorId) => {
  requestIndex += 1;
  const url = new URL(route, `${target.apiBaseUrl.replace(/\/$/, "")}/`);
  const headers = {};
  if (body !== undefined) {
    headers["content-type"] = "application/json";
  }
  if (actorId) {
    headers["x-mock-user-id"] = actorId;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  output(`${String(requestIndex).padStart(2, "0")}-${name}`, {
    request: {
      method,
      url: url.toString(),
      actor: actorId ? "declared-dev-actor" : null
    },
    status: response.status,
    body: json
  });
  if (!response.ok) {
    throw new Error(`${name} failed with HTTP ${response.status}: ${text}`);
  }
  return json;
};

const expectSuccess = (name, json) => {
  assert(json.success === true, `${name}_success_envelope`);
  return json.data;
};

const health = await request("health", "GET", "health");
assert(health.ok === true, "health_ok");

const places = expectSuccess(
  "places_public_reads",
  await request("places", "GET", "places?pageSize=1")
);
assert(Array.isArray(places.items), "places_public_reads_success");
await request("places-map-markers", "GET", "places/map-markers");
await request("admin-places", "GET", "admin/places", undefined, target.actors.admin);

const now = new Date();
const suffix = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const eventInput = {
  title_zh: `生产验收烟测活动 ${suffix}`,
  title_en: `Production acceptance smoke event ${suffix}`,
  summary_zh: "生产验收 API 烟测自动创建。",
  summary_en: "Created by production acceptance API smoke.",
  content_zh: "用于验证 CloudBase API 目标的报名、票券和核销链路。",
  content_en: "Validates registration, ticket, and check-in against the CloudBase API target.",
  address_text: "Tongzilin Community Center",
  location: { latitude: 30.618887, longitude: 104.065468 },
  start_time: "2027-05-01T10:00:00+08:00",
  end_time: "2027-05-01T12:00:00+08:00",
  signup_deadline: "2027-04-30T18:00:00+08:00",
  capacity: 20
};
const createdEvent = expectSuccess(
  "admin_event_create",
  await request("admin-event-create", "POST", "admin/events", eventInput, target.actors.admin)
);
created.eventId = createdEvent._id;
await request(
  "admin-event-review",
  "POST",
  `admin/events/${created.eventId}/review`,
  {
    review_status: "approved",
    publish_status: "published",
    reason: "Production acceptance smoke."
  },
  target.actors.admin
);
await request("event-detail", "GET", `events/${created.eventId}`);
const registration = expectSuccess(
  "event_registration",
  await request(
    "event-registration",
    "POST",
    `events/${created.eventId}/registrations`,
    {
      contact_name: "Acceptance Smoke User",
      contact_phone: `130${suffix.slice(-8)}`,
      attendee_count: 1,
      source_channel: "miniapp"
    },
    target.actors.member
  )
);
created.registrationId = registration.registration._id;
created.ticketId = registration.ticket._id;
await request(
  "event-ticket",
  "GET",
  `events/registrations/${created.registrationId}/ticket`,
  undefined,
  target.actors.member
);
await request(
  "admin-event-registrations",
  "GET",
  `admin/events/${created.eventId}/registrations`,
  undefined,
  target.actors.admin
);
await request(
  "admin-event-checkin",
  "POST",
  `admin/events/${created.eventId}/checkin`,
  { ticket_id: created.ticketId, note: "Production acceptance smoke." },
  target.actors.admin
);
assert(
  Boolean(created.eventId && created.registrationId && created.ticketId),
  "events_registration_ticket_checkin_success"
);

const post = expectSuccess(
  "discover_post_create",
  await request(
    "discover-post-create",
    "POST",
    "discover/posts",
    {
      title: `Production acceptance smoke post ${suffix}`,
      content: "Created by the production acceptance CloudBase API smoke.",
      language: "en",
      tag_ids: ["acceptance"],
      location_text: "Tongzilin",
      image_file_ids: [],
      image_urls: [],
      place_id: null,
      event_id: created.eventId
    },
    target.actors.member
  )
);
created.postId = post._id;
const comment = expectSuccess(
  "discover_comment_create",
  await request(
    "discover-comment-create",
    "POST",
    `discover/posts/${created.postId}/comments`,
    {
      content: "Acceptance smoke comment.",
      language: "en"
    },
    target.actors.admin
  )
);
created.commentId = comment._id;
await request(
  "discover-like",
  "POST",
  `discover/posts/${created.postId}/like`,
  { liked: true },
  target.actors.admin
);
await request(
  "discover-favorite",
  "POST",
  `discover/posts/${created.postId}/favorite`,
  { favorited: true },
  target.actors.admin
);
await request(
  "discover-share",
  "POST",
  `discover/posts/${created.postId}/share`,
  { channel: "copy_link" },
  target.actors.admin
);
await request(
  "discover-interaction",
  "GET",
  `discover/posts/${created.postId}/interaction`,
  undefined,
  target.actors.admin
);
await request(
  "discover-report",
  "POST",
  `discover/posts/${created.postId}/report`,
  {
    reason: "spam-or-scam",
    description: "Production acceptance smoke report.",
    evidence_file_ids: []
  },
  target.actors.admin
);
assert(
  Boolean(created.postId && created.commentId),
  "discover_create_comment_interaction_report_success"
);

await request(
  "admin-discover-posts",
  "GET",
  `admin/discover/posts?keyword=${encodeURIComponent(suffix)}`,
  undefined,
  target.actors.admin
);
await request(
  "admin-discover-reports",
  "GET",
  "admin/discover/reports?pageSize=5",
  undefined,
  target.actors.admin
);
await request(
  "admin-discover-analytics",
  "GET",
  "admin/discover/analytics?windowDays=30",
  undefined,
  target.actors.admin
);
assert(true, "admin_governance_smoke_success");

for (const required of expected.required) {
  assert(assertions.includes(required), `expected_assertion_recorded:${required}`);
}

output("summary", {
  target: {
    environmentClassification: target.environmentClassification,
    apiMode: target.apiMode,
    apiBaseUrl: target.apiBaseUrl,
    cloudbaseEnvId: target.cloudbaseEnvId,
    cloudFunctionName: target.cloudFunctionName,
    authClassification: target.authClassification
  },
  created,
  assertions
});

console.log(JSON.stringify({ ok: true, created, assertions }, null, 2));
