export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorInfo {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  luminance: number;
}

export interface ContrastResult {
  ratio: number;
  passAANormal: boolean;
  passAALarge: boolean;
  passAAANormal: boolean;
  passAAALarge: boolean;
}

export interface TokenPair {
  fg: string;
  bg: string;
  fgKey?: string;
  bgKey?: string;
  role: string;
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
  suggestedFg?: string;
  suggestedBg?: string;
  suggestedRatio?: number;
}

export type ColorblindType = 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface DesignTokens {
  colors: Record<string, string>;
  pairs?: Array<{
    foreground: string;
    background: string;
    role: string;
  }>;
}

export interface ReportItem {
  source: string;
  role: string;
  fg: string;
  bg: string;
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
  suggestedFg?: string;
  suggestedBg?: string;
  suggestedRatio?: number;
}

export interface AuditReport {
  total: number;
  passAA: number;
  passAAA: number;
  failCount: number;
  items: ReportItem[];
  generatedAt: string;
}
