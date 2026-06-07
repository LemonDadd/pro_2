import { CheckCircle } from 'lucide-react';
import type { ReportItem } from '@/types';

interface FailuresTabProps {
  items: ReportItem[];
}

export default function FailuresTab({ items }: FailuresTabProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle size={40} className="mx-auto text-emerald-500 mb-3" />
        <p className="text-zinc-600">没有未通过的项</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="p-4 bg-white rounded-lg border border-zinc-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex -space-x-1 mt-0.5">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: item.fg }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: item.bg }}
                />
              </div>
              <div>
                <p className="font-medium text-zinc-800">{item.role}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  来源: {item.source} · {item.fg} / {item.bg}
                </p>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-red-600">
              {item.ratio.toFixed(2)}:1
            </span>
          </div>

          {(item.suggestedFg || item.suggestedBg) && (
            <div className="mt-3 pt-3 border-t border-zinc-100">
              <p className="text-xs font-medium text-amber-700 mb-2">💡 建议修正</p>
              <div className="flex items-center gap-4 text-sm">
                {item.suggestedFg && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">前景:</span>
                    <div
                      className="w-5 h-5 rounded border border-zinc-300"
                      style={{ backgroundColor: item.suggestedFg }}
                    />
                    <span className="font-mono text-zinc-700">{item.suggestedFg}</span>
                  </div>
                )}
                {item.suggestedBg && (
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">背景:</span>
                    <div
                      className="w-5 h-5 rounded border border-zinc-300"
                      style={{ backgroundColor: item.suggestedBg }}
                    />
                    <span className="font-mono text-zinc-700">{item.suggestedBg}</span>
                  </div>
                )}
                {item.suggestedRatio && (
                  <span className="ml-auto text-emerald-600 font-medium">
                    → {item.suggestedRatio.toFixed(2)}:1
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
