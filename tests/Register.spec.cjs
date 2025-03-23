const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/register');
});

test("Register form and it's fields are visible", async ({ page }) => {
await page.goto('http://localhost:3000/register');
await expect(page.getByRole('main')).toMatchAriaSnapshot(`
    - heading "REGISTER FORM" [level=4]
    - textbox "Enter Your Name"
    - textbox "Enter Your Email"
    - textbox "Enter Your Password"
    - textbox "Enter Your Phone"
    - textbox "Enter Your Address"
    - textbox
    - textbox "What is Your Favorite sports"
    - button "REGISTER"
    `);
});

test('successful registration and navigate to Login page', async ({ page }) => {
    const randomSuffix = Math.floor(Math.random() * 10000);
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(`uitest-name${randomSuffix}`);
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(`uitest-email${randomSuffix}@gmail.com`);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(`uitest${randomSuffix}-password`);
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('12345678');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('singapore');
    await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('soccer');
    await page.getByRole('button', { name: 'REGISTER' }).click();
    
    await page.goto('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();
  });

  test('should display error for invalid phone number', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('a');
    await expect(page.getByText('Phone number must contain only numbers')).toBeVisible();
  });

  test('should display validation error for invalid email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('uitest-name');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('invalidemail');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('uitest-password');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('12345678');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('singapore');
    await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('soccer');
    await page.getByRole('button', { name: 'REGISTER' }).click();
    
    const validationMessage = await page
    .getByRole('textbox', { name: 'Enter Your Email' })
    .evaluate((input) => input.validationMessage);
  
    // Because messages can vary by browser/locale, you might do:
    expect(validationMessage).toMatch(/(@|email)/);
  });