import { expect, test, type Locator, type Page } from "@playwright/test";
import { loginAsOwner } from "./support/availability-api";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

const roomTitles = { first: "Suíte Azul", second: "Quarto Verde" };

function pngFile(name: string) {
  return { name, mimeType: "image/png", buffer: png };
}

function unsavedCards(page: Page) {
  return page.getByRole("listitem").filter({ has: page.getByText("Ainda não salvo", { exact: true }) });
}

function savedCards(page: Page) {
  return page.getByRole("listitem").filter({ has: page.getByText("Salvo", { exact: true }) });
}

async function fillRoom(card: Locator, title: string, withDoubleBed: boolean) {
  await card.getByLabel("Nome do quarto").fill(title);
  await card.getByLabel("Valor da diária (R$)").fill("150,00");
  await card.getByLabel("Privativo").check();
  await card.getByLabel("Mulher", { exact: true }).check();
  if (withDoubleBed) {
    await card.getByRole("button", { name: "Adicionar cama" }).click();
    await card.getByRole("button", { name: /Tipo da cama 1/ }).click();
    await card.getByRole("option", { name: "Casal" }).click();
  }
  await card.getByRole("button", { name: "Salvar quarto" }).click();
}

test.describe("fluxo unificado de cadastro do imóvel", () => {
  test.describe.configure({ mode: "serial" });

  let owner: Awaited<ReturnType<typeof loginAsOwner>>;
  let propertyId: string | undefined;

  test.beforeAll(async () => {
    owner = await loginAsOwner("proprietario-1@seed.local");
  });

  test.afterAll(async () => {
    if (propertyId) await owner.delete(`/owner/properties/${propertyId}`);
    await owner.dispose();
  });

  test.beforeEach(async ({ page }) => {
    await page.context().addCookies((await owner.storageState()).cookies);
  });

  function setupUrl(query: string) {
    return `/meus-imoveis/${propertyId}/configurar?${query}`;
  }

  test("cria imóvel com dois quartos", async ({ page }) => {
    await page.goto("/meus-imoveis/novo");
    await page.getByLabel("Título do anúncio").fill("Casa E2E fluxo unificado");
    await page.getByRole("button", { name: /Tipo do imóvel/ }).click();
    await page.getByRole("option", { name: "Casa" }).click();
    await page.getByLabel("Descrição do imóvel").fill("Casa de teste automatizado com dois quartos.");
    await page.getByLabel("CEP").fill("01310-100");
    await expect(page.getByLabel("Rua / avenida")).not.toHaveValue("");
    await page.getByLabel("Número", { exact: true }).fill("1000");
    await page.getByRole("spinbutton", { name: "Quartos" }).fill("2");
    await page.getByRole("button", { name: "Salvar e continuar" }).click();

    await expect(page).toHaveURL(/passo=fotos&quartos=2/);
    propertyId = /meus-imoveis\/([^/]+)\/configurar/.exec(page.url())?.[1];
    expect(propertyId).toBeTruthy();

    const gallery = page.getByRole("region", { name: "Fotos do imóvel" });
    await gallery.locator("input[type=file]").setInputFiles(pngFile("imovel.png"));
    await expect(gallery.getByText("1 arquivo enviado.")).toBeVisible();
    await page.getByRole("link", { name: "Continuar" }).click();

    await expect(page).toHaveURL(/passo=quartos&quartos=2/);
    await expect(unsavedCards(page)).toHaveCount(2);

    await fillRoom(unsavedCards(page).first(), roomTitles.first, true);
    await expect(page.getByRole("status").filter({ hasText: "quartos salvos" })).toHaveText("1 de 2 quartos salvos");
    await fillRoom(unsavedCards(page).first(), roomTitles.second, false);
    await expect(page.getByRole("status").filter({ hasText: "quartos salvos" })).toHaveText("2 de 2 quartos salvos");
    await expect(savedCards(page)).toHaveCount(2);

    await page.getByRole("button", { name: "Continuar para revisão" }).click();
    await expect(page).toHaveURL(/passo=revisao/);
    await expect(page.getByRole("heading", { name: "Quartos (2)" })).toBeVisible();
    await expect(page.getByText(roomTitles.first, { exact: true })).toBeVisible();
    await expect(page.getByText(roomTitles.second, { exact: true })).toBeVisible();
    await expect(page.getByText("1 casal")).toBeVisible();
  });

  test("retoma rascunho com quartos salvos e vazios", async ({ page }) => {
    await page.goto(setupUrl("passo=quartos&quartos=3"));
    await expect(savedCards(page)).toHaveCount(2);
    await expect(unsavedCards(page)).toHaveCount(1);

    await page.goto(setupUrl("passo=quartos"));
    await expect(savedCards(page)).toHaveCount(2);
    await expect(unsavedCards(page)).toHaveCount(0);
  });

  test("trata quantidade inválida na URL", async ({ page }) => {
    await page.goto(setupUrl("passo=quartos&quartos=abc"));
    await expect(savedCards(page)).toHaveCount(2);
    await expect(unsavedCards(page)).toHaveCount(0);

    await page.goto(setupUrl("passo=quartos&quartos=999"));
    await expect(savedCards(page)).toHaveCount(2);
    await expect(unsavedCards(page)).toHaveCount(18);
  });

  test("abre o passo Imóvel pelo link legado", async ({ page }) => {
    await page.goto(setupUrl("passo=basico"));
    await expect(page.getByRole("heading", { name: "Sobre o imóvel" })).toBeVisible();
    await expect(page.getByLabel("Título do anúncio")).toHaveValue("Casa E2E fluxo unificado");
  });

  test("remover quarto não troca a galeria do restante", async ({ page }) => {
    await page.goto(setupUrl("passo=quartos"));
    await savedCards(page).filter({ hasText: roomTitles.first }).getByRole("button", { name: "Remover", exact: true }).click();
    await page.getByRole("button", { name: "Excluir quarto" }).click();
    await expect(savedCards(page)).toHaveCount(1);

    const remaining = savedCards(page).filter({ hasText: roomTitles.second });
    await remaining.getByRole("button", { name: "Editar" }).click();
    const gallery = remaining.getByRole("region", { name: `Fotos de ${roomTitles.second}` });
    await gallery.locator("input[type=file]").setInputFiles(pngFile("quarto.png"));
    await expect(gallery.getByText("1 arquivo enviado.")).toBeVisible();

    const property = await (await owner.get(`/owner/properties/${propertyId}`)).json();
    expect(property.rooms).toHaveLength(1);
    const room = await (await owner.get(`/owner/rooms/${property.rooms[0].id}`)).json();
    expect(room.title).toBe(roomTitles.second);
    expect(room.media).toHaveLength(1);
  });

  test("para o lote ao receber 429", async ({ page }) => {
    const message = "Muitas requisições. Aguarde um minuto e tente novamente.";
    await page.route("**/owner/rooms/*/media", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        headers: { "access-control-allow-origin": route.request().headers().origin ?? "*", "access-control-allow-credentials": "true" },
        body: JSON.stringify({ message }),
      }),
    );
    await page.goto(setupUrl("passo=quartos"));
    const card = savedCards(page).filter({ hasText: roomTitles.second });
    await card.getByRole("button", { name: "Editar" }).click();
    const gallery = card.getByRole("region", { name: `Fotos de ${roomTitles.second}` });
    await gallery.locator("input[type=file]").setInputFiles([pngFile("a.png"), pngFile("b.png"), pngFile("c.png")]);

    await expect(gallery.getByText(`${message} 3 arquivo(s) não enviados.`)).toBeVisible();
    await expect(gallery.getByText("arquivo(s) não enviados.")).toHaveCount(1);
  });
});
