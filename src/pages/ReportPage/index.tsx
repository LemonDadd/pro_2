import { useState, useMemo } from 'react';
import { Download, Printer, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuditStore } from '@/store/auditStore';
import { generateMarkdownReport, downloadMarkdown, printReport } from '@/utils/report';

export default function ReportPage() {
  const { getFullReport, palettePairs, scannedItems, currentFg, currentBg } = useAuditStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'failures' | 'all'>('overview');

  const report = useMemo(() => getFullReport(), [getFullReport]);
  const markdown = useMemo(() => generateMarkdownReport(report), [report]);

  const handleDownload = () => {
    downloadMarkdown(markdown, 'contrast-audit-report.md');
  };

  const handlePrint = () => {
    printReport();
  };

  const failItems = report.items.filter(item => !item.passAA);
  const passItems = report.items.filter(item => item.passAA);

  const passRate = report.total > 0 ? ((report.passAA / report.total) * 100).toFixed(1) : '0';

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
          {[
            { key: 'overview', label: '概览' },
            { key: 'failures', label: `未通过 (${failItems.length})` },
            { key: 'all', label: `全部 (${report.items.length})` },
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
          {activeTab === 'overview' && (
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
                    <p className="text-xl font-bold text-zinc-900 mt-1">{palettePairs.length}</p>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <p className="text-xs text-zinc-500">页面扫描</p>
                    <p className="text-xl font-bold text-zinc-900 mt-1">{scannedItems.length}</p>
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
          )}

          {activeTab === 'failures' && (
            <div className="space-y-3">
              {failItems.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle size={40} className="mx-auto text-emerald-500 mb-3" />
                  <p className="text-zinc-600">没有未通过的项</p>
                </div>
              ) : (
                failItems.map((item, idx) => (
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
                ))
              )}
            </div>
          )}

          {activeTab === 'all' && (
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
                  {report.items.map((item, idx) => (
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
