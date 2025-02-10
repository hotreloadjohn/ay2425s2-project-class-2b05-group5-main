const { test, expect } = require('@playwright/test');

test.describe('Supplier Admin Dashboard', () => {
  test('Should redirect unauthenticated users to login', async ({ page }) => {
    const NORMAL_USER = { email: 'outis@gmail.com', password: '123' };
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', NORMAL_USER.email);
    await page.fill('#password', NORMAL_USER.password);
    await page.goto('http://localhost:3001/supplierAdminDashboard.html');
    await page.click('button[type="submit"]');
    // Assert that unauthenticated users are redirected to the login page
    await expect(page).toHaveURL(/.*\/login.html/);
  });

  test('Should allow admin to view dashboard statistics', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Simulate admin login
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', 'admin');
    });

    await page.goto('http://localhost:3001/supplierAdminDashboard.html');

    // Verify navbar visibility
    await expect(page.locator('#logged-in-navbar')).toBeVisible();

    // Verify statistics cards are loaded
    await expect(page.locator('#total-applications')).toHaveText(/Total: \d+/);
    await expect(page.locator('#approved-applications')).toHaveText(/Approved: \d+/);
    await expect(page.locator('#rejected-applications')).toHaveText(/Rejected: \d+/);
  });


  test('Should display top companies list correctly', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Simulate admin login
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', 'admin');
    });

    await page.goto('http://localhost:3001/supplierAdminDashboard.html');

    const topCompaniesList = page.locator('#top-companies');
    await topCompaniesList.waitFor();

    // Verify list contents and assert the correct number of companies
    const topCompaniesCount = await page.locator('#top-companies li').count();
    expect(topCompaniesCount).toBeGreaterThan(0);

  });

  test('Should allow admin to logout', async ({ page }) => {
    await page.goto('http://localhost:3001');

    // Simulate admin login
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', 'admin');
    });

    await page.goto('http://localhost:3001/supplierAdminDashboard.html');

    const logoutLink = page.locator('#logout-link');
    await logoutLink.click();

    // Verify redirection to login page
    await expect(page).toHaveURL(/.*\/login.html/);
  });
});
