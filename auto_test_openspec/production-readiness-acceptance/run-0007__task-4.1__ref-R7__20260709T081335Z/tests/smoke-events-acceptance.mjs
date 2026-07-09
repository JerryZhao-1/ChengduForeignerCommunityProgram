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
const request = async (name, method, route, body, actorId, allowStatuses = [200, 201]) => {
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
  if (!allowStatuses.includes(response.status)) {
    throw new Error(`${name} failed with HTTP ${response.status}: ${text}`);
  }
  return { response, json };
};

const successData = (name, result) => {
  assert(result.json.success === true, `${name}_success_envelope`);
  return result.json.data;
};

const now = new Date();
const suffix = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
const eventInput = {
  title_zh: `活动验收核销 ${suffix}`,
  title_en: `Events acceptance check-in ${suffix}`,
  summary_zh: "用于生产验收的活动报名和核销链路。",
  summary_en: "Production acceptance registration and check-in flow.",
  content_zh: "验证活动详情、报名、票券、核销和重复核销反馈。",
  content_en: "Validates detail, registration, ticket, check-in, and repeated check-in feedback.",
  address_text: "Tongzilin Community Center",
  location: { latitude: 30.618887, longitude: 104.065468 },
  start_time: "2027-06-01T10:00:00+08:00",
  end_time: "2027-06-01T12:00:00+08:00",
  signup_deadline: "2027-05-31T18:00:00+08:00",
  capacity: 20
};

const event = successData(
  "event_create",
  await request("event-create", "POST", "admin/events", eventInput, target.actors.admin)
);
assert(Boolean(event._id), "event_created");

await request(
  "event-review",
  "POST",
  `admin/events/${event._id}/review`,
  {
    review_status: "approved",
    publish_status: "published",
    reason: "Production acceptance event flow."
  },
  target.actors.admin
);
assert(true, "event_published");

const detail = successData(
  "event_detail",
  await request("event-detail", "GET", `events/${event._id}`)
);
assert(detail._id === event._id, "event_detail_read");

const registrationResult = successData(
  "registration",
  await request(
    "registration",
    "POST",
    `events/${event._id}/registrations`,
    {
      contact_name: "Acceptance Events User",
      contact_phone: `131${suffix.slice(-8)}`,
      attendee_count: 1,
      source_channel: "miniapp"
    },
    target.actors.member
  )
);
const registration = registrationResult.registration;
const ticket = registrationResult.ticket;
assert(Boolean(registration?._id && ticket?._id), "registration_created");

const ticketRead = successData(
  "ticket",
  await request(
    "ticket",
    "GET",
    `events/registrations/${registration._id}/ticket`,
    undefined,
    target.actors.member
  )
);
assert(ticketRead._id === ticket._id, "ticket_read");

const adminRegistrations = successData(
  "admin_registrations",
  await request(
    "admin-registrations",
    "GET",
    `admin/events/${event._id}/registrations`,
    undefined,
    target.actors.admin
  )
);
assert(
  adminRegistrations.some((item) => item._id === registration._id),
  "admin_registration_list_read"
);

const checkin = successData(
  "checkin",
  await request(
    "checkin",
    "POST",
    `admin/events/${event._id}/checkin`,
    { ticket_id: ticket._id, note: "Production acceptance check-in." },
    target.actors.admin
  )
);
assert(checkin.status === "used" && Boolean(checkin.used_at), "checkin_success");

const repeat = await request(
  "repeat-checkin",
  "POST",
  `admin/events/${event._id}/checkin`,
  { ticket_id: ticket._id, note: "Repeated check-in should fail." },
  target.actors.admin,
  [409]
);
assert(
  repeat.json.success === false &&
    repeat.json.error?.code === "CONFLICT" &&
    repeat.json.error?.details?.reason === "ticket_not_valid",
  "repeat_checkin_conflict"
);

for (const required of expected.required) {
  assert(assertions.includes(required), `expected_assertion_recorded:${required}`);
}

output("summary", {
  created: {
    event_id: event._id,
    registration_id: registration._id,
    ticket_id: ticket._id
  },
  repeatCheckin: {
    status: repeat.response.status,
    code: repeat.json.error?.code,
    reason: repeat.json.error?.details?.reason
  },
  assertions
});

console.log(JSON.stringify({ ok: true, assertions }, null, 2));
