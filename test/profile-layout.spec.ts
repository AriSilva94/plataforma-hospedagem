import { createServer, type Server } from "node:http";
import { expect, test } from "@playwright/test";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";
let server: Server;
let submittedProfile: unknown;
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
  await expect(page.getByRole("textbox", { name: /Telefone/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Alterar senha/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Desativar conta/ })).toBeDisabled();
});

test("salva os dados atuais e adiciona somente o perfil ausente", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByRole("textbox", { name: "Nome" }).fill("Ana Souza");
  await page.getByRole("button", { name: "Salvar dados" }).click();
  await expect(page.getByRole("heading", { name: "Ana Souza", level: 1 })).toBeVisible();
  expect(submittedProfile).toEqual({ name: "Ana Souza", email: "ana@example.com" });

  await page.getByRole("button", { name: "Adicionar perfil de hóspede" }).click();
  await expect(page.getByText("Perfil ativo")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Adicionar perfil de hóspede" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Adicionar perfil de proprietário" })).toBeVisible();
});
