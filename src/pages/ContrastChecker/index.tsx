import { useState, useEffect } from 'react';
import { ArrowDownUp, Sparkles } from 'lucide-react';
import ColorInput from '@/components/ColorInput/ColorInput';
import ContrastBadges from '@/components/ContrastBadge/ContrastBadges';
import { getContrastResult, getColorInfo } from '@/utils/color';
import { suggestBetterPair } from '@/utils/suggest';
import { useAuditStore } from '@/store/auditStore';

export default function ContrastChecker() {
  const { currentFg, currentBg, setCurrentColors } = useAuditStore();
  const [fg, setFg] = useState(currentFg);
  const [bg, setBg] = useState(currentBg);
  const [suggestedFg, setSuggestedFg] = useState<string | undefined>();
  const [suggestedBg, setSuggestedBg] = useState<string | undefined>();
  const [suggestedRatio, setSuggestedRatio] = useState<number | undefined>();

  const contrastResult = getContrastResult(fg, bg);
  const fgInfo = getColorInfo(fg);
  const bgInfo = getColorInfo(bg);

  useEffect(() => {
    setCurrentColors(fg, bg);
  }, [fg, bg, setCurrentColors]);

  useEffect(() => {
    if (!contrastResult.passAANormal) {
      const suggestion = suggestBetterPair(fg, bg, 4.5);
      if (suggestion) {
        setSuggestedFg(suggestion.suggestedFg);
        setSuggestedBg(suggestion.suggestedBg);
        setSuggestedRatio(suggestion.suggestedRatio);
      }
    } else {
      setSuggestedFg(undefined);
      setSuggestedBg(undefined);
      setSuggestedRatio(undefined);
    }
  }, [fg, bg, contrastResult.passAANormal]);

  const handleSwap = () => {
    setFg(bg);
    setBg(fg);
  };

  const applySuggestion = () => {
    if (suggestedFg) setFg(suggestedFg);
    if (suggestedBg) setBg(suggestedBg);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">双色对比度检查</h1>
        <p className="text-zinc-500 mt-1">
          输入前景色和背景色，检查 WCAG 对比度合规性
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ColorInput label="前景色 (Text)" value={fg} onChange={setFg} swatchPosition="left" />
        <ColorInput label="背景色 (Background)" value={bg} onChange={setBg} swatchPosition="right" />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSwap}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors text-sm"
        >
          <ArrowDownUp size={16} />
          互换颜色
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-zinc-500 mb-1">对比度比率</p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-5xl font-bold font-mono ${
                  contrastResult.passAANormal ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {contrastResult.ratio.toFixed(2)}
              </span>
              <span className="text-2xl text-zinc-400">: 1</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-zinc-500 mb-2">WCAG 2.1 标准</p>
            <div className="w-56">
              <ContrastBadges result={contrastResult} />
            </div>
          </div>
        </div>

        {!contrastResult.passAANormal && (suggestedFg || suggestedBg) && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-600" />
                <span className="font-medium text-amber-800">建议修正</span>
              </div>
              <button
                onClick={applySuggestion}
                className="text-sm px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              >
                应用
              </button>
            </div>
            <div className="mt-3 flex items-center gap-4">
              {suggestedFg && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600">前景:</span>
                  <div
                    className="w-6 h-6 rounded border border-zinc-300"
                    style={{ backgroundColor: suggestedFg }}
                  />
                  <span className="font-mono text-sm text-zinc-700">{suggestedFg}</span>
                  <span className="text-xs text-zinc-500">
                    (原 {fg})
                  </span>
                </div>
              )}
              {suggestedBg && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600">背景:</span>
                  <div
                    className="w-6 h-6 rounded border border-zinc-300"
                    style={{ backgroundColor: suggestedBg }}
                  />
                  <span className="font-mono text-sm text-zinc-700">{suggestedBg}</span>
                  <span className="text-xs text-zinc-500">
                    (原 {bg})
                  </span>
                </div>
              )}
              {suggestedRatio && (
                <span className="text-sm font-medium text-emerald-600 ml-auto">
                  {suggestedRatio.toFixed(2)}:1 ✓
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">实时预览</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className="rounded-xl p-6 shadow-sm border border-zinc-200"
            style={{ backgroundColor: bg }}
          >
            <p className="text-xs font-medium mb-4" style={{ color: fg, opacity: 0.7 }}>
              预览 — 白底文字
            </p>
            <h3 style={{ color: fg, fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
              这是 18px 粗体大字
            </h3>
            <p style={{ color: fg, fontSize: '14px', lineHeight: 1.6 }}>
              这是 14px 正文字体样例。用于展示在实际应用中，正文大小的文字在该配色下的可读性效果。好的对比度可以确保所有用户都能轻松阅读内容。
            </p>
            <div className="mt-4 flex gap-2">
              <button
                style={{ backgroundColor: fg, color: bg, fontSize: '14px', padding: '8px 16px', borderRadius: '6px', fontWeight: 500 }}
              >
                主要按钮
              </button>
              <button
                style={{ border: `1px solid ${fg}`, color: fg, fontSize: '14px', padding: '8px 16px', borderRadius: '6px', fontWeight: 500 }}
              >
                次要按钮
              </button>
            </div>
          </div>

          <div
            className="rounded-xl p-6 shadow-sm border border-zinc-200"
            style={{ backgroundColor: fg }}
          >
            <p className="text-xs font-medium mb-4" style={{ color: bg, opacity: 0.7 }}>
              预览 — 反色文字
            </p>
            <h3 style={{ color: bg, fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
              这是 18px 粗体大字
            </h3>
            <p style={{ color: bg, fontSize: '14px', lineHeight: 1.6 }}>
              这是 14px 正文字体样例。用于展示在实际应用中，正文大小的文字在该配色下的可读性效果。好的对比度可以确保所有用户都能轻松阅读内容。
            </p>
            <div className="mt-4 flex gap-2">
              <button
                style={{ backgroundColor: bg, color: fg, fontSize: '14px', padding: '8px 16px', borderRadius: '6px', fontWeight: 500 }}
              >
                主要按钮
              </button>
              <button
                style={{ border: `1px solid ${bg}`, color: bg, fontSize: '14px', padding: '8px 16px', borderRadius: '6px', fontWeight: 500 }}
              >
                次要按钮
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <h3 className="text-sm font-medium text-zinc-700 mb-4">颜色信息</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-zinc-500 mb-2">前景色</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">HEX</span>
                <span className="font-mono text-zinc-700">{fgInfo.hex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">RGB</span>
                <span className="font-mono text-zinc-700">
                  {fgInfo.rgb.r}, {fgInfo.rgb.g}, {fgInfo.rgb.b}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">HSL</span>
                <span className="font-mono text-zinc-700">
                  {fgInfo.hsl.h}°, {fgInfo.hsl.s}%, {fgInfo.hsl.l}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">相对亮度</span>
                <span className="font-mono text-zinc-700">{fgInfo.luminance.toFixed(4)}</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-2">背景色</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">HEX</span>
                <span className="font-mono text-zinc-700">{bgInfo.hex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">RGB</span>
                <span className="font-mono text-zinc-700">
                  {bgInfo.rgb.r}, {bgInfo.rgb.g}, {bgInfo.rgb.b}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">HSL</span>
                <span className="font-mono text-zinc-700">
                  {bgInfo.hsl.h}°, {bgInfo.hsl.s}%, {bgInfo.hsl.l}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">相对亮度</span>
                <span className="font-mono text-zinc-700">{bgInfo.luminance.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
