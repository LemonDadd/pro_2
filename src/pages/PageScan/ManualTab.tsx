import { Plus, Trash2, CheckCircle, XCircle, Code } from 'lucide-react';
import { getContrastResult } from '@/utils/color';
import type { ScanItem } from './constants';

interface ManualTabProps {
  items: ScanItem[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof ScanItem, value: string) => void;
  onRemove: (id: string) => void;
}

export default function ManualTab({ items, onAdd, onUpdate, onRemove }: ManualTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-2 text-sm bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <Plus size={14} />
          添加选择器
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 text-zinc-500 text-xs">
              <th className="text-left px-3 py-2 font-medium">选择器</th>
              <th className="text-left px-3 py-2 font-medium">前景色</th>
              <th className="text-left px-3 py-2 font-medium">背景色</th>
              <th className="text-center px-3 py-2 font-medium">对比度</th>
              <th className="text-center px-3 py-2 font-medium">AA</th>
              <th className="text-center px-3 py-2 font-medium">AAA</th>
              <th className="text-center px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const contrast = getContrastResult(item.fg, item.bg);
              return (
                <tr key={item.id} className="border-t border-zinc-100 hover:bg-zinc-50/50">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.selector}
                      onChange={(e) => onUpdate(item.id, 'selector', e.target.value)}
                      className="w-full px-2 py-1 border border-zinc-200 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={item.fg}
                        onChange={(e) => onUpdate(item.id, 'fg', e.target.value.toUpperCase())}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={item.fg}
                        onChange={(e) => onUpdate(item.id, 'fg', e.target.value)}
                        className="w-20 px-2 py-1 border border-zinc-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={item.bg}
                        onChange={(e) => onUpdate(item.id, 'bg', e.target.value.toUpperCase())}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={item.bg}
                        onChange={(e) => onUpdate(item.id, 'bg', e.target.value)}
                        className="w-20 px-2 py-1 border border-zinc-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center font-mono font-medium">
                    {contrast.ratio.toFixed(2)}:1
                  </td>
                  <td className="px-3 py-2 text-center">
                    {contrast.passAANormal ? (
                      <CheckCircle size={16} className="mx-auto text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="mx-auto text-red-500" />
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {contrast.passAAANormal ? (
                      <CheckCircle size={16} className="mx-auto text-emerald-500" />
                    ) : (
                      <XCircle size={16} className="mx-auto text-zinc-300" />
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8">
          <Code size={32} className="mx-auto text-zinc-300 mb-2" />
          <p className="text-zinc-500 text-sm">暂无选择器，点击上方按钮添加</p>
        </div>
      )}
    </div>
  );
}
