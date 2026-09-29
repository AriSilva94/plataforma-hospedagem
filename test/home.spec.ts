import { expect, test } from "@playwright/test";

test("visitante vê a apresentação pública sem aviso de idade", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Encontre o quarto livre");
  await expect(page.getByText("18 anos")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Criar conta" }).first()).toHaveAttribute("href", "/cadastro");
  await expect(page.getByRole("heading", { name: "Da busca à próxima diária" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Anuncie o imóvel. Alugue cada quarto do seu jeito." })).toBeVisible();
});

test("apresentação pública não gera rolagem horizontal no mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Entrar" }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
