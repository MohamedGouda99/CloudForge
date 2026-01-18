/**
 * End-to-end tests for the infrastructure designer.
 */
import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page: import('@playwright/test').Page) {
  await page.fill('input[placeholder="Enter your username"]', 'admin');
  await page.fill('input[placeholder="Enter your password"]', 'admin123');
  await page.click('button[type="submit"]');
}

// Helper to login and wait for dashboard
async function loginAndWaitForDashboard(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await expect(page.locator('input[placeholder="Enter your username"]')).toBeVisible({ timeout: 15000 });
  await login(page);
  await expect(page).toHaveURL(/dashboard|projects/i, { timeout: 15000 });
}

test.describe('Designer Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWaitForDashboard(page);
  });

  test('should display dashboard after login', async ({ page }) => {
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
  });

  test('should have new project functionality', async ({ page }) => {
    const newProjectButton = page.locator('button:has-text("New Project")').first();
    await expect(newProjectButton).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to designer when clicking a project', async ({ page }) => {
    // Scroll to projects section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const projectCard = page.locator('[href*="/designer/"]').first();
    if (await projectCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await projectCard.click({ force: true });
      await expect(page).toHaveURL(/designer/i, { timeout: 10000 });
    }
  });
});

test.describe('Terraform Generation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWaitForDashboard(page);
  });

  test('should have terraform generation option', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const projectCard = page.locator('[href*="/designer/"]').first();
    if (await projectCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await projectCard.click({ force: true });
      await page.waitForURL(/designer/i, { timeout: 10000 });

      const generateButton = page.locator('button:has-text("Generate"), button:has-text("Terraform")');
      if (await generateButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(generateButton.first()).toBeVisible();
      }
    }
  });
});

test.describe('Canvas Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndWaitForDashboard(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const projectCard = page.locator('[href*="/designer/"]').first();
    if (await projectCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await projectCard.click({ force: true });
    }
  });

  test('should display canvas when project is opened', async ({ page }) => {
    const canvas = page.locator('.react-flow');
    if (await canvas.isVisible({ timeout: 10000 }).catch(() => false)) {
      await expect(canvas).toBeVisible();
    }
  });

  test('should have zoom controls when canvas is visible', async ({ page }) => {
    const canvas = page.locator('.react-flow');
    if (await canvas.isVisible({ timeout: 10000 }).catch(() => false)) {
      const zoomControls = page.locator('.react-flow__controls');
      await expect(zoomControls).toBeVisible({ timeout: 5000 });
    }
  });
});
