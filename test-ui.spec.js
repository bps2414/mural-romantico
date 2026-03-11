const { test, expect } = require('@playwright/test');

test('mural-romantico login flow on mobile', async ({ page }) => {
  // Configura a viewport para um iPhone pra ver o layout responsivo
  await page.setViewportSize({ width: 390, height: 844 });
  
  // Tenta acessar a Home, deve redirecionar pra /login
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveURL(/.*\/login/);

  // Vê se os textos básicos estão lá
  await expect(page.getByText('Acesso Restrito')).toBeVisible();
  await expect(page.getByText('Qual é a nossa senha secreta?')).toBeVisible();

  // Tenta logar errado
  await page.getByPlaceholder('Digite o segredo...').fill('senha-errada');
  await page.getByRole('button', { name: 'Entrar no Cantinho' }).click();
  
  // Confirma erro
  await expect(page.getByText('Ops... senha incorreta.')).toBeVisible();

  // Tenta logar certo
  await page.getByPlaceholder('Digite o segredo...').fill('123'); // the fallback from code
  await page.getByRole('button', { name: 'Entrar no Cantinho' }).click();

  // Deve ir pra Home
  await expect(page).toHaveURL('http://localhost:3000/');
  await expect(page.getByText('Nosso Mural')).toBeVisible();

  // Tira uma print pra ver se tá bonitinho como eu quero
  await page.screenshot({ path: 'test-results/mobile-feed.png' });
});
