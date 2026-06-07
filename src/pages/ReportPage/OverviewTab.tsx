import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { AuditReport } from '@/types';

interface OverviewTabProps {
  report: AuditReport;
  currentFg: string;
  currentBg: string;
  paletteCount: number;
  scannedCount: number;
  failItems: AuditReport['items'];
}

export default function OverviewTab({ report, currentFg, currentBg, paletteCount, scannedCount, failItems }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-zinc-700 mb-3">数据来源</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-zinc-50 rounded-lg">
            <p className="text-xs text-zinc-500">双色检查</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">1</p>
            <p className="text-xs text-zinc-400 mt-1">
              {currentFg} / {currentBg}
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg">
            <p className="text-xs text-zinc-500">调色板</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">{paletteCount}</p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg">
            <p className="text-xs text-zinc-500">页面扫描</p>
            <p className="text-xl font-bold text-zinc-900 mt-1">{scannedCount}</p>
          </div>
        </div>
      </div>

      {report.failCount > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            需要关注的问题
          </h3>
          <div className="space-y-2">
            {failItems.slice(0, 5).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
              >
                <div className="flex items-center gap-3">
                  <XCircle size={18} className="text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-zinc-800">{item.role}</p>
                    <p className="text-xs text-zinc-500">来源: {item.source}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold font-mono text-red-600">
                    {item.ratio.toFixed(2)}:1
                  </p>
                  <p className="text-xs text-zinc-500">需 ≥ 4.5:1</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {report.failCount === 0 && (
        <div className="text-center py-12">
          <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
          <p className="text-lg font-medium text-zinc-800">所有配对均通过 AA 级标准！</p>
          <p className="text-sm text-zinc-500 mt-1">你的配色方案具备良好的可访问性</p>
        </div>
      )}
    </div>
  );
}
