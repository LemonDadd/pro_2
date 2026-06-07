import { CheckCircle, XCircle } from 'lucide-react';
import type { ReportItem } from '@/types';

interface AllItemsTabProps {
  items: ReportItem[];
}

export default function AllItemsTab({ items }: AllItemsTabProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-50 text-zinc-500 text-xs">
            <th className="text-left px-3 py-2 font-medium">来源</th>
            <th className="text-left px-3 py-2 font-medium">角色</th>
            <th className="text-left px-3 py-2 font-medium">前景 / 背景</th>
            <th className="text-center px-3 py-2 font-medium">对比度</th>
            <th className="text-center px-3 py-2 font-medium">AA</th>
            <th className="text-center px-3 py-2 font-medium">AAA</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={idx}
              className={`border-t border-zinc-100 ${
                !item.passAA ? 'bg-red-50/30' : 'hover:bg-zinc-50/50'
              }`}
            >
              <td className="px-3 py-2 text-zinc-500">{item.source}</td>
              <td className="px-3 py-2 text-zinc-700 font-medium">{item.role}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white"
                      style={{ backgroundColor: item.fg }}
                    />
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white"
                      style={{ backgroundColor: item.bg }}
                    />
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    {item.fg}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-center font-mono font-medium">
                {item.ratio.toFixed(2)}:1
              </td>
              <td className="px-3 py-2 text-center">
                {item.passAA ? (
                  <CheckCircle size={16} className="mx-auto text-emerald-500" />
                ) : (
                  <XCircle size={16} className="mx-auto text-red-500" />
                )}
              </td>
              <td className="px-3 py-2 text-center">
                {item.passAAA ? (
                  <CheckCircle size={16} className="mx-auto text-emerald-500" />
                ) : (
                  <XCircle size={16} className="mx-auto text-zinc-300" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
