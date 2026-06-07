import { useRef } from 'react';
import { Upload, FileJson, RefreshCw, XCircle } from 'lucide-react';

interface TokenInputProps {
  jsonText: string;
  error: string | null;
  onTextChange: (text: string) => void;
  onParse: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function TokenInput({
  jsonText,
  error,
  onTextChange,
  onParse,
  onFileUpload,
  onDrop,
}: TokenInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileJson size={18} className="text-zinc-500" />
          <span className="font-medium text-zinc-700">Design Tokens</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={onFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <Upload size={14} />
              上传文件
            </button>
          </label>
          <button
            onClick={onParse}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <RefreshCw size={14} />
            解析
          </button>
        </div>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={handleDragOver}
        className="p-4"
      >
        <textarea
          value={jsonText}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full h-48 p-3 font-mono text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
          placeholder='{"colors": {"primary": "#6366F1", "onPrimary": "#FFFFFF"}}'
        />
        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <XCircle size={14} />
            {error}
          </p>
        )}
        <p className="mt-2 text-xs text-zinc-400">
          支持格式: {`{ colors: { primary, onPrimary, secondary, onSecondary... } }`}，或拖拽 JSON 文件
        </p>
      </div>
    </div>
  );
}
