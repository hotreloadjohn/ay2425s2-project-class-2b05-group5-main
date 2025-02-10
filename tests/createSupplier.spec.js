const { test, expect } = require('@playwright/test');

const SUPPLIER_DATA = {
    id:9,
    personId: 9,
    companyName: "Fashion Hub",
    productType: "Clothing",
    Reason: "Expanding market reach globally.",
};
const TEST_USER = {
  email: 'dante@gmail.com',
  password: '123',
};
test.describe('Create New Supplier Page', () => {
  test('Should redirect unauthenticated users to login', async ({ page }) => {
    const NORMAL_USER = { email: 'outis@gmail.com', password: '123' };
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', NORMAL_USER.email);
    await page.fill('#password', NORMAL_USER.password);

    // Submit the login form
    await page.click('button[type="submit"]');

    await page.goto('http://localhost:3001/createSupplier.html');
    // Check if the page redirects to login
    await expect(page).toHaveURL(/.*\/login.html/);
  });
})
  test('Should allow admin to view and create a new supplier', async ({ page }) => {
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.evaluate(() => {
      localStorage.setItem('userId', '14');
      localStorage.setItem('role', 'admin');
      localStorage.setItem('token', 'test-token');
    });
    await page.goto(`http://localhost:3001/createSupplier.html?suapplyId=${SUPPLIER_DATA.id}`);

    await page.waitForSelector('#create-supplier-form')
    // Fill the supplier form
    await page.fill('#companyName', SUPPLIER_DATA.companyName);
    await page.fill('#productType', SUPPLIER_DATA.productType);
    // Simulate fetching a supplier admin ID
    await page.evaluate(() => {
      localStorage.setItem('userId', 14);
    });
  });


  test('Should allow admin go to the page', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', 'admin');
    });
    await page.goto(`http://localhost:3001/createSupplier.html?suapplyId=${SUPPLIER_DATA.id}`);

    // Verify logged-in navbar is visible
    await page.waitForSelector('#logged-in-navbar');
    await expect(page.locator('#logged-in-navbar')).toBeVisible();
  });
