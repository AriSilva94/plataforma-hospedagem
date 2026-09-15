import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { randomUUID } from "crypto";

loadEnvConfig(process.cwd(), true);

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const databaseUrl = process.env.E2E_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Defina E2E_DATABASE_URL para executar os testes e2e do frontend.",
  );
}

const accessTokenSecret = randomUUID();
const refreshTokenSecret = randomUUID();

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run start",
      cwd: "../backend",
      url: "http://localhost:3000/health",
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        REDIS_URL: process.env.E2E_REDIS_URL ?? "redis://localhost:6379",
        ACCESS_TOKEN_SECRET: accessTokenSecret,
        ACCESS_TOKEN_TTL: "15m",
        REFRESH_TOKEN_SECRET: refreshTokenSecret,
        REFRESH_TOKEN_TTL: "30d",
        REFRESH_TOKEN_TTL_DAYS: "30",
        FRONTEND_URL: baseURL,
        SMTP_HOST: process.env.E2E_SMTP_HOST ?? "localhost",
        SMTP_PORT: process.env.E2E_SMTP_PORT ?? "1025",
        EMAIL_FROM: "e2e@localhost",
      },
    },
    {
      command: "npm run dev -- --port 3001",
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL:
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
      },
    },
  ],
});
