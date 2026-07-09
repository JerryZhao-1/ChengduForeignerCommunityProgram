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
  return json.data;
};

const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const post = await request(
  "post-create",
  "POST",
  "discover/posts",
  {
    title: `Interaction hardening post ${suffix}`,
    content: "Testing near-concurrent interaction writes.",
    language: "en",
    tag_ids: ["acceptance", "interaction"],
    location_text: "Tongzilin",
    image_file_ids: [],
    image_urls: [],
    place_id: null,
    event_id: null
  },
  target.actors.member
);
assert(Boolean(post._id), "post_created");

const initial = await request(
  "initial-interaction",
  "GET",
  `discover/posts/${post._id}/interaction`,
  undefined,
  target.actors.admin
);
assert(initial.liked === false && initial.favorited === false, "initial_interaction_state_read");

const [liked, favorited, shared] = await Promise.all([
  request(
    "concurrent-like",
    "POST",
    `discover/posts/${post._id}/like`,
    { liked: true },
    target.actors.admin
  ),
  request(
    "concurrent-favorite",
    "POST",
    `discover/posts/${post._id}/favorite`,
    { favorited: true },
    target.actors.admin
  ),
  request(
    "concurrent-share",
    "POST",
    `discover/posts/${post._id}/share`,
    { channel: "copy_link" },
    target.actors.admin
  )
]);
assert(
  liked.liked === true || favorited.favorited === true || shared.share_count >= 1,
  "concurrent_like_favorite_share_completed"
);

const finalState = await request(
  "final-interaction",
  "GET",
  `discover/posts/${post._id}/interaction`,
  undefined,
  target.actors.admin
);
assert(finalState.liked === true, "final_liked_preserved");
assert(finalState.favorited === true, "final_favorited_preserved");
assert(finalState.share_count === initial.share_count + 1, "final_share_count_incremented");

for (const required of expected.required) {
  assert(assertions.includes(required), `expected_assertion_recorded:${required}`);
}

output("summary", {
  post_id: post._id,
  initial,
  finalState,
  assertions
});

console.log(JSON.stringify({ ok: true, assertions }, null, 2));
