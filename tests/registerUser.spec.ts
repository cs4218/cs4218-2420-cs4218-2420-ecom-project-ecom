import { test, expect } from '@playwright/test';
import mongoose from "mongoose";
import { USER_DATA } from "../test-data/index.js";

test.beforeEach(async () => {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URL);

    // Create collection
    await mongoose.connection.createCollection("users");
});

test.afterAll(async () => {
    // Remove user
    await mongoose.connection.collection("users").deleteMany({});
    // Disconnect from DB
    await mongoose.disconnect();
});

test.describe('User should be able to register an account and log in', () => {
    test('by filling in the registration form', async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
        await page.getByRole('link', { name: 'Register' }).click();

        // Fill in the registration form
        await expect(page.getByRole('heading', { name: 'REGISTER FORM' })).toBeVisible();
        await page.getByPlaceholder('Enter Your Name').fill(USER_DATA.name);
        await page.getByPlaceholder('Enter Your Email').fill(USER_DATA.email);
        await page.getByPlaceholder('Enter Your Password').fill(USER_DATA.password);
        await page.getByPlaceholder('Enter Your Phone').fill(USER_DATA.phone);
        await page.getByPlaceholder('Enter Your Address').fill(USER_DATA.address);
        await page.getByPlaceholder('Enter Your DOB').fill(USER_DATA.DOB);
        await page.getByPlaceholder('What is Your Favorite sports').fill(USER_DATA.answer);

        // Submit the registration form
        await expect(page.getByRole('button', { name: 'REGISTER' })).toBeVisible();
        await page.getByRole('button', { name: 'REGISTER' }).click();

        // Check the success message
        await expect(page.getByText('Register Successfully, please login')).toBeVisible();

        // Check navigated to login page
        await expect(page).toHaveURL('http://localhost:3000/login');
        await expect(page.getByText('LOGIN FORM')).toBeVisible();

        // Fill in the login form
        await page.getByPlaceholder('Enter Your Email').fill(USER_DATA.email);
        await page.getByPlaceholder('Enter Your Password').fill(USER_DATA.password);

        // Submit the login form
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
        await page.getByRole('button', { name: 'Login' }).click();

        // Check the success message
        await expect(page.getByText("login successfully")).toBeVisible();
        await expect(page).toHaveURL('http://localhost:3000/');
        await expect(page.getByText(USER_DATA.name)).toBeVisible();

        // View user dashboard
        await page.getByRole('button', {name: USER_DATA.name}).click();
        await expect(page.getByRole('link', {name: 'Dashboard'})).toBeVisible();
        await page.getByRole('link', {name: 'Dashboard'}).click();
        await expect(page.getByRole('heading', { name: USER_DATA.name })).toBeVisible();
        await expect(page.getByRole('heading', { name: USER_DATA.email })).toBeVisible();
        await expect(page.getByText(USER_DATA.address)).toBeVisible();
        
        // View user profile
        await page.getByRole('link', {name: 'Profile'}).click();
        await expect(page).toHaveURL('http://localhost:3000/dashboard/user/profile');
        await expect(page.getByRole('heading', { name: 'USER PROFILE' })).toBeVisible();
        await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue(USER_DATA.name);
        await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue(USER_DATA.email);
        await expect(page.getByRole('textbox', { name: 'Enter Your Password' })).toBeEmpty();
        await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue(USER_DATA.phone);
        await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue(USER_DATA.address);
        await expect(page.getByRole('button', { name: 'UPDATE' })).toBeVisible();

    });
});
