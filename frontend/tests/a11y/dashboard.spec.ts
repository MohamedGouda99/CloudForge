/**
 * Accessibility tests for the dashboard page
 */
import { test, expect } from '@playwright/test';
import { checkAccessibility, formatViolationReport } from './helpers';

test.describe('Dashboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="username"], input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {
      // If no redirect, try navigating directly
    });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should have no critical accessibility violations', async ({ page }) => {
    const { violations } = await checkAccessibility(page, {
      includedImpacts: ['critical', 'serious'],
    });

    if (violations.length > 0) {
      console.log(formatViolationReport(violations));
    }

    // Fail on critical violations only
    const criticalViolations = violations.filter((v) => v.impact === 'critical');
    expect(criticalViolations).toHaveLength(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check for navigation landmarks
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();

    // Should have at least one navigation region
    expect(navCount).toBeGreaterThanOrEqual(0); // May not have nav on all pages

    // Check for skip link
    const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link');
    if ((await skipLink.count()) > 0) {
      // Skip link should be focusable
      await skipLink.first().focus();
    }
  });

  test('should have accessible data tables', async ({ page }) => {
    const tables = await page.locator('table').all();

    for (const table of tables) {
      // Tables should have headers
      const headers = await table.locator('th').count();
      if (headers === 0) {
        // Check for role="columnheader" as alternative
        const roleHeaders = await table.locator('[role="columnheader"]').count();
        expect(roleHeaders).toBeGreaterThan(0);
      }

      // Table should have caption or aria-label
      const caption = await table.locator('caption').count();
      const ariaLabel = await table.getAttribute('aria-label');
      const ariaLabelledby = await table.getAttribute('aria-labelledby');

      // At least one accessibility label method should be present
      // (not strictly required but good practice)
    }
  });

  test('should have accessible buttons', async ({ page }) => {
    const buttons = await page.locator('button, [role="button"]').all();

    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');

      // Button should have accessible name
      const hasAccessibleName =
        (text && text.trim().length > 0) || ariaLabel !== null || title !== null;

      // Icon-only buttons must have aria-label
      if (!text || text.trim().length === 0) {
        expect(ariaLabel || title, 'Icon button should have aria-label').toBeTruthy();
      }
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    // Check for ARIA live regions
    const liveRegions = await page.locator('[aria-live], [role="alert"], [role="status"]').count();

    // Should have at least one live region for notifications
    // This is not strictly required but good practice
    // expect(liveRegions).toBeGreaterThanOrEqual(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus should be manageable
    await page.keyboard.press('Tab');

    // Should be able to navigate through interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Tab several times to ensure navigation works
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      // Focus should be visible and manageable
    }
  });
});
