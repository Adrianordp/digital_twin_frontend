import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'tests',
    timeout: 30_000,
    expect: {
        timeout: 5000,
    },
    reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
    use: {
        baseURL: 'http://localhost:5173',
        actionTimeout: 0,
        trace: 'off',
    },
    webServer: {
        command: 'npm run dev',
        port: 5173,
        reuseExistingServer: true,
        timeout: 120_000,
    },
    projects: [
        { name: 'mobile-360x640', use: { viewport: { width: 360, height: 640 } } },
        { name: 'iphone-x', use: { viewport: { width: 375, height: 812 } } },
        { name: 'mobile-412x915', use: { viewport: { width: 412, height: 915 } } },
        { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
        { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    ],
    outputDir: 'playwright-results',
});
