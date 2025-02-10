const { test, expect } = require("@playwright/test");

const baseUrl = "http://localhost:3001";

test.describe("Delivery Process", () => {
  test.beforeEach(async ({ page }) => {
    const NORMAL_USER = { email: "ishmael@gmail.com", password: "123" };

    // Log in
    await page.goto(`${baseUrl}/login.html`);
    await page.fill("#email", NORMAL_USER.email);
    await page.fill("#password", NORMAL_USER.password);
    await page.click('button[type="submit"]');

    // Ensure login is successful
    await page.waitForURL(`${baseUrl}/index.html`);
  });

  test("Display correct collection point in order based on postal code", async ({
    page,
  }) => {
    // Navigate to delivery form page
    await page.goto(`${baseUrl}/delivery/deliveryChoice.html`);

    // Fill in required fields
    await page.fill("#name", "John Doe");
    await page.fill("#address", "123 Test Street");
    await page.fill("#unit", "#06-244");
    await page.fill("#postal-code", "248646");
    await page.fill("#phone-number", "98765432");

    // Wait for the radio buttons to appear
    await page.waitForSelector(".radio-group", { state: "visible" });

    // Select 'Pick Up at Collection Points'
    await page.click("#pickup-option");

    // Wait for the collection points dropdown to load
    await page.waitForSelector("#pickup-location-group", { state: "visible" });

    // Verify the first collection point is correct
    const firstOption = await page.$eval(
      "#pickup-location option:first-child",
      (el) => el.textContent.trim()
    );
    expect(firstOption).toContain(
      "Happiness Printing Store, 304 Orchard Road, #04-20, 238863 - 0.6 km"
    );

    // Change the postal code
    await page.fill("#postal-code", "120410"); // Different postal code
    await page.waitForTimeout(1000); // Wait for the collection points to update

    // Verify that the radio selection is reset
    const isPickupChecked = await page.$eval(
      "#pickup-option",
      (el) => el.checked
    );
    expect(isPickupChecked).toBeFalsy();
  });

  test("Check the orders by tracking number", async ({ page }) => {
    // Navigate to profile page
    await page.goto(`${baseUrl}/profile/profile.html`);

    // Click the Track Orders button
    // Wait for the button to be visible
    await page.waitForSelector("#track-orders-btn", { state: "visible" });
    await page.click("#track-orders-btn");

    // Wait for modal to be fully visible
    await page.waitForFunction(() => {
      const modal = document.querySelector("#tracking-modal");
      if (!modal) return false;
      const style = window.getComputedStyle(modal);
      return style.display === "block" && style.visibility !== "hidden";
    });

    // Confirm modal is visible
    await expect(page.locator("#tracking-modal")).toBeVisible();

    // Fill in the tracking number
    await page.fill("#tracking-number", "L000000");

    // Click the Track button
    await page.click("#track-btn");

    // Wait for the tracking info to update
    await page.waitForSelector("#tracking-info p", { state: "visible" });
    const trackingMessage = await page.textContent("#tracking-info p");
    expect(trackingMessage).toContain("Invalid Tracking Number!");
  });
});
