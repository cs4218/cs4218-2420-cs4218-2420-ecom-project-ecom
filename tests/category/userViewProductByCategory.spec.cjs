import { expect, test } from '@playwright/test';

const TEST_CATEGORY = "Electronics";

let category;

test("Any user can view products in a category", async ({ page }) => {
  await test.step("User navigates to all categories from header", async () => {
    await page.goto('http://localhost:3000/')
    await page.getByRole("link", { name: "CATEGORIES" }).click()
    await page.getByRole("link", { name: "ALL CATEGORIES" }).click()

    await expect(page).toHaveURL('http://localhost:3000/categories')
  })

  await test.step("User can view existing categories", async () => {
    await page.waitForTimeout(1000);
    category = page.getByRole("link", { name: TEST_CATEGORY })

    await expect(category).toBeVisible();
  })

  await test.step("User can navigate to product category", async () => {
    await category.click()
    await page.waitForTimeout(1000)

    await expect(page).toHaveURL(`http://localhost:3000/category/${TEST_CATEGORY.toLowerCase()}`)
    await page.waitForSelector(".card-title");
    await expect(page.getByRole("heading", {name: "Laptop" })).toBeVisible();
  })
})