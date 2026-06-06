import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  getLuminance,
  getContrastRatio,
  getContrastResult,
} from './color';
import type { ContrastResult } from '@/types';

function adjustLightness(hex: string, targetL: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const newHsl = { ...hsl, l: Math.max(0, Math.min(100, targetL)) };
  const newRgb = hslToRgb(newHsl);
  return rgbToHex(newRgb);
}

function getLightnessFromHex(hex: string): number {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  return hsl.l;
}

export function suggestForegroundColor(
  fgHex: string,
  bgHex: string,
  targetRatio: number = 4.5
): { hex: string; ratio: number; result: ContrastResult } | null {
  const bgLum = getLuminance(hexToRgb(bgHex));
  const fgLum = getLuminance(hexToRgb(fgHex));
  const currentRatio = getContrastRatio(fgLum, bgLum);

  if (currentRatio >= targetRatio) {
    return null;
  }

  const currentL = getLightnessFromHex(fgHex);
  const shouldDarken = fgLum > bgLum;

  let low = 0;
  let high = 100;
  let bestHex = fgHex;
  let bestRatio = currentRatio;

  if (shouldDarken) {
    low = 0;
    high = currentL;
  } else {
    low = currentL;
    high = 100;
  }

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const testHex = adjustLightness(fgHex, mid);
    const testLum = getLuminance(hexToRgb(testHex));
    const testRatio = getContrastRatio(testLum, bgLum);

    if (testRatio >= targetRatio) {
      bestHex = testHex;
      bestRatio = testRatio;
      if (shouldDarken) {
        low = mid;
      } else {
        high = mid;
      }
    } else {
      if (shouldDarken) {
        high = mid;
      } else {
        low = mid;
      }
    }
  }

  if (bestRatio < targetRatio) {
    const extremeHex = adjustLightness(fgHex, shouldDarken ? 0 : 100);
    const extremeLum = getLuminance(hexToRgb(extremeHex));
    const extremeRatio = getContrastRatio(extremeLum, bgLum);
    if (extremeRatio > bestRatio) {
      bestHex = extremeHex;
      bestRatio = extremeRatio;
    }
  }

  return {
    hex: bestHex,
    ratio: Math.round(bestRatio * 100) / 100,
    result: getContrastResult(bestHex, bgHex),
  };
}

export function suggestBetterPair(
  fgHex: string,
  bgHex: string,
  targetRatio: number = 4.5
): { suggestedFg?: string; suggestedBg?: string; suggestedRatio: number } | null {
  const result = getContrastResult(fgHex, bgHex);
  if (result.ratio >= targetRatio) {
    return null;
  }

  const fgSuggest = suggestForegroundColor(fgHex, bgHex, targetRatio);
  const bgSuggest = suggestForegroundColor(bgHex, fgHex, targetRatio);

  if (!fgSuggest && !bgSuggest) {
    return null;
  }

  const fgImprovement = fgSuggest ? fgSuggest.ratio - result.ratio : -1;
  const bgImprovement = bgSuggest ? bgSuggest.ratio - result.ratio : -1;

  if (fgImprovement >= bgImprovement && fgSuggest) {
    return {
      suggestedFg: fgSuggest.hex,
      suggestedRatio: fgSuggest.ratio,
    };
  } else if (bgSuggest) {
    return {
      suggestedBg: bgSuggest.hex,
      suggestedRatio: bgSuggest.ratio,
    };
  }

  return null;
}
