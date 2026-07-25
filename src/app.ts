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
${tasks
  .map((task) => {
    const title = escapeHtml(task.title);
    return task.completed
      ? `      <li data-completed="true"><s>${title}</s></li>`
      : `      <li>${title}</li>`;
  })
  .join("\n")}
    </ul>`;
    const taskActions = tasks
      .filter((task) => !task.completed)
      .map((task) => {
        const id = escapeHtml(task.id);
        const title = escapeHtml(task.title);
        return `      <button type="button" data-complete-task-id="${id}">Complete ${title}</button>`;
      })
      .join("\n");

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
${taskActions}
    <script type="module">
      const form = document.querySelector("#task-form");
      const titleInput = document.querySelector("#task-title");
      const submitButton = form.querySelector('button[type="submit"]');
      const errorMessage = document.querySelector("#task-error");
      const completeButtons = document.querySelectorAll(
        "[data-complete-task-id]",
      );

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

      completeButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const taskId = button.dataset.completeTaskId;

          if (!taskId) {
            return;
          }

          button.disabled = true;
          errorMessage.textContent = "";

          try {
            const response = await fetch(
              \`/tasks/\${encodeURIComponent(taskId)}\`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ completed: true }),
              },
            );

            if (!response.ok) {
              errorMessage.textContent = "Could not complete task.";
              return;
            }

            window.location.reload();
          } catch {
            errorMessage.textContent = "Could not complete task.";
          } finally {
            button.disabled = false;
          }
        });
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

  app.patch<{ Params: { id: string } }>(
    "/tasks/:id",
    async (request, reply) => {
      const body: unknown = request.body;

      if (
        typeof body !== "object" ||
        body === null ||
        !("completed" in body) ||
        body.completed !== true
      ) {
        return reply
          .code(400)
          .send({ error: "Completed must be true" });
      }

      const task = taskStore.complete(request.params.id);

      if (task === undefined) {
        return reply.code(404).send({ error: "Task not found" });
      }

      return reply.code(200).send(task);
    },
  );

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}
