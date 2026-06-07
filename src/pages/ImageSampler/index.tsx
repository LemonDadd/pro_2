import { useState, useRef, useEffect } from 'react';
import { Upload, MousePointer2, Pipette, Plus, Check } from 'lucide-react';
import { rgbToHex, getContrastResult } from '@/utils/color';
import ContrastBadges from '@/components/ContrastBadge/ContrastBadges';
import { suggestBetterPair } from '@/utils/suggest';
import { buildReportItem } from '@/utils/report';
import { useAuditStore } from '@/store/auditStore';

type PickMode = 'fg' | 'bg' | null;

export default function ImageSampler() {
  const { samplerItem, setSamplerItem } = useAuditStore();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fgColor, setFgColor] = useState('#1F2937');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [pickMode, setPickMode] = useState<PickMode>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contrastResult = getContrastResult(fgColor, bgColor);
  const suggestion = !contrastResult.passAANormal ? suggestBetterPair(fgColor, bgColor, 4.5) : null;
  const isInReport = !!samplerItem && samplerItem.fg === fgColor && samplerItem.bg === bgColor;

  const handleAddToReport = () => {
    if (isInReport) {
      setSamplerItem(null);
    } else {
      const item = buildReportItem('图片取样', '取样前景 / 背景', fgColor, bgColor);
      setSamplerItem(item);
    }
  };

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imgRef.current = img;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pickMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex({ r: pixel[0], g: pixel[1], b: pixel[2] });

    if (pickMode === 'fg') {
      setFgColor(hex);
    } else {
      setBgColor(hex);
    }
    setPickMode(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageSrc(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">图片取样</h1>
        <p className="text-zinc-500 mt-1">
          上传设计稿图片，点击取色检查实际界面元素的对比度
        </p>
      </div>

      {!imageSrc ? (
        <div
          className="border-2 border-dashed border-zinc-200 rounded-xl p-16 text-center bg-white"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload size={40} className="mx-auto text-zinc-400 mb-4" />
          <p className="text-zinc-700 font-medium mb-1">上传图片</p>
          <p className="text-sm text-zinc-500 mb-4">拖拽图片到此处或点击上传</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            选择图片
          </button>
          <p className="text-xs text-zinc-400 mt-3">支持 PNG、JPG 格式</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-3 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700">图片预览</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-zinc-500 hover:text-zinc-700"
                >
                  更换图片
                </button>
              </div>
              <div
                className={`p-4 bg-zinc-100 overflow-auto ${
                  pickMode ? 'cursor-crosshair' : ''
                }`}
                style={{ maxHeight: '60vh' }}
              >
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="max-w-full h-auto mx-auto block rounded shadow-md"
                  style={{ cursor: pickMode ? 'crosshair' : 'default' }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
              <p className="text-sm font-medium text-zinc-700 mb-3">取色设置</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-zinc-300 shadow-inner"
                      style={{ backgroundColor: fgColor }}
                    />
                    <div>
                      <p className="text-xs text-zinc-500">前景色</p>
                      <p className="font-mono text-sm text-zinc-700">{fgColor}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPickMode(pickMode === 'fg' ? null : 'fg')}
                    className={`p-2 rounded-lg transition-colors ${
                      pickMode === 'fg'
                        ? 'bg-amber-500 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    <Pipette size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-zinc-300 shadow-inner"
                      style={{ backgroundColor: bgColor }}
                    />
                    <div>
                      <p className="text-xs text-zinc-500">背景色</p>
                      <p className="font-mono text-sm text-zinc-700">{bgColor}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPickMode(pickMode === 'bg' ? null : 'bg')}
                    className={`p-2 rounded-lg transition-colors ${
                      pickMode === 'bg'
                        ? 'bg-amber-500 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    <Pipette size={16} />
                  </button>
                </div>
              </div>

              {pickMode && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg text-xs text-amber-700 flex items-center gap-2">
                  <MousePointer2 size={12} />
                  点击图片选取{pickMode === 'fg' ? '前景' : '背景'}色
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-sm text-zinc-500">对比度</span>
                <span
                  className={`text-3xl font-bold font-mono ${
                    contrastResult.passAANormal ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {contrastResult.ratio.toFixed(2)}
                  <span className="text-lg text-zinc-400">:1</span>
                </span>
              </div>
              <ContrastBadges result={contrastResult} />
              <button
                onClick={handleAddToReport}
                className={`mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isInReport
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                {isInReport ? <Check size={14} /> : <Plus size={14} />}
                {isInReport ? '已加入报告' : '加入报告'}
              </button>
            </div>

            {suggestion && (
              <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                <p className="text-sm font-medium text-amber-800 mb-2">💡 建议修正</p>
                <div className="text-xs text-amber-700 space-y-1">
                  {suggestion.suggestedFg && (
                    <div className="flex items-center gap-2">
                      <span>前景:</span>
                      <span className="font-mono">{suggestion.suggestedFg}</span>
                    </div>
                  )}
                  {suggestion.suggestedBg && (
                    <div className="flex items-center gap-2">
                      <span>背景:</span>
                      <span className="font-mono">{suggestion.suggestedBg}</span>
                    </div>
                  )}
                  <div className="pt-1 font-medium">
                    修正后: {suggestion.suggestedRatio.toFixed(2)}:1
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
        <h3 className="text-sm font-medium text-zinc-700 mb-2">使用提示</h3>
        <ul className="text-xs text-zinc-500 space-y-1">
          <li>• 点击取色按钮后，在图片上点击即可选取颜色</li>
          <li>• 建议选取实际文字和背景区域进行对比</li>
          <li>• 图片会与白底合成后计算，忽略 alpha 通道</li>
          <li>• 对于复杂渐变，建议选取最浅/最深处分别测试</li>
        </ul>
      </div>
    </div>
  );
}
