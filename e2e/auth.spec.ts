import { expect, test } from '@playwright/test';

test('cadastra um hóspede e permite incluir o perfil de proprietário', async ({ page }) => {
  const email = `guest-${Date.now()}@example.com`;

  await page.goto('/cadastro');
  await page.getByLabel('Nome completo').fill('Hóspede Playwright');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('uma-senha-segura');
  await page.getByLabel('Quero começar como').selectOption('GUEST');
  await page.getByRole('button', { name: 'Criar conta' }).click();

  await expect(page).toHaveURL(/\/perfil$/);
  await expect(page.getByRole('heading', { name: 'Seu perfil' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dados pessoais' })).toBeVisible();
  await expect(page.getByText('Ativos: GUEST.')).toBeVisible();

  await page.getByRole('button', { name: 'Adicionar perfil de proprietário' }).click();
  await expect(page.getByText('Ativos: GUEST, OWNER.')).toBeVisible();
});
