const { test, expect } = require('@playwright/test');

const baseUrl = 'http://localhost:3001';

test.describe('Profile Update with Password Verification', () => {

    test('Update email', async ({ page }) => {
        const USERS = [
            { email: 'yisang@gmail.com', password: '123', newEmail: 'lily@gmail.com' },
            { email: 'lily@gmail.com', password: '123', newEmail: 'yisang@gmail.com' }
        ];

        let loggedInUser = null;

        for (const user of USERS) {
            await page.goto(`${baseUrl}/login.html`);
            await page.fill('#email', user.email);
            await page.fill('#password', user.password);
            await page.click('button[type="submit"]');

            try {
                await page.waitForURL(`${baseUrl}/index.html`, { timeout: 6000 });
                loggedInUser = user;
                break; // Exit loop if login is successful
            } catch (error) {
                console.log(`Login failed for ${user.email}, retrying...`);
            }
        }

        if (!loggedInUser) throw new Error('All login attempts failed');

        console.log(`Logged in as: ${loggedInUser.email}`);

        // Navigate to profile page
        await page.goto(`${baseUrl}/profile/profile.html`);

        // Click update button
        await page.click('.update-btn[data-field="email"]');

        // Password prompt
        await page.waitForSelector('#password-prompt-box', { state: 'visible' });
        await page.fill('#password-input', '123');
        await page.click('#password-submit-btn');

        // Ensure update box appears
        await page.waitForSelector('#update-box', { state: 'visible' });

        // Update email & save
        await page.fill('#update-value', loggedInUser.newEmail);
        await page.click('#save-btn');

        // Wait for API response & ensure update is successful
        await page.waitForResponse(response =>
            response.url().includes('/profile/email/update') && response.status() === 200
        );

        // Wait for UI update & verify
        await page.waitForFunction(
            email => document.querySelector('#email')?.textContent === email,
            loggedInUser.newEmail
        );

        expect(await page.textContent('#email')).toBe(loggedInUser.newEmail);
    });

test('Update username', async ({ page }) => {

    // Login credentials for username update
    const USERNAME_USER = { email: 'faust@gmail.com', password: '123' };

    // Log in with credentials
    await page.goto(`${baseUrl}/login.html`);
    await page.fill('#email', USERNAME_USER.email);
    await page.fill('#password', USERNAME_USER.password);
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(`${baseUrl}/index.html`);

    // Navigate to profile page
    await page.goto(`${baseUrl}/profile/profile.html`);

    // Check if userId is correct
    const userId = await page.evaluate(() => localStorage.getItem('userId'));
    expect(userId).not.toBeNull();
    expect(userId).toBe('2');

    // Click the update button for the username field
    await page.click('.update-btn[data-field="username"]');

    // Wait for the password prompt box to be visible
    await page.waitForSelector('#password-prompt-box', { state: 'visible' });

    // Enter password and submit
    await page.fill('#password-input', '123');
    await page.click('#password-submit-btn');

    // Ensure password verification succeeds
    const isPasswordVerified = await page.evaluate(() => {
        return !document.querySelector('.password-error-message');
    });
    expect(isPasswordVerified).toBe(true);

    // Wait for the update box to appear
    await page.waitForSelector('#update-box', { state: 'visible' });

    // Update username value and save
    await page.fill('#update-value', 'lily');
    await page.click('#save-btn');

    // Verify username update in UI
    const updatedUsername = await page.textContent('#username');
    expect(updatedUsername).toBe('lily');
});

test('Update password', async ({ page }) => {


    // Login credentials for password update
    const PASSWORD_USER = { email: 'qx@gmail.com', password: '123' };

    // Log in with credentials
    await page.goto(`${baseUrl}/login.html`);
    await page.fill('#email', PASSWORD_USER.email);
    await page.fill('#password', PASSWORD_USER.password);
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(`${baseUrl}/index.html`);

    // Navigate to profile page
    await page.goto(`${baseUrl}/profile/profile.html`);

    // Check if userId is correct
    const userId = await page.evaluate(() => localStorage.getItem('userId'));
    expect(userId).not.toBeNull();
    expect(userId).toBe('3');

    // Click the update button for the password field
    await page.click('.update-btn[data-field="password"]');

    // Wait for the password prompt box to be visible
    await page.waitForSelector('#password-prompt-box', { state: 'visible' });

    // Enter old password and submit
    await page.fill('#password-input', '123');
    await page.click('#password-submit-btn');

    // Ensure password verification succeeds
    const isPasswordVerified = await page.evaluate(() => {
        return !document.querySelector('.password-error-message');
    });
    expect(isPasswordVerified).toBe(true);

    // Wait for the update box to appear
    await page.waitForSelector('#update-box', { state: 'visible' });

    // Enter the new password
    await page.fill('#update-value', '123');

    // Listen for the alert dialog after the save button is clicked
    page.on('dialog', async dialog => {
        console.log(dialog.message());
        expect(dialog.message()).toBe('Successfully Updated!!');
        await dialog.accept();
    });

    // Click the Save button
    await page.click('#save-btn');

    // Wait for the alert to appear
    await page.waitForTimeout(2000);
});

});
