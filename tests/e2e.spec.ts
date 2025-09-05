import { test, expect } from '@playwright/test';

test('init simulation and persist across reload', async ({ page }) => {
    // Intercept init call
    await page.route('**/simulate/init', async (route) => {
        const request = route.request();
        await request.postDataJSON();
        // simple response with session id
        await route.fulfill({ status: 200, body: JSON.stringify({ session_id: 'session-e2e-1' }) });
    });

    await page.goto('/');

    // Select model (already default)
    await page.fill('input[placeholder="Leave empty to use advanced JSON"]', '5');
    await page.click('button:has-text("Initialize Simulation")');

    // Wait for session text (exact match)
    await expect(page.locator('text="Session: session-e2e-1"')).toBeVisible();

    // Reload and expect persistence (exact match)
    await page.reload();
    await expect(page.locator('text="Active session: session-e2e-1"')).toBeVisible();
});
