import { expect, test } from "@playwright/test";

import { buildApp } from "../src/app.js";

test("shows the Tiny Task Board home page", async ({ page }) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Tiny Task Board" }),
  ).toBeVisible();
});

test("画面から新しいタスクを登録する", async ({ page }) => {
  await page.goto("/");

  const titleInput = page.getByLabel("Task title");

  await expect(titleInput).toBeVisible();
  await titleInput.fill("Write deployment pipeline");
  await page.getByRole("button", { name: "Add task" }).click();

  await expect(
    page.getByText("Write deployment pipeline", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No tasks yet.", { exact: true }),
  ).toHaveCount(0);
  await expect(titleInput).toHaveValue("");
});

test("画面から未完了タスクを完了する", async ({ page }) => {
  const title = "Write deployment pipeline";
  const app = buildApp();
  const appUrl = await app.listen({
    host: "127.0.0.1",
    port: 0,
  });

  try {
    await page.goto(appUrl);
    await expect(
      page.getByText("No tasks yet.", { exact: true }),
    ).toBeVisible();

    await page.getByLabel("Task title").fill(title);
    await page.getByRole("button", { name: "Add task" }).click();
    await expect(page.getByText(title, { exact: true })).toBeVisible();

    const completeButton = page.getByRole("button", {
      name: `Complete ${title}`,
    });

    await expect(completeButton).toBeVisible();
    await completeButton.click();

    await expect(
      page
        .locator('[data-completed="true"]')
        .getByText(title, { exact: true }),
    ).toBeVisible();
    await expect(page.getByText(title, { exact: true })).toHaveCount(1);
  } finally {
    await app.close();
  }
});
