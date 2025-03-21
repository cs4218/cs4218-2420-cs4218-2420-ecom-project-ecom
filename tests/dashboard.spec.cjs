import { expect, test } from '@playwright/test';

const ORGINAL_PROFILE = {
  name: "CS 4218 Test Account",
  password: "cs4218@test.com",
  phone: "81234567",
  address: "1 Computing Drive",
}

const NEW_PROFILE = {
  name: "CS 4218 Test Accounts",
  password: "cs4218@test.coms",
  phone: "81234567s",
  address: "1 Computing Drives",
}

test.describe('User Update Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('#exampleInputEmail1', "cs4218@test.com");
    await page.fill('#exampleInputPassword1', "cs4218@test.com");
    await page.click('button:has-text("LOGIN")');
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
    await page.goto('http://localhost:3000/dashboard/user/profile');
  });

  test.afterEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/user/profile');
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(ORGINAL_PROFILE.name);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(ORGINAL_PROFILE.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(ORGINAL_PROFILE.phone);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(ORGINAL_PROFILE.address);
    await page.getByRole('button', { name: 'UPDATE' }).click();
    await expect(page.locator('div').filter({ hasText: /^Profile Updated Successfully$/ }).nth(2)).toBeVisible();
  });

  test('should update profile successfully', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill(NEW_PROFILE.name);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill(NEW_PROFILE.password);
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill(NEW_PROFILE.phone);
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill(NEW_PROFILE.address);
    await page.getByRole('button', { name: 'UPDATE' }).click();
    await expect(page.locator('div').filter({ hasText: /^Profile Updated Successfully$/ }).nth(2)).toBeVisible();
    await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.goto('http://localhost:3000/login');
    await page.fill('#exampleInputEmail1', "cs4218@test.com");
    await page.fill('#exampleInputPassword1', "cs4218@test.coms");
    await page.click('button:has-text("LOGIN")');
    await expect(page.getByText('Something went wrong')).not.toBeVisible(); 
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
    await page.goto('http://localhost:3000/dashboard/user/profile');
    await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(NEW_PROFILE.name);
    await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(NEW_PROFILE.phone);
    await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(NEW_PROFILE.address);

  });

  test('should reject if password not long enough', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('a');
    await page.getByRole('button', { name: 'UPDATE' }).click();
    await expect(page.getByText('Password is required and 6')).toBeVisible();
  });
});
