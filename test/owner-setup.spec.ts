import { expect, test, type Page } from "@playwright/test";
import { loginAsOwner } from "./support/availability-api";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

const roomTitles = { first: "Suíte Azul", second: "Quarto Verde" };

function pngFile(name: string) {
  return { name, mimeType: "image/png", buffer: png };
}

function continueButton(page: Page) {
  return page.getByRole("button", { name: "Continuar", exact: true });
}

async function upload(page: Page, region: string, ...names: string[]) {
  const gallery = page.getByRole("region", { name: region });
  await gallery.locator("input[type=file]").setInputFiles(names.map(pngFile));
  return gallery;
}

test.describe("cadastro guiado do imóvel", () => {
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
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.context().addCookies((await owner.storageState()).cookies);
  });

  function setupUrl(query: string) {
    return `/meus-imoveis/${propertyId}/configurar?${query}`;
  }

  async function propertyDetail() {
    return (await owner.get(`/owner/properties/${propertyId}`)).json();
  }

  test("cria imóvel com áreas, banheiros e dois quartos", async ({ page }) => {
    await page.goto("/meus-imoveis/novo");
    await page.getByRole("button", { name: "Começar" }).click();

    await page.getByRole("textbox", { name: "CEP" }).pressSequentially("01310100");
    await expect(page.getByRole("textbox", { name: "Número" })).toBeVisible();
    await page.getByRole("textbox", { name: "Número" }).fill("1000");
    await continueButton(page).click();

    await page.getByRole("radio", { name: "Casa" }).click();
    await page.getByRole("textbox", { name: "Nome do imóvel" }).fill("Casa E2E cadastro guiado");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/configurar\?passo=descricao/);
    propertyId = /meus-imoveis\/([^/]+)\/configurar/.exec(page.url())?.[1];
    expect(propertyId).toBeTruthy();

    await continueButton(page).click();
    await expect(page.getByRole("alert").filter({ hasText: "Descreva o imóvel para continuar." })).toBeVisible();
    await page.getByRole("textbox", { name: "Descrição do imóvel" }).fill("Casa de teste automatizado com dois quartos.");
    await continueButton(page).click();

    await expect(page.getByRole("button", { name: "Pular por enquanto" })).toBeVisible();
    const propertyGallery = await upload(page, "Fotos do imóvel", "imovel.png");
    await expect(propertyGallery.getByText("1 arquivo enviado.")).toBeVisible();
    await continueButton(page).click();

    await page.getByRole("checkbox", { name: "Piscina" }).click();
    await continueButton(page).click();

    const areaGallery = await upload(page, "Fotos da área Piscina", "piscina.png");
    await expect(areaGallery.getByText("Foto adicionada")).toBeVisible();
    await continueButton(page).click();

    await page.getByRole("button", { name: "Aumentar banheiros nas áreas comuns" }).click();
    await continueButton(page).click();

    await expect(page.getByRole("heading", { level: 1, name: "Adicione uma foto de cada banheiro." })).toBeVisible();
    const bathroomGallery = await upload(page, "Foto do banheiro 1", "banheiro.png");
    await expect(bathroomGallery.getByText("Foto adicionada")).toBeVisible();
    await continueButton(page).click();

    await page.getByRole("button", { name: "Aumentar quantidade de quartos" }).click();
    await page.getByRole("button", { name: "Cadastrar 2 quartos" }).click();

    await page.getByRole("textbox", { name: "Nome do quarto" }).fill(roomTitles.first);
    await continueButton(page).click();
    await continueButton(page).click();
    await expect(page.getByRole("alert").filter({ hasText: "Adicione pelo menos uma cama." })).toBeVisible();
    await page.getByRole("button", { name: "Aumentar camas casal" }).click();
    await expect(page.getByText("Pelas camas, até 2 hóspedes")).toBeVisible();
    await continueButton(page).click();
    await page.getByRole("radio", { name: /^Privativo/ }).click();
    await page.getByRole("checkbox", { name: "Mulher", exact: true }).click();
    await continueButton(page).click();
    await page.getByRole("checkbox", { name: "Cofre" }).click();
    await continueButton(page).click();
    await page.getByRole("textbox", { name: "Valor da diária em reais" }).fill("150,00");
    await page.getByRole("button", { name: "Salvar quarto" }).click();
    await page.getByRole("button", { name: "Pular por enquanto" }).click();

    await page.getByRole("textbox", { name: "Nome do quarto" }).fill(roomTitles.second);
    await page.getByRole("button", { name: `Copiar do ${roomTitles.first}` }).click();
    for (const heading of [/camas/, /banheiro próprio/, /Quem pode se hospedar/, /O que tem dentro/, /valor da diária/]) {
      await continueButton(page).click();
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
    await expect(page.getByRole("textbox", { name: "Valor da diária em reais" })).toHaveValue("150,00");
    await page.getByRole("button", { name: "Salvar quarto" }).click();
    const roomGallery = await upload(page, `Fotos do ${roomTitles.second}`, "quarto.png");
    await expect(roomGallery.getByText("1 arquivo enviado.")).toBeVisible();
    await page.getByRole("button", { name: "Revisar" }).click();

    await expect(page.getByRole("heading", { name: "Confira antes de publicar" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "2 quartos" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Publicar imóvel" })).toBeEnabled();

    const property = await propertyDetail();
    expect(property).toMatchObject({ sharedBathroomCount: 2, missingRequirements: [], sharedAreas: [{ type: "POOL" }] });
    expect(property.sharedAreas[0].media).toHaveLength(1);
    expect(property.sharedBathrooms).toHaveLength(2);
    expect(property.sharedBathrooms[0].media).toHaveLength(1);
    expect(property.sharedBathrooms[1].media).toHaveLength(0);
    expect(property.rooms).toHaveLength(2);
    const second = await (await owner.get(`/owner/rooms/${property.rooms[1].id}`)).json();
    expect(second).toMatchObject({
      title: roomTitles.second,
      capacity: 2,
      bathroomType: "PRIVATE",
      acceptedAudiences: ["WOMAN"],
      amenities: ["SAFE"],
      beds: [{ type: "DOUBLE", quantity: 1 }],
      priceCents: 15000,
    });
    expect(second.media).toHaveLength(1);
  });

  test("retoma rascunho pelo passo da URL e pelo primeiro pendente", async ({ page }) => {
    await page.goto(setupUrl("passo=quarto-2-diaria"));
    await expect(page.getByRole("heading", { name: `Qual o valor da diária do ${roomTitles.second}?` })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Valor da diária em reais" })).toHaveValue("150,00");

    await page.goto(setupUrl(""));
    await expect(page.getByRole("heading", { name: "Confira antes de publicar" })).toBeVisible();

    await page.goto(setupUrl("passo=basico"));
    await expect(page.getByRole("heading", { name: "Qual o CEP do imóvel?" })).toBeVisible();
  });

  test("editar pela revisão salva e volta à revisão", async ({ page }) => {
    await page.goto(setupUrl("passo=revisao"));
    await page.getByRole("button", { name: "Editar banheiros nas áreas comuns" }).click();
    await page.getByRole("button", { name: "Aumentar banheiros nas áreas comuns" }).click();
    await continueButton(page).click();
    await expect(page.getByRole("heading", { level: 1, name: "Adicione uma foto de cada banheiro." })).toBeVisible();
    await page.getByRole("button", { name: "Salvar e voltar à revisão" }).click();

    await expect(page.getByRole("heading", { name: "Confira antes de publicar" })).toBeVisible();
    const property = await propertyDetail();
    expect(property.sharedBathroomCount).toBe(3);
    expect(property.sharedBathrooms).toHaveLength(3);
  });

  test("diminuir a quantidade exclui o último quarto salvo após confirmação", async ({ page }) => {
    await page.goto(setupUrl("passo=quartos"));
    await page.getByRole("button", { name: "Diminuir quantidade de quartos" }).click();
    await page.getByRole("button", { name: "Excluir quarto" }).click();

    await expect(page.getByRole("button", { name: "Cadastrar 1 quarto" })).toBeVisible();
    const property = await propertyDetail();
    expect(property.rooms).toHaveLength(1);
    expect(property.rooms[0].title).toBe(roomTitles.first);
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
    await page.goto(setupUrl("passo=quarto-1-fotos"));
    const gallery = await upload(page, `Fotos do ${roomTitles.first}`, "a.png", "b.png", "c.png");

    await expect(gallery.getByText(`${message} 3 arquivo(s) não enviados.`)).toBeVisible();
    await expect(gallery.getByText("arquivo(s) não enviados.")).toHaveCount(1);
  });
});
