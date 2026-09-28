import { expect, test } from "@playwright/test";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

function trackPostRequests(page: import("@playwright/test").Page, endpoint: string) {
  let postCount = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url() === `${apiUrl}${endpoint}`) {
      postCount += 1;
    }
  });

  return async () => {
    await page.waitForTimeout(150);
    expect(postCount).toBe(0);
  };
}

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
    /(?:%2F|\/)rooms(?:%2F|\/)room3\.png/i,
  );
});

test("login mobile mantém o formulário na primeira tela", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");

  await expect(page.getByRole("button", { name: "Entrar" })).toBeInViewport();
  const cardBox = await page.locator(".auth-card").boundingBox();

  expect(cardBox).not.toBeNull();
  expect(cardBox!.y).toBeGreaterThan(100);
  expect(cardBox!.y + cardBox!.height).toBeLessThan(744);
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
  ).toBe(true);
});

test("login tablet mantém o formulário na primeira tela", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 844 });
  await page.goto("/login");

  await expect(page.getByRole("button", { name: "Entrar" })).toBeInViewport();
  const cardBox = await page.locator(".auth-card").boundingBox();

  expect(cardBox).not.toBeNull();
  expect(cardBox!.y).toBeGreaterThan(100);
  expect(cardBox!.y + cardBox!.height).toBeLessThan(744);
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
  ).toBe(true);
});

for (const viewport of [
  { width: 1440, height: 720 },
  { width: 1440, height: 844 },
  { width: 1024, height: 844 },
]) {
  test(`login cabe integralmente em ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/login");

    expect(
      await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
    ).toBe(true);
    await expect(page.getByText("Seus dados estão seguros com a gente")).toBeInViewport();
    await expect(page.getByText("© 2026 DOMUS X. Todos os direitos reservados.")).toBeInViewport();
  });
}

for (const viewport of [
  { width: 768, height: 700 },
  { width: 390, height: 667 },
]) {
  test(`login compacto cabe integralmente em ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/login");

    expect(
      await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight),
    ).toBe(true);
    await expect(page.getByRole("button", { name: "Entrar" })).toBeInViewport();
    await expect(page.getByText("Seus dados estão seguros com a gente")).toBeInViewport();
  });
}

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
  await page.getByLabel("Senha").fill("senha-segura1");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/perfil$/);
  expect(submittedBody).toEqual({
    name: "Ana Silva",
    email: "ana@example.com",
    password: "senha-segura1",
  });
});

test("login mostra erro de e-mail inválido ao sair do campo", async ({ page }) => {
  await page.goto("/login");

  const email = page.getByRole("textbox", { name: "E-mail" });
  await email.fill("email-invalido");
  await email.blur();

  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
  await expect(email).toHaveAttribute("aria-invalid", "true");
});

test("login não envia POST quando o e-mail é obrigatório", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Senha").fill("senha-valida");
  const expectNoPost = trackPostRequests(page, "/auth/login");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("O e-mail é obrigatório.")).toBeVisible();
  await expectNoPost();
});

test("recuperação mostra erro de e-mail inválido e não envia POST", async ({ page }) => {
  await page.goto("/recuperar-senha");
  const email = page.getByRole("textbox", { name: "E-mail" });
  await email.fill("email-invalido");
  await email.blur();

  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
  const expectNoPost = trackPostRequests(page, "/auth/forgot-password");
  await page.getByRole("button", { name: "Enviar instruções" }).click();
  await expectNoPost();
});

test("cadastro mostra nome curto inválido e não envia POST", async ({ page }) => {
  await page.goto("/cadastro");
  const name = page.getByRole("textbox", { name: "Nome completo" });
  await name.fill("A");
  await name.blur();

  await expect(page.getByText("O nome deve ter pelo menos 2 caracteres.")).toBeVisible();
  await page.getByRole("textbox", { name: "E-mail" }).fill("ana@example.com");
  await page.getByLabel("Senha").fill("senha-com-12-caracteres");
  const expectNoPost = trackPostRequests(page, "/auth/register");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expectNoPost();
});

test("cadastro mostra senha curta inválida e não envia POST", async ({ page }) => {
  await page.goto("/cadastro");
  await page.getByRole("textbox", { name: "Nome completo" }).fill("Ana Silva");
  await page.getByRole("textbox", { name: "E-mail" }).fill("ana@example.com");
  const password = page.getByLabel("Senha");
  await password.fill("curta");
  await password.blur();

  await expect(page.getByText("A senha deve ter pelo menos 12 caracteres.")).toBeVisible();
  const expectNoPost = trackPostRequests(page, "/auth/register");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expectNoPost();
});

test("redefinição rejeita token inválido e não envia POST", async ({ page }) => {
  await page.goto("/redefinir-senha?token=invalido");
  const token = page.getByRole("textbox", { name: "Token" });
  await token.focus();
  await token.blur();
  await expect(page.getByText("Token inválido.")).toBeVisible();

  await page.getByLabel("Nova senha").fill("senha-validade-12+");
  const expectNoPost = trackPostRequests(page, "/auth/reset-password");
  await page.getByRole("button", { name: "Redefinir senha" }).click();
  await expectNoPost();
});

test("redefinição rejeita senha curta e não envia POST", async ({ page }) => {
  await page.goto(`/redefinir-senha?token=${"t".repeat(32)}`);
  const password = page.getByLabel("Nova senha");
  await password.fill("curta");
  await password.blur();
  await expect(page.getByText("A senha deve ter pelo menos 12 caracteres.")).toBeVisible();

  const expectNoPost = trackPostRequests(page, "/auth/reset-password");
  await page.getByRole("button", { name: "Redefinir senha" }).click();
  await expectNoPost();
});
