import { expect, test } from '@playwright/test';

const TEST_PRODUCT_SLUG = "textbook";

let lastFailedApiCall;

test.describe("ProductDetails UI test", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`http://localhost:3000/product/${TEST_PRODUCT_SLUG}`);

    page.on("response", (response) => {
      if (!response.ok()) lastFailedApiCall = response;
    });
    await page.waitForTimeout(1000);
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

  test("Any user can view product details", async ({ page }) => {
    await test.step("User views product details", async () => {
      const productName = page.getByRole("heading", { level: 6, name: /^Name : / });
      await expect(productName).toBeVisible();
  
      const productDescription = page.getByRole("heading", { level: 6, name: /^Description : / });
      await expect(productDescription).toBeVisible();
  
      const productPrice = page.getByRole("heading", { level: 6, name: /^Price :/ });
      await expect(productPrice).toBeVisible();
  
      const productCategory = page.getByRole("heading", { level: 6, name: /^Category : / });
      await expect(productCategory).toBeVisible();
  
      const productImage = page.getByRole('img', { name: 'Textbook' });
      await expect(productImage).toBeVisible(); 
    })
  
    await test.step("Similar products are visible", async () => {
      const similarProductsHeading = page.getByRole("heading", { name: /Similar Products/i });
      const similarProductLinksCount = await page.getByRole("button", { name: /More Details/i }).count();
      
      await expect(similarProductsHeading).toBeVisible();
      await expect(similarProductLinksCount).toBeGreaterThan(0);
    });
  });

  test("User can add product to cart from ProductDetails page", async ({ page }) => {
    await test.step("Clicking 'Add to Cart' updates storage and UI", async () => {
      await page.getByRole("button", { name: "ADD TO CART" }).click();
      
      const cartItems = JSON.parse(await page.evaluate(() => localStorage.getItem("cart")));
      expect(cartItems.length).toBeGreaterThan(0);
      await page.waitForTimeout(100);
      const toastNotification = page.getByText("Item Added to cart");
      await expect(toastNotification).toBeVisible();
    });

    await test.step("Navigate to cart page", async () => {
      await page.goto(`http://localhost:3000/cart`);
      await page.waitForTimeout(100);
    });

    await expect(page.getByText('Textbook', { exact: true })).toBeVisible();
    
  });

  test("Invalid product URL leads to 404", async ({ page }) => {
    await page.goto(`http://localhost:3000/product/not-exist`);
    await page.waitForTimeout(100);

    await expect(page.getByText("404")).toBeVisible();
  })
})
