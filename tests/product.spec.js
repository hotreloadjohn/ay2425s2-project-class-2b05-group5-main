const { test, expect } = require('@playwright/test');

const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Load All Products Page', () => {
test('should load all products on the website', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForSelector('.product-card'); 
    const productCards = page.locator('.product-card');
    const productCount = await productCards.count(); 
    console.log("Total Products: ", productCount)
    expect(productCount).toBeGreaterThan(0) 
});

test('should allow me to search product (eg. notebook)', async ({ page }) => {
    await page.goto(baseUrl); 

    // Wait for product cards to load before searching
    await page.waitForSelector('.product-card', { timeout: 5000 }); 
    const productCards = page.locator('.product-card');
    const productCount = await productCards.count(); 
    expect(productCount).toBeGreaterThan(0) 

    const searchInput = page.locator('.search-box');
    await searchInput.fill("notebook"); 
    await searchInput.press('Enter'); 

    const resultCount = page.locator('#search-result-count');
    await resultCount.waitFor({ state: 'visible', timeout: 5000 });

    const countText = await resultCount.textContent();
    expect(countText).toContain('1 item found');  
});

test('should allow me to filter and sort the products', async ({ page }) => {
    await page.goto(baseUrl);

    await page.waitForSelector('.product-card', { timeout: 8000 });
    
    let productCards = page.locator('.product-card');
    let productCount = await productCards.count();
    expect(productCount).toBeGreaterThan(0);

    const filterButton = page.locator('.filter-btn');
    await filterButton.click();

    const filterPopup = page.locator('#filter-popup');
    await filterPopup.waitFor({ state: 'visible' });

    const lowToHighRadio = page.locator('input[name="sort"][value="1"]');
    await lowToHighRadio.click(); 

    const applyButton = page.locator('.apply-filter');
    await applyButton.click();

    await page.waitForTimeout(2000); 

    const productPrices = await productCards.locator('.product-price').allTextContents();

    console.log("Sorted Product Prices:", productPrices);

    const isSortedLowToHigh = productPrices.every((price, index, array) => {
        const currentPrice = parseFloat(price.replace('$', ''));
        const nextPrice = index + 1 < array.length ? parseFloat(array[index + 1].replace('$', '')) : Infinity;
        return currentPrice <= nextPrice;
    });

    expect(isSortedLowToHigh).toBe(true); // This checks if prices are sorted in ascending order
});
});
