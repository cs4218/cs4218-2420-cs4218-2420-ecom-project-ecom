import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
});

test.describe('Admin Dashboard', () => {
    test('should allow access to admin dashboard and linked admin pages if user is admin', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('Daniel@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('Daniel');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await page.getByRole('button', { name: 'Daniel' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByText('Admin Name : Daniel Admin')).toBeVisible();
    await page.getByText('Admin PanelCreate').click();
    await expect(page.getByText('Create ProductSelect a')).toBeVisible();
    await page.getByRole('link', { name: 'Create Category' }).click();
    await expect(page.locator('div').filter({ hasText: 'Manage' }).nth(4)).toBeVisible();
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page.getByRole('heading', { name: 'All Products List' })).toBeVisible();
    await page.locator('div').filter({ hasText: /^Admin PanelCreate CategoryCreate ProductProductsOrders$/ }).first().click();
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page.getByRole('heading', { name: 'All Orders' })).toBeVisible();
    });

    test('should not be able to access admin dashboard if not admin user', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).dblclick();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).press('Enter');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await expect(page.locator('div').filter({ hasText: 'DashboardProfileOrdersCS 4218' }).nth(2)).toBeVisible();
      });
});