import { expect, test } from '@playwright/test';

const RANDOM_BOTH_FILTER_NAME = 'The Law of Contract in'
const RANDOM_CLOTHING_NAME = 'NUS T-shirt'
const RANDOM_BOOK_NAME = 'Textbook'

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000');
});

test.describe('Filter Products', () => {
  test('should fiter based on one category', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await expect(page.getByRole('heading', { name: RANDOM_CLOTHING_NAME })).toBeVisible();
    await expect(page.getByTestId(/^product-/)).toHaveCount(1);
    await page.getByRole('checkbox', { name: 'Clothing' }).uncheck();
    await expect(page.getByRole('heading', { name: RANDOM_BOOK_NAME })).toBeVisible();
    await expect(page.getByTestId(/^product-/)).toHaveCount(6);
  });

  test('should fiter based on multiple category', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await expect(page.getByRole('heading', { name: RANDOM_BOOK_NAME })).not.toBeVisible();
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await expect(page.getByRole('heading', { name: RANDOM_BOOK_NAME })).toBeVisible();
    await expect(page.getByRole('heading', { name: RANDOM_CLOTHING_NAME })).toBeVisible();
    await expect(page.getByTestId(/^product-/)).toHaveCount(4);
  });

  test('should fiter based on price', async ({ page }) => {
    await page.getByRole('radio', { name: '$0 to' }).check();
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'NUS T-shirt' })).toBeVisible();
    await expect(page.getByTestId(/^product-/)).toHaveCount(2);
    await page.getByRole('radio', { name: '$40 to' }).check();
    //Test when radio filter changed
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
    await expect(page.getByTestId(/^product-/)).toHaveCount(1);
    //Test reset filter
    await page.getByRole('button', { name: 'RESET FILTERS' }).click();
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
    await expect(page.getByTestId(/^product-/)).toHaveCount(6);
  });

  test('should fiter based on price and multiple category', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await expect(page.getByRole('heading', { name: RANDOM_BOTH_FILTER_NAME })).toBeVisible();
    await page.getByRole('radio', { name: '$40 to' }).check();
    await expect(page.getByRole('heading', { name: RANDOM_CLOTHING_NAME })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: RANDOM_BOTH_FILTER_NAME })).toBeVisible();
    await expect(page.getByTestId(/^product-/)).toHaveCount(1);
    await page.getByRole('button', { name: 'RESET FILTERS' }).click();
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await expect(page.getByTestId(/^product-/)).toHaveCount(6);
  });

  test('should show empty', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Clothing' }).check();
    await expect(page.getByRole('heading', { name: RANDOM_BOTH_FILTER_NAME })).not.toBeVisible();
    await page.getByRole('radio', { name: '$40 to' }).check();
    await expect(page.getByRole('heading', { name: RANDOM_CLOTHING_NAME })).not.toBeVisible();
    await expect(page.getByTestId(/^product-/)).toHaveCount(0);
    //Ensure LOAD MORE is not displayed
    await expect(page.locator('button:has-text("Loadmore")')).toHaveCount(0);
  });
})

test.describe('Search Products', () => {
  test('should search name match', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('Nov');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('heading', { name: 'Found 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/search');
  });

  test('should search description match', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('bestselling');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('heading', { name: 'Found 2' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/search');
  });

  test('should search name & description match', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('a');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('heading', { name: 'Found 6' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Search Results' })).toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/search');
  });

  test('should search empty input', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search' }).click();
    await page.getByRole('searchbox', { name: 'Search' }).fill('');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page).toHaveURL('http://localhost:3000');
  });
});

test.describe('Product Card Buttons', () => {
  test('should redirect when more details clicked', async ({ page }) => {
    await page.getByTestId('product-67a2171ea6d9e00ef2ac0229').getByRole('button', { name: 'More Details' }).click();
    await expect(page).toHaveURL('http://localhost:3000/product/the-law-of-contract-in-singapore');
  });

  test('should populate cart when add to cart clicked', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByTestId('product-67a2171ea6d9e00ef2ac0229').getByRole('button', { name: 'ADD TO CART' }).click();
    await page.goto('http://localhost:3000'); //Ensure item added to local storage
    await page.getByTestId('product-66db427fdb0119d9234b27f9').getByRole('button', { name: 'ADD TO CART' }).click();
    await page.goto('http://localhost:3000/cart');
    await expect(page.getByText('Novel', { exact: true })).toBeVisible();
    await expect(page.getByText('The Law of Contract in')).toBeVisible();
    await page.getByRole('button', { name: 'Remove' }).first().click();
    await page.getByRole('button', { name: 'Remove' }).first().click();
  });
});

