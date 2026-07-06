import tcb from "@cloudbase/node-sdk";
import { createMockDataset } from "@community-map/shared";

const DEFAULT_ENV_ID = "cloud1-d7gxdk8t43bd639c0";

const env = process.env.CLOUDBASE_ENV_ID ?? process.env.TCB_ENV ?? DEFAULT_ENV_ID;
const dataset = createMockDataset();
const app = tcb.init({ env });
const db = app.database();

const withoutDocumentId = <TItem extends { _id: string }>(item: TItem) => {
  const document: Partial<TItem> = { ...item };
  delete document._id;
  return document;
};

const hasExistingEvents = async () => {
  const result = await db.collection("events").limit(1).get();
  return result.data.length > 0;
};

const setDocument = async <TItem extends { _id: string }>(
  collectionName: string,
  item: TItem
) => {
  await db
    .collection(collectionName)
    .doc(item._id)
    .set(withoutDocumentId(item));
};

const main = async () => {
  if (await hasExistingEvents()) {
    console.log(
      `[seed:cloudbase-events] ${env} already has events; skipping seed.`
    );
    return;
  }

  await Promise.all([
    ...dataset.events.map((event) => setDocument("events", event)),
    ...dataset.registrations.map((registration) =>
      setDocument("event_registrations", registration)
    ),
    ...dataset.tickets.map((ticket) => setDocument("event_tickets", ticket))
  ]);

  console.log(
    `[seed:cloudbase-events] seeded ${dataset.events.length} events, ${dataset.registrations.length} registrations, ${dataset.tickets.length} tickets into ${env}.`
  );
};

main().catch((error: unknown) => {
  console.error("[seed:cloudbase-events] failed", error);
  process.exitCode = 1;
});
