import { test, expect } from "@playwright/test";

test("admin should be able to view and edit orders", async ({ page }) => {
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

  // Navigate to Admin Orders Page
  await page.getByRole("button", { name: "Test" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Orders" }).click();

  // Check if Orders Table is Visible
  await expect(page.getByRole("heading", { name: "All Orders" })).toBeVisible();
  await expect(page.locator("table")).toBeVisible();

  // Verify table headers
  const headers = ["Status", "Buyer", "date", "Payment", "Quantity"];
  for (const header of headers) {
    await expect(
      page.getByRole("columnheader", { name: header })
    ).toBeVisible();
  }

  // Ensure at least one order is present
  const orders = await page.$$("tbody tr");
  expect(orders.length).toBeGreaterThan(0);

  // Verify order details
  const firstOrder = orders[0];
  await expect(firstOrder.locator("td:nth-child(2)")).toBeVisible(); // Status
  await expect(firstOrder.locator("td:nth-child(3)")).toBeVisible(); // Buyer
  await expect(firstOrder.locator("td:nth-child(4)")).toBeVisible(); // Date
  await expect(firstOrder.locator("td:nth-child(5)")).toBeVisible(); // Payment
  await expect(firstOrder.locator("td:nth-child(6)")).toBeVisible(); // Quantity

  // Verify order status dropdown
  const statusDropdown = firstOrder.getByTestId("status");
  await expect(statusDropdown).toBeVisible();

  // Change order status
  await statusDropdown.selectOption("Shipped");
  await page.waitForTimeout(1000); // Wait for backend update
  await page.reload();

  // Verify the status is updated
  await expect(statusDropdown).toHaveValue("Shipped");
});
