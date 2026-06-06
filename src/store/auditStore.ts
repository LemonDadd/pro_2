import { create } from 'zustand';
import type { ReportItem, AuditReport, TokenPair } from '@/types';
import { buildAuditReport, tokenPairsToReportItems } from '@/utils/report';
import { getContrastResult } from '@/utils/color';

interface AuditState {
  currentFg: string;
  currentBg: string;
  palettePairs: TokenPair[];
  scannedItems: ReportItem[];
  setCurrentColors: (fg: string, bg: string) => void;
  setPalettePairs: (pairs: TokenPair[]) => void;
  addScannedItems: (items: ReportItem[]) => void;
  clearScannedItems: () => void;
  getFullReport: () => AuditReport;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  currentFg: '#1F2937',
  currentBg: '#FFFFFF',
  palettePairs: [],
  scannedItems: [],

  setCurrentColors: (fg, bg) => set({ currentFg: fg, currentBg: bg }),

  setPalettePairs: (pairs) => set({ palettePairs: pairs }),

  addScannedItems: (items) =>
    set((state) => ({
      scannedItems: [...state.scannedItems, ...items],
    })),

  clearScannedItems: () => set({ scannedItems: [] }),

  getFullReport: () => {
    const state = get();
    const allItems: ReportItem[] = [];

    if (state.palettePairs.length > 0) {
      allItems.push(...tokenPairsToReportItems(state.palettePairs, '调色板'));
    }

    allItems.push(...state.scannedItems);

    if (allItems.length === 0) {
      const contrast = getContrastResult(state.currentFg, state.currentBg);
      allItems.push({
        source: '双色检查',
        role: '当前前景 / 背景',
        fg: state.currentFg,
        bg: state.currentBg,
        ratio: contrast.ratio,
        passAA: contrast.passAANormal,
        passAAA: contrast.passAAANormal,
      });
    }

    return buildAuditReport(allItems);
  },
}));
