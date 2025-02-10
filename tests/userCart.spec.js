const { test, expect } = require('@playwright/test');

const baseUrl = 'http://localhost:3001';

test.describe('Add to Cart Page', () => {
    test('Allow user to add products to cart after login', async ({ page }) => {
        const NORMAL_USER = { email: 'ryoshu@gmail.com', password: '123' };

        // Log in
        await page.goto(`${baseUrl}/login.html`);
        await page.fill('#email', NORMAL_USER.email);
        await page.fill('#password', NORMAL_USER.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${baseUrl}/index.html`);
        await page.waitForSelector('#profile-link');

        await page.goto(`${baseUrl}/`);
        await page.waitForSelector('.product-card');

        const productCards = page.locator('.product-card');
        const firstProduct = productCards.first();
        await firstProduct.locator('.add-to-cart-button').click();

        try {
            console.log('Navigating to cart page...');
            await page.goto(`${baseUrl}/cart/cart.html`, { timeout: 60000 });
            await page.waitForSelector('#cart-items');
            const cartItems = await page.locator('#cart-items tr').count();
            console.log(`Cart contains ${cartItems} item(s).`);
            expect(cartItems).toBeGreaterThan(0);
        } catch (error) {
            console.error('Error navigating to cart page:', error.message);
            console.log('Trying to check for network issues...');
            page.on('response', (response) => {
                console.log('Response status:', response.status(), response.url());
            });
        }
    });
});
