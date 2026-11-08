import { expect, request, test } from "@playwright/test";
import { parseIsoDate, toIsoDate } from "@/lib/availability";
import {
  apiUrl,
  findSeedRoom,
  getOwnerAvailability,
  getPublicAvailability,
  loginAsOwner,
  replaceAvailability,
  type AvailabilityBody,
} from "./support/availability-api";

function addDays(isoDate: string, offset: number) {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + offset);
  return toIsoDate(date);
}

test("filtro de cidade dos anúncios aplica, mantém outros parâmetros e limpa", async ({ page }) => {
  await page.route("**/locations/cities?*", (route) => route.fulfill({ json: [{ city: "Curitiba", state: "PR" }] }));
  await page.goto("/anuncios?entrada=2026-12-01");

  const city = page.getByRole("combobox", { name: "Cidade" });
  await expect(city).toHaveValue("");
  await expect(page.getByRole("button", { name: "Limpar cidade" })).toHaveCount(0);

  await city.fill("curit");
  await page.getByRole("option", { name: /Curitiba\s*PR/ }).click();

  await expect(page).toHaveURL(/\/anuncios\?entrada=2026-12-01&cidade=Curitiba&uf=PR$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Quartos em Curitiba – PR");
  await expect(city).toHaveValue("Curitiba, PR");

  await page.getByRole("button", { name: "Limpar cidade" }).click();

  await expect(page).toHaveURL(/\/anuncios\?entrada=2026-12-01$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Anúncios");
  await expect(city).toHaveValue("");
});

test("filtros de tipo, diária e público atualizam a URL e limpam juntos", async ({ page }) => {
  await page.goto("/anuncios");
  const filters = page.getByRole("region", { name: "Filtros" });

  await filters.locator("label:visible",{ hasText: "Motel" }).click();
  await expect(page).toHaveURL(/\/anuncios\?tipo=motel$/);
  await expect(filters.getByRole("checkbox", { name: "Motel" })).toBeChecked();
  await filters.locator("label:visible",{ hasText: "Casa" }).click();
  await expect(page).toHaveURL(/tipo=motel%2Ccasa$/);
  await filters.locator("label:visible",{ hasText: "Motel" }).click();
  await expect(page).toHaveURL(/\/anuncios\?tipo=casa$/);

  const maxPrice = filters.getByRole("slider", { name: "Diária" });
  await maxPrice.focus();
  await maxPrice.press("ArrowLeft");
  await maxPrice.press("ArrowLeft");
  await maxPrice.press("ArrowLeft");
  await expect(page).toHaveURL(/tipo=casa&preco_max=1970$/);
  await expect(maxPrice).toHaveAttribute("aria-valuetext", /^Até R\$\s1\.970$/);
  await expect(maxPrice).toBeFocused();

  const moreFilters = filters.getByRole("button", { name: /^Mais filtros/ });
  await moreFilters.click();
  await filters.locator("label:visible",{ hasText: "Mulher trans" }).click();
  await expect(page).toHaveURL(/publico=mulher-trans/);
  await expect(filters.getByRole("radio", { name: "Mulher trans" })).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(moreFilters).toHaveAccessibleName("Mais filtros 1 ativo");

  await filters.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page).toHaveURL(/\/anuncios$/);
  await expect(filters.getByRole("checkbox", { name: "Casa" })).not.toBeChecked();
  await moreFilters.click();
  await expect(filters.getByRole("radio", { name: "Todos" })).toBeChecked();
  await expect(maxPrice).toHaveAttribute("aria-valuetext", "Qualquer valor");
});

test("clicar e arrastar em qualquer ponto do trilho da diária define o valor máximo", async ({ page }) => {
  await page.goto("/anuncios");
  const track = page.getByRole("region", { name: "Filtros" }).locator(".price-range:visible .price-range-track");
  const box = await track.boundingBox();
  if (!box) throw new Error("trilho da diária não encontrado");
  const y = box.y + box.height / 2;

  await page.mouse.click(box.x + box.width * 0.5, y);
  await expect(page).toHaveURL(/\/anuncios\?preco_max=(99|100|101)0$/);

  const moved = await track.boundingBox();
  if (!moved) throw new Error("trilho da diária não encontrado");
  await page.mouse.move(moved.x + moved.width * 0.5, y);
  await page.mouse.down();
  await page.mouse.move(moved.x + moved.width * 0.25, y, { steps: 6 });
  await page.mouse.up();
  await expect(page).toHaveURL(/preco_max=(49|50|51)0$/);
});

test("no celular os filtros abrem num painel com o total de quartos", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/anuncios");

  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Filtros" });
  await expect(sheet).toBeVisible();

  await sheet.locator("label", { hasText: "Apartamento" }).click();
  await expect(page).toHaveURL(/\/anuncios\?tipo=apartamento$/);
  const results = sheet.getByRole("button", { name: /^(Ver \d+ quartos?|Nenhum quarto encontrado)$/ });
  await expect(results).toBeVisible();

  await results.click();
  await expect(sheet).toBeHidden();
  await expect(page.getByRole("button", { name: /^Filtros 1 ativo$/ })).toBeVisible();
});

test("filtro de cidade mostra a cidade vinda da URL", async ({ page }) => {
  await page.goto("/anuncios?cidade=Curitiba&uf=PR");

  await expect(page.getByRole("combobox", { name: "Cidade" })).toHaveValue("Curitiba, PR");
});

test("filtros chegam à API: diária máxima e tipo restringem os cards", async ({ page }) => {
  await page.goto("/anuncios?preco_max=500");
  const prices = await page.locator("[data-room-content] section > ul > li strong").allTextContents();
  expect(prices.length).toBeGreaterThan(0);
  for (const price of prices) {
    expect(Number(price.replace(/[^\d,]/g, "").replace(",", "."))).toBeLessThanOrEqual(500);
  }

  await page.goto("/anuncios?tipo=casa");
  const cards = page.locator("[data-room-content] section > ul > li");
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();
  await expect(cards.filter({ hasText: "Casa" })).toHaveCount(total);
});

test("filtros aplicados em sequência rápida não se perdem", async ({ page }) => {
  await page.goto("/anuncios");
  const filters = page.getByRole("region", { name: "Filtros" });

  await filters.locator("label:visible", { hasText: "Casa" }).click();
  await filters.locator("label:visible", { hasText: "Motel" }).click();
  await filters.getByRole("button", { name: /^Mais filtros/ }).click();
  await filters.locator("label:visible", { hasText: "Mulher trans" }).click();

  await expect(page).toHaveURL(/tipo=casa%2Cmotel&publico=mulher-trans$/);
});

test("diária fora da escala do slider é ignorada", async ({ page }) => {
  await page.goto("/anuncios?preco_max=5000");
  const slider = page.getByRole("region", { name: "Filtros" }).getByRole("slider", { name: "Diária" });
  await expect(slider).toHaveAttribute("aria-valuetext", "Qualquer valor");
  await expect(page.getByRole("button", { name: "Limpar filtros" })).toHaveCount(0);
});

test("cidade da URL é validada: nome oficial no título e aviso para cidade inexistente", async ({ page }) => {
  await page.goto("/anuncios?cidade=sao%20paulo&uf=SP");
  await expect(page).toHaveTitle("Quartos em São Paulo – SP | DOMUS X");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Quartos em São Paulo – SP");
  await expect(page.getByRole("combobox", { name: "Cidade" })).toHaveValue("São Paulo, SP");

  await page.goto("/anuncios?cidade=Ligue%2099999-0000&uf=SP");
  await expect(page).toHaveTitle("Anúncios | DOMUS X");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Anúncios");
  await expect(page.getByText("Não encontramos essa cidade. Mostrando todos os anúncios.")).toBeVisible();
  await expect(page.getByText("Ligue 99999-0000")).toHaveCount(0);
  await expect(page.getByText("Não foi possível carregar")).toHaveCount(0);
});

test.describe("filtro entrada", () => {
  let room: Awaited<ReturnType<typeof findSeedRoom>>;
  let owner: Awaited<ReturnType<typeof loginAsOwner>>;
  let roomId: string;
  let today: string;
  let cityQuery: string;
  let previous: AvailabilityBody;

  test.beforeAll(async () => {
    room = await findSeedRoom();
    owner = await loginAsOwner(room.ownerEmail);

    const api = await request.newContext({ baseURL: apiUrl });
    const { items } = (await (await api.get("/rooms?limit=1")).json()) as { items: { id: string; property: { city: string; state: string } }[] };
    await api.dispose();
    roomId = items[0].id;
    today = (await getPublicAvailability(roomId)).today;
    previous = await getOwnerAvailability(owner, roomId);
    cityQuery = new URLSearchParams({ cidade: items[0].property.city, uf: items[0].property.state }).toString();

    await replaceAvailability(owner, roomId, { blockedWeekdays: [], blockedDates: [addDays(today, 9)] });
  });

  test.afterAll(async () => {
    await replaceAvailability(owner, roomId, previous);
    await owner.dispose();
  });

  test("entrada na URL filtra quartos bloqueados naquela data", async ({ page }) => {
    const card = page.locator(`a[href="/imoveis/${room.propertyId}/quartos/${roomId}"]`);

    await page.goto(`/anuncios?${cityQuery}&entrada=${addDays(today, 8)}`);
    await expect(page.getByRole("heading", { name: "Todos os anúncios" })).toBeVisible();
    await expect(card.first()).toBeVisible();

    await page.goto(`/anuncios?${cityQuery}&entrada=${addDays(today, 9)}`);
    await expect(page.getByRole("heading", { name: "Todos os anúncios" })).toBeVisible();
    await expect(card).toHaveCount(0);
  });
});
