import { expect, test } from "@playwright/test";

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
