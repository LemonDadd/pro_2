import { Upload } from 'lucide-react';

interface ImportTabProps {
  importText: string;
  importError: string | null;
  onTextChange: (text: string) => void;
  onImport: () => void;
}

export default function ImportTab({ importText, importError, onTextChange, onImport }: ImportTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-zinc-700 block mb-2">
          批量导入 JSON
        </label>
        <textarea
          value={importText}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full h-48 p-3 font-mono text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
          placeholder='[{"selector": "h1", "fg": "#111827", "bg": "#FFFFFF"}'
        />
        {importError && (
          <p className="mt-2 text-sm text-red-500">{importError}</p>
        )}
        <p className="mt-2 text-xs text-zinc-400">
          支持格式: 数组对象，字段包括 selector / fg / bg 或 color / backgroundColor
        </p>
      </div>
      <button
        onClick={onImport}
        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-1.5"
      >
        <Upload size={14} />
        导入
      </button>
    </div>
  );
}
