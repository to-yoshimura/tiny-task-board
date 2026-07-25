import { afterAll, describe, expect, it } from "vitest";

import { buildApp } from "../src/app.js";

const app = buildApp();

afterAll(async () => {
  await app.close();
});

describe("GET /", () => {
  it("returns the Tiny Task Board page", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/^text\/html\b/);
    expect(response.body).toContain("<h1>Tiny Task Board</h1>");
  });
});
