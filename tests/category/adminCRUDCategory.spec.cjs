import { expect, test } from '@playwright/test';

const NEW_CATEGORY_NAME = `TestCategory-${Math.random().toString(36).substring(2, 8)}`;
const UPDATED_CATEGORY_NAME = `Updated-${NEW_CATEGORY_NAME}`

const AUTH_URL = "http://localhost:3000/login"
const ADMIN_USER = {
  email: 'admin@test.sg',
  password: 'admin@test.sg', 
}

const login = async (page) => {
  await page.goto(AUTH_URL);
  await page.fill('#exampleInputEmail1', ADMIN_USER.email);
  await page.fill('#exampleInputPassword1', ADMIN_USER.password);
  await page.click('button:has-text("LOGIN")');
  await page.waitForFunction(() => localStorage.getItem("auth") !== null);
}

const searchTable = async (page, category) => {
  const row = page.locator(`table tr:has-text("${category}")`, {exact: true});
  await row.waitFor({ state: "visible", timeout: 5000 });
  return row;
};

test.describe.serial('Admin Category Management', () => {
  let lastFailedApiCall;

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('http://localhost:3000/dashboard/admin/create-category');

    page.on("response", (response) => {
      if (!response.ok()) lastFailedApiCall = response;
    });
  });

  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === "failed") {
      console.log(
        "Last failed API call:",
        lastFailedApiCall.status(),
        lastFailedApiCall.url(),
        await lastFailedApiCall.text()
      );
    } 
  });

  test('Admin can create a category', async ({ page }) => {
    await page.getByPlaceholder("Enter new category").fill(NEW_CATEGORY_NAME);
    await page.click('button:has-text("SUBMIT")');
    await page.waitForTimeout(1000);

    await expect(page.getByPlaceholder("Enter new category")).toHaveText("");
    const newCategory = await searchTable(page, NEW_CATEGORY_NAME);
    expect(newCategory).toBeVisible();
  });

  test('Admin can update a category', async ({ page }) => {
    page.on('dialog', async dialog => {
      console.log(dialog.message());
      await dialog.dismiss();
    });
    const createdCategory = await searchTable(page, NEW_CATEGORY_NAME);
    await createdCategory.locator('button:has-text("Edit")').click();

    const modal = page.locator('.ant-modal');
    expect(modal).toBeVisible();

    await modal.locator('input[type="text"]').fill(UPDATED_CATEGORY_NAME);
    await modal.locator('button:has-text("Submit")').click();
    await page.waitForTimeout(1000);

    const updatedCategory = await searchTable(page, UPDATED_CATEGORY_NAME);
    expect(updatedCategory).toBeVisible();
  });

  test('Admin can delete a category', async ({ page }) => {
    const createdCategory = await searchTable(page, UPDATED_CATEGORY_NAME);
    await createdCategory.locator('button:has-text("Delete")').click();
    await page.waitForTimeout(1000);

    await expect(page.locator(`table tr:has-text("${UPDATED_CATEGORY_NAME}")`)).not.toBeVisible();
  });
});