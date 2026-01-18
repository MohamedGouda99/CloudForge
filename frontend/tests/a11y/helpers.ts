/**
 * Accessibility testing helpers using axe-core with Playwright
 */
import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Run axe accessibility scan on the current page
 * @param page - Playwright page object
 * @param options - Optional axe configuration
 * @returns Accessibility scan results
 */
export async function checkAccessibility(
  page: Page,
  options?: {
    includedImpacts?: ('critical' | 'serious' | 'moderate' | 'minor')[];
    excludeSelectors?: string[];
    tags?: string[];
  }
) {
  const axeBuilder = new AxeBuilder({ page });

  // Default to WCAG 2.1 AA
  axeBuilder.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);

  // Apply custom tags if provided
  if (options?.tags) {
    axeBuilder.withTags(options.tags);
  }

  // Exclude selectors if provided (e.g., third-party widgets)
  if (options?.excludeSelectors) {
    for (const selector of options.excludeSelectors) {
      axeBuilder.exclude(selector);
    }
  }

  const results = await axeBuilder.analyze();

  // Filter by impact level if specified
  let violations = results.violations;
  if (options?.includedImpacts) {
    violations = violations.filter((v) =>
      options.includedImpacts!.includes(v.impact as 'critical' | 'serious' | 'moderate' | 'minor')
    );
  }

  return {
    violations,
    passes: results.passes,
    incomplete: results.incomplete,
    inapplicable: results.inapplicable,
  };
}

/**
 * Assert that a page has no accessibility violations
 * @param page - Playwright page object
 * @param options - Optional configuration
 */
export async function expectNoAccessibilityViolations(
  page: Page,
  options?: {
    includedImpacts?: ('critical' | 'serious' | 'moderate' | 'minor')[];
    excludeSelectors?: string[];
  }
) {
  const { violations } = await checkAccessibility(page, options);

  if (violations.length > 0) {
    const violationSummary = violations
      .map((v) => {
        const nodes = v.nodes.map((n) => n.target.join(', ')).join('\n    - ');
        return `[${v.impact?.toUpperCase()}] ${v.id}: ${v.help}\n    - ${nodes}`;
      })
      .join('\n\n');

    throw new Error(`Found ${violations.length} accessibility violations:\n\n${violationSummary}`);
  }
}

/**
 * Get a summary of accessibility issues for reporting
 */
export function formatViolationReport(violations: any[]): string {
  if (violations.length === 0) {
    return 'No accessibility violations found.';
  }

  const lines = ['Accessibility Violations:', ''];

  const byImpact = {
    critical: violations.filter((v) => v.impact === 'critical'),
    serious: violations.filter((v) => v.impact === 'serious'),
    moderate: violations.filter((v) => v.impact === 'moderate'),
    minor: violations.filter((v) => v.impact === 'minor'),
  };

  for (const [impact, items] of Object.entries(byImpact)) {
    if (items.length > 0) {
      lines.push(`${impact.toUpperCase()} (${items.length}):`);
      for (const v of items) {
        lines.push(`  - ${v.id}: ${v.help}`);
        lines.push(`    Affected: ${v.nodes.length} element(s)`);
        lines.push(`    Fix: ${v.helpUrl}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}
