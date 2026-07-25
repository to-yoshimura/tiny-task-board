import { afterAll, describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";

const app = buildApp({
  initialTasks: [
    {
      id: "task-1",
      title: "Read Continuous Delivery",
      completed: false,
    },
  ],
});

afterAll(async () => {
  await app.close();
});

describe("GET / with tasks", () => {
  it("shows existing tasks instead of the empty state", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/^text\/html\b/);
    expect(response.body).toContain("<h1>Tiny Task Board</h1>");
    expect(response.body).toContain("Read Continuous Delivery");
    expect(response.body).not.toContain("No tasks yet.");
  });

  it("escapes task titles in HTML", async () => {
    const appWithUnsafeTitle = buildApp({
      initialTasks: [
        {
          id: "task-1",
          title: '<script>alert("xss")</script>',
          completed: false,
        },
      ],
    });

    try {
      const response = await appWithUnsafeTitle.inject({
        method: "GET",
        url: "/",
      });

      expect(response.body).not.toContain("<script>");
      expect(response.body).toContain(
        "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
      );
    } finally {
      await appWithUnsafeTitle.close();
    }
  });
});

describe("POST /tasks", () => {
  it("creates an incomplete task and shows it on the task board", async () => {
    const app = buildApp();

    try {
      const response = await app.inject({
        method: "POST",
        url: "/tasks",
        payload: {
          title: "Write deployment pipeline",
        },
      });

      expect(response.statusCode).toBe(201);
      expect(response.headers["content-type"]).toMatch(/^application\/json\b/);

      const task = response.json<{
        id: string;
        title: string;
        completed: boolean;
      }>();

      expect(task).toEqual({
        id: expect.any(String),
        title: "Write deployment pipeline",
        completed: false,
      });
      expect(task.id).not.toBe("");

      const page = await app.inject({
        method: "GET",
        url: "/",
      });

      expect(page.body).toContain("Write deployment pipeline");
      expect(page.body).not.toContain("No tasks yet.");
    } finally {
      await app.close();
    }
  });

  it.each([
    ["an empty title", { title: "" }],
    ["a whitespace-only title", { title: "   " }],
    ["a missing title", {}],
    ["a non-string title", { title: 42 }],
  ])("rejects %s without creating a task", async (_caseName, payload) => {
    const app = buildApp();

    try {
      const response = await app.inject({
        method: "POST",
        url: "/tasks",
        payload,
      });

      expect(response.statusCode).toBe(400);

      const page = await app.inject({
        method: "GET",
        url: "/",
      });

      expect(page.body).toContain("No tasks yet.");
    } finally {
      await app.close();
    }
  });
});
