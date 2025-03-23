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
  await page.getByRole('link', { name: 'Orders' }).click();
});


test('Navigate to Orders tab and render orders list', async ({ page }) => {

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

  await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();
  await expect(page.getByRole('cell', { name: '1' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Not Process' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'a', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'a few seconds ago' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Failed' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: '1' }).nth(1)).toBeVisible();
  await expect(page.getByRole('cell', { name: '2' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Not Process' }).nth(1)).toBeVisible();
  await expect(page.getByRole('cell', { name: 'a', exact: true }).nth(1)).toBeVisible();
  await expect(page.getByRole('cell', { name: 'a few seconds ago' }).nth(1)).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Failed' }).nth(1)).toBeVisible();
  await expect(page.getByRole('cell', { name: '1' }).nth(2)).toBeVisible();
  await expect(page.getByRole('img', { name: 'Smartphone' })).toBeVisible();
  await expect(page.getByText('Smartphone', { exact: true })).toBeVisible();
  await expect(page.getByText('A high-end smartphone')).toBeVisible();
  await expect(page.getByText('Price : 999.99')).toBeVisible();
  await expect(page.getByRole('img', { name: 'Novel' })).toBeVisible();
  await expect(page.getByText('Novel', { exact: true })).toBeVisible();
  await expect(page.getByText('A bestselling novel')).toBeVisible();
  await expect(page.getByText('Price : 14.99')).toBeVisible();
});
