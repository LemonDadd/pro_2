import type { RGB, ColorblindType } from '@/types';
import { hexToRgb, rgbToHex } from './color';

const colorblindMatrices: Record<ColorblindType, number[]> = {
  protanopia: [
    0.567, 0.433, 0, 0, 0,
    0.558, 0.442, 0, 0, 0,
    0, 0.242, 0.758, 0, 0,
    0, 0, 0, 1, 0,
  ],
  deuteranopia: [
    0.625, 0.375, 0, 0, 0,
    0.7, 0.3, 0, 0, 0,
    0, 0.3, 0.7, 0, 0,
    0, 0, 0, 1, 0,
  ],
  tritanopia: [
    0.95, 0.05, 0, 0, 0,
    0, 0.433, 0.567, 0, 0,
    0, 0.475, 0.525, 0, 0,
    0, 0, 0, 1, 0,
  ],
};

export function applyColorblindMatrix(rgb: RGB, type: ColorblindType): RGB {
  const m = colorblindMatrices[type];
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const newR = m[0] * r + m[1] * g + m[2] * b + m[3] * 1 + m[4] * 0;
  const newG = m[5] * r + m[6] * g + m[7] * b + m[8] * 1 + m[9] * 0;
  const newB = m[10] * r + m[11] * g + m[12] * b + m[13] * 1 + m[14] * 0;

  return {
    r: Math.round(Math.max(0, Math.min(1, newR)) * 255),
    g: Math.round(Math.max(0, Math.min(1, newG)) * 255),
    b: Math.round(Math.max(0, Math.min(1, newB)) * 255),
  };
}

export function simulateColorblind(hex: string, type: ColorblindType): string {
  const rgb = hexToRgb(hex);
  const result = applyColorblindMatrix(rgb, type);
  return rgbToHex(result);
}

export function getColorblindFilterSvg(type: ColorblindType): string {
  const m = colorblindMatrices[type];
  return `
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="colorblind-${type}">
          <feColorMatrix type="matrix" values="
            ${m[0]} ${m[1]} ${m[2]} 0 0
            ${m[5]} ${m[6]} ${m[7]} 0 0
            ${m[10]} ${m[11]} ${m[12]} 0 0
            0 0 0 1 0
          "/>
        </filter>
      </defs>
    </svg>
  `;
}

export const colorblindInfo: Record<ColorblindType, { name: string; description: string }> = {
  protanopia: {
    name: '红色盲',
    description: '无法感知红色光，红绿色觉减弱',
  },
  deuteranopia: {
    name: '绿色盲',
    description: '无法感知绿色光，最常见的色盲类型',
  },
  tritanopia: {
    name: '蓝色盲',
    description: '无法感知蓝色光，蓝黄色觉减弱',
  },
};
