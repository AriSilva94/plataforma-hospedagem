import { expect, test } from "@playwright/test";

test("visitante vê a home enxuta sem aviso de idade", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Encontre o quarto livre");
  await expect(page.getByText("18 anos")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Criar conta" }).first()).toHaveAttribute("href", "/cadastro");
  await expect(page.getByRole("button", { name: "Assistir ao vídeo de apresentação" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Anunciar espaço" })).toHaveAttribute("href", "/cadastro");
  await expect(page.getByRole("heading", { name: "Como funciona" })).toBeVisible();
});

test("busca da home sugere cidades e leva aos anúncios com cidade e UF", async ({ page }) => {
  const queries: string[] = [];
  await page.route("**/locations/cities?*", (route) => {
    queries.push(new URL(route.request().url()).searchParams.get("q") ?? "");
    return route.fulfill({ json: [{ city: "Curitiba", state: "PR" }, { city: "Curitibanos", state: "SC" }] });
  });
  await page.goto("/");

  const city = page.getByRole("combobox", { name: /^Para onde você vai\?/ });
  await city.fill("c");
  await expect(page.getByRole("listbox")).toBeHidden();
  await city.fill("curit");
  await expect(page.getByRole("option")).toHaveCount(2);
  expect(queries).toEqual(["curit"]);
  await city.press("ArrowDown");
  await city.press("Enter");
  await expect(city).toHaveValue("Curitibanos, SC");
  await expect(page.getByRole("listbox")).toBeHidden();

  await city.fill("curit");
  await page.getByRole("option", { name: /Curitiba\s*PR/ }).click();
  await expect(city).toHaveValue("Curitiba, PR");
  await page.getByRole("button", { name: "Ver quartos disponíveis" }).click();

  await expect(page).toHaveURL(/\/anuncios\?cidade=Curitiba&uf=PR$/);
});

test("busca da home exige cidade da lista", async ({ page }) => {
  await page.route("**/locations/cities?*", (route) => route.fulfill({ json: [{ city: "Curitiba", state: "PR" }] }));
  await page.goto("/");

  const city = page.getByRole("combobox", { name: /^Para onde você vai\?/ });
  await expect(city).toHaveAttribute("aria-required", "true");
  await city.fill("Curitiba");
  await city.press("Escape");
  await page.getByRole("button", { name: "Ver quartos disponíveis" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "Selecione uma cidade da lista." })).toBeVisible();
  await expect(city).toHaveAttribute("aria-invalid", "true");
  await expect(city).toBeFocused();
  await expect(page).toHaveURL(/\/$/);

  await city.fill("curi");
  await page.getByRole("option", { name: /Curitiba/ }).click();
  await expect(page.getByText("Selecione uma cidade da lista.")).toHaveCount(0);
});

test("busca da home avisa quando nenhuma cidade é encontrada", async ({ page }) => {
  await page.route("**/locations/cities?*", (route) => route.fulfill({ json: [] }));
  await page.goto("/");

  await page.getByRole("combobox", { name: /^Para onde você vai\?/ }).fill("xyzw");
  await expect(page.getByRole("status").filter({ hasText: "Nenhuma cidade encontrada." })).toBeVisible();
});

test("home do visitante cabe na tela sem rolagem no desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");

  expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
});

test("home não gera rolagem horizontal no mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Entrar" }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
