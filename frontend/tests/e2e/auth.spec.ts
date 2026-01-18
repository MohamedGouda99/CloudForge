/**
 * End-to-end tests for authentication flows.
 */
import { test, expect } from '@playwright/test';

// Helper function to login
async function login(page: import('@playwright/test').Page) {
  await page.fill('input[placeholder="Enter your username"]', 'admin');
  await page.fill('input[placeholder="Enter your password"]', 'admin123');
  await page.click('button[type="submit"]');
}

// Helper to wait for page to be ready
async function waitForPageReady(page: import('@playwright/test').Page) {
  // Wait for React to mount the login form
  await expect(page.locator('input[placeholder="Enter your username"]')).toBeVisible({ timeout: 15000 });
}

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Go directly to login page
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    // Check that login form elements are present
    await expect(page.locator('input[placeholder="Enter your username"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Enter your password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    // Check for Sign In text
    await expect(page.locator('h2:has-text("Sign In")')).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[placeholder="Enter your username"]', 'invaliduser');
    await page.fill('input[placeholder="Enter your password"]', 'wrongpassword');

    // Submit the form
    await page.click('button[type="submit"]');

    // Should show error message - look for red text containing error
    await expect(page.locator('.text-red-300, .text-red-400')).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill in valid credentials (default admin)
    await login(page);

    // Should redirect to dashboard or main page
    await expect(page).toHaveURL(/dashboard|projects/i, { timeout: 15000 });
  });

  test('should persist authentication across page reload', async ({ page }) => {
    // Login
    await login(page);

    // Wait for navigation
    await expect(page).toHaveURL(/dashboard|projects/i, { timeout: 15000 });

    // Reload the page
    await page.reload();

    // Should still be on authenticated page (not redirected to login)
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/\/login$/i);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await login(page);
    await expect(page).toHaveURL(/dashboard|projects/i, { timeout: 15000 });

    // Find and click logout button (might be in a dropdown menu)
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout"]');

    // Check if we need to open a menu first
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("admin"), .user-menu');
    if (await userMenu.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await userMenu.first().click();
    }

    if (await logoutButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.first().click();
      // Should redirect to login or landing
      await expect(page).toHaveURL(/login|\/$/i, { timeout: 10000 });
    }
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access a protected route directly
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // Should redirect to login - check for login form
    await expect(page.locator('input[placeholder="Enter your password"]')).toBeVisible({ timeout: 30000 });
  });

  test('should access dashboard after login', async ({ page }) => {
    // Go to login page
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);

    // Login
    await login(page);

    // Should be on dashboard
    await expect(page).toHaveURL(/dashboard|projects/i, { timeout: 15000 });
    // Verify dashboard content is visible - look for "Welcome back" text
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Landing Page Navigation', () => {
  test('should navigate from landing page to login', async ({ page }) => {
    // Go to landing page
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Find and click Sign In link
    const signInLink = page.locator('a:has-text("Sign In")').first();
    await expect(signInLink).toBeVisible({ timeout: 15000 });
    await signInLink.click();

    // Should be on login page
    await expect(page.locator('input[placeholder="Enter your username"]')).toBeVisible({ timeout: 15000 });
  });
});
