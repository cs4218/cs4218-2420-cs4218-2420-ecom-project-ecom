import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
});

test.describe('CartPage', () => {
    test('should add item to cart and redirect to login if user not logged in', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByTestId('product-67a21772a6d9e00ef2ac022a').getByRole('button', { name: 'ADD TO CART' }).click();
        await page.getByRole('link', { name: 'Cart' }).click();
        await page.getByText('NUS T-shirt', { exact: true }).click();
        await expect(page.getByText('NUS T-shirtPlain NUS T-shirt')).toBeVisible();
        await expect(page.getByText('You Have 1 items in your cart')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Total : $' })).toBeVisible();
        await page.getByRole('button', { name: 'Plase Login to checkout' }).click();
        await expect(page.getByText('LOGIN FORMForgot PasswordLOGIN')).toBeVisible();
      });
      test('should add multiple items to cart and make payment if user is logged in', async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).press('Enter');
        await page.getByRole('button', { name: 'LOGIN' }).click();
    
        await page.getByRole('link', { name: 'Home' }).click();
        await page.getByTestId('product-67a21772a6d9e00ef2ac022a').getByRole('button', { name: 'ADD TO CART' }).click();
        await page.getByTestId('product-67a2171ea6d9e00ef2ac0229').getByRole('button', { name: 'ADD TO CART' }).click();
        
        await page.getByRole('link', { name: 'Cart' }).click();
        await expect(page.getByText('NUS T-shirtPlain NUS T-shirt')).toBeVisible();
        await expect(page.getByText('The Law of Contract in SingaporeA bestselling book in SingaporPrice :')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Make Payment' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Update Address' })).toBeVisible();
        await page.locator('div').filter({ hasText: /^NUS T-shirtPlain NUS T-shirt for salePrice : 4\.99Remove$/ }).getByRole('button').click();
        await expect(page.getByText('You Have 1 items in your cart')).toBeVisible();
      });

      test('user should be able to update address from cart page if logged in', async ({ page }) => {
        await page.goto('http://localhost:3000/cart');
        await page.getByRole('link', { name: 'Login' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        await page.getByRole('link', { name: 'Cart' }).click();
        await page.getByRole('button', { name: 'Update Address' }).click();
        await expect(page.getByText('USER PROFILEUPDATE')).toBeVisible();
      });
});

