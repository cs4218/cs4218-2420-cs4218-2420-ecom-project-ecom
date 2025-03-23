import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('a@gmail.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('123456');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('button', { name: 'a', exact: true }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  
});


test('Render Dashboard and validate UserMenu and user details', async ({ page }) => {
  // Mock localStorage data before navigating to the dashboard
  await page.addInitScript(() => {
    const mockUser = {
      user: {
        name: "a",
        email: "a@gmail.com",
        address: "a",
      },
      token: "mock-jwt-token"
    };
    localStorage.setItem("auth", JSON.stringify(mockUser));
  });
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await expect(page.getByRole('heading', { name: 'a' }).nth(1)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'a@gmail.com' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'a' }).nth(3)).toBeVisible();
});
