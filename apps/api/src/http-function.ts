import { createServer } from "node:http";

import { createApp } from "./app";

const port = Number(process.env.PORT ?? 9000);
const app = createApp(process.env.API_PROVIDER);
const server = createServer(app.callback());

server.listen(port, () => {
  console.log(`[api] CloudBase HTTP function listening on port ${port}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`[api] received ${signal}, shutting down`);
  server.close(() => {
    process.exit(0);
  });
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
