import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  reporter: process.env.CI
    ? [["dot"], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
