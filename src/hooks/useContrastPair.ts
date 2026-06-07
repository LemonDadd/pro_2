import { useState, useMemo, useCallback } from 'react';
import { getContrastResult, getColorInfo } from '@/utils/color';
import { suggestBetterPair } from '@/utils/suggest';
import type { ContrastResult, ColorInfo } from '@/types';

interface UseContrastPairOptions {
  initialFg?: string;
  initialBg?: string;
  targetRatio?: number;
}

interface UseContrastPairReturn {
  fg: string;
  bg: string;
  setFg: (color: string) => void;
  setBg: (color: string) => void;
  setBoth: (fg: string, bg: string) => void;
  swap: () => void;
  contrastResult: ContrastResult;
  fgInfo: ColorInfo;
  bgInfo: ColorInfo;
  suggestedFg?: string;
  suggestedBg?: string;
  suggestedRatio?: number;
  hasSuggestion: boolean;
  applySuggestion: () => void;
}

export function useContrastPair(options: UseContrastPairOptions = {}): UseContrastPairReturn {
  const { initialFg = '#1F2937', initialBg = '#FFFFFF', targetRatio = 4.5 } = options;
  const [fg, setFg] = useState(initialFg);
  const [bg, setBg] = useState(initialBg);

  const contrastResult = useMemo(() => getContrastResult(fg, bg), [fg, bg]);
  const fgInfo = useMemo(() => getColorInfo(fg), [fg]);
  const bgInfo = useMemo(() => getColorInfo(bg), [bg]);

  const suggestion = useMemo(() => {
    if (contrastResult.passAANormal) return null;
    return suggestBetterPair(fg, bg, targetRatio);
  }, [fg, bg, contrastResult.passAANormal, targetRatio]);

  const setBoth = useCallback((newFg: string, newBg: string) => {
    setFg(newFg);
    setBg(newBg);
  }, []);

  const swap = useCallback(() => {
    setFg(bg);
    setBg(fg);
  }, [fg, bg]);

  const applySuggestion = useCallback(() => {
    if (!suggestion) return;
    if (suggestion.suggestedFg) setFg(suggestion.suggestedFg);
    if (suggestion.suggestedBg) setBg(suggestion.suggestedBg);
  }, [suggestion]);

  return {
    fg,
    bg,
    setFg,
    setBg,
    setBoth,
    swap,
    contrastResult,
    fgInfo,
    bgInfo,
    suggestedFg: suggestion?.suggestedFg,
    suggestedBg: suggestion?.suggestedBg,
    suggestedRatio: suggestion?.suggestedRatio,
    hasSuggestion: !!suggestion,
    applySuggestion,
  };
}
