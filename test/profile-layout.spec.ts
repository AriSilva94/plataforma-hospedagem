import { createServer, type Server } from "node:http";
import { expect, test } from "@playwright/test";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";
let server: Server;
let submittedProfile: unknown;
let submittedIdentity: unknown;
let ownerRequests: { method: string; url: string; body: unknown }[] = [];
let verificationRequests = 0;
let profileError = false;
let profileDelayMs = 0;
let postalCodeDelayMs = 0;
const citiesByState: Record<string, string[]> = {
  PE: ["Olinda", "Recife"],
  SP: ["Campinas", "São Paulo", "São Pedro"],
};
const ownerProperty = {
  id: "p1",
  title: "Casa Central",
  type: "HOUSE",
  status: "DRAFT",
  description: null,
  houseRules: null,
  generalInfo: null,
  features: [],
  missingRequirements: ["DESCRIPTION", "ADDRESS", "PHOTO", "ROOM"],
  postalCode: null,
  street: null,
  number: null,
  complement: null,
  neighborhood: null,
  city: null,
  state: null,
  referencePoints: [],
  sharedAreas: [{ id: "a1", type: "LIVING_ROOM", label: null, description: null }],
  media: [],
  rooms: [],
};
const completePersonalData = { phone: "+5511912345678", birthDate: "1990-05-10", city: "Recife", state: "PE" };
const emptyPersonalData = { phone: null, birthDate: null, city: null, state: null };
const initialUser = {
  id: "user-1",
  name: "Ana Silva",
  email: "ana@example.com",
  emailVerifiedAt: null as string | null,
  phone: null as string | null,
  birthDate: null as string | null,
  city: null as string | null,
  state: null as string | null,
  roles: [] as string[],
};
let user = initialUser;

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Access-Control-Allow-Methods", "GET, PATCH, POST, PUT, OPTIONS");
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
        phone: string | null;
        birthDate: string | null;
        city: string | null;
        state: string | null;
      };
      submittedProfile = body;
      user = { ...user, ...body, phone: body.phone ? `+55${body.phone}` : null };
      response.writeHead(200).end(JSON.stringify(user));
      return;
    }

    if (request.url?.startsWith("/locations/states/") && request.method === "GET") {
      const state = request.url.split("/")[3];
      response.writeHead(200).end(JSON.stringify(citiesByState[state] ?? []));
      return;
    }

    if (request.url === "/auth/email-verification" && request.method === "POST") {
      verificationRequests += 1;
      response.writeHead(202).end("{}");
      return;
    }

    if (request.url?.startsWith("/admin/users") && request.method === "GET") {
      response.writeHead(200).end(JSON.stringify({ items: [], page: 1, limit: 20, total: 0 }));
      return;
    }

    if (request.url === "/owner/postal-codes/01310100" && request.method === "GET") {
      if (postalCodeDelayMs) await new Promise((resolve) => setTimeout(resolve, postalCodeDelayMs));
      response.writeHead(200).end(JSON.stringify({ street: "Avenida Paulista", neighborhood: "Bela Vista", city: "São Paulo", state: "SP" }));
      return;
    }

    if (request.url?.startsWith("/owner/postal-codes/") && request.method === "GET") {
      response.writeHead(404).end(JSON.stringify({ message: "CEP não encontrado." }));
      return;
    }

    if (request.url === "/owner/properties/p1" && request.method === "GET") {
      response.writeHead(200).end(JSON.stringify(ownerProperty));
      return;
    }

    if (request.url === "/owner/properties/p2" && request.method === "GET") {
      response.writeHead(200).end(JSON.stringify({ ...ownerProperty, id: "p2", postalCode: "30130000" }));
      return;
    }

    if (request.url?.startsWith("/owner/properties") && request.method !== "GET") {
      const chunks: Uint8Array[] = [];
      for await (const chunk of request) chunks.push(chunk);
      ownerRequests.push({ method: request.method ?? "", url: request.url, body: JSON.parse(Buffer.concat(chunks).toString()) });
      response.writeHead(200).end(JSON.stringify(ownerProperty));
      return;
    }

    if (request.url === "/users/me/profiles/guest" && request.method === "PATCH") {
      const chunks: Uint8Array[] = [];
      for await (const chunk of request) chunks.push(chunk);
      submittedIdentity = JSON.parse(Buffer.concat(chunks).toString());
      response.writeHead(200).end(JSON.stringify({ ...user, guestProfile: submittedIdentity }));
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
  user = initialUser;
  submittedProfile = undefined;
  submittedIdentity = undefined;
  ownerRequests = [];
  verificationRequests = 0;
  profileError = false;
  profileDelayMs = 0;
  postalCodeDelayMs = 0;
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
  await expect(page.getByRole("textbox", { name: "Telefone" })).toBeEditable();
  await expect(page.getByRole("textbox", { name: "Data de nascimento" })).toBeEditable();
  await expect(page.getByRole("button", { name: /^Estado/ })).toBeEnabled();
  await expect(page.getByRole("button", { name: /^Cidade/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /^Cidade/ })).toContainText("Selecione o estado primeiro");
  await expect(page.getByText("estarão disponíveis em breve")).toHaveCount(0);
  await expect(page.getByText("O e-mail está cadastrado, mas ainda não foi verificado.")).toBeVisible();
  await expect(page.getByText("Cadastrado, não verificado")).toBeVisible();
  await expect(page.getByRole("button", { name: /Alterar senha/ })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Desativar conta/ })).toBeDisabled();
});

test("envia o link de confirmação quando o e-mail não está verificado", async ({ page }) => {
  await page.goto("/perfil");

  await page.getByRole("button", { name: "Enviar link de confirmação" }).click();

  await expect(page.getByText("Enviamos um link de confirmação para ana@example.com. Ele vale por 24 horas.")).toBeVisible();
  expect(verificationRequests).toBe(1);
});

test("mostra o e-mail como verificado sem oferecer novo envio", async ({ page }) => {
  user = { ...user, emailVerifiedAt: "2026-10-08T00:00:00.000Z" };
  await page.goto("/perfil");

  await expect(page.getByText("Seu e-mail está verificado.")).toBeVisible();
  await expect(page.getByText("Verificado", { exact: true })).toBeVisible();
  await expect(page.getByText("Cadastrado, não verificado")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enviar link de confirmação" })).toHaveCount(0);
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
  expect(submittedProfile).toEqual({ name: "Ana Souza", ...emptyPersonalData });

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

test("salva telefone, nascimento, estado e cidade normalizados", async ({ page }) => {
  await page.goto("/perfil");
  const phone = page.getByRole("textbox", { name: "Telefone" });
  await phone.pressSequentially("11912345678");
  await expect(phone).toHaveValue("(11) 91234-5678");
  const birthDate = page.getByRole("textbox", { name: "Data de nascimento" });
  await birthDate.pressSequentially("10051990");
  await expect(birthDate).toHaveValue("10/05/1990");

  await page.getByRole("button", { name: /^Estado/ }).click();
  await page.getByRole("combobox", { name: "Buscar estado" }).fill("sao pau");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /^Estado/ })).toContainText("São Paulo");

  const city = page.getByRole("button", { name: /^Cidade/ });
  await expect(city).toBeEnabled();
  await city.click();
  await page.getByRole("combobox", { name: "Buscar cidade" }).fill("são p");
  await expect(page.getByRole("option")).toHaveCount(2);
  await page.getByRole("option", { name: "São Paulo" }).click();
  await expect(city).toContainText("São Paulo");
  await page.getByRole("button", { name: "Salvar dados" }).click();

  await expect(page.getByText("Dados atualizados.")).toBeVisible();
  expect(submittedProfile).toEqual({
    name: "Ana Silva",
    phone: "11912345678",
    birthDate: "1990-05-10",
    city: "São Paulo",
    state: "SP",
  });
  await expect(phone).toHaveValue("(11) 91234-5678");
});

test("escolhe a data de nascimento pelo calendário, do ano ao dia", async ({ page }) => {
  await page.goto("/perfil");
  const birthDate = page.getByRole("textbox", { name: "Data de nascimento" });
  const calendar = page.getByRole("dialog", { name: "Escolher data de nascimento" });

  await page.getByRole("button", { name: "Abrir calendário" }).click();
  await expect(calendar.getByText("Selecione o ano")).toBeVisible();
  await expect(calendar.getByRole("button", { name: String(new Date().getFullYear() - 17) })).toHaveCount(0);
  await calendar.getByRole("button", { name: "1990" }).click();
  await calendar.getByRole("button", { name: "mai" }).click();
  await calendar.getByRole("button", { name: "10 de maio de 1990" }).click();

  await expect(calendar).toBeHidden();
  await expect(birthDate).toHaveValue("10/05/1990");

  await page.getByRole("button", { name: "Abrir calendário" }).click();
  await expect(calendar.getByRole("button", { name: "10 de maio de 1990" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await expect(calendar.getByRole("button", { name: "18 de maio de 1990" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(calendar).toBeHidden();
  await expect(birthDate).toHaveValue("10/05/1990");
});

test("abre o calendário ao clicar no campo de data sem impedir a digitação", async ({ page }) => {
  await page.goto("/perfil");
  const birthDate = page.getByRole("textbox", { name: "Data de nascimento" });
  const calendar = page.getByRole("dialog", { name: "Escolher data de nascimento" });

  await birthDate.click();
  await expect(calendar).toBeVisible();
  await expect(birthDate).toBeFocused();
  await page.keyboard.type("10051990");
  await expect(birthDate).toHaveValue("10/05/1990");
  await expect(calendar).toBeVisible();
  await expect(calendar.getByRole("button", { name: "10 de maio de 1990" })).toHaveAttribute("aria-pressed", "true");

  await calendar.getByRole("button", { name: "1990", exact: true }).click();
  await calendar.getByRole("button", { name: "1985", exact: true }).click();
  await calendar.getByRole("button", { name: "mar" }).click();
  await calendar.getByRole("button", { name: "7 de março de 1985", exact: true }).click();
  await expect(calendar).toBeHidden();
  await expect(birthDate).toHaveValue("07/03/1985");
});

test("carrega os dados pessoais cadastrados e permite limpá-los", async ({ page }) => {
  user = { ...user, phone: "+551131234567", birthDate: "1990-05-10", city: "Recife", state: "PE" };
  await page.goto("/perfil");

  const phone = page.getByRole("textbox", { name: "Telefone" });
  const birthDate = page.getByRole("textbox", { name: "Data de nascimento" });
  const state = page.getByRole("button", { name: /^Estado/ });
  const city = page.getByRole("button", { name: /^Cidade/ });
  await expect(phone).toHaveValue("(11) 3123-4567");
  await expect(birthDate).toHaveValue("10/05/1990");
  await expect(state).toContainText("Pernambuco");
  await expect(city).toContainText("Recife");
  await expect(city).toBeEnabled();

  await phone.fill("");
  await birthDate.fill("");
  await state.click();
  await page.getByRole("button", { name: "Limpar seleção" }).click();
  await expect(city).toBeDisabled();
  await expect(city).toContainText("Selecione o estado primeiro");
  await page.getByRole("button", { name: "Salvar dados" }).click();

  await expect(page.getByText("Dados atualizados.")).toBeVisible();
  expect(submittedProfile).toEqual({ name: "Ana Silva", ...emptyPersonalData });
});

test("troca de estado limpa a cidade e carrega as cidades do novo estado", async ({ page }) => {
  user = { ...user, city: "Recife", state: "PE" };
  await page.goto("/perfil");
  const city = page.getByRole("button", { name: /^Cidade/ });
  await expect(city).toContainText("Recife");

  await page.getByRole("button", { name: /^Estado/ }).click();
  await page.getByRole("combobox", { name: "Buscar estado" }).fill("sp");
  await page.getByRole("option", { name: /São Paulo/ }).click();

  await expect(city).toContainText("Selecione a cidade");
  await city.click();
  await expect(page.getByRole("option")).toHaveText(["Campinas", "São Paulo", "São Pedro"]);
  await page.getByRole("combobox", { name: "Buscar cidade" }).fill("xyz");
  await expect(page.getByText("Nenhuma cidade encontrada.")).toBeVisible();
});

test("valida telefone, data incompleta e maioridade sem enviar PATCH", async ({ page }) => {
  await page.goto("/perfil");
  const phone = page.getByRole("textbox", { name: "Telefone" });
  const birthDate = page.getByRole("textbox", { name: "Data de nascimento" });
  await phone.fill("1191234");
  await birthDate.fill("3102");
  await page.getByRole("button", { name: "Salvar dados" }).click();

  await expect(page.getByText("Informe um telefone com DDD, como (11) 91234-5678.")).toBeVisible();
  await expect(page.getByText("Informe uma data de nascimento válida.")).toBeVisible();
  await expect(phone).toHaveAttribute("aria-invalid", "true");

  await birthDate.fill(`0101${new Date().getFullYear() - 17}`);
  await expect(page.getByText("É necessário ter pelo menos 18 anos.", { exact: true })).toBeVisible();
  expect(submittedProfile).toBeUndefined();
});

test("exige dados pessoais completos antes de cadastrar um imóvel", async ({ page }) => {
  user = { ...user, roles: ["OWNER"], phone: "+5511912345678", birthDate: "1990-05-10", city: "Recife" };
  await page.goto("/meus-imoveis/novo");

  await expect(page.getByRole("heading", { name: "Complete seus dados pessoais" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Completar dados pessoais" })).toHaveAttribute("href", "/perfil");

  user = { ...user, state: "PE" };
  await page.reload();

  await expect(page.getByRole("heading", { name: "Novo imóvel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Complete seus dados pessoais" })).toHaveCount(0);
});

test("salva o público do hóspede pelo seletor com busca", async ({ page }) => {
  user = { ...user, roles: ["GUEST"] };
  await page.goto("/perfil");
  const identity = page.getByRole("button", { name: /^Você se identifica como/ });

  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(page.getByText("Selecione uma opção.")).toBeVisible();
  expect(submittedIdentity).toBeUndefined();

  await identity.click();
  await page.getByRole("combobox", { name: "Buscar opção" }).fill("trans");
  await expect(page.getByRole("option")).toHaveText(["Mulher trans", "Homem trans"]);
  await page.getByRole("option", { name: "Mulher trans" }).click();
  await expect(identity).toContainText("Mulher trans");
  await page.getByRole("button", { name: "Salvar", exact: true }).click();

  await expect(page.getByText("Informação salva.")).toBeVisible();
  expect(submittedIdentity).toEqual({ genderIdentity: "TRANS_WOMAN" });
});

test("limpa a confirmação de dados salvos ao alterar um seletor", async ({ page }) => {
  user = { ...user, city: "Recife", state: "PE" };
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Salvar dados" }).click();
  await expect(page.getByText("Dados atualizados.")).toBeVisible();

  await page.getByRole("button", { name: /^Cidade/ }).click();
  await page.getByRole("option", { name: "Olinda" }).click();
  await expect(page.getByText("Dados atualizados.")).toHaveCount(0);
});

test("mostra o e-mail da conta sem permitir alteração", async ({ page }) => {
  await page.goto("/perfil");
  const email = page.getByRole("textbox", { name: "E-mail" });

  await expect(email).toHaveValue("ana@example.com");
  await expect(email).toBeDisabled();
  await expect(page.getByText("O e-mail identifica sua conta e não pode ser alterado.")).toBeVisible();
});

test("normaliza o nome antes de enviar PATCH sem incluir o e-mail", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByRole("textbox", { name: "Nome" }).fill(" Ana Souza ");
  await page.getByRole("button", { name: "Salvar dados" }).click();

  await expect(page.getByText("Dados atualizados.")).toBeVisible();
  expect(submittedProfile).toEqual({ name: "Ana Souza", ...emptyPersonalData });
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

test("filtra usuários da administração pelos seletores com busca", async ({ page }) => {
  user = { ...user, roles: ["ADMIN"] };
  await page.goto("/admin/usuarios");

  await page.getByRole("button", { name: /^Perfil/ }).click();
  await page.getByRole("combobox", { name: "Buscar em perfil" }).fill("prop");
  await page.getByRole("option", { name: "Proprietário" }).click();
  await page.getByRole("button", { name: "Filtrar" }).click();

  await expect(page).toHaveURL(/perfil=OWNER/);
  await expect(page).toHaveURL(/situacao=(&|$)/);
  await expect(page.getByRole("button", { name: /^Perfil/ })).toContainText("Proprietário");
  await expect(page.getByRole("button", { name: /^Situação/ })).toContainText("Todos");
});

test("cadastra imóvel escolhendo o tipo no seletor com busca", async ({ page }) => {
  user = { ...user, ...completePersonalData, roles: ["OWNER"] };
  await page.goto("/meus-imoveis/novo");
  await page.getByRole("textbox", { name: "Título do anúncio" }).fill("Casa Central");
  await page.getByRole("textbox", { name: /^Descrição do imóvel/ }).fill("Casa ampla perto do centro.");
  await page.getByRole("button", { name: /^Salvar/ }).click();
  await expect(page.getByText("Selecione o tipo do imóvel.")).toBeVisible();
  expect(ownerRequests).toEqual([]);

  await page.getByRole("button", { name: /^Tipo do imóvel/ }).click();
  await page.getByRole("option", { name: "Sobrado" }).click();
  await page.getByRole("button", { name: /^Salvar/ }).click();

  await expect.poll(() => ownerRequests.length).toBe(1);
  expect(ownerRequests[0]).toMatchObject({ method: "POST", url: "/owner/properties", body: { title: "Casa Central", type: "TOWNHOUSE" } });
});

test("salva a UF do imóvel pelo seletor com busca", async ({ page }) => {
  user = { ...user, ...completePersonalData, roles: ["OWNER"] };
  await page.goto("/meus-imoveis/p1/editar?secao=localizacao");

  await page.getByRole("button", { name: /^UF/ }).click();
  await page.getByRole("combobox", { name: "Buscar estado" }).fill("ba");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: /^UF/ })).toContainText("Bahia");
  await page.getByRole("button", { name: "Salvar localização" }).click();

  await expect(page.getByText("Localização salva.")).toBeVisible();
  expect(ownerRequests[0]).toMatchObject({ method: "PATCH", url: "/owner/properties/p1", body: { state: "BA" } });
});

test("altera o tipo de uma área compartilhada pelo seletor com busca", async ({ page }) => {
  user = { ...user, ...completePersonalData, roles: ["OWNER"] };
  await page.goto("/meus-imoveis/p1/editar?secao=areas");
  const area = page.getByRole("button", { name: /^Área Sala/ });

  await area.click();
  await page.getByRole("option", { name: "Cozinha" }).click();
  await expect(page.getByRole("button", { name: /^Área Cozinha/ })).toBeVisible();
  await page.getByRole("button", { name: "Salvar áreas" }).click();

  await expect(page.getByText("Áreas compartilhadas salvas.")).toBeVisible();
  expect(ownerRequests[0]).toMatchObject({ method: "PUT", body: { areas: [{ type: "KITCHEN" }] } });
});

test("formata o CEP e preenche o endereço do imóvel a partir dele", async ({ page }) => {
  user = { ...user, ...completePersonalData, roles: ["OWNER"] };
  await page.goto("/meus-imoveis/p1/editar?secao=localizacao");
  const postalCode = page.getByRole("textbox", { name: "CEP" });

  await postalCode.pressSequentially("01310100");

  await expect(postalCode).toHaveValue("01310-100");
  await expect(page.getByRole("textbox", { name: "Rua / avenida" })).toHaveValue("Avenida Paulista");
  await expect(page.getByRole("textbox", { name: "Bairro" })).toHaveValue("Bela Vista");
  await expect(page.getByRole("textbox", { name: "Cidade" })).toHaveValue("São Paulo");
  await expect(page.getByRole("button", { name: /^UF/ })).toContainText("São Paulo");
  await expect(page.getByRole("textbox", { name: "Número" })).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Número" })).toHaveValue("");

  await postalCode.fill("99999999");
  await expect(postalCode).toHaveValue("99999-999");
  await expect(page.getByText("CEP não encontrado.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Rua / avenida" })).toHaveValue("Avenida Paulista");
});

test("bloqueia o endereço e mostra carregamento no CEP durante a busca", async ({ page }) => {
  user = { ...user, ...completePersonalData, roles: ["OWNER"] };
  postalCodeDelayMs = 600;
  await page.goto("/meus-imoveis/p1/editar?secao=localizacao");
  const postalCode = page.getByRole("textbox", { name: "CEP" });
  const street = page.getByRole("textbox", { name: "Rua / avenida" });

  await postalCode.pressSequentially("01310100");

  await expect(page.getByRole("status").filter({ hasText: "Buscando endereço..." })).toBeAttached();
  await expect(postalCode).toBeEnabled();
  for (const name of ["Rua / avenida", "Número", "Bairro", "Cidade"]) {
    await expect(page.getByRole("textbox", { name })).toBeDisabled();
  }
  await expect(page.getByRole("button", { name: /^UF/ })).toBeDisabled();

  await expect(street).toHaveValue("Avenida Paulista");
  await expect(street).toBeEnabled();
  await expect(page.getByRole("status").filter({ hasText: "Buscando endereço..." })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Número" })).toBeFocused();
});

test("mostra com máscara o CEP já salvo do imóvel", async ({ page }) => {
  user = { ...user, ...completePersonalData, roles: ["OWNER"] };
  await page.goto("/meus-imoveis/p2/editar?secao=localizacao");

  await expect(page.getByRole("textbox", { name: "CEP" })).toHaveValue("30130-000");
});
