import { test, expect } from '@playwright/test';

// navigate to the home page first 
test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
});

test.describe("Search Results", () => {

    test('should navigate to product details page after MORE DETAILS button clicked', async ({ page }) => {
        // search for an item 
        const searchBar = page.getByRole('searchbox', { name: 'Search' });

        await searchBar.fill("nus");
        await expect(page.getByRole('searchbox', { name: 'Search' })).toHaveValue('nus');
        await searchBar.press("Enter");

        // Find the first item and click more details button
        await page.waitForSelector('.card');
        const productCard = await page.locator('.card').filter({ hasText: 'NUS T-shirt' }).first();

        await expect(productCard).toBeVisible();

        await productCard.locator('.btn-primary').click();

        // expect the URL to change to the product details page
        await expect(page).toHaveURL('http://localhost:3000/product/NUS-T-shirt');

    });
    
    test('should navigate to search results page and add to cart when ADD TO CART button clicked', async ({ page }) => {
        // search for an item 
        const searchBar = page.getByRole('searchbox', { name: 'Search' });

        await searchBar.fill("nus");
        await expect(page.getByRole('searchbox', { name: 'Search' })).toHaveValue('nus');
        await searchBar.press("Enter");

        // Find the first item
        await page.waitForSelector('.card');
        const productCard = await page.locator('.card').filter({ hasText: 'NUS T-shirt' }).first();

        await expect(productCard).toBeVisible();

        // Assert empty cart at first
        await expect(page.locator('sup')).toHaveText('0');

        // Click on ADD TO CART button
        await productCard.locator('.btn-secondary').click();

        await expect(page.getByRole('status')).toHaveText("Item Added to cart");
        await expect(page.locator('sup')).toHaveText('1');

        // check cart has product
        await page.getByRole('link', { name: 'Cart' }).click();
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
            - paragraph: NUS T-shirt
            - paragraph: Plain NUS T-shirt for sale
            - paragraph: "/Price : \\\\d+\\\\.\\\\d+/"
            `);

    })

})