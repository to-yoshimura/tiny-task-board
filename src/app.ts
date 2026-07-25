import Fastify, { type FastifyInstance } from "fastify";

import {
  createInMemoryTaskStore,
  type Task,
} from "./task-store.js";

type BuildAppOptions = {
  initialTasks?: readonly Task[];
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify();
  const taskStore = createInMemoryTaskStore(options.initialTasks);

  app.get("/", async (_request, reply) => {
    const tasks = taskStore.getAll();
    const taskList =
      tasks.length === 0
        ? "<p>No tasks yet.</p>"
        : `<ul>
${tasks.map((task) => `      <li>${escapeHtml(task.title)}</li>`).join("\n")}
    </ul>`;

    return reply.type("text/html; charset=utf-8").send(`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8">
    <title>Tiny Task Board</title>
  </head>
  <body>
    <h1>Tiny Task Board</h1>
    ${taskList}
  </body>
</html>`);
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
