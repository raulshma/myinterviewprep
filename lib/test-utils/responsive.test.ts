/**
 * Tests for responsive test utilities
 */

import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  BREAKPOINTS,
  MOBILE_VIEWPORT,
  MIN_TOUCH_TARGET,
  MIN_FONT_SIZES,
  mobileViewportWidthArb,
  tabletViewportWidthArb,
  desktopViewportWidthArb,
  commonMobileWidthsArb,
  mobileViewportArb,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  meetsMinTouchTarget,
  meetsMinFontSize,
  hasHorizontalOverflow,
  parsePxValue,
  getBreakpoint,
  simulateViewport,
  assertTouchTargetCompliance,
  assertNoHorizontalOverflow,
  assertFontSizeCompliance,
} from './responsive';

describe('Responsive Test Utilities', () => {
  describe('Constants', () => {
    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.sm).toBe(640);
      expect(BREAKPOINTS.md).toBe(768);
      expect(BREAKPOINTS.lg).toBe(1024);
      expect(BREAKPOINTS.xl).toBe(1280);
    });

    it('should have correct mobile viewport range', () => {
      expect(MOBILE_VIEWPORT.min).toBe(320);
      expect(MOBILE_VIEWPORT.max).toBe(767);
    });

    it('should have correct minimum touch target', () => {
      expect(MIN_TOUCH_TARGET).toBe(44);
    });

    it('should have correct minimum font sizes', () => {
      expect(MIN_FONT_SIZES.body).toBe(14);
      expect(MIN_FONT_SIZES.caption).toBe(12);
    });
  });

  describe('Viewport Classification', () => {
    it('should correctly identify mobile viewports', () => {
      expect(isMobileViewport(320)).toBe(true);
      expect(isMobileViewport(767)).toBe(true);
      expect(isMobileViewport(768)).toBe(false);
    });

    it('should correctly identify tablet viewports', () => {
      expect(isTabletViewport(768)).toBe(true);
      expect(isTabletViewport(1023)).toBe(true);
      expect(isTabletViewport(767)).toBe(false);
      expect(isTabletViewport(1024)).toBe(false);
    });

    it('should correctly identify desktop viewports', () => {
      expect(isDesktopViewport(1024)).toBe(true);
      expect(isDesktopViewport(1920)).toBe(true);
      expect(isDesktopViewport(1023)).toBe(false);
    });
  });

  describe('Touch Target Validation', () => {
    it('should pass for elements meeting minimum size', () => {
      expect(meetsMinTouchTarget({ width: 44, height: 44, offsetWidth: 44, offsetHeight: 44 })).toBe(true);
      expect(meetsMinTouchTarget({ width: 100, height: 50, offsetWidth: 100, offsetHeight: 50 })).toBe(true);
    });

    it('should fail for elements below minimum size', () => {
      expect(meetsMinTouchTarget({ width: 43, height: 44, offsetWidth: 43, offsetHeight: 44 })).toBe(false);
      expect(meetsMinTouchTarget({ width: 44, height: 43, offsetWidth: 44, offsetHeight: 43 })).toBe(false);
      expect(meetsMinTouchTarget({ width: 30, height: 30, offsetWidth: 30, offsetHeight: 30 })).toBe(false);
    });
  });

  describe('Font Size Validation', () => {
    it('should pass for body text meeting minimum size', () => {
      expect(meetsMinFontSize(14, 'body')).toBe(true);
      expect(meetsMinFontSize(16, 'body')).toBe(true);
    });

    it('should fail for body text below minimum size', () => {
      expect(meetsMinFontSize(13, 'body')).toBe(false);
      expect(meetsMinFontSize(12, 'body')).toBe(false);
    });

    it('should pass for caption text meeting minimum size', () => {
      expect(meetsMinFontSize(12, 'caption')).toBe(true);
      expect(meetsMinFontSize(14, 'caption')).toBe(true);
    });

    it('should fail for caption text below minimum size', () => {
      expect(meetsMinFontSize(11, 'caption')).toBe(false);
      expect(meetsMinFontSize(10, 'caption')).toBe(false);
    });
  });

  describe('Horizontal Overflow Detection', () => {
    it('should detect overflow when scroll width exceeds viewport', () => {
      expect(hasHorizontalOverflow(800, 375)).toBe(true);
      expect(hasHorizontalOverflow(400, 320)).toBe(true);
    });

    it('should not detect overflow when scroll width fits viewport', () => {
      expect(hasHorizontalOverflow(375, 375)).toBe(false);
      expect(hasHorizontalOverflow(300, 375)).toBe(false);
    });
  });

  describe('parsePxValue', () => {
    it('should parse pixel values correctly', () => {
      expect(parsePxValue('14px')).toBe(14);
      expect(parsePxValue('16.5px')).toBe(16.5);
      expect(parsePxValue('14')).toBe(14);
    });

    it('should return 0 for invalid values', () => {
      expect(parsePxValue('invalid')).toBe(0);
      expect(parsePxValue('1em')).toBe(0);
      expect(parsePxValue('')).toBe(0);
    });
  });

  describe('getBreakpoint', () => {
    it('should return correct breakpoint for viewport width', () => {
      expect(getBreakpoint(320)).toBe('base');
      expect(getBreakpoint(639)).toBe('base');
      expect(getBreakpoint(640)).toBe('sm');
      expect(getBreakpoint(767)).toBe('sm');
      expect(getBreakpoint(768)).toBe('md');
      expect(getBreakpoint(1023)).toBe('md');
      expect(getBreakpoint(1024)).toBe('lg');
      expect(getBreakpoint(1279)).toBe('lg');
      expect(getBreakpoint(1280)).toBe('xl');
      expect(getBreakpoint(1535)).toBe('xl');
      expect(getBreakpoint(1536)).toBe('2xl');
    });
  });

  describe('Viewport Simulation', () => {
    let cleanup: (() => void) | null = null;

    afterEach(() => {
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    });

    it('should simulate viewport dimensions', () => {
      cleanup = simulateViewport({ width: 375, height: 667 });
      expect(globalThis.innerWidth).toBe(375);
      expect(globalThis.innerHeight).toBe(667);
    });

    it('should simulate matchMedia for max-width queries', () => {
      cleanup = simulateViewport({ width: 375, height: 667 });
      const mql = globalThis.matchMedia('(max-width: 767px)');
      expect(mql.matches).toBe(true);

      const mql2 = globalThis.matchMedia('(max-width: 320px)');
      expect(mql2.matches).toBe(false);
    });

    it('should simulate matchMedia for min-width queries', () => {
      cleanup = simulateViewport({ width: 1024, height: 768 });
      const mql = globalThis.matchMedia('(min-width: 768px)');
      expect(mql.matches).toBe(true);

      const mql2 = globalThis.matchMedia('(min-width: 1280px)');
      expect(mql2.matches).toBe(false);
    });
  });

  describe('Assertion Helpers', () => {
    it('assertTouchTargetCompliance should identify violations', () => {
      const elements = [
        { width: 44, height: 44, offsetWidth: 44, offsetHeight: 44 },
        { width: 30, height: 30, offsetWidth: 30, offsetHeight: 30 },
        { width: 50, height: 50, offsetWidth: 50, offsetHeight: 50 },
      ];

      const result = assertTouchTargetCompliance(elements);
      expect(result.compliant).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].width).toBe(30);
    });

    it('assertNoHorizontalOverflow should calculate overflow', () => {
      const result1 = assertNoHorizontalOverflow(800, 375);
      expect(result1.compliant).toBe(false);
      expect(result1.overflow).toBe(425);

      const result2 = assertNoHorizontalOverflow(375, 375);
      expect(result2.compliant).toBe(true);
      expect(result2.overflow).toBe(0);
    });

    it('assertFontSizeCompliance should identify violations', () => {
      const fontSizes = [
        { size: 16, type: 'body' as const },
        { size: 12, type: 'body' as const },
        { size: 10, type: 'caption' as const },
      ];

      const result = assertFontSizeCompliance(fontSizes);
      expect(result.compliant).toBe(false);
      expect(result.violations).toHaveLength(2);
    });
  });

  describe('Fast-check Generators', () => {
    it('mobileViewportWidthArb should generate values in mobile range', () => {
      fc.assert(
        fc.property(mobileViewportWidthArb, (width) => {
          return width >= 320 && width <= 767;
        }),
        { numRuns: 100 }
      );
    });

    it('tabletViewportWidthArb should generate values in tablet range', () => {
      fc.assert(
        fc.property(tabletViewportWidthArb, (width) => {
          return width >= 768 && width <= 1023;
        }),
        { numRuns: 100 }
      );
    });

    it('desktopViewportWidthArb should generate values in desktop range', () => {
      fc.assert(
        fc.property(desktopViewportWidthArb, (width) => {
          return width >= 1024 && width <= 1920;
        }),
        { numRuns: 100 }
      );
    });

    it('commonMobileWidthsArb should generate common device widths', () => {
      const commonWidths = [320, 375, 390, 414, 428, 360, 412];
      fc.assert(
        fc.property(commonMobileWidthsArb, (width) => {
          return commonWidths.includes(width);
        }),
        { numRuns: 100 }
      );
    });

    it('mobileViewportArb should generate valid viewport dimensions', () => {
      fc.assert(
        fc.property(mobileViewportArb, (viewport) => {
          return (
            viewport.width >= 320 &&
            viewport.width <= 767 &&
            viewport.height >= 568 &&
            viewport.height <= 926
          );
        }),
        { numRuns: 100 }
      );
    });
  });
});
