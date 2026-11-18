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

let storyViewed = false;

const stories = () => [{ roomId: "story-1", viewed: storyViewed, propertyId: "p1", title: "Suíte Premium", priceCents: 35000, capacity: 2, acceptedAudiences: ["MAN", "WOMAN"], neighborhood: "Centro", city: "Curitiba", state: "PR", media: [{ id: "m1", type: "IMAGE", url: "http://localhost:3030/story.png" }, { id: "m2", type: "VIDEO", url: "http://localhost:3030/story.mp4" }] }];

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
    if (path === "/rooms/stories") return response.end(JSON.stringify({ items: stories() }));
    if (path === "/favorites/room-ids") return response.end(JSON.stringify({ roomIds: [] }));
    response.writeHead(404).end("{}");
  });
  await new Promise<void>((resolve) => server.listen(Number(new URL(apiUrl).port), resolve));
});

test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test.beforeEach(async ({ context }) => {
  storyViewed = false;
  await context.addCookies([{ name: "access_token", value: "test-session", url: "http://localhost:3001" }]);
});

test("home logada troca de painel pelas abas sem rolar a página no desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");

  const fits = () => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight);

  await expect(page.getByRole("tab", { name: "Em destaque" })).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Disponíveis" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Locais em destaque" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Suíte 1" })).toBeVisible();
  expect(await fits()).toBe(true);

  await page.getByRole("tab", { name: "Disponíveis" }).press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Como funciona" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Discrição e segurança fazem parte do fluxo" })).toBeVisible();
  expect(await fits()).toBe(true);

  await page.getByRole("tab", { name: "Anunciar" }).click();
  await expect(page.getByRole("link", { name: "Anunciar meu espaço" })).toHaveAttribute("href", "/meus-imoveis");
  expect(await fits()).toBe(true);
});

test("story abre em tela cheia, avança entre mídias e fecha", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await page.getByRole("button", { name: "Abrir story de Suíte Premium" }).click();
  const viewer = page.getByRole("dialog", { name: "Story de Suíte Premium" });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByText("Centro, Curitiba · PR")).toBeVisible();
  await expect(viewer.getByRole("link", { name: "Ver quarto" })).toHaveAttribute("href", "/imoveis/p1/quartos/story-1");

  await viewer.getByRole("button", { name: "Próxima mídia" }).click();
  await expect(viewer.locator("video")).toBeVisible();

  await viewer.getByRole("button", { name: "Fechar story" }).click();
  await expect(viewer).toBeHidden();
});

test("story registra a visualização no backend e passa a constar como visto", async ({ page }) => {
  const views: string[] = [];
  await page.route("**/rooms/*/story/views", (route) => {
    views.push(new URL(route.request().url()).pathname);
    return route.fulfill({ status: 204 });
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Abrir story de Suíte Premium" });
  await expect(trigger).toHaveAttribute("data-viewed", "false");
  await trigger.click();
  await page.getByRole("button", { name: "Fechar story" }).click();

  await expect(trigger).toHaveAttribute("data-viewed", "true");
  expect(views).toEqual(["/rooms/story-1/story/views"]);
});

test("story já visto vem marcado pela API", async ({ page }) => {
  storyViewed = true;
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Abrir story de Suíte Premium" })).toHaveAttribute("data-viewed", "true");
});

test("story abre mesmo quando o registro da visualização falha", async ({ page }) => {
  await page.route("**/rooms/*/story/views", (route) => route.fulfill({ status: 500, body: "{}" }));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await page.getByRole("button", { name: "Abrir story de Suíte Premium" }).click();

  await expect(page.getByRole("dialog", { name: "Story de Suíte Premium" })).toBeVisible();
});

test("home logada não gera rolagem horizontal no mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(page.getByRole("tab", { name: "Disponíveis" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir story de Suíte Premium" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
