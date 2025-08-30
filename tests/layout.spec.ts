import { test, expect } from '@playwright/test';

test('header and main render across configured viewports', async ({ page }, testInfo) => {
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    const navItems = page.locator('header nav ul li');
    await expect(navItems).toHaveCount(4);

    const card = page.locator('main div.max-w-3xl');
    await expect(card).toBeVisible();

    // take a screenshot named after the current project (viewport)
    await page.screenshot({ path: `playwright-results/${testInfo.project.name}.png`, fullPage: false });
});
