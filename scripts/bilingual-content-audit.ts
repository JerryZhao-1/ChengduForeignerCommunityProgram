import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import {
  EVENT_PUBLICATION_FIELDS,
  PLACE_PUBLICATION_FIELDS,
  isPublicationPlaceholder
} from "../packages/shared/src/publication-readiness";

export type AuditClassification = "blocking" | "editorial";
export type AuditEvidenceKind = "fixture" | "production-candidate";

export interface ContentAuditIssue {
  classification: AuditClassification;
  code: string;
  path: string;
  recordId?: string;
  message: string;
}

export interface ContentAuditInput {
  evidenceKind: AuditEvidenceKind;
  provenance: {
    environment: string;
    exportedAt: string;
    source: { collections: string[]; query: string };
    recordCounts: Record<string, number>;
  };
  events?: Array<Record<string, unknown>>;
  places?: Array<Record<string, unknown>>;
  announcements?: Array<Record<string, unknown>>;
  discoverPosts?: Array<Record<string, unknown>>;
}

const ANNOUNCEMENT_PUBLICATION_FIELDS = [
  "title_zh",
  "title_en",
  "summary_zh",
  "summary_en",
  "content_zh",
  "content_en"
] as const;

const collectionKeys = [
  "events",
  "places",
  "announcements",
  "discoverPosts"
] as const;

const forbiddenUrlPatterns = [
  { code: "localhost_url", pattern: /(?:localhost|127\.0\.0\.1)/i },
  { code: "private_network_url", pattern: /https?:\/\/(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/i },
  { code: "fixture_url", pattern: /example\.com/i }
];

const nonblank = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const recordId = (record: Record<string, unknown>) =>
  nonblank(record._id) ? record._id : undefined;

const requiredFieldIssues = (
  record: Record<string, unknown>,
  path: string,
  fields: readonly string[]
): ContentAuditIssue[] =>
  fields.flatMap((field) => {
    const value = record[field];
    if (!nonblank(value)) {
      return [{
        classification: "blocking" as const,
        code: "required_bilingual_field",
        path: `${path}.${field}`,
        recordId: recordId(record),
        message: `${field} is required and must not be blank.`
      }];
    }
    if (isPublicationPlaceholder(value)) {
      return [{
        classification: "blocking" as const,
        code: "placeholder_copy",
        path: `${path}.${field}`,
        recordId: recordId(record),
        message: `${field} contains placeholder copy.`
      }];
    }
    return [];
  });

const urlValues = (record: Record<string, unknown>) => {
  const values: Array<{ path: string; value: string }> = [];
  for (const field of ["cover_url", "image_url"] as const) {
    if (nonblank(record[field])) values.push({ path: field, value: record[field] });
  }
  for (const field of ["gallery_urls", "image_urls", "media_urls"] as const) {
    const entries = record[field];
    if (Array.isArray(entries)) {
      entries.forEach((value, index) => {
        if (nonblank(value)) values.push({ path: `${field}.${index}`, value });
      });
    }
  }
  const external = record.external_gallery_media;
  if (Array.isArray(external)) {
    external.forEach((item, index) => {
      if (item && typeof item === "object" && nonblank((item as Record<string, unknown>).image_url)) {
        values.push({
          path: `external_gallery_media.${index}.image_url`,
          value: (item as Record<string, unknown>).image_url as string
        });
      }
    });
  }
  return values;
};

const mediaIssues = (
  record: Record<string, unknown>,
  path: string
): ContentAuditIssue[] => {
  const urls = urlValues(record);
  const issues: ContentAuditIssue[] = [];
  for (const item of urls) {
    try {
      const parsed = new URL(item.value);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported protocol');
    } catch {
      issues.push({
        classification: "blocking",
        code: "invalid_media_url",
        path: `${path}.${item.path}`,
        recordId: recordId(record),
        message: "Public media URL must be a valid HTTP(S) URL."
      });
      continue;
    }
    for (const rule of forbiddenUrlPatterns) {
      if (rule.pattern.test(item.value)) {
        issues.push({
          classification: "blocking",
          code: rule.code,
          path: `${path}.${item.path}`,
          recordId: recordId(record),
          message: "Public media points to a forbidden development or fixture URL."
        });
      }
    }
  }

  const hasMedia = urls.length > 0;
  const hasAttribution =
    nonblank(record.media_attribution) ||
    Boolean(record.cover_source) ||
    (Array.isArray(record.external_gallery_media) &&
      record.external_gallery_media.length > 0 &&
      record.external_gallery_media.every((item) =>
        Boolean(item && typeof item === "object" && (item as Record<string, unknown>).attribution)
      ));
  if (hasMedia && !hasAttribution) {
    issues.push({
      classification: "editorial",
      code: "media_attribution_required",
      path: `${path}.media_attribution`,
      recordId: recordId(record),
      message: "Public media requires reviewed source or attribution metadata."
    });
  }
  return issues;
};

const provenanceIssues = (input: ContentAuditInput): ContentAuditIssue[] => {
  const issues: ContentAuditIssue[] = [];
  const required: Array<[string, unknown]> = [
    ["provenance.environment", input.provenance?.environment],
    ["provenance.exportedAt", input.provenance?.exportedAt],
    ["provenance.source.query", input.provenance?.source?.query]
  ];
  for (const [path, value] of required) {
    if (!nonblank(value)) {
      issues.push({ classification: "blocking", code: "provenance_required", path, message: `${path} is required.` });
    }
  }
  if (!input.provenance?.source?.collections?.length) {
    issues.push({ classification: "blocking", code: "provenance_required", path: "provenance.source.collections", message: "At least one source collection is required." });
  }
  if (!Number.isFinite(Date.parse(input.provenance?.exportedAt ?? ""))) {
    issues.push({ classification: "blocking", code: "invalid_export_timestamp", path: "provenance.exportedAt", message: "Export timestamp must be ISO-compatible." });
  }
  for (const key of collectionKeys) {
    const actual = input[key]?.length ?? 0;
    const declared = input.provenance?.recordCounts?.[key];
    if (declared !== actual) {
      issues.push({
        classification: "blocking",
        code: "record_count_mismatch",
        path: `provenance.recordCounts.${key}`,
        message: `Declared ${String(declared)} but export contains ${actual}.`
      });
    }
  }
  return issues;
};

export const auditBilingualContent = (input: ContentAuditInput) => {
  const issues = provenanceIssues(input);

  (input.events ?? []).forEach((event, index) => {
    const path = `events.${index}`;
    issues.push(...requiredFieldIssues(event, path, EVENT_PUBLICATION_FIELDS));
    if (event.review_status !== "approved" || event.publish_status !== "published") {
      issues.push({ classification: "blocking", code: "draft_leakage", path: `${path}.publish_status`, recordId: recordId(event), message: "Candidate export contains a non-public Event." });
    }
    issues.push(...mediaIssues(event, path));
  });

  (input.places ?? []).forEach((place, index) => {
    const path = `places.${index}`;
    const fields = place.is_recommended
      ? [...PLACE_PUBLICATION_FIELDS, "recommended_reason_zh", "recommended_reason_en"]
      : PLACE_PUBLICATION_FIELDS;
    issues.push(...requiredFieldIssues(place, path, fields));
    if (place.status !== "published") {
      issues.push({ classification: "blocking", code: "draft_leakage", path: `${path}.status`, recordId: recordId(place), message: "Candidate export contains a non-public Place." });
    }
    issues.push(...mediaIssues(place, path));
  });

  (input.announcements ?? []).forEach((announcement, index) => {
    const path = `announcements.${index}`;
    issues.push(...requiredFieldIssues(announcement, path, ANNOUNCEMENT_PUBLICATION_FIELDS));
    if (announcement.status !== "published") {
      issues.push({ classification: "blocking", code: "draft_leakage", path: `${path}.status`, recordId: recordId(announcement), message: "Candidate export contains a non-public Announcement." });
    }
    issues.push(...mediaIssues(announcement, path));
  });

  (input.discoverPosts ?? []).forEach((post, index) => {
    const path = `discoverPosts.${index}`;
    if (!['zh', 'en'].includes(String(post.language))) {
      issues.push({ classification: "blocking", code: "invalid_original_language", path: `${path}.language`, recordId: recordId(post), message: "Discover UGC must declare its original language as zh or en." });
    }
    if (!nonblank(post.title) || !nonblank(post.content)) {
      issues.push({ classification: "blocking", code: "ugc_content_required", path, recordId: recordId(post), message: "Discover UGC requires original title and content; translations are not required." });
    }
    issues.push(...mediaIssues(post, path));
  });

  const blocking = issues.filter((issue) => issue.classification === "blocking").length;
  const editorial = issues.filter((issue) => issue.classification === "editorial").length;
  const contentPass = issues.length === 0;
  return {
    evidenceKind: input.evidenceKind,
    auditedAt: new Date().toISOString(),
    provenance: input.provenance,
    counts: Object.fromEntries(collectionKeys.map((key) => [key, input[key]?.length ?? 0])),
    summary: { blocking, editorial, total: issues.length },
    contentPass,
    releaseEligible: contentPass && input.evidenceKind === "production-candidate",
    releaseIneligibilityReason:
      input.evidenceKind === "fixture"
        ? "Fixture evidence cannot satisfy the production release gate."
        : contentPass
          ? null
          : "Production-candidate content audit has unresolved issues.",
    issues
  };
};

const parseArgs = (args: string[]) => {
  const value = (name: string) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };
  return { input: value("--input"), output: value("--output") };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) throw new Error("Usage: --input <export.json> [--output <audit.json>]");
  const input = JSON.parse(await readFile(args.input, "utf8")) as ContentAuditInput;
  const result = auditBilingualContent(input);
  const serialized = `${JSON.stringify(result, null, 2)}\n`;
  if (args.output) await writeFile(args.output, serialized, "utf8");
  process.stdout.write(serialized);
  process.exitCode = result.contentPass ? 0 : 1;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
