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

  app.post("/tasks", async (request, reply) => {
    const body: unknown = request.body;

    if (
      typeof body !== "object" ||
      body === null ||
      !("title" in body) ||
      typeof body.title !== "string"
    ) {
      return reply
        .code(400)
        .send({ error: "Title must be a non-empty string" });
    }

    const title = body.title.trim();

    if (title === "") {
      return reply
        .code(400)
        .send({ error: "Title must be a non-empty string" });
    }

    const task = taskStore.add(title);

    return reply.code(201).send(task);
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
