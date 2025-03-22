import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard UI testing', () => {

    test('test', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@test.sg');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('admin@test.sg');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('button', { name: 'admin@test.sg' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await expect(page.getByText('Admin PanelCreate')).toBeVisible();
        await expect(page.getByText('Admin Name : admin@test.sg Admin Email : admin@test.sg Admin Contact : admin@')).toBeVisible();
    });
})