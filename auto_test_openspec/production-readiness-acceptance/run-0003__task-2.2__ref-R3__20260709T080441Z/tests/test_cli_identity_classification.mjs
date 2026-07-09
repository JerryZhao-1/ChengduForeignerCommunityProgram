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
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
  assertions.push(message);
};

const identityPath = path.join(repoRoot, target.identityDocument);
const apiGuidePath = path.join(repoRoot, target.apiGuideDocument);
assert(fs.existsSync(identityPath), "identity_document_exists");
const identityDoc = fs.readFileSync(identityPath, "utf8");
const apiGuide = fs.readFileSync(apiGuidePath, "utf8");

for (const snippet of expected.requiredDocSnippets) {
  assert(identityDoc.includes(snippet), `identity_doc_contains:${snippet}`);
}

assert(
  identityDoc.includes("Local/dev only") &&
    identityDoc.includes("Not production authentication"),
  "identity_document_classifies_local_mock_header"
);
assert(
  identityDoc.includes("CloudBase dev production-like smoke") &&
    identityDoc.includes("dev acceptance evidence"),
  "identity_document_classifies_cloudbase_dev_acceptance"
);
assert(
  identityDoc.includes("Public launch remains blocked") &&
    identityDoc.includes("Admin-only APIs reject unauthenticated"),
  "identity_document_declares_public_launch_blocker"
);
assert(
  apiGuide.includes("docs/production-acceptance-identity.md") &&
    apiGuide.includes("不是 public launch 的生产认证方案"),
  "api_guide_links_identity_classification"
);
assert(
  target.authClassification.includes("x-mock-user-id") &&
    target.authClassification.includes("Public launch requires") &&
    target.actors.admin === "user_001" &&
    target.actors.member === "user_002",
  "target_declares_actor_header_classification"
);

let requestIndex = 0;
const request = async (name, method, route, actorId) => {
  requestIndex += 1;
  const url = new URL(route, `${target.apiBaseUrl.replace(/\/$/, "")}/`);
  const headers = {};
  if (actorId) {
    headers["x-mock-user-id"] = actorId;
  }
  const response = await fetch(url, { method, headers });
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
  return { response, json };
};

const admin = await request(
  "admin-places-as-admin",
  "GET",
  "admin/places",
  target.actors.admin
);
assert(
  admin.response.status === 200 && admin.json.success === true,
  "admin_actor_can_access_admin_endpoint"
);

const member = await request(
  "admin-places-as-member",
  "GET",
  "admin/places",
  target.actors.member
);
assert(
  member.response.status === 403 && member.json.error?.code === "FORBIDDEN",
  "member_actor_is_forbidden_from_admin_endpoint"
);

const noHeader = await request("admin-places-no-header", "GET", "admin/places");
const noHeaderRejected =
  noHeader.response.status === 401 || noHeader.response.status === 403;
const noHeaderClassified =
  noHeaderRejected || identityDoc.includes("Public launch remains blocked");
assert(noHeaderClassified, "no_header_admin_behavior_is_classified");

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
  noHeaderAdminBehavior: {
    status: noHeader.response.status,
    acceptedAsProductionAuth: false,
    classification: noHeaderRejected
      ? "rejected_without_declared_actor"
      : "public_launch_blocker_documented"
  },
  assertions
});

console.log(JSON.stringify({ ok: true, assertions }, null, 2));
