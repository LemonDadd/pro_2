import type { DesignTokens, TokenPair } from '@/types';
import { getContrastResult, isValidHex, normalizeHex } from './color';
import { suggestBetterPair } from './suggest';

const semanticPairPatterns: Array<{ fg: string; bg: string; role: string }> = [
  { fg: 'onPrimary', bg: 'primary', role: '主要文字 / 主背景' },
  { fg: 'onSecondary', bg: 'secondary', role: '次要文字 / 次背景' },
  { fg: 'onSurface', bg: 'surface', role: '表面文字 / 表面背景' },
  { fg: 'onBackground', bg: 'background', role: '背景文字 / 页面背景' },
  { fg: 'onError', bg: 'error', role: '错误文字 / 错误背景' },
  { fg: 'onSuccess', bg: 'success', role: '成功文字 / 成功背景' },
  { fg: 'onWarning', bg: 'warning', role: '警告文字 / 警告背景' },
  { fg: 'onInfo', bg: 'info', role: '信息文字 / 信息背景' },
  { fg: 'primary', bg: 'surface', role: '主色 / 表面' },
  { fg: 'secondary', bg: 'surface', role: '次色 / 表面' },
];

export function parseDesignTokens(json: string): DesignTokens | null {
  try {
    const data = JSON.parse(json);
    if (!data.colors || typeof data.colors !== 'object') {
      return null;
    }
    const normalizedColors: Record<string, string> = {};
    for (const [key, value] of Object.entries(data.colors)) {
      if (typeof value === 'string' && isValidHex(value)) {
        normalizedColors[key] = normalizeHex(value);
      }
    }
    return {
      colors: normalizedColors,
      pairs: data.pairs || undefined,
    };
  } catch {
    return null;
  }
}

export function generateTokenPairs(tokens: DesignTokens): TokenPair[] {
  const pairs: TokenPair[] = [];
  const colors = tokens.colors;

  if (tokens.pairs && tokens.pairs.length > 0) {
    for (const pair of tokens.pairs) {
      const fg = colors[pair.foreground];
      const bg = colors[pair.background];
      if (fg && bg) {
        const contrast = getContrastResult(fg, bg);
        pairs.push({
          fg,
          bg,
          fgKey: pair.foreground,
          bgKey: pair.background,
          role: pair.role || `${pair.foreground} / ${pair.background}`,
          ratio: contrast.ratio,
          passAA: contrast.passAANormal,
          passAAA: contrast.passAAANormal,
        });
      }
    }
  } else {
    for (const pattern of semanticPairPatterns) {
      const fg = colors[pattern.fg];
      const bg = colors[pattern.bg];
      if (fg && bg) {
        const contrast = getContrastResult(fg, bg);
        pairs.push({
          fg,
          bg,
          fgKey: pattern.fg,
          bgKey: pattern.bg,
          role: pattern.role,
          ratio: contrast.ratio,
          passAA: contrast.passAANormal,
          passAAA: contrast.passAAANormal,
        });
      }
    }

    if (pairs.length === 0) {
      const colorEntries = Object.entries(colors);
      for (let i = 0; i < colorEntries.length; i++) {
        for (let j = i + 1; j < colorEntries.length; j++) {
          const [name1, color1] = colorEntries[i];
          const [name2, color2] = colorEntries[j];
          const contrast = getContrastResult(color1, color2);
          pairs.push({
            fg: color1,
            bg: color2,
            fgKey: name1,
            bgKey: name2,
            role: `${name1} / ${name2}`,
            ratio: contrast.ratio,
            passAA: contrast.passAANormal,
            passAAA: contrast.passAAANormal,
          });
        }
      }
    }
  }

  return pairs.sort((a, b) => a.ratio - b.ratio);
}

export function generateSuggestions(pairs: TokenPair[], targetRatio: number = 4.5): TokenPair[] {
  return pairs.map(pair => {
    if (pair.passAA) return pair;

    const suggestion = suggestBetterPair(pair.fg, pair.bg, targetRatio);
    if (suggestion) {
      return {
        ...pair,
        suggestedFg: suggestion.suggestedFg,
        suggestedBg: suggestion.suggestedBg,
        suggestedRatio: suggestion.suggestedRatio,
      };
    }
    return pair;
  });
}

export const sampleTokens = `{
  "colors": {
    "primary": "#6366F1",
    "onPrimary": "#FFFFFF",
    "secondary": "#EC4899",
    "onSecondary": "#FFFFFF",
    "surface": "#FFFFFF",
    "onSurface": "#1F2937",
    "background": "#F9FAFB",
    "onBackground": "#111827",
    "error": "#EF4444",
    "onError": "#FFFFFF",
    "success": "#10B981",
    "onSuccess": "#FFFFFF",
    "warning": "#F59E0B",
    "onWarning": "#FFFFFF",
    "info": "#3B82F6",
    "onInfo": "#FFFFFF",
    "muted": "#9CA3AF",
    "onMuted": "#FFFFFF"
  }
}`;

export function buildFixedTokens(
  originalTokens: DesignTokens,
  pairs: TokenPair[]
): DesignTokens {
  const fixedColors = { ...originalTokens.colors };

  for (const pair of pairs) {
    if (pair.suggestedFg && pair.fgKey && fixedColors[pair.fgKey]) {
      fixedColors[pair.fgKey] = pair.suggestedFg;
    }
    if (pair.suggestedBg && pair.bgKey && fixedColors[pair.bgKey]) {
      fixedColors[pair.bgKey] = pair.suggestedBg;
    }
  }

  return {
    ...originalTokens,
    colors: fixedColors,
  };
}

export function exportTokensToJson(tokens: DesignTokens): string {
  return JSON.stringify(tokens, null, 2);
}

export function downloadTokens(tokens: DesignTokens, filename: string = 'design-tokens-fixed.json') {
  const json = exportTokensToJson(tokens);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
