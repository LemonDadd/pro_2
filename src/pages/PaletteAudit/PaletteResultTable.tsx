import { CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import type { TokenPair } from '@/types';

interface PaletteResultTableProps {
  pairs: TokenPair[];
  showSuggestions: boolean;
  onToggleSuggestions: () => void;
  onApplySuggestion: (pair: TokenPair) => void;
  onExportFixed: () => void;
  canExport: boolean;
}

export default function PaletteResultTable({
  pairs,
  showSuggestions,
  onToggleSuggestions,
  onApplySuggestion,
  onExportFixed,
  canExport,
}: PaletteResultTableProps) {
  if (pairs.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
        <span className="font-medium text-zinc-700">
          检查结果
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportFixed}
            disabled={!canExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            导出修正版
          </button>
          <button
            onClick={onToggleSuggestions}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              showSuggestions
                ? 'bg-amber-100 text-amber-700'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
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
            {pairs.map((pair, index) => (
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
                          onClick={() => onApplySuggestion(pair)}
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
  );
}
