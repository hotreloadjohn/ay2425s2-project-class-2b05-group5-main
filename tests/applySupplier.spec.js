const { test, expect } = require('@playwright/test');

const TEST_USER = {
  email: 'outis@gmail.com',
  password: '123',
};
const REJECT_USER={
    email:'ishmael@gmail.com',
    password:'123'
}
const APPLICATION_DATA = {
    companyName: 'Test Company',
    productType: 'Electronics',
    reason: 'We provide quality products.',
  };
const PENDING_USER ={
    email: "sinclair@gmail.com",
    password: "123"
}
test.describe('Apply as Supplier', () => {
  test('Should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('http://localhost:3001/applySupplier.html');
    await expect(page).toHaveURL(/.*\/login.html/);
  });

  // test('Should allow logged-in user to view and submit application', async ({ page }) => {
  //   // Simulate login
  //   await page.goto('http://localhost:3001/login.html');
  //   await page.fill('#email', TEST_USER.email);
  //   await page.fill('#password', TEST_USER.password);
  //   await page.click('button[type="submit"]');
  //   await page.evaluate(() => {
  //     localStorage.setItem('userId', '11');
  //     localStorage.setItem('role', 'user');
  //   });
  //   // Navigate to the supplier application page
  //   await page.goto('http://localhost:3001/applySupplier.html');

  //   await page.waitForSelector('#apply-supplier-form')
  //   // Fill and submit the application form
  //   await page.fill('#company-name', APPLICATION_DATA.companyName);
  //   await page.fill('#product-type', APPLICATION_DATA.productType);
  //   await page.fill('#reason_id', APPLICATION_DATA.reason);
  //   await page.click('button[type="submit"]');
  // });

  test('Should display existing application if available', async ({ page }) => {
    // Simulate user login
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', PENDING_USER.email);
    await page.fill('#password', PENDING_USER.password);
    await page.click('button[type="submit"]');
    await page.evaluate(() => {
      localStorage.setItem('userId', '10');
      localStorage.setItem('role', 'user');
    });
    // Navigate to the supplier application page
    await page.goto('http://localhost:3001/applySupplier.html');

    // Verify existing application is displayed
    await expect(page.locator('#existing-company-name')).toHaveText('Medicare Supplies');
    await expect(page.locator('#existing-product-type')).toHaveText('Medical Equipment');
    await expect(page.locator('#existing-reason')).toHaveText('Meeting growing demand in healthcare.');
    await expect(page.locator('#existing-status')).toHaveText('pending');
  });

  test('Should allow user to edit application if rejected', async ({ page }) => {
    // Simulate user login
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', REJECT_USER.email);
    await page.fill('#password', REJECT_USER.password);
    await page.click('button[type="submit"]');
    await page.evaluate(() => {
      localStorage.setItem('userId', '8');
      localStorage.setItem('role', 'user');
    });
    // Navigate to the supplier application page
    await page.goto('http://localhost:3001/applySupplier.html');

    // Verify form is visible and editable
    await expect(page.locator('#company-name')).toHaveValue('Speed Logistics');
    await expect(page.locator('#product-type')).toHaveValue('Transport Services');
    await expect(page.locator('#reason_id')).toHaveValue('Improving supply chain efficiency.');
    await page.click('button[type="submit"]');
  });
});
