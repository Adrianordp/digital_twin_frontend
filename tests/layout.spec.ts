import { test, expect } from '@playwright/test';

test('header and main render across configured viewports', async ({ page }, testInfo) => {
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    const navItems = page.locator('header nav ul li');
    await expect(navItems).toHaveCount(4);

    // Check that both main sections are visible
    const modelSection = page.locator('#model');
    await expect(modelSection).toBeVisible();

    const simulationSection = page.locator('#simulation');
    await expect(simulationSection).toBeVisible();

    // Check that the ModelSelector is rendered
    const modelSelector = page.locator('fieldset legend:has-text("Choose a model")');
    await expect(modelSelector).toBeVisible();

    // take a screenshot named after the current project (viewport)
    await page.screenshot({ path: `playwright-results/${testInfo.project.name}.png`, fullPage: false });
});
