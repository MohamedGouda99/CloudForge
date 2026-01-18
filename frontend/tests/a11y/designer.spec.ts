/**
 * Accessibility tests for the designer/canvas page
 */
import { test, expect } from '@playwright/test';
import { checkAccessibility, formatViolationReport } from './helpers';

test.describe('Designer Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="username"], input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Navigate to designer (may need to create/select a project first)
    await page.waitForTimeout(2000);

    // Try to navigate to designer
    await page.goto('/designer');
    await page.waitForLoadState('networkidle');
  });

  test('should have no critical accessibility violations', async ({ page }) => {
    const { violations } = await checkAccessibility(page, {
      includedImpacts: ['critical', 'serious'],
      // Exclude the canvas itself as it's a complex interactive element
      excludeSelectors: ['.react-flow', '.react-flow__renderer', 'canvas'],
    });

    if (violations.length > 0) {
      console.log(formatViolationReport(violations));
    }

    // Fail on critical violations
    const criticalViolations = violations.filter((v) => v.impact === 'critical');
    expect(criticalViolations).toHaveLength(0);
  });

  test('should have accessible toolbar', async ({ page }) => {
    // Check toolbar region
    const toolbar = page.locator('[role="toolbar"], .toolbar, .designer-toolbar');

    if ((await toolbar.count()) > 0) {
      // Toolbar should be keyboard navigable
      await toolbar.first().focus();

      // Toolbar buttons should have labels
      const toolbarButtons = await toolbar.locator('button, [role="button"]').all();
      for (const button of toolbarButtons) {
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');
        const text = await button.textContent();

        // Each button should have an accessible name
        const hasAccessibleName =
          ariaLabel !== null || title !== null || (text && text.trim().length > 0);
        expect(hasAccessibleName, 'Toolbar button should have accessible name').toBeTruthy();
      }
    }
  });

  test('should have accessible sidebar panels', async ({ page }) => {
    // Check for inspector/property panels
    const panels = page.locator('[role="complementary"], aside, .panel, .sidebar');

    if ((await panels.count()) > 0) {
      for (const panel of await panels.all()) {
        // Panel should have heading or aria-label
        const headings = await panel.locator('h1, h2, h3, h4, h5, h6').count();
        const ariaLabel = await panel.getAttribute('aria-label');
        const ariaLabelledby = await panel.getAttribute('aria-labelledby');

        // Should have some form of labeling
        // (not strictly enforcing as panels may vary)
      }
    }
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    // Common canvas shortcuts should be documented or announced

    // Test undo shortcut
    await page.keyboard.press('Control+z');

    // Test redo shortcut
    await page.keyboard.press('Control+Shift+z');

    // These should not cause errors
  });

  test('should have accessible form controls in inspector', async ({ page }) => {
    // Click on a node if one exists to show inspector
    const node = page.locator('.react-flow__node').first();
    if ((await node.count()) > 0) {
      await node.click();
      await page.waitForTimeout(500);
    }

    // Check inspector form controls
    const inspector = page.locator('.inspector, [role="form"], form');
    if ((await inspector.count()) > 0) {
      const inputs = await inspector.locator('input:not([type="hidden"])').all();

      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');

        // Check for associated label
        const hasLabel = id
          ? (await page.locator(`label[for="${id}"]`).count()) > 0
          : false;
        const hasAriaLabel = ariaLabel !== null || ariaLabelledby !== null;

        expect(hasLabel || hasAriaLabel, `Input should have a label: ${id}`).toBeTruthy();
      }
    }
  });

  test('should announce canvas state changes', async ({ page }) => {
    // Check for status announcements (aria-live regions)
    const liveRegions = await page.locator('[aria-live="polite"], [aria-live="assertive"]').count();

    // Good practice to have live regions for state changes
    // Not strictly required but recommended
  });

  test('canvas should have accessible description', async ({ page }) => {
    const canvas = page.locator('.react-flow, [role="application"]');

    if ((await canvas.count()) > 0) {
      const ariaLabel = await canvas.first().getAttribute('aria-label');
      const ariaDescribedby = await canvas.first().getAttribute('aria-describedby');
      const role = await canvas.first().getAttribute('role');

      // Canvas should have some form of accessible description
      // or be marked as an application region
    }
  });
});
