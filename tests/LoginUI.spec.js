import { test, expect } from "@playwright/test";

test.describe("Login Component", () => {
  // Before each test, navigate to the login page
  test.beforeEach(async ({ page }) => {
    // Adjust the URL to point to the login page in your app
    await page.goto("http://localhost:3000/login");
  });

  test("should display login form", async ({ page }) => {
    // Check if the login form is displayed correctly
    const title = page.locator(".title");
    await expect(title).toHaveText("LOGIN FORM");

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');

    // Ensure all form elements are visible
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });

  test("should handle valid login", async ({ page }) => {
    // Fill in the email and password
    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("test@example.com"); //existing user
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("password123");
    await page.getByRole("button", { name: "LOGIN" }).click();

    // Check for the success toast message
    await expect(page).toHaveURL("http://localhost:3000", { timeout: 5000 });
    await expect(page.getByText("login successfully")).toBeVisible();
  });

  test("should handle failed login", async ({ page }) => {
    // Fill in the email and password
    await page.getByRole("textbox", { name: "Enter Your Email" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("test@example.com"); //existing user
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("passworddddddd123"); // wrong password
    await page.getByRole("button", { name: "LOGIN" }).click();

    await expect(page.getByText("Invalid Password")).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    // Click on "Forgot Password" button
    await page.click("button.forgot-btn");

    // Ensure the page navigates to the forgot password route
    await expect(page).toHaveURL("http://localhost:3000/forgot-password");
  });
});
