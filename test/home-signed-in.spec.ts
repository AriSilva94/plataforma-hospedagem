import { createServer, type Server } from "node:http";
import { expect, test, type Locator, type Page } from "@playwright/test";

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

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAX+XDSwAAAABJRU5ErkJggg==", "base64");
let storyViewed = false;
let withSecondStory = false;
let storyMedia: { id: string; type: string; url: string }[] | null = null;

const defaultMedia = () => [{ id: "m1", type: "IMAGE", url: `${apiUrl}/story.png` }, { id: "m2", type: "VIDEO", url: `${apiUrl}/story.mp4` }];

const storyOf = (roomId: string, title: string, media: { id: string; type: string; url: string }[]) => ({
  roomId,
  viewed: storyViewed,
  propertyId: "p1",
  title,
  priceCents: 35000,
  capacity: 2,
  acceptedAudiences: ["MAN", "WOMAN"],
  neighborhood: "Centro",
  city: "Curitiba",
  state: "PR",
  media,
});

const stories = () => [storyOf("story-1", "Suíte Premium", storyMedia ?? defaultMedia()), ...(withSecondStory ? [storyOf("story-2", "Suíte Master", storyMedia ?? defaultMedia())] : [])];

const twoImages = () => [{ id: "m1", type: "IMAGE", url: `${apiUrl}/story.png` }, { id: "m2", type: "IMAGE", url: `${apiUrl}/story-2.png` }];

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
    if (path?.endsWith(".png")) return response.writeHead(200, { "Content-Type": "image/png" }).end(png);
    if (path === "/rooms/stories") return response.end(JSON.stringify({ items: stories() }));
    if (path === "/favorites/room-ids") return response.end(JSON.stringify({ roomIds: [] }));
    response.writeHead(404).end("{}");
  });
  await new Promise<void>((resolve) => server.listen(Number(new URL(apiUrl).port), resolve));
});

test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test.beforeEach(async ({ context, page }) => {
  await page.route("**/_next/image**", (route) => route.fulfill({ status: 200, contentType: "image/png", body: png }));
  storyViewed = false;
  storyMedia = null;
  withSecondStory = false;
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

test.describe("temporizador do story", () => {
  async function openStory(page: Page) {
    storyMedia = twoImages();
    await page.clock.install();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir story de Suíte Premium" }).click();
    const viewer = page.getByRole("dialog", { name: "Story de Suíte Premium" });
    await expect(viewer).toBeVisible();
    return { viewer, bars: viewer.locator("progress") };
  }

  const barValue = (bars: Locator, index: number) => bars.nth(index).evaluate((bar: HTMLProgressElement) => bar.value);

  test("imagem avança sozinha depois de 5 segundos", async ({ page }) => {
    const { bars } = await openStory(page);

    await page.clock.runFor(5200);

    await expect.poll(() => barValue(bars, 0)).toBe(100);
  });

  test("segurar o story pausa o avanço e soltar retoma sem navegar", async ({ page }) => {
    const { viewer, bars } = await openStory(page);
    const box = await viewer.getByRole("button", { name: "Próxima mídia" }).boundingBox();
    if (!box) throw new Error("zona de toque ausente");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.clock.runFor(6000);
    expect(await barValue(bars, 0)).toBeLessThan(100);

    await page.mouse.up();
    expect(await barValue(bars, 0)).toBeLessThan(100);
    expect(await barValue(bars, 1)).toBe(0);

    await page.clock.runFor(5200);
    await expect.poll(() => barValue(bars, 0)).toBe(100);
  });

  test("aba oculta pausa o avanço e voltar retoma", async ({ page }) => {
    const { bars } = await openStory(page);
    const setHidden = (hidden: boolean) =>
      page.evaluate((value) => {
        Object.defineProperty(document, "hidden", { value, configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
      }, hidden);

    await setHidden(true);
    await page.clock.runFor(6000);
    expect(await barValue(bars, 0)).toBeLessThan(100);

    await setHidden(false);
    await page.clock.runFor(5200);
    await expect.poll(() => barValue(bars, 0)).toBe(100);
  });
});

test.describe("gestos, pré-carregamento e falha de mídia do story", () => {
  async function openStory(page: Page, title = "Suíte Premium") {
    await page.clock.install();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("button", { name: `Abrir story de ${title}` }).click();
    const viewer = page.getByRole("dialog", { name: `Story de ${title}` });
    await expect(viewer).toBeVisible();
    return viewer;
  }

  const swipe = async (page: Page, from: [number, number], to: [number, number]) => {
    await page.mouse.move(...from);
    await page.mouse.down();
    await page.mouse.move(...to, { steps: 5 });
    await page.mouse.up();
  };

  test("deslize horizontal troca de story e deslize para baixo fecha", async ({ page }) => {
    withSecondStory = true;
    storyMedia = twoImages();
    await openStory(page);

    await swipe(page, [300, 400], [100, 400]);
    await expect(page.getByRole("dialog", { name: "Story de Suíte Master" })).toBeVisible();

    await swipe(page, [100, 400], [300, 400]);
    await expect(page.getByRole("dialog", { name: "Story de Suíte Premium" })).toBeVisible();

    await swipe(page, [200, 300], [200, 520]);
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("pré-carrega a próxima mídia enquanto exibe a atual", async ({ page }) => {
    storyMedia = twoImages();
    const preloaded = page.waitForRequest((request) => decodeURIComponent(request.url()).includes("story-2.png"));

    await openStory(page);
    await page.clock.pauseAt(new Date(Date.now() + 1000));

    await preloaded;
  });

  test("falha de mídia mostra aviso e avança depois de um instante", async ({ page }) => {
    const viewer = await openStory(page);
    await viewer.getByRole("button", { name: "Próxima mídia" }).click();

    await expect(viewer.getByRole("status")).toHaveText("Não foi possível carregar esta mídia.");
    await expect(viewer).toBeVisible();

    await page.clock.runFor(2500);
    await expect(viewer).toBeHidden();
  });
});

test("home logada não gera rolagem horizontal no mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(page.getByRole("tab", { name: "Disponíveis" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir story de Suíte Premium" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
