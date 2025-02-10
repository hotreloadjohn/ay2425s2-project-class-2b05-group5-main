const { test, expect } = require('@playwright/test');
require('dotenv').config();
const stripe = require('stripe')('sk_test_51QOcvUAuYNt6Tkf5Nyc6nGHeXFsZkgldoy1hwQkwrOXe48aATj3ObKX0t71pTZ9nLhHib7kDp9IlKV0xnpXobjxo00l6Cd3NWx');

const ADMIN_USER = {
  email: 'dante@gmail.com',
  password: '123',
};

test.describe('Coupon Management Page', () => {

  test('Should allow admin to view the coupon creation page', async ({ page }) => {
    // Simulate login as admin
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', ADMIN_USER.email);
    await page.fill('#password', ADMIN_USER.password);
    await page.click('button[type="submit"]');

    await page.evaluate(() => {
      localStorage.setItem('token', 'adminToken123');
      localStorage.setItem('role', 'admin');
    });

    await page.goto('http://localhost:3001/coupons/createCoupons.html');

    // Check if the navbar is visible for admin
    await expect(page.locator('#logged-in-navbar')).toBeVisible();

    // Check if the create coupon form is visible
    await expect(page.locator('form#createVoucherForm')).toBeVisible();
  });

  test('Should allow admin to create a coupon', async ({ page }) => {
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', ADMIN_USER.email);
    await page.fill('#password', ADMIN_USER.password);
    await page.click('button[type="submit"]');

    await page.evaluate(() => {
      localStorage.setItem('token', 'adminToken123');
      localStorage.setItem('role', 'admin');
    });

    await page.goto('http://localhost:3001/coupons/createCoupons.html');

    // Fill out the coupon creation form
    await page.fill('#name', 'New Year Discount');
    await page.fill('#discount', '20');
    await page.selectOption('#discountType', { label: 'Percentage' });
    await page.selectOption('#duration', { label: 'Once' });

    // Submit the form
    await page.click('button[type="submit"]');

    // Ensure success message appears
    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Coupon created successfully!.');
        await dialog.dismiss(); // or `dialog.accept();`
    });
  });

  test('Should show error for invalid discount amount', async ({ page }) => {
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', ADMIN_USER.email);
    await page.fill('#password', ADMIN_USER.password);
    await page.click('button[type="submit"]');

    await page.evaluate(() => {
      localStorage.setItem('token', 'adminToken123');
      localStorage.setItem('role', 'admin');
    });

    await page.goto('http://localhost:3001/coupons/createCoupons.html');

    // Fill out the coupon creation form with invalid discount
    await page.fill('#name', 'Invalid Discount');
    await page.fill('#discount', '-10');
    await page.selectOption('#discountType', { label: 'Percentage' });
    await page.selectOption('#duration', { label: 'Once' });

    // Submit the form
    await page.click('button[type="submit"]');

    // Ensure error message appears
    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Please enter a valid discount amount.');
        await dialog.dismiss(); // or `dialog.accept();`
    });
    
    

  });

});

test.describe('Voucher Management Page', () => {

  test.beforeEach(async ({ page }) => {
    // Simulate an admin login by setting localStorage values
    await page.goto('http://localhost:3001/login.html');
    await page.fill('#email', ADMIN_USER.email);
    await page.fill('#password', ADMIN_USER.password);
    await page.click('button[type="submit"]');

    await page.evaluate(() => {
      localStorage.setItem('token', 'adminToken123');
      localStorage.setItem('role', 'admin');
    });
    await page.goto('http://localhost:3001/coupons/getAllCoupons.html');
 
    await page.reload(); // Reload to apply stored values
  });

  // test('should display vouchers if available', async ({ page }) => {

  //   await expect(page.locator('.coupon-card')).toHaveCount(2);
  //   await expect(page.locator('.voucher-code').nth(0)).toContainText('ID: SUMMER20');
  //   await expect(page.locator('.voucher-code').nth(1)).toContainText('ID: DrPq8GuO');    
  //   await expect(page.locator('.voucher-description').nth(0)).toContainText('Name: null');
  //   await expect(page.locator('.voucher-description').nth(1)).toContainText('Name: CNY');
  //   await expect(page.locator('.voucher-duration').nth(0)).toContainText('Duration: once');
  //   await expect(page.locator('.voucher-duration').nth(1)).toContainText('Duration: once');
  //   await expect(page.locator('.voucher-discount').nth(0)).toContainText('20% Off');
  //   await expect(page.locator('.voucher-discount').nth(1)).toContainText('S$5 SGD Off');
  // });

//   test('should delete a voucher successfully', async ({ page }) => {
//     // Ensure voucher exists
//     const targetVoucher = page.locator('.coupon-card', { hasText: 'DrPq8GuO' });
    
//     await expect(targetVoucher.locator('.voucher-code')).toContainText('ID: DrPq8GuO');
//     await expect(targetVoucher.locator('.voucher-description')).toContainText('Name: CNY');
//     await expect(targetVoucher.locator('.voucher-discount')).toContainText('S$5 SGD Off');
//     await expect(targetVoucher.locator('.voucher-duration')).toContainText('Duration: once');

//     // Handle the confirmation popup before clicking delete
//     page.once('dialog', dialog => dialog.accept());

//     // Click the delete button for the specific voucher
//     await targetVoucher.locator('.delete-btn').click();

//     // Wait for the voucher to be removed from the DOM
//     await expect(targetVoucher).toBeHidden();
//     //create again in stripe website to let the test able to run mutiple time, as stripe cannot skip the existing data cannot put in seed.js
//     const couponData={
//         id: 'DrPq8GuO',
//         name: "CNY",
//         amount_off:500,
//         currency:"sgd",
//         duration:"once"
//     }
//     await stripe.coupons.create(couponData)
// });


});
