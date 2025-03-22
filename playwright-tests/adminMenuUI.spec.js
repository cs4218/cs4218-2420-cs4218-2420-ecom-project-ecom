import { test, expect } from '@playwright/test';
test.describe('adminMenu UI testing', () => {
    test('should be able to use admin menu', async ({ page }) => {
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

        // Test create category
        await page.getByRole('link', { name: 'Create Category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('textbox', { name: 'Enter new category' }).fill('Test category');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('cell', { name: 'Test category' })).toBeVisible();

        // Test edit category
        await page.getByRole('button', { name: 'Edit' }).nth(3).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).click();
        await page.getByRole('dialog').getByRole('textbox', { name: 'Enter new category' }).fill('Test category2');
        await page.getByRole('dialog').getByRole('button', { name: 'Submit' }).click();
        await expect(page.locator('tbody')).toContainText('Test category2');

        // Test delete category
        await page.getByRole('button', { name: 'Delete' }).nth(3).click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.reload();
        await expect(page.getByRole('cell', { name: 'Test category2' })).not.toBeVisible();

        // Test create product
        await page.getByRole('link', { name: 'Create Product' }).click();
        await page.locator('#rc_select_0').click();
        await page.getByTitle('Electronics').locator('div').click();
        await page.getByRole('textbox', { name: 'write a name' }).click();
        await page.getByRole('textbox', { name: 'write a name' }).fill('Gameboy');
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('Gameboy');
        await page.getByPlaceholder('write a Price').click();
        await page.getByPlaceholder('write a Price').fill('10.00');
        await page.getByPlaceholder('write a quantity').click();
        await page.getByPlaceholder('write a quantity').fill('1');
        await page.locator('#rc_select_1').click();
        await page.getByText('Yes').click();
        await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
        await page.getByRole('link', { name: 'Create Product' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByRole('main')).toContainText('Gameboy');
        

        // Test edit product
        await page.getByRole('link', { name: 'Gameboy Gameboy Gameboy' }).click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.getByRole('textbox', { name: 'write a description' }).click();
        await page.getByRole('textbox', { name: 'write a description' }).fill('Gameboy updated description');
        // await page.locator('div').filter({ hasText: /^UPDATE PRODUCT$/ }).click();
        await page.getByRole('button', { name: 'UPDATE PRODUCT' }).click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.getByRole('link', { name: 'Create Product' }).click();
        await page.getByRole('link', { name: 'Products' }).click();
        await expect(page.getByRole('link', { name: 'Gameboy Gameboy Gameboy' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Gameboy Gameboy Gameboy' })).toContainText('Gameboy updated description');
        await page.getByRole('link', { name: 'Gameboy Gameboy Gameboy' }).click();
        page.on('dialog', async dialog => {
          await dialog.accept('yes');
        });

        // Test delete product
        await page.waitForTimeout(2000);
        await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();
        await page.waitForTimeout(2000);
        await page.goto('http://localhost:3000/dashboard/admin/products');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('link', { name: 'Gameboy Gameboy Gameboy' })).not.toBeVisible();

        // Test view orders
        await page.getByRole('link', { name: 'Orders' }).click();
        await expect(page.getByText('NUS T-shirt', { exact: true })).toBeVisible();
        await page.getByText('Laptop').first().click();
        await expect(page.getByText('Laptop').nth(2)).toBeVisible();
        await expect(page.getByText('Not Process')).toBeVisible();
        await expect(page.getByRole('cell', { name: 'CS 4218 Test Account' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'a few seconds ago' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Failed' })).toBeVisible();
        await expect(page.getByRole('cell', { name: '3' })).toBeVisible();

        // Test view users
        await page.getByRole('link', { name: 'Users' }).click();
        await expect(page.getByRole('cell', { name: 'Daniel', exact: true })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'Daniel@gmail.com' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'admin@test.sg' }).first()).toBeVisible();
        await expect(page.getByRole('cell', { name: 'admin@test.sg' }).nth(1)).toBeVisible();
        await expect(page.getByRole('cell', { name: 'CS 4218 Test Account' })).toBeVisible();
        await expect(page.getByRole('cell', { name: 'cs4218@test.com' })).toBeVisible();
    });

})