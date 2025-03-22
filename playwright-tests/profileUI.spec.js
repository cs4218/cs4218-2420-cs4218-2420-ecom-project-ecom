import { test, expect } from '@playwright/test';
test.describe('Profile UI testing', () => {

})
test('should have user details', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('cs4218@test.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('cs4218@test.com');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('button', { name: 'CS 4218 Test Account' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('CS 4218 Test Account');
  await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue('cs4218@test.com');
  await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeEmpty();
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('81234567');
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('1 Computing Drive');
});