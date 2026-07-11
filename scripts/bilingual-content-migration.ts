import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export type MigrationScope = "events" | "notifications" | "all";

interface MigrationInput {
  events?: Array<Record<string, unknown>>;
  notifications?: Array<Record<string, unknown>>;
  migrationHints?: {
    notificationLegacyLocales?: Record<string, "zh" | "en">;
  };
  [key: string]: unknown;
}

interface MigrationAction {
  collection: "events" | "notifications";
  recordId: string;
  field: string;
  sourceField: string;
  value: string;
  operation: "copy_known_language_legacy_value";
}

const nonblank = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

const clone = <T>(value: T): T => structuredClone(value);

const buildActions = (input: MigrationInput, scope: MigrationScope) => {
  const actions: MigrationAction[] = [];
  const editorialReview: Array<{ collection: string; recordId: string; reason: string }> = [];

  if (scope === "events" || scope === "all") {
    for (const event of input.events ?? []) {
      const id = nonblank(event._id) ? event._id : "unknown";
      if (!nonblank(event.address_zh) && nonblank(event.address_text)) {
        actions.push({
          collection: "events",
          recordId: id,
          field: "address_zh",
          sourceField: "address_text",
          value: event.address_text.trim(),
          operation: "copy_known_language_legacy_value"
        });
      }
      if (!nonblank(event.address_en)) {
        editorialReview.push({
          collection: "events",
          recordId: id,
          reason: "address_en requires reviewed editorial translation; no value was generated."
        });
      }
    }
  }

  if (scope === "notifications" || scope === "all") {
    const localeHints = input.migrationHints?.notificationLegacyLocales ?? {};
    for (const notification of input.notifications ?? []) {
      const id = nonblank(notification._id) ? notification._id : "unknown";
      const locale = localeHints[id];
      if (!locale) {
        if (
          (!nonblank(notification.title_zh) && !nonblank(notification.title_en)) ||
          (!nonblank(notification.body_zh) && !nonblank(notification.body_en))
        ) {
          editorialReview.push({
            collection: "notifications",
            recordId: id,
            reason: "Legacy notification language is unknown; add an explicit zh/en migration hint before copying."
          });
        }
        continue;
      }
      const titleField = `title_${locale}`;
      const bodyField = `body_${locale}`;
      if (!nonblank(notification[titleField]) && nonblank(notification.title)) {
        actions.push({
          collection: "notifications",
          recordId: id,
          field: titleField,
          sourceField: "title",
          value: notification.title.trim(),
          operation: "copy_known_language_legacy_value"
        });
      }
      if (!nonblank(notification[bodyField]) && nonblank(notification.body)) {
        actions.push({
          collection: "notifications",
          recordId: id,
          field: bodyField,
          sourceField: "body",
          value: notification.body.trim(),
          operation: "copy_known_language_legacy_value"
        });
      }
      const counterpart = locale === "zh" ? "en" : "zh";
      if (!nonblank(notification[`title_${counterpart}`]) || !nonblank(notification[`body_${counterpart}`])) {
        editorialReview.push({
          collection: "notifications",
          recordId: id,
          reason: `${counterpart} notification copy requires reviewed editorial content; no translation was generated.`
        });
      }
    }
  }

  return { actions, editorialReview };
};

export const planBilingualBackfill = (
  input: MigrationInput,
  scope: MigrationScope = "all"
) => {
  const { actions, editorialReview } = buildActions(input, scope);
  const inputDigest = digest(input);
  const planDigest = digest({ inputDigest, scope, actions });
  return {
    mode: "dry-run" as const,
    scope,
    inputDigest,
    planDigest,
    mutationPerformed: false,
    actionCount: actions.length,
    actions,
    editorialReview
  };
};

export const applyBilingualBackfill = (
  input: MigrationInput,
  options: { scope?: MigrationScope; approvedPlanDigest: string }
) => {
  const scope = options.scope ?? "all";
  const plan = planBilingualBackfill(input, scope);
  if (!options.approvedPlanDigest || options.approvedPlanDigest !== plan.planDigest) {
    throw new Error("Apply requires the exact digest from a reviewed dry-run plan.");
  }
  const output = clone(input);
  for (const action of plan.actions) {
    const records = output[action.collection] ?? [];
    const record = records.find((item) => item._id === action.recordId);
    if (record) record[action.field] = action.value;
  }
  return {
    output,
    report: {
      ...plan,
      mode: "apply" as const,
      mutationPerformed: plan.actions.length > 0,
      outputDigest: digest(output)
    }
  };
};

const parseArgs = (args: string[]) => {
  const value = (name: string) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };
  return {
    input: value("--input"),
    report: value("--report"),
    output: value("--output"),
    scope: (value("--scope") ?? "all") as MigrationScope,
    approvedPlanDigest: value("--approved-plan-digest"),
    apply: args.includes("--apply")
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !["events", "notifications", "all"].includes(args.scope)) {
    throw new Error("Usage: --input <export.json> [--scope events|notifications|all] [--report <plan.json>] [--apply --approved-plan-digest <digest> --output <migrated.json>]");
  }
  const input = JSON.parse(await readFile(args.input, "utf8")) as MigrationInput;
  if (!args.apply) {
    const plan = planBilingualBackfill(input, args.scope);
    const serialized = `${JSON.stringify(plan, null, 2)}\n`;
    if (args.report) await writeFile(args.report, serialized, "utf8");
    process.stdout.write(serialized);
    return;
  }
  if (!args.output || !args.approvedPlanDigest) {
    throw new Error("Apply requires --output and --approved-plan-digest from a reviewed dry-run.");
  }
  const applied = applyBilingualBackfill(input, {
    scope: args.scope,
    approvedPlanDigest: args.approvedPlanDigest
  });
  await writeFile(args.output, `${JSON.stringify(applied.output, null, 2)}\n`, "utf8");
  const serialized = `${JSON.stringify(applied.report, null, 2)}\n`;
  if (args.report) await writeFile(args.report, serialized, "utf8");
  process.stdout.write(serialized);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main();
}
