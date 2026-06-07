import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { devToolsSnippet } from './constants';

export default function SnippetTab() {
  const [copied, setCopied] = useState(false);

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(devToolsSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.log('复制失败');
    }
  };

  return (
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
  );
}
