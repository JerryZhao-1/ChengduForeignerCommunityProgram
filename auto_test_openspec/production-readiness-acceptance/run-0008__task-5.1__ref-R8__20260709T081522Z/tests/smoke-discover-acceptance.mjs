import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const runDir = path.resolve(scriptDir, "..");
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
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
  assertions.push(message);
};

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

const successData = (name, json) => {
  assert(json.success === true, `${name}_success_envelope`);
  return json.data;
};

const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const post = successData(
  "post_create",
  await request(
    "post-create",
    "POST",
    "discover/posts",
    {
      title: `Discover acceptance post ${suffix}`,
      content: "Production acceptance Discover content flow.",
      language: "en",
      tag_ids: ["acceptance", "discover"],
      location_text: "Tongzilin",
      image_file_ids: [],
      image_urls: [],
      place_id: null,
      event_id: null
    },
    target.actors.member
  )
);
assert(Boolean(post._id), "post_created");

const comment = successData(
  "comment_create",
  await request(
    "comment-create",
    "POST",
    `discover/posts/${post._id}/comments`,
    {
      content: "Discover acceptance comment.",
      language: "en"
    },
    target.actors.admin
  )
);
assert(Boolean(comment._id), "comment_created");

const liked = successData(
  "like",
  await request(
    "like",
    "POST",
    `discover/posts/${post._id}/like`,
    { liked: true },
    target.actors.admin
  )
);
assert(liked.liked === true, "like_recorded");

const favorited = successData(
  "favorite",
  await request(
    "favorite",
    "POST",
    `discover/posts/${post._id}/favorite`,
    { favorited: true },
    target.actors.admin
  )
);
assert(favorited.favorited === true, "favorite_recorded");

const shared = successData(
  "share",
  await request(
    "share",
    "POST",
    `discover/posts/${post._id}/share`,
    { channel: "copy_link" },
    target.actors.admin
  )
);
assert(shared.share_count >= 1, "share_recorded");

const interaction = successData(
  "interaction",
  await request(
    "interaction",
    "GET",
    `discover/posts/${post._id}/interaction`,
    undefined,
    target.actors.admin
  )
);
assert(interaction.liked === true && interaction.favorited === true, "interaction_state_read");

const reportedPost = successData(
  "report",
  await request(
    "report",
    "POST",
    `discover/posts/${post._id}/report`,
    {
      reason: "spam-or-scam",
      description: "Production acceptance Discover report.",
      evidence_file_ids: []
    },
    target.actors.admin
  )
);
assert(reportedPost._id === post._id, "report_submitted");

const adminPosts = successData(
  "admin_posts",
  await request(
    "admin-posts",
    "GET",
    `admin/discover/posts?keyword=${encodeURIComponent(suffix)}`,
    undefined,
    target.actors.admin
  )
);
assert(adminPosts.items.some((item) => item._id === post._id), "admin_post_visible");

const adminReports = successData(
  "admin_reports",
  await request(
    "admin-reports",
    "GET",
    "admin/discover/reports?pageSize=20",
    undefined,
    target.actors.admin
  )
);
const report = adminReports.items.find((item) => item.post_id === post._id);
assert(Boolean(report?._id), "admin_report_visible");

const analytics = successData(
  "admin_analytics",
  await request(
    "admin-analytics",
    "GET",
    "admin/discover/analytics?windowDays=30",
    undefined,
    target.actors.admin
  )
);
assert(Number.isInteger(analytics.post_count), "admin_analytics_read");

for (const required of expected.required) {
  assert(assertions.includes(required), `expected_assertion_recorded:${required}`);
}

output("summary", {
  created: {
    post_id: post._id,
    comment_id: comment._id,
    report_id: report?._id ?? null
  },
  interaction,
  analytics: {
    post_count: analytics.post_count,
    comment_count: analytics.comment_count,
    report_count: analytics.report_count,
    open_report_count: analytics.open_report_count
  },
  assertions
});

console.log(JSON.stringify({ ok: true, assertions }, null, 2));
