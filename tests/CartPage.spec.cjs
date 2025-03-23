import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/cart");
});

test("cart page fields are visible", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Hello Guest Your Cart Is Empty" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Cart Summary" })
  ).toBeVisible();
  await expect(page.getByText("Total | Checkout | Payment")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Total : $" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Please Login to checkout" })
  ).toBeVisible();
  await expect(
    page.getByText("🛒 Virtual VaultSearchHomeCategoriesAll")
  ).toBeVisible();
});

test("can navigate to home and add item to cart", async ({ page }) => {
  await page.getByRole("link", { name: "Home" }).click();
  await page.goto("http://localhost:3000/");
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page.goto("http://localhost:3000/cart");
  await expect(page.getByText("The Law of Contract in")).toBeVisible();
  await expect(page.locator(".col-md-7 > .row")).toBeVisible();
  await expect(page.getByText("Price :")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Total : $" })).toBeVisible();
  await expect(page.getByText("You Have 1 items in your cart")).toBeVisible();
});

test("can remove item from cart", async ({ page }) => {
  await page.getByRole("link", { name: "Home" }).click();
  await page.goto("http://localhost:3000/");
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page.goto("http://localhost:3000/cart");
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.locator(".col-md-7")).toBeVisible();
  await expect(page.getByRole("main")).toContainText("Total : $0.00");
  await expect(page.locator("h1")).toContainText("Your Cart Is Empty");
});
