import { test, expect } from '@playwright/test';

// navigate to the categories page first 
test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/categories');
});

test.describe("Categories page", () => {

    test("should display all categories from backend", async ({ page }) => {

        await expect(page.getByTestId('category-container')).toContainText('Book');
        await expect(page.getByTestId('category-container')).toContainText('Electronics');
        await expect(page.getByTestId('category-container')).toContainText('Clothing');

    });

    test("should navigate to the relevant category page and display the relevant products", async ({ page }) => {

        // assert at categories page first
        await expect(page.getByRole('main')).toContainText('ElectronicsBookClothing');

        // navigate to the specific category page
        await page.getByRole('link', { name: 'Electronics' }).click();

        // assert that products of that category is displayed
        await expect(page.getByRole('main')).toContainText('Category - Electronics');
    });
})