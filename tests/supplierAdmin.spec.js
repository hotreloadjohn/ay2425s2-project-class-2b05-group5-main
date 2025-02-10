const { test, expect } = require('@playwright/test');

const APPLICATION_DATA = {
  searchTerm: 'Limbus',
};

test.describe('Supplier Admin Page', () => {
  test('Should redirect unauthenticated users to login', async ({ page }) => {
    const NORMAL_USER = { email: 'outis@gmail.com', password: '123' };
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', NORMAL_USER.email);
    await page.fill('#password', NORMAL_USER.password);

    // Submit the login form
    await page.click('button[type="submit"]');

    await page.goto('http://localhost:3001/supplierAdmin.html');
    await expect(page).toHaveURL(/.*\/login.html/);
  });

  test('Should allow admin to view applications', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', 'admin');
    });
    await page.goto('http://localhost:3001/supplierAdmin.html');

    // Verify logged-in navbar is visible
    await page.waitForSelector('#logged-in-navbar');
    await expect(page.locator('#logged-in-navbar')).toBeVisible();
  });

  test('Should allow admin to filter applications', async ({ page }) => {
  await page.goto('http://localhost:3001');
  
  // Simulate an admin login
  await page.evaluate(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('role', 'admin');
  });
  await page.goto('http://localhost:3001/supplierAdmin.html');

  // Use the data from the seed for filtering
  const searchBox = page.locator('.search-box');
  await searchBox.fill(APPLICATION_DATA.searchTerm)
  const statusFilter = page.locator('.status-filter');
  
  // Select 'pending' from the status filter
  await statusFilter.selectOption({ label: 'Pending' });

  await page.click('button.search-btn');  // Clicking the search button

  const applicationsContainer = page.locator('#applications-container');
  
  // Assert that the filtered applications are shown correctly
  await expect(applicationsContainer).toContainText(APPLICATION_DATA.searchTerm);
  await expect(applicationsContainer).toContainText('Status: pending');  // Ensuring 'Status: pending' is displayed
});

  
  

  test('Should allow admin to approve/reject applications', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', 'admin');
    });
    await page.goto('http://localhost:3001/supplierAdmin.html');

    // Applications from the seed data (from supplierApply)
    const applicationsContainer = page.locator('#applications-container');
    await applicationsContainer.waitFor();

    const pendingApplication = applicationsContainer
      .locator('.application-card.status-pending-card')
      .first();
    await pendingApplication.waitFor();

    const approveButton = pendingApplication.locator('button.approve-btn');
    await approveButton.click();
  });

  test('Should allow admin to logout', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('role', 'admin');
    });
    await page.goto('http://localhost:3001/supplierAdmin.html');

    const logoutLink = page.locator('#logout-link');
    await logoutLink.waitFor();
    await logoutLink.click();

    // Verify redirection to login page
    await expect(page).toHaveURL(/.*\/login.html/);

  });
});
