import { createServer, type Server } from "node:http";
import { expect, test } from "@playwright/test";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";
let server: Server;

const user = {
  id: "user-1",
  name: "Ana Silva",
  email: "ana@example.com",
  emailVerifiedAt: null,
  hasPassword: true,
  phone: null,
  birthDate: null,
  city: null,
  state: null,
  roles: [],
};

function rooms(prefix: string, featured: boolean) {
  return Array.from({ length: 6 }, (_, index) => ({
    id: `${prefix}-${index}`,
    title: `${prefix} ${index + 1}`,
    priceCents: 12000 + index * 1000,
    featured,
    verified: index % 2 === 0,
    coverUrl: null,
    property: { id: "p1", title: "Casa Central", type: "HOUSE", neighborhood: "Centro", city: "Curitiba", state: "PR" },
  }));
}

test.beforeAll(async () => {
  server = createServer((request, response) => {
    response.setHeader("Content-Type", "application/json");
    const path = request.url?.split("?")[0];
    if (path === "/users/me") return response.end(JSON.stringify(user));
    if (path === "/rooms") return response.end(JSON.stringify({ items: rooms("Quarto", false), nextCursor: null, total: 6 }));
    if (path === "/rooms/featured") return response.end(JSON.stringify({ items: rooms("Suíte", true), nextCursor: null, total: 6 }));
    if (path === "/favorites/room-ids") return response.end(JSON.stringify({ roomIds: [] }));
    response.writeHead(404).end("{}");
  });
  await new Promise<void>((resolve) => server.listen(Number(new URL(apiUrl).port), resolve));
});

test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test.beforeEach(async ({ context }) => {
  await context.addCookies([{ name: "access_token", value: "test-session", url: "http://localhost:3001" }]);
});

test("home logada troca de painel pelas abas sem rolar a página no desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");

  const fits = () => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight);

  await expect(page.getByRole("tab", { name: "Em destaque" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Suíte 1" })).toBeVisible();
  expect(await fits()).toBe(true);

  await page.getByRole("tab", { name: "Disponíveis" }).click();
  await expect(page.getByRole("heading", { name: "Quarto 1", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Suíte 1" })).toBeHidden();
  expect(await fits()).toBe(true);

  await page.getByRole("tab", { name: "Disponíveis" }).press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Como funciona" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Discrição e segurança fazem parte do fluxo" })).toBeVisible();
  expect(await fits()).toBe(true);

  await page.getByRole("tab", { name: "Anunciar" }).click();
  await expect(page.getByRole("link", { name: "Anunciar meu espaço" })).toHaveAttribute("href", "/meus-imoveis");
  expect(await fits()).toBe(true);
});

test("home logada não gera rolagem horizontal no mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(page.getByRole("tab", { name: "Em destaque" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
