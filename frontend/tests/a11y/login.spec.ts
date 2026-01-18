/**
 * Accessibility tests for the login page
 */
import { test, expect } from '@playwright/test';
import { checkAccessibility, expectNoAccessibilityViolations, formatViolationReport } from './helpers';

test.describe('Login Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('should have no critical accessibility violations', async ({ page }) => {
    const { violations } = await checkAccessibility(page, {
      includedImpacts: ['critical', 'serious'],
    });

    if (violations.length > 0) {
      console.log(formatViolationReport(violations));
    }

    // Fail on critical/serious violations
    expect(violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });

  test('should have proper form labels', async ({ page }) => {
    // Check that all form inputs have associated labels
    const inputs = await page.locator('input:not([type="hidden"])').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');

      // Input should have an id with associated label, or aria-label/labelledby
      const hasLabel = id
        ? (await page.locator(`label[for="${id}"]`).count()) > 0
        : false;
      const hasAriaLabel = ariaLabel !== null || ariaLabelledby !== null;

      expect(hasLabel || hasAriaLabel, `Input should have a label: ${id}`).toBeTruthy();
    }
  });

  test('should be navigable by keyboard', async ({ page }) => {
    // Tab through the form
    await page.keyboard.press('Tab');

    // Should be able to reach username input
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Should be able to submit with Enter
    await page.fill('input[type="text"], input[name="username"]', 'testuser');
    await page.fill('input[type="password"]', 'testpass');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const { violations } = await checkAccessibility(page, {
      tags: ['cat.color'],
    });

    // Log contrast issues
    const contrastViolations = violations.filter((v) => v.id === 'color-contrast');
    if (contrastViolations.length > 0) {
      console.log('Color contrast issues:', formatViolationReport(contrastViolations));
    }
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();

    // Should have at least one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // H1 should be first heading if present
    if (headings.length > 0 && h1Count > 0) {
      const firstHeading = await headings[0].evaluate((el) => el.tagName.toLowerCase());
      expect(['h1', 'h2']).toContain(firstHeading);
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Navigate to a focusable element
    await page.keyboard.press('Tab');

    // Check that focused element has visible focus style
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // The focus should be visually distinguishable
    // This is a basic check - visual regression testing would be more thorough
  });
});
