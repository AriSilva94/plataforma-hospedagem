import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  workers: 1,
  use: { baseURL: "http://localhost:3001" },
  webServer: {
    command: "npx next dev --port 3001",
    url: "http://localhost:3001",
    env: { MEDIA_PUBLIC_BASE_URL: "http://localhost:3030" },
    reuseExistingServer: !process.env.CI,
  },
});
