import { createServer } from "node:http";

import { FILE_PATH_RULES } from "@community-map/shared";

import { createApp } from "../src/app";
import { main } from "../src/cloudbase";

interface ApiSuccess<TData> {
  success: true;
  data: TData;
  requestId: string;
}

interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

interface PageResult<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  total: number;
}

interface EventItem {
  _id: string;
  title_en: string;
  review_status: string;
  publish_status: string;
}

interface EventRegistration {
  _id: string;
  event_id: string;
  user_id: string;
  ticket_id: string;
}

interface EventTicket {
  _id: string;
  registration_id: string;
  status: string;
  used_at: string | null;
}

interface EventInput {
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  content_zh: string;
  content_en: string;
  address_text: string;
  location: { latitude: number; longitude: number };
  start_time: string;
  end_time: string;
  signup_deadline: string;
  capacity: number;
}

interface PostItem {
  _id: string;
  author_user_id: string;
  title: string;
  status: string;
  review_status: string;
}

interface CommentItem {
  _id: string;
  post_id: string;
  author_user_id: string;
  status: string;
}

interface FileAsset {
  file_id: string;
  cloud_path: string;
  visibility: string;
  biz_type: string;
  biz_id: string;
  uploaded_by: string;
  status: string;
}

interface ReportCase {
  _id: string;
  target_type: "post" | "comment";
  target_id: string;
  post_id: string;
  comment_id: string | null;
  reporter_user_id: string;
  reason: string;
  evidence_file_ids: string[];
  evidence: Array<{ file_id: string; temp_url?: string }>;
  status: string;
  handler_user_id: string | null;
}

interface UserGovernance {
  user: { _id: string; nickname: string; role_flags: string[] };
  enforcement: { status: string; reason: string | null };
  post_count: number;
  comment_count: number;
  report_count: number;
  violation_count: number;
}

interface MeGovernance extends UserGovernance {
  unread_notification_count: number;
}

interface AuditRecord {
  _id: string;
  action: string;
  target_type: string;
  target_id: string;
  actor_user_id: string;
  reason: string | null;
}

interface NotificationItem {
  _id: string;
  user_id: string;
  title: string;
  body: string;
  status: string;
}

const createTestBaseUrl = async () => {
  const app = createApp("mock");
  const server = createServer(app.callback());

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to create test server.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      })
  };
};

const request = async <TBody>(
  baseUrl: string,
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH";
    actorId?: string;
    body?: unknown;
  } = {}
) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body === undefined
        ? {}
        : { "content-type": "application/json" }),
      ...(options.actorId ? { "x-mock-user-id": options.actorId } : {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  return {
    response,
    body: (await response.json()) as TBody
  };
};

const createEventInput = (
  title: string,
  overrides: Partial<EventInput> = {}
): EventInput => ({
  ...{
    title_zh: title,
    title_en: title,
    summary_zh: "简介",
    summary_en: "Summary",
    content_zh: "正文",
    content_en: "Body",
    address_text: "Tongzilin",
    location: { latitude: 30.615, longitude: 104.062 },
    start_time: "2027-08-02T10:00:00+08:00",
    end_time: "2027-08-02T12:00:00+08:00",
    signup_deadline: "2027-08-01T18:00:00+08:00",
    capacity: 12
  },
  ...overrides
});

const eventConflictReason = (body: ApiFailure) =>
  (body.error.details as { reason?: string } | undefined)?.reason;

describe("events integration readiness", () => {
  it("keeps public event reads launch-visible and reflects admin publication", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const list = await request<ApiSuccess<PageResult<EventItem>>>(
        baseUrl,
        "/events"
      );
      expect(list.response.status).toBe(200);
      expect(list.body.data.items.map((event) => event._id)).toContain(
        "event_001"
      );
      expect(list.body.data.items.map((event) => event._id)).not.toContain(
        "event_draft"
      );

      const draftDetail = await request<ApiFailure>(
        baseUrl,
        "/events/event_draft"
      );
      expect(draftDetail.response.status).toBe(404);
      expect(draftDetail.body.error.code).toBe("NOT_FOUND");

      const create = await request<ApiSuccess<EventItem>>(
        baseUrl,
        "/admin/events",
        {
          method: "POST",
          actorId: "user_001",
          body: createEventInput("Launch Event")
        }
      );
      expect(create.response.status).toBe(201);

      const hiddenBeforeReview = await request<ApiFailure>(
        baseUrl,
        `/events/${create.body.data._id}`
      );
      expect(hiddenBeforeReview.response.status).toBe(404);

      const review = await request<ApiSuccess<EventItem>>(
        baseUrl,
        `/admin/events/${create.body.data._id}/review`,
        {
          method: "POST",
          actorId: "user_001",
          body: {
            review_status: "approved",
            publish_status: "published"
          }
        }
      );
      expect(review.response.status).toBe(200);

      const publicDetail = await request<ApiSuccess<EventItem>>(
        baseUrl,
        `/events/${create.body.data._id}`
      );
      expect(publicDetail.response.status).toBe(200);
      expect(publicDetail.body.data.title_en).toBe("Launch Event");
      expect(publicDetail.body.data.review_status).toBe("approved");
      expect(publicDetail.body.data.publish_status).toBe("published");
    } finally {
      await close();
    }
  });

  it("enforces registration, ticket ownership, and check-in negative paths", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const register = await request<
        ApiSuccess<{ registration: EventRegistration; ticket: EventTicket }>
      >(baseUrl, "/events/event_001/registrations", {
        method: "POST",
        actorId: "user_002",
        body: {
          contact_name: "Emma",
          contact_phone: "13900000000",
          attendee_count: 1,
          source_channel: "miniapp"
        }
      });
      expect(register.response.status).toBe(201);
      expect(register.body.data.registration.user_id).toBe("user_002");
      expect(register.body.data.ticket.status).toBe("valid");

      const duplicate = await request<ApiFailure>(
        baseUrl,
        "/events/event_001/registrations",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            contact_name: "Emma",
            contact_phone: "13900000000",
            attendee_count: 1,
            source_channel: "miniapp"
          }
        }
      );
      expect(duplicate.response.status).toBe(409);
      expect(duplicate.body.error.code).toBe("CONFLICT");
      expect(eventConflictReason(duplicate.body)).toBe("already_registered");

      const full = await request<ApiFailure>(
        baseUrl,
        "/events/event_full/registrations",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            contact_name: "Emma",
            contact_phone: "13900000000",
            attendee_count: 1,
            source_channel: "miniapp"
          }
        }
      );
      expect(full.response.status).toBe(409);
      expect(full.body.error.code).toBe("CONFLICT");
      expect(eventConflictReason(full.body)).toBe("capacity_exceeded");

      const closed = await request<ApiFailure>(
        baseUrl,
        "/events/event_closed/registrations",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            contact_name: "Emma",
            contact_phone: "13900000000",
            attendee_count: 1,
            source_channel: "miniapp"
          }
        }
      );
      expect(closed.response.status).toBe(409);
      expect(closed.body.error.code).toBe("CONFLICT");
      expect(eventConflictReason(closed.body)).toBe("event_ended");

      const createSignupClosed = await request<ApiSuccess<EventItem>>(
        baseUrl,
        "/admin/events",
        {
          method: "POST",
          actorId: "user_001",
          body: createEventInput("Signup Deadline Passed", {
            start_time: "2026-01-02T10:00:00+08:00",
            end_time: "2099-01-02T12:00:00+08:00",
            signup_deadline: "2026-01-01T18:00:00+08:00"
          })
        }
      );
      expect(createSignupClosed.response.status).toBe(201);

      const reviewSignupClosed = await request<ApiSuccess<EventItem>>(
        baseUrl,
        `/admin/events/${createSignupClosed.body.data._id}/review`,
        {
          method: "POST",
          actorId: "user_001",
          body: {
            review_status: "approved",
            publish_status: "published"
          }
        }
      );
      expect(reviewSignupClosed.response.status).toBe(200);

      const signupDeadlinePassed = await request<ApiFailure>(
        baseUrl,
        `/events/${createSignupClosed.body.data._id}/registrations`,
        {
          method: "POST",
          actorId: "user_002",
          body: {
            contact_name: "Emma",
            contact_phone: "13900000000",
            attendee_count: 1,
            source_channel: "miniapp"
          }
        }
      );
      expect(signupDeadlinePassed.response.status).toBe(409);
      expect(signupDeadlinePassed.body.error.code).toBe("CONFLICT");
      expect(eventConflictReason(signupDeadlinePassed.body)).toBe(
        "signup_deadline_passed"
      );

      const hiddenEvent = await request<ApiFailure>(
        baseUrl,
        "/events/event_draft/registrations",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            contact_name: "Emma",
            contact_phone: "13900000000",
            attendee_count: 1,
            source_channel: "miniapp"
          }
        }
      );
      expect(hiddenEvent.response.status).toBe(404);
      expect(hiddenEvent.body.error.code).toBe("NOT_FOUND");

      const ownTicket = await request<ApiSuccess<EventTicket>>(
        baseUrl,
        `/events/registrations/${register.body.data.registration._id}/ticket`,
        { actorId: "user_002" }
      );
      expect(ownTicket.response.status).toBe(200);
      expect(ownTicket.body.data._id).toBe(register.body.data.ticket._id);

      const otherTicket = await request<ApiFailure>(
        baseUrl,
        "/events/registrations/reg_001/ticket",
        { actorId: "user_002" }
      );
      expect(otherTicket.response.status).toBe(403);
      expect(otherTicket.body.error.code).toBe("FORBIDDEN");

      const nonAdminCheckin = await request<ApiFailure>(
        baseUrl,
        "/admin/events/event_001/checkin",
        {
          method: "POST",
          actorId: "user_002",
          body: { ticket_id: register.body.data.ticket._id }
        }
      );
      expect(nonAdminCheckin.response.status).toBe(403);
      expect(nonAdminCheckin.body.error.code).toBe("FORBIDDEN");

      const wrongEventCheckin = await request<ApiFailure>(
        baseUrl,
        "/admin/events/event_full/checkin",
        {
          method: "POST",
          actorId: "user_001",
          body: { ticket_id: register.body.data.ticket._id }
        }
      );
      expect(wrongEventCheckin.response.status).toBe(409);
      expect(wrongEventCheckin.body.error.code).toBe("CONFLICT");

      const checkin = await request<ApiSuccess<EventTicket>>(
        baseUrl,
        "/admin/events/event_001/checkin",
        {
          method: "POST",
          actorId: "user_001",
          body: { ticket_id: register.body.data.ticket._id }
        }
      );
      expect(checkin.response.status).toBe(200);
      expect(checkin.body.data.status).toBe("used");
      expect(checkin.body.data.used_at).not.toBeNull();

      const alreadyUsed = await request<ApiFailure>(
        baseUrl,
        "/admin/events/event_001/checkin",
        {
          method: "POST",
          actorId: "user_001",
          body: { ticket_id: register.body.data.ticket._id }
        }
      );
      expect(alreadyUsed.response.status).toBe(409);
      expect(alreadyUsed.body.error.code).toBe("CONFLICT");
    } finally {
      await close();
    }
  });
});

describe("discover integration readiness", () => {
  it("filters public posts and creates posts with deterministic visible state", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const list = await request<ApiSuccess<PageResult<PostItem>>>(
        baseUrl,
        "/discover/posts"
      );
      expect(list.response.status).toBe(200);
      expect(list.body.data.items.map((post) => post._id)).toEqual([
        "post_001",
        "post_002",
        "post_003",
        "post_004",
        "post_005",
        "post_006",
        "post_007"
      ]);
      expect(list.body.data.items[0]).toHaveProperty("created_at");
      expect(list.body.data.items[0]).toHaveProperty("comment_count", 1);
      expect(list.body.data.items[0]).toHaveProperty("author_display");

      const hidden = await request<ApiFailure>(
        baseUrl,
        "/discover/posts/post_hidden"
      );
      expect(hidden.response.status).toBe(404);
      expect(hidden.body.error.code).toBe("NOT_FOUND");

      const mine = await request<ApiSuccess<PageResult<PostItem>>>(
        baseUrl,
        "/discover/me/posts",
        { actorId: "user_001" }
      );
      expect(mine.response.status).toBe(200);
      expect(mine.body.data.items.map((post) => post._id)).toContain(
        "post_hidden"
      );

      const create = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            title: "Dentist recommendation",
            content: "Looking near Tongzilin station.",
            language: "en",
            tag_ids: ["help"],
            location_text: "Tongzilin",
            image_file_ids: [],
            image_urls: []
          }
        }
      );
      expect(create.response.status).toBe(201);
      expect(create.body.data.status).toBe("visible");
      expect(create.body.data.review_status).toBe("visible");

      const invalid = await request<ApiFailure>(baseUrl, "/discover/posts", {
        method: "POST",
        actorId: "user_002",
        body: {
          title: "Invalid",
          content: "Missing required language",
          tag_ids: []
        }
      });
      expect(invalid.response.status).toBe(400);
      expect(invalid.body.error.code).toBe("VALIDATION_ERROR");
    } finally {
      await close();
    }
  });

  it("enforces comment availability, report visibility, and admin moderation", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const comment = await request<ApiSuccess<CommentItem>>(
        baseUrl,
        "/discover/posts/post_001/comments",
        {
          method: "POST",
          actorId: "user_002",
          body: { content: "Helpful, thanks.", language: "en" }
        }
      );
      expect(comment.response.status).toBe(201);
      expect(comment.body.data.post_id).toBe("post_001");
      expect(comment.body.data).toHaveProperty("status", "visible");

      const comments = await request<ApiSuccess<PageResult<CommentItem>>>(
        baseUrl,
        "/discover/posts/post_001/comments"
      );
      expect(comments.response.status).toBe(200);
      expect(comments.body.data.items.map((item) => item._id)).toContain(
        comment.body.data._id
      );

      const detailAfterComment = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_001"
      );
      expect(detailAfterComment.body.data).toHaveProperty("comment_count", 2);

      const hiddenComment = await request<ApiFailure>(
        baseUrl,
        "/discover/posts/post_hidden/comments",
        {
          method: "POST",
          actorId: "user_002",
          body: { content: "Should fail.", language: "en" }
        }
      );
      expect(hiddenComment.response.status).toBe(404);
      expect(hiddenComment.body.error.code).toBe("NOT_FOUND");

      const report = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_002/report",
        {
          method: "POST",
          actorId: "user_001",
          body: { reason: "spam", description: "Looks promotional." }
        }
      );
      expect(report.response.status).toBe(200);
      expect(report.body.data.review_status).toBe("reported");

      const reportedDetail = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_002"
      );
      expect(reportedDetail.response.status).toBe(200);
      expect(reportedDetail.body.data.review_status).toBe("reported");

      const nonAdminModeration = await request<ApiFailure>(
        baseUrl,
        "/admin/discover/posts/post_001/moderation",
        {
          method: "POST",
          actorId: "user_002",
          body: { review_status: "hidden" }
        }
      );
      expect(nonAdminModeration.response.status).toBe(403);
      expect(nonAdminModeration.body.error.code).toBe("FORBIDDEN");

      const stillVisible = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_001"
      );
      expect(stillVisible.response.status).toBe(200);

      const adminModeration = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/admin/discover/posts/post_001/moderation",
        {
          method: "POST",
          actorId: "user_001",
          body: { review_status: "hidden" }
        }
      );
      expect(adminModeration.response.status).toBe(200);
      expect(adminModeration.body.data.status).toBe("hidden");

      const hiddenAfterModeration = await request<ApiFailure>(
        baseUrl,
        "/discover/posts/post_001"
      );
      expect(hiddenAfterModeration.response.status).toBe(404);
    } finally {
      await close();
    }
  });

  it("creates durable report cases, protects evidence, and audits governance actions", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const evidenceForm = new FormData();
      evidenceForm.append("biz_id", "pending_report_post_003");
      evidenceForm.append(
        "file",
        new Blob(["fake evidence bytes"], { type: "image/jpeg" }),
        "evidence.jpg"
      );
      const evidenceUploadResponse = await fetch(
        `${baseUrl}/files/report-evidence`,
        {
          method: "POST",
          headers: {
            "x-mock-user-id": "user_002"
          },
          body: evidenceForm
        }
      );
      const evidenceUpload = {
        response: evidenceUploadResponse,
        body: (await evidenceUploadResponse.json()) as ApiSuccess<FileAsset>
      };
      expect(evidenceUpload.response.status).toBe(201);
      expect(evidenceUpload.body.data.visibility).toBe("private");
      expect(evidenceUpload.body.data.biz_type).toBe("report_evidence");
      expect(evidenceUpload.body.data.biz_id).toBe("pending_report_post_003");
      expect(evidenceUpload.body.data.cloud_path).toContain(
        FILE_PATH_RULES.reports
      );

      const reportPost = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_003/report",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            reason: "safety",
            description: "Photo evidence attached.",
            evidence_file_ids: [evidenceUpload.body.data.file_id]
          }
        }
      );
      expect(reportPost.response.status).toBe(200);
      expect(reportPost.body.data.review_status).toBe("reported");

      const publicDetail = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_003"
      );
      expect(publicDetail.response.status).toBe(200);
      expect(publicDetail.body.data.review_status).toBe("reported");

      const publicList = await request<ApiSuccess<PageResult<PostItem>>>(
        baseUrl,
        "/discover/posts"
      );
      expect(publicList.body.data.items.map((item) => item._id)).toContain(
        "post_003"
      );

      const forbiddenQueue = await request<ApiFailure>(
        baseUrl,
        "/admin/discover/reports",
        { actorId: "user_002" }
      );
      expect(forbiddenQueue.response.status).toBe(403);

      const reports = await request<ApiSuccess<PageResult<ReportCase>>>(
        baseUrl,
        "/admin/discover/reports?status=open",
        { actorId: "user_001" }
      );
      expect(reports.response.status).toBe(200);
      const createdReport = reports.body.data.items.find(
        (item) => item.post_id === "post_003"
      );
      expect(createdReport?.evidence_file_ids).toEqual([
        evidenceUpload.body.data.file_id
      ]);
      expect(createdReport?.evidence[0]?.temp_url).toContain("private/reports");

      const rejected = await request<ApiSuccess<ReportCase>>(
        baseUrl,
        `/admin/discover/reports/${createdReport?._id}/resolve`,
        {
          method: "POST",
          actorId: "user_001",
          body: {
            status: "rejected",
            reason: "No violation.",
            moderation_action: "none"
          }
        }
      );
      expect(rejected.response.status).toBe(200);
      expect(rejected.body.data.status).toBe("rejected");

      const visibleAfterReject = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_003"
      );
      expect(visibleAfterReject.response.status).toBe(200);
      expect(visibleAfterReject.body.data.review_status).toBe("visible");

      await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_003/report",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            reason: "safety",
            description: "Second review."
          }
        }
      );
      const secondReports = await request<ApiSuccess<PageResult<ReportCase>>>(
        baseUrl,
        "/admin/discover/reports?status=open",
        { actorId: "user_001" }
      );
      const secondReport = secondReports.body.data.items.find(
        (item) => item.post_id === "post_003"
      );
      expect(secondReport).toBeTruthy();

      const actioned = await request<ApiSuccess<ReportCase>>(
        baseUrl,
        `/admin/discover/reports/${secondReport?._id}/resolve`,
        {
          method: "POST",
          actorId: "user_001",
          body: {
            status: "actioned",
            reason: "Hide after review.",
            moderation_action: "hide"
          }
        }
      );
      expect(actioned.body.data.status).toBe("actioned");

      const hiddenAfterAction = await request<ApiFailure>(
        baseUrl,
        "/discover/posts/post_003"
      );
      expect(hiddenAfterAction.response.status).toBe(404);

      const comment = await request<ApiSuccess<CommentItem>>(
        baseUrl,
        "/discover/posts/post_004/comments",
        {
          method: "POST",
          actorId: "user_001",
          body: { content: "Reportable comment.", language: "en" }
        }
      );
      expect(comment.response.status).toBe(201);

      const commentReport = await request<ApiSuccess<ReportCase>>(
        baseUrl,
        `/discover/posts/post_004/comments/${comment.body.data._id}/report`,
        {
          method: "POST",
          actorId: "user_002",
          body: { reason: "spam", description: "Comment report." }
        }
      );
      expect(commentReport.response.status).toBe(201);
      expect(commentReport.body.data.target_type).toBe("comment");

      const hideComment = await request<ApiSuccess<CommentItem>>(
        baseUrl,
        `/admin/discover/comments/${comment.body.data._id}/moderation`,
        {
          method: "POST",
          actorId: "user_001",
          body: { status: "hidden", reason: "Policy review" }
        }
      );
      expect(hideComment.body.data.status).toBe("hidden");

      const comments = await request<ApiSuccess<PageResult<CommentItem>>>(
        baseUrl,
        "/discover/posts/post_004/comments"
      );
      expect(comments.body.data.items.map((item) => item._id)).not.toContain(
        comment.body.data._id
      );

      const resolved = await request<ApiSuccess<ReportCase>>(
        baseUrl,
        `/admin/discover/reports/${commentReport.body.data._id}/resolve`,
        {
          method: "POST",
          actorId: "user_001",
          body: {
            status: "actioned",
            reason: "Comment hidden.",
            moderation_action: "hide"
          }
        }
      );
      expect(resolved.body.data.status).toBe("actioned");
      expect(resolved.body.data.handler_user_id).toBe("user_001");

      const enforce = await request<ApiSuccess<UserGovernance>>(
        baseUrl,
        "/admin/discover/users/user_002/enforcement",
        {
          method: "POST",
          actorId: "user_001",
          body: {
            status: "muted",
            reason: "Repeated report violations."
          }
        }
      );
      expect(enforce.response.status).toBe(200);
      expect(enforce.body.data.enforcement.status).toBe("muted");

      const audit = await request<ApiSuccess<PageResult<AuditRecord>>>(
        baseUrl,
        "/admin/discover/audit",
        { actorId: "user_001" }
      );
      expect(audit.body.data.items.map((item) => item.action)).toEqual(
        expect.arrayContaining([
          "moderate_comment",
          "resolve_report",
          "enforce_user"
        ])
      );
    } finally {
      await close();
    }
  });

  it("applies warned, muted, banned, and restored enforcement rules", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    const createPostBody = (title: string) => ({
      title,
      content: "Governance enforcement check.",
      language: "en",
      tag_ids: ["governance"],
      location_text: "Tongzilin",
      image_file_ids: [],
      image_urls: []
    });

    try {
      const warned = await request<ApiSuccess<UserGovernance>>(
        baseUrl,
        "/admin/discover/users/user_002/enforcement",
        {
          method: "POST",
          actorId: "user_001",
          body: {
            status: "warned",
            reason: "Please follow community rules."
          }
        }
      );
      expect(warned.response.status).toBe(200);
      expect(warned.body.data.enforcement.status).toBe("warned");

      const warnedGovernance = await request<ApiSuccess<MeGovernance>>(
        baseUrl,
        "/discover/me/governance",
        { actorId: "user_002" }
      );
      expect(warnedGovernance.response.status).toBe(200);
      expect(warnedGovernance.body.data.enforcement.status).toBe("warned");
      expect(
        warnedGovernance.body.data.unread_notification_count
      ).toBeGreaterThan(0);

      const notifications = await request<ApiSuccess<NotificationItem[]>>(
        baseUrl,
        "/notifications",
        { actorId: "user_002" }
      );
      expect(notifications.body.data[0]?.title).toContain("提醒");
      expect(notifications.body.data[0]?.body).toContain(
        "Please follow community rules."
      );

      const warnedPost = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts",
        {
          method: "POST",
          actorId: "user_002",
          body: createPostBody("Warned can post")
        }
      );
      expect(warnedPost.response.status).toBe(201);

      const warnedComment = await request<ApiSuccess<CommentItem>>(
        baseUrl,
        "/discover/posts/post_001/comments",
        {
          method: "POST",
          actorId: "user_002",
          body: { content: "Warned can comment.", language: "en" }
        }
      );
      expect(warnedComment.response.status).toBe(201);

      const warnedReport = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_002/report",
        {
          method: "POST",
          actorId: "user_002",
          body: { reason: "spam", description: "Warned can report." }
        }
      );
      expect(warnedReport.response.status).toBe(200);

      await request<ApiSuccess<UserGovernance>>(
        baseUrl,
        "/admin/discover/users/user_002/enforcement",
        {
          method: "POST",
          actorId: "user_001",
          body: {
            status: "muted",
            reason: "Temporary mute."
          }
        }
      );

      const mutedPost = await request<ApiFailure>(baseUrl, "/discover/posts", {
        method: "POST",
        actorId: "user_002",
        body: createPostBody("Muted cannot post")
      });
      expect(mutedPost.response.status).toBe(403);
      expect(mutedPost.body.error.code).toBe("FORBIDDEN");
      expect(
        (mutedPost.body.error.details as { enforcement_status?: string })
          .enforcement_status
      ).toBe("muted");

      const mutedComment = await request<ApiFailure>(
        baseUrl,
        "/discover/posts/post_001/comments",
        {
          method: "POST",
          actorId: "user_002",
          body: { content: "Muted cannot comment.", language: "en" }
        }
      );
      expect(mutedComment.response.status).toBe(403);
      expect(
        (mutedComment.body.error.details as { enforcement_status?: string })
          .enforcement_status
      ).toBe("muted");

      const mutedReport = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_003/report",
        {
          method: "POST",
          actorId: "user_002",
          body: { reason: "spam", description: "Muted can still report." }
        }
      );
      expect(mutedReport.response.status).toBe(200);

      await request<ApiSuccess<UserGovernance>>(
        baseUrl,
        "/admin/discover/users/user_002/enforcement",
        {
          method: "POST",
          actorId: "user_001",
          body: {
            status: "banned",
            reason: "Temporary ban."
          }
        }
      );

      const bannedPost = await request<ApiFailure>(baseUrl, "/discover/posts", {
        method: "POST",
        actorId: "user_002",
        body: createPostBody("Banned cannot post")
      });
      expect(bannedPost.response.status).toBe(403);
      expect(
        (bannedPost.body.error.details as { enforcement_status?: string })
          .enforcement_status
      ).toBe("banned");

      const bannedComment = await request<ApiFailure>(
        baseUrl,
        "/discover/posts/post_001/comments",
        {
          method: "POST",
          actorId: "user_002",
          body: { content: "Banned cannot comment.", language: "en" }
        }
      );
      expect(bannedComment.response.status).toBe(403);

      const bannedReport = await request<ApiFailure>(
        baseUrl,
        "/discover/posts/post_004/report",
        {
          method: "POST",
          actorId: "user_002",
          body: { reason: "spam", description: "Banned cannot report." }
        }
      );
      expect(bannedReport.response.status).toBe(403);

      const bannedMine = await request<ApiFailure>(
        baseUrl,
        "/discover/me/posts",
        { actorId: "user_002" }
      );
      expect(bannedMine.response.status).toBe(403);

      const bannedGovernance = await request<ApiSuccess<MeGovernance>>(
        baseUrl,
        "/discover/me/governance",
        { actorId: "user_002" }
      );
      expect(bannedGovernance.response.status).toBe(200);
      expect(bannedGovernance.body.data.enforcement.status).toBe("banned");

      const publicList = await request<ApiSuccess<PageResult<PostItem>>>(
        baseUrl,
        "/discover/posts",
        { actorId: "user_002" }
      );
      expect(publicList.response.status).toBe(200);
      expect(publicList.body.data.items.map((item) => item._id)).not.toEqual(
        expect.arrayContaining(["post_002", "post_004", "post_006"])
      );
      expect(
        publicList.body.data.items.some(
          (item) => item.author_user_id === "user_002"
        )
      ).toBe(false);

      const bannedAuthorPost = await request<ApiFailure>(
        baseUrl,
        "/discover/posts/post_002"
      );
      expect(bannedAuthorPost.response.status).toBe(404);

      await request<ApiSuccess<UserGovernance>>(
        baseUrl,
        "/admin/discover/users/user_002/enforcement",
        {
          method: "POST",
          actorId: "user_001",
          body: {
            status: "active",
            reason: "Restored."
          }
        }
      );

      const restoredPost = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts",
        {
          method: "POST",
          actorId: "user_002",
          body: createPostBody("Restored can post")
        }
      );
      expect(restoredPost.response.status).toBe(201);

      const restoredAuthorPost = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts/post_002"
      );
      expect(restoredAuthorPost.response.status).toBe(200);
      expect(restoredAuthorPost.body.data.status).toBe("visible");

      const restoredGovernance = await request<ApiSuccess<MeGovernance>>(
        baseUrl,
        "/discover/me/governance",
        { actorId: "user_002" }
      );
      expect(restoredGovernance.body.data.enforcement.status).toBe("active");
      expect(
        restoredGovernance.body.data.unread_notification_count
      ).toBeGreaterThanOrEqual(4);
    } finally {
      await close();
    }
  });

  it("binds owned public post media and rejects unauthorized media ids", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const form = new FormData();
      form.append(
        "file",
        new Blob(["fake image bytes"], { type: "image/jpeg" }),
        "local-tip.jpg"
      );
      const uploadResponse = await fetch(`${baseUrl}/files/post-media`, {
        method: "POST",
        headers: {
          "x-mock-user-id": "user_002"
        },
        body: form
      });
      const upload = {
        response: uploadResponse,
        body: (await uploadResponse.json()) as ApiSuccess<FileAsset>
      };
      expect(upload.response.status).toBe(201);
      expect(upload.body.data.uploaded_by).toBe("user_002");
      expect(upload.body.data.biz_type).toBe("post_image");
      expect(upload.body.data.cloud_path).toContain(FILE_PATH_RULES.postImages);
      const fileId = upload.body.data.file_id;

      const uploadVideoForm = new FormData();
      uploadVideoForm.append(
        "file",
        new Blob(["fake video bytes"], { type: "video/mp4" }),
        "clip.mp4"
      );
      const uploadVideoResponse = await fetch(`${baseUrl}/files/post-media`, {
        method: "POST",
        headers: {
          "x-mock-user-id": "user_002"
        },
        body: uploadVideoForm
      });
      const uploadVideo = {
        response: uploadVideoResponse,
        body: (await uploadVideoResponse.json()) as ApiSuccess<FileAsset>
      };
      expect(uploadVideo.response.status).toBe(201);
      expect(uploadVideo.body.data.biz_type).toBe("post_video");

      const invalidForm = new FormData();
      invalidForm.append(
        "file",
        new Blob(["plain text"], { type: "text/plain" }),
        "note.txt"
      );
      const invalidUploadResponse = await fetch(`${baseUrl}/files/post-media`, {
        method: "POST",
        headers: {
          "x-mock-user-id": "user_002"
        },
        body: invalidForm
      });
      const invalidUpload = {
        response: invalidUploadResponse,
        body: (await invalidUploadResponse.json()) as ApiFailure
      };
      expect(invalidUpload.response.status).toBe(400);
      expect(invalidUpload.body.error.code).toBe("VALIDATION_ERROR");

      const unauthorized = await request<ApiFailure>(
        baseUrl,
        "/discover/posts",
        {
          method: "POST",
          actorId: "user_001",
          body: {
            title: "Unauthorized media",
            content: "Should not bind another user's media.",
            language: "en",
            tag_ids: ["media"],
            location_text: null,
            image_file_ids: [fileId],
            image_urls: []
          }
        }
      );
      expect(unauthorized.response.status).toBe(403);

      const create = await request<ApiSuccess<PostItem>>(
        baseUrl,
        "/discover/posts",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            title: "Media backed post",
            content: "Uses an uploaded media asset.",
            language: "en",
            tag_ids: ["media"],
            location_text: null,
            image_file_ids: [fileId],
            image_urls: []
          }
        }
      );
      expect(create.response.status).toBe(201);
      expect(create.body.data).toHaveProperty("image_file_ids", [fileId]);
      expect(create.body.data).toHaveProperty("image_urls");
    } finally {
      await close();
    }
  });
});

describe("files auth roles and notifications readiness", () => {
  it("enforces file upload completion and private URL boundaries", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const uploadRequest = await request<
        ApiSuccess<{
          cloud_path: string;
          upload_url: string;
          expires_in: number;
        }>
      >(baseUrl, "/files/upload-requests", {
        method: "POST",
        actorId: "user_002",
        body: {
          biz_type: "post_image",
          biz_id: "post_001",
          file_name: "new.jpg",
          visibility: "public",
          target_prefix: FILE_PATH_RULES.postImages
        }
      });
      expect(uploadRequest.response.status).toBe(201);
      expect(uploadRequest.body.data.cloud_path).toBe(
        "public/posts/post_001/new.jpg"
      );

      const complete = await request<ApiSuccess<FileAsset>>(
        baseUrl,
        "/files/complete",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            biz_type: "post_image",
            biz_id: "post_001",
            file_id: "cloud://public/posts/post_001/new.jpg",
            cloud_path: uploadRequest.body.data.cloud_path,
            visibility: "public"
          }
        }
      );
      expect(complete.response.status).toBe(201);
      expect(complete.body.data).toMatchObject({
        visibility: "public",
        biz_type: "post_image",
        biz_id: "post_001",
        uploaded_by: "user_002",
        status: "active"
      });

      const protectedUpload = await request<ApiFailure>(
        baseUrl,
        "/files/upload-requests",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            biz_type: "event_ticket",
            biz_id: "ticket_forbidden",
            file_name: "ticket.png",
            visibility: "private",
            target_prefix: FILE_PATH_RULES.tickets
          }
        }
      );
      expect(protectedUpload.response.status).toBe(403);
      expect(protectedUpload.body.error.code).toBe("FORBIDDEN");

      const protectedComplete = await request<ApiFailure>(
        baseUrl,
        "/files/complete",
        {
          method: "POST",
          actorId: "user_002",
          body: {
            biz_type: "event_ticket",
            biz_id: "ticket_forbidden",
            file_id: "cloud://private/tickets/ticket_forbidden.png",
            cloud_path: "private/tickets/ticket_forbidden.png",
            visibility: "private"
          }
        }
      );
      expect(protectedComplete.response.status).toBe(403);
      expect(protectedComplete.body.error.code).toBe("FORBIDDEN");

      const rejectedAsset = await request<ApiFailure>(
        baseUrl,
        "/files/private-url",
        {
          method: "POST",
          actorId: "user_001",
          body: { file_id: "cloud://private/tickets/ticket_forbidden.png" }
        }
      );
      expect(rejectedAsset.response.status).toBe(404);

      const ownerPrivateUrl = await request<
        ApiSuccess<{ temp_url: string; expires_at: string }>
      >(baseUrl, "/files/private-url", {
        method: "POST",
        actorId: "user_001",
        body: { file_id: "cloud://private-ticket-001" }
      });
      expect(ownerPrivateUrl.response.status).toBe(200);
      expect(ownerPrivateUrl.body.data.temp_url).toContain(
        "private-ticket-001"
      );

      const forbiddenPrivateUrl = await request<ApiFailure>(
        baseUrl,
        "/files/private-url",
        {
          method: "POST",
          actorId: "user_002",
          body: { file_id: "cloud://private-ticket-001" }
        }
      );
      expect(forbiddenPrivateUrl.response.status).toBe(403);
      expect(forbiddenPrivateUrl.body.error.code).toBe("FORBIDDEN");
    } finally {
      await close();
    }
  });

  it("rejects invalid actors, protects admin routes, and isolates notifications", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const invalidActor = await request<ApiFailure>(baseUrl, "/admin/events", {
        method: "POST",
        actorId: "missing_user",
        body: createEventInput("Invalid Actor Event")
      });
      expect(invalidActor.response.status).toBe(401);
      expect(invalidActor.body.error.code).toBe("UNAUTHORIZED");

      const nonAdmin = await request<ApiFailure>(baseUrl, "/admin/events", {
        method: "POST",
        actorId: "user_002",
        body: createEventInput("Forbidden Event")
      });
      expect(nonAdmin.response.status).toBe(403);
      expect(nonAdmin.body.error.code).toBe("FORBIDDEN");

      const ownNotifications = await request<ApiSuccess<NotificationItem[]>>(
        baseUrl,
        "/notifications",
        { actorId: "user_001" }
      );
      expect(ownNotifications.response.status).toBe(200);
      expect(ownNotifications.body.data.map((item) => item._id)).toEqual([
        "notification_001"
      ]);

      const markRead = await request<ApiSuccess<NotificationItem>>(
        baseUrl,
        "/notifications/notification_001/read",
        { method: "POST", actorId: "user_001", body: {} }
      );
      expect(markRead.response.status).toBe(200);
      expect(markRead.body.data.status).toBe("read");

      const crossUser = await request<ApiFailure>(
        baseUrl,
        "/notifications/notification_002/read",
        { method: "POST", actorId: "user_001", body: {} }
      );
      expect(crossUser.response.status).toBe(404);
      expect(crossUser.body.error.code).toBe("NOT_FOUND");

      const otherUserNotifications = await request<
        ApiSuccess<NotificationItem[]>
      >(baseUrl, "/notifications", { actorId: "user_002" });
      expect(otherUserNotifications.body.data).toEqual([
        expect.objectContaining({
          _id: "notification_002",
          status: "unread"
        })
      ]);
    } finally {
      await close();
    }
  });
});

describe("cloudbase handler parity for non-places readiness", () => {
  it("matches hardened fallback semantics without claiming live persistence", async () => {
    const events = await main(
      {},
      {
        eventID: "req_readiness_events",
        httpContext: {
          url: "http://localhost/events",
          httpMethod: "GET",
          headers: { "x-mock-user-id": "user_001" }
        }
      }
    );
    const eventsBody = events.body as ApiSuccess<PageResult<EventItem>>;

    expect(events.statusCode).toBe(200);
    expect(eventsBody.data.items.map((event) => event._id)).not.toContain(
      "event_draft"
    );

    const forbiddenPrivateUrl = await main(
      { file_id: "cloud://private-ticket-001" },
      {
        eventID: "req_readiness_private_url",
        httpContext: {
          url: "http://localhost/files/private-url",
          httpMethod: "POST",
          headers: { "x-mock-user-id": "user_002" }
        }
      }
    );
    const privateUrlBody = forbiddenPrivateUrl.body as ApiFailure;
    expect(forbiddenPrivateUrl.statusCode).toBe(403);
    expect(privateUrlBody.error.code).toBe("FORBIDDEN");

    const nonAdminModeration = await main(
      { review_status: "hidden" },
      {
        eventID: "req_readiness_moderation",
        httpContext: {
          url: "http://localhost/admin/discover/posts/post_001/moderation",
          httpMethod: "POST",
          headers: { "x-mock-user-id": "user_002" }
        }
      }
    );
    const moderationBody = nonAdminModeration.body as ApiFailure;
    expect(nonAdminModeration.statusCode).toBe(403);
    expect(moderationBody.error.code).toBe("FORBIDDEN");

    const invalidActor = await main(
      createEventInput("Invalid CloudBase Actor"),
      {
        eventID: "req_readiness_invalid_actor",
        httpContext: {
          url: "http://localhost/admin/events",
          httpMethod: "POST",
          headers: { "x-mock-user-id": "missing_user" }
        }
      }
    );
    const invalidActorBody = invalidActor.body as ApiFailure;
    expect(invalidActor.statusCode).toBe(401);
    expect(invalidActorBody.error.code).toBe("UNAUTHORIZED");
  });
});
