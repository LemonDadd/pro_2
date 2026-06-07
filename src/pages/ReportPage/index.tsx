import { useState, useMemo } from 'react';
import { Download, Printer, FileText } from 'lucide-react';
import { useAuditStore } from '@/store/auditStore';
import { generateMarkdownReport, downloadMarkdown, printReport } from '@/utils/report';
import OverviewTab from './OverviewTab';
import FailuresTab from './FailuresTab';
import AllItemsTab from './AllItemsTab';

type TabKey = 'overview' | 'failures' | 'all';

export default function ReportPage() {
  const { getFullReport, palettePairs, scannedItems, currentFg, currentBg } = useAuditStore();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const report = useMemo(() => getFullReport(), [getFullReport]);
  const markdown = useMemo(() => generateMarkdownReport(report), [report]);

  const failItems = report.items.filter(item => !item.passAA);
  const passRate = report.total > 0 ? ((report.passAA / report.total) * 100).toFixed(1) : '0';

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'overview', label: '概览' },
    { key: 'failures', label: `未通过 (${failItems.length})` },
    { key: 'all', label: `全部 (${report.items.length})` },
  ];

  const handleDownload = () => {
    downloadMarkdown(markdown, 'contrast-audit-report.md');
  };

  const handlePrint = () => {
    printReport();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">报告导出</h1>
          <p className="text-zinc-500 mt-1">
            汇总所有检查结果，导出 Markdown 报告或打印 PDF
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <Printer size={16} />
            打印
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            <Download size={16} />
            导出 Markdown
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">总检查项</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{report.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">AA 级通过率</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{passRate}%</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">AAA 级通过</p>
          <p className="text-3xl font-bold text-zinc-600 mt-1">{report.passAAA}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-sm text-zinc-500">未通过项</p>
          <p className={`text-3xl font-bold mt-1 ${report.failCount > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {report.failCount}
          </p>
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
          {activeTab === 'overview' && (
            <OverviewTab
              report={report}
              currentFg={currentFg}
              currentBg={currentBg}
              paletteCount={palettePairs.length}
              scannedCount={scannedItems.length}
              failItems={failItems}
            />
          )}
          {activeTab === 'failures' && (
            <FailuresTab items={failItems} />
          )}
          {activeTab === 'all' && (
            <AllItemsTab items={report.items} />
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-zinc-500" />
            <span className="font-medium text-zinc-700">Markdown 预览</span>
          </div>
          <button
            onClick={handleDownload}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            下载 .md
          </button>
        </div>
        <div className="p-4 bg-zinc-50 max-h-96 overflow-auto">
          <pre className="text-xs text-zinc-700 font-mono whitespace-pre-wrap">
            {markdown}
          </pre>
        </div>
      </div>

      <div className="text-center text-xs text-zinc-400">
        报告生成时间: {report.generatedAt}
      </div>
    </div>
  );
}
