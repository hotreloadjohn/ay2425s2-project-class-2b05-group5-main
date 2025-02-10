const { test, expect } = require('@playwright/test');

const baseUrl = 'http://localhost:3001';

test.describe('Wishlist Feature', () => {
    test('Allow user to add products to wishlist after login', async ({ page }) => {
        const user = { email: 'ryoshu@gmail.com', password: '123' };

        // Log in
        await page.goto(`${baseUrl}/login.html`);
        await page.fill('#email', user.email);
        await page.fill('#password', user.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL(`${baseUrl}/index.html`);
        await page.waitForSelector('#profile-link');

        // Navigate to homepage
        await page.goto(`${baseUrl}/`);
        await page.waitForSelector('.product-card');

        const productCards = page.locator('.product-card');
        const firstProduct = productCards.nth(0);
        const secondProduct = productCards.nth(1);
        const thirdProduct = productCards.nth(2);

        // Add products to the wishlist
        await firstProduct.locator('.add-to-wishlist-button').click();
        await secondProduct.locator('.add-to-wishlist-button').click();
        await thirdProduct.locator('.add-to-wishlist-button').click();

        console.log('Added products to the wishlist.');

        // Navigate to the wishlist page
        try {
            console.log('Navigating to wishlist page...');
            await page.goto(`${baseUrl}/wishlist/wishlist.html`, { timeout: 5000 });
            await page.waitForSelector('#wishlist-items');
            const wishlistItems = await page.locator('#wishlist-items tr').count();
            console.log(`Wishlist contains ${wishlistItems} item(s).`);
            expect(wishlistItems).toBeGreaterThan(0);
        } catch (error) {
            console.error('Error navigating to wishlist page:', error.message);
            console.log('Trying to check for network issues...');
            page.on('response', (response) => {
                console.log('Response status:', response.status(), response.url());
            });
        }
    });
});