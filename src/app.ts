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
    <form id="task-form">
      <label for="task-title">Task title</label>
      <input id="task-title" name="title" type="text" required>
      <button type="submit">Add task</button>
      <p id="task-error" role="alert"></p>
    </form>
    ${taskList}
    <script type="module">
      const form = document.querySelector("#task-form");
      const titleInput = document.querySelector("#task-title");
      const submitButton = form.querySelector('button[type="submit"]');
      const errorMessage = document.querySelector("#task-error");

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = titleInput.value.trim();

        if (title === "") {
          errorMessage.textContent = "Enter a task title.";
          titleInput.focus();
          return;
        }

        submitButton.disabled = true;
        errorMessage.textContent = "";

        try {
          const response = await fetch("/tasks", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title }),
          });

          if (!response.ok) {
            errorMessage.textContent = "Could not add task.";
            return;
          }

          titleInput.value = "";
          window.location.reload();
        } catch {
          errorMessage.textContent = "Could not add task.";
        } finally {
          submitButton.disabled = false;
        }
      });
    </script>
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
