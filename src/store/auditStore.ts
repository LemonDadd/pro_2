import { create } from 'zustand';
import type { ReportItem, AuditReport, TokenPair } from '@/types';
import { buildAuditReport, tokenPairsToReportItems } from '@/utils/report';
import { getContrastResult } from '@/utils/color';
import { suggestBetterPair } from '@/utils/suggest';

interface AuditState {
  currentFg: string;
  currentBg: string;
  palettePairs: TokenPair[];
  scannedItems: ReportItem[];
  contrastItem: ReportItem | null;
  samplerItem: ReportItem | null;

  setCurrentColors: (fg: string, bg: string) => void;
  setPalettePairs: (pairs: TokenPair[]) => void;
  addScannedItems: (items: ReportItem[]) => void;
  clearScannedItems: () => void;
  addContrastToReport: (fg: string, bg: string) => void;
  removeContrastFromReport: () => void;
  setSamplerItem: (item: ReportItem | null) => void;
  clearAll: () => void;
  getFullReport: () => AuditReport;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  currentFg: '#1F2937',
  currentBg: '#FFFFFF',
  palettePairs: [],
  scannedItems: [],
  contrastItem: null,
  samplerItem: null,

  setCurrentColors: (fg, bg) => set({ currentFg: fg, currentBg: bg }),

  setPalettePairs: (pairs) => set({ palettePairs: pairs }),

  addScannedItems: (items) =>
    set((state) => ({
      scannedItems: [...state.scannedItems, ...items],
    })),

  clearScannedItems: () => set({ scannedItems: [] }),

  addContrastToReport: (fg, bg) => {
    const contrast = getContrastResult(fg, bg);
    const suggestion = suggestBetterPair(fg, bg, 4.5);
    set({
      contrastItem: {
        source: '双色检查',
        role: '当前前景 / 背景',
        fg,
        bg,
        ratio: contrast.ratio,
        passAA: contrast.passAANormal,
        passAAA: contrast.passAAANormal,
        suggestedFg: suggestion?.suggestedFg,
        suggestedBg: suggestion?.suggestedBg,
        suggestedRatio: suggestion?.suggestedRatio,
      },
    });
  },

  removeContrastFromReport: () => set({ contrastItem: null }),

  setSamplerItem: (item) => set({ samplerItem: item }),

  clearAll: () => set({
    palettePairs: [],
    scannedItems: [],
    contrastItem: null,
    samplerItem: null,
  }),

  getFullReport: () => {
    const state = get();
    const allItems: ReportItem[] = [];

    if (state.contrastItem) {
      allItems.push(state.contrastItem);
    }

    if (state.palettePairs.length > 0) {
      allItems.push(...tokenPairsToReportItems(state.palettePairs, '调色板'));
    }

    if (state.scannedItems.length > 0) {
      allItems.push(...state.scannedItems);
    }

    if (state.samplerItem) {
      allItems.push(state.samplerItem);
    }

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
