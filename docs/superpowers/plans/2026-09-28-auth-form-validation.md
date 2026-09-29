# Auth Form Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validar localmente os formulários do fluxo de autenticação e apresentar erros de campo acessíveis, sem mudar o contrato com a API.

**Architecture:** Um módulo de schemas concentra as regras espelhadas dos DTOs de autenticação. `AuthForm` seleciona o schema pelo endpoint, usa `react-hook-form` com `zodResolver` e continua enviando o mesmo objeto normalizado para a API apenas depois da validação. O CSS existente recebe estados de erro e mensagens por campo.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, React Hook Form, Zod, @hookform/resolvers, Tailwind CSS 4, Playwright.

---

### Task 1: Instalar dependências e criar schemas de autenticação

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `lib/auth-form-schema.ts`

- [ ] **Step 1: Instalar as dependências de formulário**

Run:

```bash
npm install react-hook-form zod @hookform/resolvers
```

Expected: os três pacotes constam em `dependencies` e o lockfile é atualizado.

- [ ] **Step 2: Criar schemas e mensagens de validação**

```ts
import { z } from "zod";

const email = z.string().trim().min(1, "Informe seu e-mail.").email("Informe um e-mail válido.").transform((value) => value.toLowerCase());
const password = z.string().min(1, "Informe sua senha.").max(128, "A senha deve ter no máximo 128 caracteres.");

export const authFormSchemas = {
  "/auth/login": z.object({ email, password }),
  "/auth/register": z.object({
    name: z.string().trim().min(2, "Informe ao menos 2 caracteres.").max(120, "O nome deve ter no máximo 120 caracteres."),
    email,
    password: password.min(12, "A senha deve ter ao menos 12 caracteres."),
  }),
  "/auth/forgot-password": z.object({ email }),
  "/auth/reset-password": z.object({
    token: z.string().min(32, "O link de redefinição é inválido ou expirou."),
    password: password.min(12, "A senha deve ter ao menos 12 caracteres."),
  }),
} as const;
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json lib/auth-form-schema.ts
git commit -m "feat: add auth form validation schemas"
```

### Task 2: Cobrir a validação local com testes falhos

**Files:**
- Modify: `test/auth.spec.ts`

- [ ] **Step 1: Adicionar testes Playwright para os estados inválidos**

```ts
test("login informa e-mail inválido sem enviar para a API", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "E-mail" }).fill("domus");
  await page.getByRole("textbox", { name: "E-mail" }).blur();

  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "E-mail" })).toHaveAttribute("aria-invalid", "true");
});

test("cadastro informa senha curta antes do envio", async ({ page }) => {
  await page.goto("/cadastro");
  await page.getByLabel("Senha").fill("curta");
  await page.getByLabel("Senha").blur();

  await expect(page.getByText("A senha deve ter ao menos 12 caracteres.")).toBeVisible();
});
```

- [ ] **Step 2: Executar para confirmar falha**

Run:

```bash
npx playwright test test/auth.spec.ts
```

Expected: FAIL porque as mensagens e atributos por campo ainda não existem.

### Task 3: Integrar React Hook Form ao componente compartilhado

**Files:**
- Modify: `components/auth-form.tsx`

- [ ] **Step 1: Inicializar `useForm` com validação progressiva**

Usar o schema associado a `endpoint`, `zodResolver`, `mode: "onBlur"`, `reValidateMode: "onChange"` e `shouldFocusError: true`.

```ts
const form = useForm<AuthFormValues>({
  resolver: zodResolver(authFormSchemas[endpoint]),
  mode: "onBlur",
  reValidateMode: "onChange",
  shouldFocusError: true,
});
```

- [ ] **Step 2: Substituir o submit manual pelo `handleSubmit`**

Receber valores tipados, enviar `JSON.stringify(values)` para o mesmo `apiFetch(endpoint, ...)` e preservar `isPending`, `successPath`, `router.push`, `router.refresh`, mensagens de API e Google Auth.

- [ ] **Step 3: Registrar campos e expor a semântica de erro**

Para cada campo, aplicar `register(field.name)`, `aria-invalid`, `aria-describedby` e um `id` estável. Renderizar a mensagem associada após o input quando `formState.errors[field.name]` existir.

```tsx
<input
  {...register(field.name)}
  aria-describedby={fieldError ? `${field.name}-error` : undefined}
  aria-invalid={Boolean(fieldError)}
  className="auth-input"
/>
{fieldError ? <p className="auth-field-error" id={`${field.name}-error`} role="alert">{fieldError.message}</p> : null}
```

- [ ] **Step 4: Commit**

```bash
git add components/auth-form.tsx
git commit -m "feat: validate auth forms before submit"
```

### Task 4: Criar feedback visual de erro e concluir a verificação

**Files:**
- Modify: `app/globals.css`
- Modify: `test/auth.spec.ts`

- [ ] **Step 1: Estilizar os estados inválidos**

Adicionar `.auth-input-wrap:has(input[aria-invalid="true"])` com realce `--danger`, e `.auth-field-error` com cor legível, ícone já disponível em `react-icons/lu` e espaçamento compacto. Manter o foco azul para campos válidos e respeitar `prefers-reduced-motion`.

- [ ] **Step 2: Completar a matriz de testes**

Cobrir obrigatório no login, e-mail inválido em login/recuperação, nome curto e senha curta no cadastro, senha curta e token inválido na redefinição. Verificar que erro local não cria requisição `POST`.

- [ ] **Step 3: Executar verificações**

Run:

```bash
npm run typecheck
npx eslint components/auth-form.tsx lib/auth-form-schema.ts test/auth.spec.ts
npx playwright test test/auth.spec.ts
node C:\Users\ariov\.agents\skills\impeccable\scripts\detect.mjs --json app/globals.css components/auth-form.tsx
```

Expected: typecheck, lint dos arquivos alterados, testes relacionados e detector passam.

- [ ] **Step 4: Revisar e commit final**

Run:

```bash
rg -n "style=\{\{" app components lib test
git diff --check
```

Expected: sem estilos inline ou erros de whitespace.

```bash
git add app/globals.css test/auth.spec.ts
git commit -m "feat: show auth validation feedback"
```
