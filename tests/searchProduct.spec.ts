import { test, expect } from '@playwright/test';
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import { CATEGORY_DATA, ELECTRONICS_PRODUCT_DATA } from "../test-data/index.js";


const CATEGORY_IDS = {};
let numOfProducts = 0;
let phoneProduct;


test.beforeEach(async () => {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URL);

    // Create collections
    await mongoose.connection.createCollection("categories");
    await mongoose.connection.createCollection("products");

    // Create categories
    for (const categoryData of CATEGORY_DATA) {
        const category = new categoryModel(categoryData);
        const savedCategory = await category.save();
        // Store the mapping of category id to assign to products
        CATEGORY_IDS[categoryData.name] = savedCategory._id;
    }

    // Create products
    for (const productData of ELECTRONICS_PRODUCT_DATA) {
        if (productData['category'] == "Electronics") {
            numOfProducts += 1;
            if (productData['name'] == "Smartphone") {
                //Store phone product for use in test
                phoneProduct = { ...productData }
            }
        }
        // Assign the category id to the product
        productData['category'] = CATEGORY_IDS[productData['category']];
        const product = new productModel(productData);
        await product.save();
    }
});


test.afterEach(async () => {
    // Remove collections
    await mongoose.connection.collection("categories").deleteMany({});
    await mongoose.connection.collection("products").deleteMany({});

    // Disconnect from DB
    await mongoose.disconnect();
});


test.describe('User should be able to search for desired products through the search bar, view more details & add to cart', () => {
    test('by entering a search keyword', async ({ page }) => {
        await page.goto('http://localhost:3000/');

        // Check products are shown on the home page
        let numOfProductsShown = 0;
        for (const productData of ELECTRONICS_PRODUCT_DATA) {
            await expect(page.getByRole('heading', { name: productData.name })).toBeVisible();
            numOfProductsShown += 1;
        }
        expect(numOfProductsShown).toBe(ELECTRONICS_PRODUCT_DATA.length);

        // Search for desired product
        await page.getByPlaceholder('Search').click();
        await page.getByPlaceholder('Search').fill('phone');
        await page.getByRole('button', { name: 'Search' }).click();

        // Check search results for 'Phone' is correct
        await expect(page.getByRole('heading', { name: 'Found' })).toHaveText('Found 1');

        // Click more details button of the phone product
        let moreDetailsButton = page.getByRole('heading', { name: phoneProduct.name }).locator('..').locator('button', { hasText: 'More Details' });
        await moreDetailsButton.click();

        // Assert product details of the phone product
        await expect(page.getByRole('heading', { name: 'Name : ' + phoneProduct.name })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Description : ' + phoneProduct.description })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Price :$' + phoneProduct.price })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Category : ' + phoneProduct.category })).toBeVisible();

        // Verify adding the product to cart
        await (page.getByRole('button', { name: 'ADD TO CART' })).click();
        await expect(page.getByText('Item Added to cart')).toBeVisible();

        // Assert other electronics as similar products
        const similarProductsHeading = page.getByRole('heading', { name: 'Similar Products ➡️' });
        const similarProductsContainer = similarProductsHeading.locator('xpath=following-sibling::div[1]');
        await similarProductsContainer.waitFor({ state: 'visible' });
        const numberOfSimilarProducts = await similarProductsContainer.locator('.card').count();
        expect(numberOfSimilarProducts).toBe(numOfProducts - 1);

        // Go to cart
        await page.getByRole('link', { name: 'Cart' }).click();
        await expect(page.getByText('You Have 1 items in your cart')).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Total : $' + phoneProduct.price })).toBeVisible();

        // Remove the product from cart
        await page.getByRole('button', { name: 'Remove' }).click();
        await expect(page.getByText('Your Cart Is Empty')).toBeVisible();
    });
});