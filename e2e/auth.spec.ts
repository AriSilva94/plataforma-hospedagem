import { expect, test } from '@playwright/test';

test('solicita confirmação de maioridade antes de exibir a página inicial', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Você tem 18 anos ou mais?' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirmo — tenho 18 anos ou mais' }).click();

  await expect(page.getByRole('heading', { name: /Encontre o local ideal de forma rápida, segura e discreta/i })).toBeVisible();
  await expect(page.getByRole('navigation').getByText('Favoritos')).toBeVisible();
  await expect(page.getByText('Anunciar espaço')).toBeVisible();
  await expect(page.getByRole('button', { name: /Cidade Selecione a cidade/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Horário Qual horário/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Duração Por período/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Locais em destaque' })).toBeVisible();
});

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
