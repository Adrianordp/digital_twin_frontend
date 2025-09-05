import { test, expect } from '@playwright/test';

test('init simulation and persist across reload', async ({ page }) => {
    await page.route('**/simulate/init', async (route) => {
        const request = route.request();
        await request.postDataJSON();
        await route.fulfill({ status: 200, body: JSON.stringify({ session_id: 'session-e2e-1' }) });
    });

    await page.goto('/');

    await page.fill('[data-testid="initial-input"]', '5');
    await page.click('[data-testid="init-button"]');

    await expect(page.locator('text="Session: session-e2e-1"')).toBeVisible();

    await page.reload();
    await expect(page.locator('text="Active session: session-e2e-1"')).toBeVisible();
});
