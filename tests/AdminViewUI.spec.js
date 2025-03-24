import { test, expect } from "@playwright/test";

test("admin dashboard view users", async ({ page }) => {
  // Navigate to the home page
  await page.goto("http://localhost:3000/");

  // Perform login
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("test@admin.com");
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("test@admin.com");
  await page.getByRole("button", { name: "LOGIN" }).click();

  // Navigate through dashboard
  await page.getByRole("button", { name: "Test" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Users" }).click();

  // Assertions to verify correct user data and navigation structure
  await expect(page.locator("tbody")).toContainText("admin@test.sg");
  await expect(page.getByTestId("admin-menu")).toMatchAriaSnapshot(
    '- link "Users"'
  );
  await expect(page.getByRole("navigation")).toMatchAriaSnapshot(`
    - navigation:
      - link "🛒 Virtual Vault"
      - list:
        - search:
          - searchbox "Search"
          - button "Search"
        - listitem:
          - link "Home"
        - listitem:
          - link "Categories"
        - listitem:
          - button "Test"
        - listitem:
          - link "Cart"
          - superscript: "0"
  `);
});
