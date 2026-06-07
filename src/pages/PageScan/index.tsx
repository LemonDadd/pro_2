import { useState } from 'react';
import { Scan } from 'lucide-react';
import { getContrastResult, isValidHex, normalizeHex } from '@/utils/color';
import { buildReportItem } from '@/utils/report';
import { useAuditStore } from '@/store/auditStore';
import type { ReportItem } from '@/types';
import ManualTab from './ManualTab';
import ImportTab from './ImportTab';
import SnippetTab from './SnippetTab';
import { defaultSelectors, type ScanItem } from './constants';

type TabKey = 'manual' | 'import' | 'snippet';

interface ImportItemRaw {
  fg?: string;
  bg?: string;
  foreground?: string;
  background?: string;
  color?: string;
  backgroundColor?: string;
  selector?: string;
  label?: string;
  role?: string;
}

export default function PageScan() {
  const { addScannedItems, scannedItems, clearScannedItems } = useAuditStore();
  const [items, setItems] = useState<ScanItem[]>(
    defaultSelectors.map((s, i) => ({ id: String(i), ...s }))
  );
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('manual');

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

      const parsed: ScanItem[] = data.map((item: ImportItemRaw, idx: number) => {
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

  const addToReport = () => {
    const reportItems: ReportItem[] = items.map(item =>
      buildReportItem('页面扫描', item.selector, item.fg, item.bg)
    );
    clearScannedItems();
    addScannedItems(reportItems);
  };

  const passCount = items.filter(i => getContrastResult(i.fg, i.bg).passAANormal).length;
  const totalCount = items.length;

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'manual', label: '手动登记' },
    { key: 'import', label: '批量导入' },
    { key: 'snippet', label: 'DevTools 脚本' },
  ];

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
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
            <ManualTab
              items={items}
              onAdd={addItem}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          )}
          {activeTab === 'import' && (
            <ImportTab
              importText={importText}
              importError={importError}
              onTextChange={setImportText}
              onImport={handleImport}
            />
          )}
          {activeTab === 'snippet' && (
            <SnippetTab />
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
