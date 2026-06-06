import { useState } from 'react';
import { Plus, Trash2, Code, Copy, CheckCircle, XCircle, Upload, Scan } from 'lucide-react';
import { getContrastResult, isValidHex, normalizeHex } from '@/utils/color';
import { suggestBetterPair } from '@/utils/suggest';
import { useAuditStore } from '@/store/auditStore';
import type { ReportItem } from '@/types';

interface ScanItem {
  id: string;
  selector: string;
  fg: string;
  bg: string;
}

const defaultSelectors = [
  { selector: 'h1', fg: '#111827', bg: '#FFFFFF' },
  { selector: 'p', fg: '#374151', bg: '#FFFFFF' },
  { selector: '.btn-primary', fg: '#FFFFFF', bg: '#6366F1' },
  { selector: '.btn-secondary', fg: '#374151', bg: '#F3F4F6' },
  { selector: 'a', fg: '#6366F1', bg: '#FFFFFF' },
];

const devToolsSnippet = `// 在目标页面控制台运行此脚本，复制输出结果
// 粘贴到下方"批量导入"区域

(function() {
  const selectors = ['h1', 'h2', 'h3', 'p', 'a', 'button', '.btn', '.btn-primary', '.btn-secondary', 'input', 'textarea', 'select'];
  const results = [];
  const seen = new Set();
  
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const styles = window.getComputedStyle(el);
    const fg = styles.color;
    const bg = styles.backgroundColor;
    
    const rgbToHex = (rgb) => {
      const m = rgb.match(/\\d+/g);
      if (!m || m.length < 3) return null;
      return '#' + m.slice(0,3).map(x => (+x).toString(16).padStart(2,'0')).join('').toUpperCase();
    };
    
    const fgHex = rgbToHex(fg);
    const bgHex = rgbToHex(bg);
    const key = sel + '-' + fgHex + '-' + bgHex;
    
    if (fgHex && bgHex && !seen.has(key)) {
      seen.add(key);
      results.push({ selector: sel, fg: fgHex, bg: bgHex });
    }
  }
  
  console.log(JSON.stringify(results, null, 2));
  console.log('请复制上面的 JSON 粘贴到对比度审计工具中');
  return JSON.stringify(results, null, 2);
})();`;

export default function PageScan() {
  const { addScannedItems, scannedItems, clearScannedItems } = useAuditStore();
  const [items, setItems] = useState<ScanItem[]>(defaultSelectors.map((s, i) => ({ id: String(i), ...s })));
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'import' | 'snippet'>('manual');

  const addItem = () => {
    setItems([...items, {
      id: String(Date.now()),
      selector: '.new-selector',
      fg: '#374151',
      bg: '#FFFFFF',
    }]);
  };

  const updateItem = (id: string, field: keyof ScanItem, value: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleImport = () => {
    setImportError(null);
    try {
      const data = JSON.parse(importText);
      if (!Array.isArray(data)) {
        throw new Error('需要数组格式');
      }

      const parsed: ScanItem[] = data.map((item: any, idx: number) => {
        const fg = item.fg || item.foreground || item.color || '#000000';
        const bg = item.bg || item.background || item.backgroundColor || '#FFFFFF';
        const selector = item.selector || item.label || item.role || `item-${idx}`;

        if (!isValidHex(fg) || !isValidHex(bg)) {
          throw new Error(`第 ${idx + 1} 项颜色格式无效`);
        }

        return {
          id: String(Date.now() + idx),
          selector: String(selector),
          fg: normalizeHex(fg),
          bg: normalizeHex(bg),
        };
      });

      setItems(parsed);
      setActiveTab('manual');
    } catch (e) {
      setImportError(e instanceof Error ? e.message : '解析失败');
    }
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(devToolsSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.log('复制失败');
    }
  };

  const addToReport = () => {
    const reportItems: ReportItem[] = items.map(item => {
      const contrast = getContrastResult(item.fg, item.bg);
      const suggestion = suggestBetterPair(item.fg, item.bg, 4.5);
      return {
        source: '页面扫描',
        role: item.selector,
        fg: item.fg,
        bg: item.bg,
        ratio: contrast.ratio,
        passAA: contrast.passAANormal,
        passAAA: contrast.passAAANormal,
        suggestedFg: suggestion?.suggestedFg,
        suggestedBg: suggestion?.suggestedBg,
        suggestedRatio: suggestion?.suggestedRatio,
      };
    });

    clearScannedItems();
    addScannedItems(reportItems);
  };

  const passCount = items.filter(i => getContrastResult(i.fg, i.bg).passAANormal).length;
  const totalCount = items.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">页面扫描</h1>
        <p className="text-zinc-500 mt-1">
          批量检查页面元素的对比度。受限于同源策略，支持手动登记或 DevTools 脚本导入
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">选择器数量</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">AA 级通过</p>
          <p className={`text-3xl font-bold mt-1 ${passCount === totalCount ? 'text-emerald-600' : 'text-amber-600'}`}>
            {passCount}
            <span className="text-base font-normal text-zinc-400 ml-1">/ {totalCount}</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">操作</p>
          <button
            onClick={addToReport}
            className="mt-1 w-full px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <Scan size={14} />
            加入报告
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="border-b border-zinc-100 flex">
          {[
            { key: 'manual', label: '手动登记' },
            { key: 'import', label: '批量导入' },
            { key: 'snippet', label: 'DevTools 脚本' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'text-amber-600 border-amber-500'
                  : 'text-zinc-500 border-transparent hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={addItem}
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
                              onChange={(e) => updateItem(item.id, 'selector', e.target.value)}
                              className="w-full px-2 py-1 border border-zinc-200 rounded text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={item.fg}
                                onChange={(e) => updateItem(item.id, 'fg', e.target.value.toUpperCase())}
                                className="w-8 h-8 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={item.fg}
                                onChange={(e) => updateItem(item.id, 'fg', e.target.value)}
                                className="w-20 px-2 py-1 border border-zinc-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={item.bg}
                                onChange={(e) => updateItem(item.id, 'bg', e.target.value.toUpperCase())}
                                className="w-8 h-8 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={item.bg}
                                onChange={(e) => updateItem(item.id, 'bg', e.target.value)}
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
                              onClick={() => removeItem(item.id)}
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
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 block mb-2">
                  批量导入 JSON
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full h-48 p-3 font-mono text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                  placeholder='[{"selector": "h1", "fg": "#111827", "bg": "#FFFFFF"}]'
                />
                {importError && (
                  <p className="mt-2 text-sm text-red-500">{importError}</p>
                )}
                <p className="mt-2 text-xs text-zinc-400">
                  支持格式: 数组对象，字段包括 selector / fg / bg 或 color / backgroundColor
                </p>
              </div>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-1.5"
              >
                <Upload size={14} />
                导入
              </button>
            </div>
          )}

          {activeTab === 'snippet' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-1">💡 使用方法</p>
                <p className="text-xs text-blue-700">
                  在目标页面打开 Chrome DevTools (F12) → Console 面板 → 粘贴并运行下方脚本 → 复制输出的 JSON → 到"批量导入"页签粘贴
                </p>
              </div>

              <div className="relative">
                <button
                  onClick={copySnippet}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 text-white rounded hover:bg-zinc-600 transition-colors z-10"
                >
                  {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {copied ? '已复制' : '复制'}
                </button>
                <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-lg text-xs font-mono overflow-auto max-h-80">
                  {devToolsSnippet}
                </pre>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-medium mb-1">⚠️ 限制说明</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• 受浏览器同源策略限制，无法直接跨域扫描页面</li>
                  <li>• 脚本只能获取元素的 computed style，无法处理伪元素、渐变背景等</li>
                  <li>• 建议针对重要页面手动运行脚本后导入结果</li>
                  <li>• 本地开发环境（localhost）不受跨域限制，可直接使用</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {scannedItems.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-800">
              ✓ 已加入报告
            </p>
            <p className="text-xs text-emerald-700">
              {scannedItems.length} 个选择器已添加到审计报告
            </p>
          </div>
          <button
            onClick={clearScannedItems}
            className="text-xs text-emerald-700 hover:text-emerald-900"
          >
            清除
          </button>
        </div>
      )}
    </div>
  );
}
