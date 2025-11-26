/**
 * Responsive Test Utilities
 *
 * Provides viewport simulation helpers and fast-check generators
 * for testing mobile responsiveness properties.
 *
 * @module lib/test-utils/responsive
 */

import * as fc from 'fast-check';

// Tailwind CSS breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Mobile viewport range (320px to 767px)
export const MOBILE_VIEWPORT = {
  min: 320,
  max: BREAKPOINTS.md - 1, // 767px
} as const;

// Minimum touch target size per WCAG guidelines
export const MIN_TOUCH_TARGET = 44;

// Minimum readable font sizes
export const MIN_FONT_SIZES = {
  body: 14,
  caption: 12,
} as const;

/**
 * Viewport dimensions type
 */
export interface ViewportDimensions {
  width: number;
  height: number;
}

/**
 * Element dimensions type for touch target testing
 */
export interface ElementDimensions {
  width: number;
  height: number;
  offsetWidth: number;
  offsetHeight: number;
}

/**
 * Fast-check generator for mobile viewport widths (320-767px)
 */
export const mobileViewportWidthArb = fc.integer({
  min: MOBILE_VIEWPORT.min,
  max: MOBILE_VIEWPORT.max,
});

/**
 * Fast-check generator for tablet viewport widths (768-1023px)
 */
export const tabletViewportWidthArb = fc.integer({
  min: BREAKPOINTS.md,
  max: BREAKPOINTS.lg - 1,
});

/**
 * Fast-check generator for desktop viewport widths (1024-1920px)
 */
export const desktopViewportWidthArb = fc.integer({
  min: BREAKPOINTS.lg,
  max: 1920,
});

/**
 * Fast-check generator for common mobile device widths
 */
export const commonMobileWidthsArb = fc.constantFrom(
  320,  // Small mobile (iPhone SE)
  375,  // iPhone 6/7/8/X
  390,  // iPhone 12/13/14
  414,  // iPhone 6/7/8 Plus
  428,  // iPhone 12/13/14 Pro Max
  360,  // Samsung Galaxy S series
  412,  // Pixel phones
);

/**
 * Fast-check generator for viewport dimensions (width and height)
 */
export const mobileViewportArb = fc.record({
  width: mobileViewportWidthArb,
  height: fc.integer({ min: 568, max: 926 }), // Common mobile heights
});

/**
 * Checks if a viewport width is considered mobile
 */
export function isMobileViewport(width: number): boolean {
  return width < BREAKPOINTS.md;
}

/**
 * Checks if a viewport width is considered tablet
 */
export function isTabletViewport(width: number): boolean {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

/**
 * Checks if a viewport width is considered desktop
 */
export function isDesktopViewport(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}

/**
 * Checks if element dimensions meet minimum touch target requirements
 */
export function meetsMinTouchTarget(dimensions: ElementDimensions): boolean {
  const width = dimensions.offsetWidth || dimensions.width;
  const height = dimensions.offsetHeight || dimensions.height;
  return width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;
}

/**
 * Checks if a font size meets minimum readability requirements
 */
export function meetsMinFontSize(
  fontSize: number,
  type: 'body' | 'caption' = 'body'
): boolean {
  return fontSize >= MIN_FONT_SIZES[type];
}

/**
 * Checks if there is horizontal overflow (unwanted horizontal scrolling)
 */
export function hasHorizontalOverflow(
  scrollWidth: number,
  viewportWidth: number
): boolean {
  return scrollWidth > viewportWidth;
}

/**
 * Parses a CSS pixel value string to a number
 * @example parsePxValue('14px') => 14
 */
export function parsePxValue(value: string): number {
  const match = value.match(/^(\d+(?:\.\d+)?)(px)?$/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Gets the Tailwind breakpoint for a given viewport width
 */
export function getBreakpoint(
  width: number
): 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'base';
}

/**
 * Creates a mock window object for viewport simulation in tests
 */
export function createMockWindow(dimensions: ViewportDimensions) {
  return {
    innerWidth: dimensions.width,
    innerHeight: dimensions.height,
    matchMedia: (query: string) => {
      // Parse common media queries
      const maxWidthMatch = query.match(/\(max-width:\s*(\d+)px\)/);
      const minWidthMatch = query.match(/\(min-width:\s*(\d+)px\)/);

      let matches = false;
      if (maxWidthMatch) {
        matches = dimensions.width <= parseInt(maxWidthMatch[1], 10);
      } else if (minWidthMatch) {
        matches = dimensions.width >= parseInt(minWidthMatch[1], 10);
      }

      return {
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      };
    },
  };
}

/**
 * Simulates setting viewport dimensions for testing
 * Returns a cleanup function to restore original values
 */
export function simulateViewport(dimensions: ViewportDimensions): () => void {
  const originalInnerWidth = globalThis.innerWidth;
  const originalInnerHeight = globalThis.innerHeight;
  const originalMatchMedia = globalThis.matchMedia;

  const mockWindow = createMockWindow(dimensions);

  Object.defineProperty(globalThis, 'innerWidth', {
    value: mockWindow.innerWidth,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, 'innerHeight', {
    value: mockWindow.innerHeight,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, 'matchMedia', {
    value: mockWindow.matchMedia,
    writable: true,
    configurable: true,
  });

  // Return cleanup function
  return () => {
    Object.defineProperty(globalThis, 'innerWidth', {
      value: originalInnerWidth,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'innerHeight', {
      value: originalInnerHeight,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'matchMedia', {
      value: originalMatchMedia,
      writable: true,
      configurable: true,
    });
  };
}

/**
 * Test helper to assert touch target compliance
 */
export function assertTouchTargetCompliance(
  elements: ElementDimensions[]
): { compliant: boolean; violations: ElementDimensions[] } {
  const violations = elements.filter((el) => !meetsMinTouchTarget(el));
  return {
    compliant: violations.length === 0,
    violations,
  };
}

/**
 * Test helper to assert no horizontal overflow
 */
export function assertNoHorizontalOverflow(
  scrollWidth: number,
  viewportWidth: number
): { compliant: boolean; overflow: number } {
  const overflow = Math.max(0, scrollWidth - viewportWidth);
  return {
    compliant: overflow === 0,
    overflow,
  };
}

/**
 * Test helper to assert minimum font size compliance
 */
export function assertFontSizeCompliance(
  fontSizes: Array<{ size: number; type: 'body' | 'caption' }>
): { compliant: boolean; violations: Array<{ size: number; type: 'body' | 'caption'; minRequired: number }> } {
  const violations = fontSizes
    .filter((item) => !meetsMinFontSize(item.size, item.type))
    .map((item) => ({
      ...item,
      minRequired: MIN_FONT_SIZES[item.type],
    }));

  return {
    compliant: violations.length === 0,
    violations,
  };
}
