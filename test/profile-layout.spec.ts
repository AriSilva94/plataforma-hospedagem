import { createServer, type Server } from "node:http";
import { expect, test } from "@playwright/test";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";
let server: Server;
let submittedProfile: unknown;
let profileError = false;
let profileDelayMs = 0;
let user = {
  id: "user-1",
  name: "Ana Silva",
  email: "ana@example.com",
  roles: [] as string[],
};

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET, PATCH, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Content-Type", "application/json");

    if (request.method === "OPTIONS") {
      response.writeHead(204).end();
      return;
    }

    if (request.url === "/users/me" && request.method === "GET") {
      response.writeHead(200).end(JSON.stringify(user));
      return;
    }

    if (request.url === "/users/me" && request.method === "PATCH") {
      const chunks: Uint8Array[] = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString()) as {
        name: string;
        email: string;
      };
      submittedProfile = body;
      user = { ...user, name: body.name, email: body.email };
      response.writeHead(200).end(JSON.stringify(user));
      return;
    }

    if (request.url?.startsWith("/users/me/profiles/") && request.method === "POST") {
      if (profileDelayMs) await new Promise((resolve) => setTimeout(resolve, profileDelayMs));
      if (profileError) {
        response.writeHead(500).end(JSON.stringify({ message: "Falha ao adicionar perfil." }));
        return;
      }
      const role = request.url.endsWith("guest") ? "GUEST" : "OWNER";
      user = { ...user, roles: [...user.roles, role] };
      response.writeHead(201).end(JSON.stringify(user));
      return;
    }

    response.writeHead(404).end("{}");
  });
  await new Promise<void>((resolve) => server.listen(Number(new URL(apiUrl).port), resolve));
});

test.afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

test.beforeEach(async ({ context }) => {
  user = { id: "user-1", name: "Ana Silva", email: "ana@example.com", roles: [] };
  submittedProfile = undefined;
  profileError = false;
  profileDelayMs = 0;
  await context.addCookies([
    { name: "access_token", value: "test-session", url: "http://localhost:3001" },
  ]);
});

test("organiza os dados e distingue recursos futuros", async ({ page }) => {
  await page.goto("/perfil");

  await expect(page.getByRole("heading", { name: "Ana Silva", level: 1 })).toBeVisible();
  for (const heading of ["Dados pessoais", "Verificação", "Perfis de acesso", "Segurança", "Conta"]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Hóspede" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proprietário" })).toBeVisible();
  await expect(page.getByText("Telefone, data de nascimento, cidade e estado estarão disponíveis em breve.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Telefone/ })).toHaveCount(0);
  await expect(page.getByText("O e-mail está cadastrado, mas ainda não foi verificado.")).toBeVisible();
  await expect(page.getByText("Cadastrado, não verificado")).toBeVisible();
  await expect(page.getByRole("button", { name: /Alterar senha/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Desativar conta/ })).toBeDisabled();
});

test("destaca a ativação antes dos dados quando não há perfis", async ({ page }) => {
  await page.goto("/perfil");
  const access = page.getByRole("heading", { name: "Perfis de acesso" });
  await expect(page.getByText("Escolha como quer usar a plataforma")).toBeVisible();
  expect(await access.evaluate((element) => {
    const personalHeading = document.getElementById("personal-data-heading");
    return personalHeading !== null && Boolean(element.compareDocumentPosition(personalHeading) & Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
  await expect(page.getByRole("button", { name: "Salvar dados" })).toBeEnabled();
});

test("mantém os dados primeiro quando já existe um perfil", async ({ page }) => {
  user = { ...user, roles: ["GUEST"] };
  await page.goto("/perfil");
  await expect(page.getByText("Escolha como quer usar a plataforma")).toHaveCount(0);
  expect(await page.getByRole("heading", { name: "Dados pessoais" }).evaluate((element) => {
    const accessHeading = document.getElementById("access-heading");
    return accessHeading !== null && Boolean(element.compareDocumentPosition(accessHeading) & Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
});

test("salva os dados atuais e adiciona somente o perfil ausente", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByRole("textbox", { name: "Nome" }).fill("Ana Souza");
  await page.getByRole("button", { name: "Salvar dados" }).click();
  await expect(page.getByRole("heading", { name: "Ana Souza", level: 1 })).toBeVisible();
  await expect(page.getByText("Dados atualizados.")).toBeVisible();
  expect(submittedProfile).toEqual({ name: "Ana Souza", email: "ana@example.com" });

  await page.getByRole("button", { name: "Adicionar perfil de hóspede" }).click();
  await expect(page.getByText("Perfil ativo")).toHaveCount(1);
  await expect(page.getByText("Perfil de hóspede adicionado.")).toBeVisible();
  await expect(page.getByText("Dados atualizados.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Adicionar perfil de hóspede" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Adicionar perfil de proprietário" })).toBeVisible();

  await page.getByRole("textbox", { name: "Nome" }).fill("Ana Silva");
  await expect(page.getByText("Dados atualizados.")).toHaveCount(0);
  await expect(page.getByText("Perfil de hóspede adicionado.")).toBeVisible();
});

test("valida nome curto no formulário e não envia PATCH", async ({ page }) => {
  await page.goto("/perfil");
  const name = page.getByRole("textbox", { name: "Nome" });
  await name.fill(" A ");
  await page.getByRole("button", { name: "Salvar dados" }).click();

  await expect(page.getByText("O nome deve ter pelo menos 2 caracteres.")).toBeVisible();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  expect(submittedProfile).toBeUndefined();
});

test("valida e-mail inválido no formulário e não envia PATCH", async ({ page }) => {
  await page.goto("/perfil");
  const email = page.getByRole("textbox", { name: "E-mail" });
  await email.fill("invalido");
  await page.getByRole("button", { name: "Salvar dados" }).click();

  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  expect(submittedProfile).toBeUndefined();
});

test("normaliza nome e e-mail antes de enviar PATCH", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByRole("textbox", { name: "Nome" }).fill(" Ana Souza ");
  await page.getByRole("textbox", { name: "E-mail" }).fill(" ANA@EXAMPLE.COM ");
  await page.getByRole("button", { name: "Salvar dados" }).click();

  await expect(page.getByText("Dados atualizados.")).toBeVisible();
  expect(submittedProfile).toEqual({ name: "Ana Souza", email: "ana@example.com" });
});

test("mostra espera e falha do perfil no contexto da ação", async ({ page }) => {
  profileDelayMs = 200;
  profileError = true;
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Adicionar perfil de proprietário" }).click();
  await expect(page.getByRole("button", { name: "Adicionando perfil..." })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Salvar dados" })).toBeVisible();
  await expect(page.getByText("Falha ao adicionar perfil.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Adicionar perfil de proprietário" })).toBeEnabled();
  await expect(page.getByRole("heading", { name: "Dados pessoais" }).locator("..").getByRole("alert")).toHaveCount(0);
});

test("perfil na navegação inferior abre e fecha o menu ao clicar novamente", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/perfil");

  const profileButton = page.getByRole("navigation", { name: "Navegação inferior" }).getByRole("button", { name: "Perfil" });
  const profileMenu = page.locator("#mobile-profile-menu");

  await profileButton.click();
  await expect(profileMenu).toBeVisible();
  await expect(profileButton).toHaveAttribute("aria-expanded", "true");

  await profileButton.click();
  await expect(profileMenu).toHaveCount(0);
  await expect(profileButton).toHaveAttribute("aria-expanded", "false");
});
