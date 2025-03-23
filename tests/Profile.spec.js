import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('a@gmail.com');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('123456');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('button', { name: 'a', exact: true }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
  await page.getByRole('link', { name: 'Profile' }).click();

});


test('Render Profile page', async ({ page }) => {
  // Mock localStorage data before navigating to the dashboard
  await page.addInitScript(() => {
    const mockUser = {
      user: {
        name: "a",
        email: "a@gmail.com",
        address: "a",
      },
      token: "mock-jwt-token"
    };
    localStorage.setItem("auth", JSON.stringify(mockUser));
  });

  await expect(page.getByRole('heading', { name: 'USER PROFILE' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'UPDATE' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'UPDATE' })).toBeVisible();
});

test('Successful update of Profile', async ({ page }) => {
  // Mock localStorage data before navigating to the dashboard
  await page.addInitScript(() => {
    const mockUser = {
      user: {
        name: "a",
        email: "a@gmail.com",
        address: "a",
      },
      token: "mock-jwt-token"
    };
    localStorage.setItem("auth", JSON.stringify(mockUser));
  });
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('123456');
  await page.getByRole('button', { name: 'UPDATE' }).click();
  await expect(page.getByText('Profile Updated Successfully')).toBeVisible();
});



test('Fail to update profile as password is too short', async ({ page }) => {
  // Mock localStorage data before navigating to the dashboard
  await page.addInitScript(() => {
    const mockUser = {
      user: {
        name: "a",
        email: "a@gmail.com",
        address: "a",
      },
      token: "mock-jwt-token"
    };
    localStorage.setItem("auth", JSON.stringify(mockUser));
  });
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('1');
  await page.getByRole('button', { name: 'UPDATE' }).click();
  await expect(page.getByText('Password must be at least 6 characters long')).toBeVisible();
});

test('Show toast error when name is blank', async ({ page }) => {
  // Mock localStorage data before navigating to the page
  await page.addInitScript(() => {
    const mockUser = {
      user: {
        name: "User Name",
        email: "user@example.com",
        phone: "1234567890",
        address: "123 Test St",
      },
      token: "mock-jwt-token"
    };
    localStorage.setItem("auth", JSON.stringify(mockUser));
  });
  
  // Clear the name field
  await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('');
  
  // Submit the form
  await page.getByRole('button', { name: 'UPDATE' }).click();
  
  // Check for toast error message
  await expect(page.getByText('Name is required')).toBeVisible();
});

test('Show toast error when phone is blank', async ({ page }) => {
  // Mock localStorage data
  await page.addInitScript(() => {
    const mockUser = {
      user: {
        name: "User Name",
        email: "user@example.com",
        phone: "1234567890",
        address: "123 Test St",
      },
      token: "mock-jwt-token"
    };
    localStorage.setItem("auth", JSON.stringify(mockUser));
  });
  
  // Clear the phone field
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('');
  
  // Submit the form
  await page.getByRole('button', { name: 'UPDATE' }).click();
  
  // Check for toast error message
  await expect(page.getByText('Phone number is required')).toBeVisible();
});

test('Show toast error when address is blank', async ({ page }) => {
  // Mock localStorage data
  await page.addInitScript(() => {
    const mockUser = {
      user: {
        name: "User Name",
        email: "user@example.com",
        phone: "1234567890",
        address: "123 Test St",
      },
      token: "mock-jwt-token"
    };
    localStorage.setItem("auth", JSON.stringify(mockUser));
  });
  
  // Clear the address field
  await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('');
  
  // Submit the form
  await page.getByRole('button', { name: 'UPDATE' }).click();
  
  // Check for toast error message
  await expect(page.getByText('Address is required')).toBeVisible();
});

test('Show toast error when password is too short', async ({ page }) => {
  // Mock localStorage data
  await page.addInitScript(() => {
    const mockUser = {
      user: {
        name: "User Name",
        email: "user@example.com",
        phone: "1234567890",
        address: "123 Test St",
      },
      token: "mock-jwt-token"
    };
    localStorage.setItem("auth", JSON.stringify(mockUser));
  });
  
  // Enter a short password
  await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('12345');
  
  // Submit the form
  await page.getByRole('button', { name: 'UPDATE' }).click();
  
  // Check for toast error message
  await expect(page.getByText('Password must be at least 6 characters long')).toBeVisible();
});

test('Show multiple toast errors when multiple fields are invalid', async ({ page }) => {
  // Mock localStorage data
  await page.addInitScript(() => {
    const mockUser = {
      user: {
        name: "User Name",
        email: "user@example.com",
        phone: "1234567890",
        address: "123 Test St",
      },
      token: "mock-jwt-token"
    };
    localStorage.setItem("auth", JSON.stringify(mockUser));
  });

  
  // Clear name and address fields
  await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('');
  
  await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('');
  
  // Submit the form
  await page.getByRole('button', { name: 'UPDATE' }).click();
  
  // Check for toast error messages
  await expect(page.getByText('Name is required')).toBeVisible();
  await expect(page.getByText('Address is required')).toBeVisible();
});