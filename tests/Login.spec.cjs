const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
});

test('unsuccessful login for wrong password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('masteruitest@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('wrongpassword');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expect(page.getByText('Invalid Password')).toBeVisible();
});

test('unsuccessful login for non-existing email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('non-existing@email.com');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('randompassword');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expect(page.getByText('Something went wrong')).toBeVisible();
});

test('login form is visible', async ({ page }) => {
    await expect(page.getByRole('main')).toMatchAriaSnapshot(`
      - heading "LOGIN FORM" [level=4]
      - textbox "Enter Your Email"
      - textbox "Enter Your Password"
      - button "Forgot Password"
      - button "LOGIN"
      `);
});

test('should login successfully', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('permanentuser@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('permanentuserpassword');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await page.goto('http://localhost:3000/');
});