import { useState, useEffect } from 'react';
import { parseDesignTokens, generateTokenPairs, generateSuggestions, sampleTokens, buildFixedTokens, downloadTokens } from '@/utils/tokens';
import type { TokenPair, DesignTokens } from '@/types';
import { useAuditStore } from '@/store/auditStore';
import TokenInput from './TokenInput';
import PaletteResultTable from './PaletteResultTable';

export default function PaletteAudit() {
  const { setPalettePairs } = useAuditStore();
  const [jsonText, setJsonText] = useState(sampleTokens);
  const [error, setError] = useState<string | null>(null);
  const [originalTokens, setOriginalTokens] = useState<DesignTokens | null>(null);
  const [withSuggestions, setWithSuggestions] = useState<TokenPair[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    handleParse();
  }, []);

  useEffect(() => {
    setPalettePairs(withSuggestions);
  }, [withSuggestions, setPalettePairs]);

  const handleParse = () => {
    setError(null);
    const tokens = parseDesignTokens(jsonText);
    if (!tokens) {
      setError('JSON 格式无效，请检查输入');
      setOriginalTokens(null);
      setWithSuggestions([]);
      return;
    }

    if (Object.keys(tokens.colors).length === 0) {
      setError('未找到有效的颜色定义');
      setOriginalTokens(null);
      setWithSuggestions([]);
      return;
    }

    setOriginalTokens(tokens);
    const tokenPairs = generateTokenPairs(tokens);
    const withSug = generateSuggestions(tokenPairs, 4.5);
    setWithSuggestions(withSug);
  };

  const handleExportFixed = () => {
    if (!originalTokens) return;
    const fixed = buildFixedTokens(originalTokens, withSuggestions);
    downloadTokens(fixed, 'design-tokens-fixed.json');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonText(text);
    };
    reader.readAsText(file);
  };

  const applySuggestion = (pair: TokenPair) => {
    if (!pair.suggestedFg && !pair.suggestedBg) return;
    const newFg = pair.suggestedFg || pair.fg;
    const newBg = pair.suggestedBg || pair.bg;
    const newRatio = pair.suggestedRatio || pair.ratio;

    setWithSuggestions(prev => prev.map(p => {
      if (p.role !== pair.role) return p;
      return {
        ...p,
        fg: newFg,
        bg: newBg,
        ratio: newRatio,
        passAA: true,
        passAAA: newRatio >= 7,
        suggestedFg: undefined,
        suggestedBg: undefined,
        suggestedRatio: undefined,
      };
    }));
  };

  const total = withSuggestions.length;
  const passAACount = withSuggestions.filter(p => p.passAA).length;
  const passAAACount = withSuggestions.filter(p => p.passAAA).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">调色板批量审计</h1>
        <p className="text-zinc-500 mt-1">
          导入 Design Tokens JSON 文件，批量检查语义颜色对的对比度
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">总配对数</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">AA 级通过</p>
          <p className={`text-3xl font-bold mt-1 ${passAACount === total ? 'text-emerald-600' : 'text-amber-600'}`}>
            {passAACount}
            <span className="text-base font-normal text-zinc-400 ml-1">/ {total}</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">AAA 级通过</p>
          <p className={`text-3xl font-bold mt-1 ${passAAACount === total ? 'text-emerald-600' : 'text-zinc-600'}`}>
            {passAAACount}
            <span className="text-base font-normal text-zinc-400 ml-1">/ {total}</span>
          </p>
        </div>
      </div>

      <TokenInput
        jsonText={jsonText}
        error={error}
        onTextChange={setJsonText}
        onParse={handleParse}
        onFileUpload={handleFileUpload}
        onDrop={handleDrop}
      />

      <PaletteResultTable
        pairs={withSuggestions}
        showSuggestions={showSuggestions}
        onToggleSuggestions={() => setShowSuggestions(!showSuggestions)}
        onApplySuggestion={applySuggestion}
        onExportFixed={handleExportFixed}
        canExport={!!originalTokens}
      />
    </div>
  );
}
