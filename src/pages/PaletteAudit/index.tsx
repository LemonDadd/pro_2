import { useState, useRef, useEffect } from 'react';
import { Upload, FileJson, CheckCircle, XCircle, RefreshCw, Sparkles, TrendingUp, Download } from 'lucide-react';
import { parseDesignTokens, generateTokenPairs, generateSuggestions, sampleTokens, buildFixedTokens, downloadTokens } from '@/utils/tokens';
import type { TokenPair, DesignTokens } from '@/types';
import { useAuditStore } from '@/store/auditStore';

export default function PaletteAudit() {
  const { setPalettePairs } = useAuditStore();
  const [jsonText, setJsonText] = useState(sampleTokens);
  const [error, setError] = useState<string | null>(null);
  const [originalTokens, setOriginalTokens] = useState<DesignTokens | null>(null);
  const [withSuggestions, setWithSuggestions] = useState<TokenPair[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const total = withSuggestions.length;
  const passAACount = withSuggestions.filter(p => p.passAA).length;
  const passAAACount = withSuggestions.filter(p => p.passAAA).length;

  const applySuggestion = (pair: TokenPair) => {
    if (!pair.suggestedFg && !pair.suggestedBg) return;
    const newFg = pair.suggestedFg || pair.fg;
    const newBg = pair.suggestedBg || pair.bg;
    const newRatio = pair.suggestedRatio || pair.ratio;

    setWithSuggestions(prev => prev.map(p => {
      if (p.role !== pair.role) return p;
      const updated = {
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
      return updated;
    }));
  };

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

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileJson size={18} className="text-zinc-500" />
            <span className="font-medium text-zinc-700">Design Tokens</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                <Upload size={14} />
                上传文件
              </button>
            </label>
            <button
              onClick={handleParse}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <RefreshCw size={14} />
              解析
            </button>
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="p-4"
        >
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-48 p-3 font-mono text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
            placeholder='{"colors": {"primary": "#6366F1", "onPrimary": "#FFFFFF"}}'
          />
          {error && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <XCircle size={14} />
              {error}
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-400">
            支持格式: {`{ colors: { primary, onPrimary, secondary, onSecondary... } }`}，或拖拽 JSON 文件
          </p>
        </div>
      </div>

      {withSuggestions.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <span className="font-medium text-zinc-700">
              检查结果
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportFixed}
                disabled={!originalTokens}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={14} />
                导出修正版
              </button>
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showSuggestions
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <Sparkles size={14} />
                {showSuggestions ? '隐藏建议' : '显示建议'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 text-xs">
                  <th className="text-left px-4 py-3 font-medium">角色</th>
                  <th className="text-left px-4 py-3 font-medium">前景 / 背景</th>
                  <th className="text-center px-4 py-3 font-medium">对比度</th>
                  <th className="text-center px-4 py-3 font-medium">AA</th>
                  <th className="text-center px-4 py-3 font-medium">AAA</th>
                  {showSuggestions && (
                    <th className="text-left px-4 py-3 font-medium">建议色</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {withSuggestions.map((pair, index) => (
                  <tr
                    key={pair.role + index}
                    className={`border-t border-zinc-100 hover:bg-zinc-50/50 ${
                      !pair.passAA ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-zinc-700 font-medium">
                      {pair.role}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: pair.fg }}
                            title={`前景: ${pair.fg}`}
                          />
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: pair.bg }}
                            title={`背景: ${pair.bg}`}
                          />
                        </div>
                        <div className="text-xs font-mono text-zinc-500">
                          {pair.fg} / {pair.bg}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-medium">
                      {pair.ratio.toFixed(2)}:1
                    </td>
                    <td className="px-4 py-3 text-center">
                      {pair.passAA ? (
                        <CheckCircle size={18} className="mx-auto text-emerald-500" />
                      ) : (
                        <XCircle size={18} className="mx-auto text-red-500" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {pair.passAAA ? (
                        <CheckCircle size={18} className="mx-auto text-emerald-500" />
                      ) : (
                        <XCircle size={18} className="mx-auto text-zinc-300" />
                      )}
                    </td>
                    {showSuggestions && (
                      <td className="px-4 py-3">
                        {(pair.suggestedFg || pair.suggestedBg) ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {pair.suggestedFg && (
                                <>
                                  <div
                                    className="w-5 h-5 rounded border border-zinc-300"
                                    style={{ backgroundColor: pair.suggestedFg }}
                                  />
                                  <span className="text-xs font-mono text-zinc-600">
                                    {pair.suggestedFg}
                                  </span>
                                </>
                              )}
                              {pair.suggestedBg && (
                                <>
                                  <span className="text-zinc-300">/</span>
                                  <div
                                    className="w-5 h-5 rounded border border-zinc-300"
                                    style={{ backgroundColor: pair.suggestedBg }}
                                  />
                                  <span className="text-xs font-mono text-zinc-600">
                                    {pair.suggestedBg}
                                  </span>
                                </>
                              )}
                            </div>
                            <span className="text-xs text-emerald-600 font-mono">
                              {pair.suggestedRatio?.toFixed(2)}:1
                            </span>
                            <button
                              onClick={() => applySuggestion(pair)}
                              className="ml-2 p-1 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                              title="应用建议"
                            >
                              <TrendingUp size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
