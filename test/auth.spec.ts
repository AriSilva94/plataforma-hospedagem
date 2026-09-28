import { expect, test } from "@playwright/test";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

test("cadastro não solicita perfil inicial e oferece Google Auth", async ({ page }) => {
  await page.goto("/cadastro");

  await expect(page.getByText("Quero começar como")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Continuar com Google" })).toHaveAttribute(
    "href",
    `${apiUrl}/auth/google`,
  );
});

test("login exibe a cena visual com a imagem room3", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByTestId("auth-room-image")).toHaveAttribute(
    "src",
    /\/rooms\/room3\.png/,
  );
});

test("login mobile mantém o formulário na primeira tela", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");

  await expect(page.getByRole("button", { name: "Entrar" })).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
  ).toBe(true);
});

for (const path of [
  "/login",
  "/cadastro",
  "/recuperar-senha",
  "/redefinir-senha?token=token-de-teste",
]) {
  test(`${path} oferece acesso Google e mensagem de segurança`, async ({ page }) => {
    await page.goto(path);

    await expect(
      page.getByRole("link", { name: "Continuar com Google" }),
    ).toHaveAttribute("href", `${apiUrl}/auth/google`);
    await expect(
      page.getByText("Seus dados estão seguros com a gente"),
    ).toBeVisible();
    await expect(page.getByTestId("auth-reassurance-icon")).toBeVisible();
  });
}

test("cadastro envia dados sem perfil e abre a página de perfil", async ({ page }) => {
  let submittedBody: unknown;
  await page.route(`${apiUrl}/auth/register`, async (route) => {
    submittedBody = route.request().postDataJSON();
    await route.fulfill({ status: 201, body: JSON.stringify({}) });
  });

  await page.goto("/cadastro");
  await page.getByRole("textbox", { name: "Nome completo" }).fill("Ana Silva");
  await page.getByRole("textbox", { name: "E-mail" }).fill("ana@example.com");
  await page.getByLabel("Senha").fill("senha-segura");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/perfil$/);
  expect(submittedBody).toEqual({
    name: "Ana Silva",
    email: "ana@example.com",
    password: "senha-segura",
  });
});
