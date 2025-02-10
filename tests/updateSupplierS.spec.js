const { test, expect } = require("@playwright/test");

const APPLICATION_DATA = {
  suapplyId: 9,
  adminreason: "Approval for supplier",
  status: "approved",
};

test.describe("Update Supplier Application", () => {
  test("Should redirect unauthenticated users to login", async ({ page }) => {
    const NORMAL_USER = { email: "outis@gmail.com", password: "123" };
    await page.goto("http://localhost:3001/login.html");
    await page.fill("#email", NORMAL_USER.email);
    await page.fill("#password", NORMAL_USER.password);
    await page.goto("http://localhost:3001/updateSupplierS.html");
    await page.click('button[type="submit"]');

    // Check if redirected to login page when not logged in
    await expect(page).toHaveURL(/.*\/login.html/);
  });

  test("Should allow admin to access the page if logged in", async ({
    page,
  }) => {
    await page.goto("http://localhost:3001");

    // Simulate admin login
    await page.evaluate(() => {
      localStorage.setItem("token", "test-token");
      localStorage.setItem("role", "admin");
    });

    await page.goto("http://localhost:3001/updateSupplierS.html");

    // Verify navbar visibility
    await expect(page.locator("#logged-in-navbar")).toBeVisible();
  });

  test("Should show default values for suapplyId and status from URL parameters", async ({
    page,
  }) => {
    console.log(`${APPLICATION_DATA.suapplyId},${APPLICATION_DATA.status}`);
    await page.goto("http://localhost:3001");
    await page.evaluate(() => {
      localStorage.setItem("token", "test-token");
      localStorage.setItem("role", "admin");
    });
    // Ensure the URL has the correct format for query parameters
    await page.goto(
      `http://localhost:3001/updateSupplierS.html?${APPLICATION_DATA.suapplyId}/${APPLICATION_DATA.status}`
    );
  });
});

// test("Should successfully update the supplier application status", async ({
//   page,
// }) => {

//   await page.goto(
//     `http://localhost:3001/updateSupplierS.html?${String(
//       APPLICATION_DATA.suapplyId
//     )}/${APPLICATION_DATA.status}`
//   );

//   const updateForm = page.locator("#update-status-form");

//   console.log(await updateForm.isVisible());

//   const adminReasonField = page.locator("#adminreason");

//   console.log(`Filling with: ${APPLICATION_DATA.adminreason}`);

//   // Fill the admin reason field
//   await adminReasonField.fill(APPLICATION_DATA.adminreason);

//   // Submit the form
//   await updateForm.locator('button[type="submit"]').click();

//   // Add further validation or assertions as necessary
// });
