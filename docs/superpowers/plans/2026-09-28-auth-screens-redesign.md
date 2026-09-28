# Auth Screens Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar todas as telas de autenticação com a direção DOMUS X premium aprovada, sem modificar seus contratos funcionais.

**Architecture:** `AuthForm` continuará como a única superfície compartilhada dos quatro fluxos e receberá a composição, sem alterar suas props ou submissão. `globals.css` hospedará as regras visuais reutilizáveis que exigem pseudo-elementos, keyframes e o fallback de movimento reduzido; os utilitários Tailwind ficam no markup estrutural.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Icons, Playwright.

---

### Task 1: Cobrir a estrutura e a acessibilidade do redesign

**Files:**
- Modify: `test/auth.spec.ts`

- [ ] **Step 1: Escrever os testes Playwright inicialmente falhos**

```ts
for (const path of ["/login", "/cadastro", "/recuperar-senha", "/redefinir-senha?token=token-de-teste"]) {
  test(`${path} oferece acesso Google e mensagem de segurança`, async ({ page }) => {
    await page.goto(path);

    await expect(page.getByRole("link", { name: "Continuar com Google" })).toHaveAttribute(
      "href",
      `${apiUrl}/auth/google`,
    );
    await expect(page.getByText("Seus dados estão seguros com a gente")).toBeVisible();
  });
}
```

- [ ] **Step 2: Executar o teste para confirmar a falha**

Run: `npx playwright test test/auth.spec.ts`

Expected: FAIL porque a mensagem de segurança ainda não existe.

- [ ] **Step 3: Manter os testes de contrato existentes**

Preservar as verificações de `href` do Google Auth e do payload/redirecionamento de cadastro; remover somente a duplicação que o loop acima absorver.

- [ ] **Step 4: Reexecutar para confirmar que ainda falha pela UI ausente**

Run: `npx playwright test test/auth.spec.ts`

Expected: FAIL pela ausência da mensagem, sem falha de configuração ou API.

### Task 2: Implementar a composição compartilhada premium

**Files:**
- Modify: `components/auth-form.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Reestruturar o shell de `AuthForm` sem tocar em `handleSubmit`**

Criar duas regiões semânticas dentro de `main`: uma cena decorativa `aria-hidden` com `BrandMark`, mensagem de acolhimento e camadas arquitetônicas; e uma região de formulário com o conteúdo existente. Manter `name`, `type`, `autoComplete`, `defaultValue`, `required`, `endpoint`, `successPath`, `FormFeedback` e o `nav` inalterados.

- [ ] **Step 2: Aplicar o provedor Google aprovado**

Usar o `FcGoogle` de `react-icons/fc` dentro do link existente, com `aria-label="Continuar com Google"`, após o divisor `ou continue com`. O link mantém exatamente:

```tsx
href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030"}/auth/google`}
```

- [ ] **Step 3: Criar a ação primária e a mensagem de confiança**

Manter o `button` `type="submit"` e `disabled={isPending}`. Acrescentar uma seta decorativa `aria-hidden` e a mensagem estática `Seus dados estão seguros com a gente` após os links, sem transformar esses elementos em novas ações.

- [ ] **Step 4: Definir apenas os estilos necessários em `globals.css`**

Adicionar classes `auth-shell`, `auth-scene`, `auth-architectural-light`, `auth-card`, `auth-submit`, `auth-provider`, `auth-divider` e `auth-reassurance`. Usar os tokens existentes e um brilho lilás discreto com `--info`; remover a dependência visual de bordas repetidas. Incluir `@keyframes auth-shimmer` e `@media (prefers-reduced-motion: reduce)` para desativar transições e a animação decorativa.

- [ ] **Step 5: Manter o comportamento mobile e desktop**

Configurar duas colunas em telas grandes; em `lg` ou abaixo, reduzir a cena para faixa superior e manter o cartão/formulário com largura útil. Não ocultar campos, mensagens, Google Auth ou links em nenhum breakpoint.

- [ ] **Step 6: Executar o teste da Task 1 para confirmar sucesso**

Run: `npx playwright test test/auth.spec.ts`

Expected: PASS em todos os testes de autenticação.

- [ ] **Step 7: Commit**

```bash
git add components/auth-form.tsx app/globals.css test/auth.spec.ts
git commit -m "feat: redesign auth screens"
```

### Task 3: Verificação final do frontend

**Files:**
- Verify: `components/auth-form.tsx`
- Verify: `app/globals.css`
- Verify: `test/auth.spec.ts`

- [ ] **Step 1: Executar lint**

Run: `npm run lint`

Expected: exit code 0.

- [ ] **Step 2: Executar typecheck**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 3: Executar testes relacionados**

Run: `npx playwright test test/auth.spec.ts`

Expected: todos os testes passam.

- [ ] **Step 4: Revisar escopo mecanicamente**

Run: `rg -n 'style=\{\{' components/auth-form.tsx app/globals.css; git diff release/separate-steps -- components/auth-form.tsx app/globals.css test/auth.spec.ts`

Expected: nenhuma ocorrência de estilo inline e apenas alterações do redesign.
