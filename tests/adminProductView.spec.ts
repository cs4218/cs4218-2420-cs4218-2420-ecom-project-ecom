import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
});

test.describe('Admin Product View', () => {
    test('Admin should be able to create product and view on product view page', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('Daniel@gmail.com');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('Daniel');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Create Product' }).click();
        await page.getByTitle('Electronics').locator('div').click();
        await page.getByText('Upload Photo').click();
        await page.locator('body').setInputFiles('Shop.ico');
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('test product');
        await page.getByRole('textbox', { name: 'write a name' }).press('Tab');
        await page.getByRole('textbox', { name: 'write a description' }).fill('test');
        await page.getByRole('textbox', { name: 'write a description' }).press('Tab');
        await page.getByPlaceholder('write a Price').fill('1');
        await page.getByPlaceholder('write a Price').press('Tab');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('1');
        await page.locator('#rc_select_1').click();
        await page.getByText('No').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await expect(page.getByRole('link', { name: 'test product test product test' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'All Products List' })).toBeVisible();
    });
});