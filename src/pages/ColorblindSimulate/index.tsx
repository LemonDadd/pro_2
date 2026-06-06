import { useState, useRef } from 'react';
import { Upload, Image } from 'lucide-react';
import { simulateColorblind, colorblindInfo } from '@/utils/colorblind';
import type { ColorblindType } from '@/types';
import ColorInput from '@/components/ColorInput/ColorInput';

const sampleColors = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
  '#6B7280', '#1F2937', '#F9FAFB', '#FFFFFF'
];

export default function ColorblindSimulate() {
  const [baseColor, setBaseColor] = useState('#6366F1');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const types: ColorblindType[] = ['protanopia', 'deuteranopia', 'tritanopia'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getFilterUrl = (type: ColorblindType) => {
    return `url(#colorblind-${type})`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">色盲模拟</h1>
        <p className="text-zinc-500 mt-1">
          模拟三种常见色盲类型的视觉效果，验证配色的可访问性
        </p>
      </div>

      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="colorblind-protanopia">
            <feColorMatrix type="matrix" values="
              0.567 0.433 0     0 0
              0.558 0.442 0     0 0
              0     0.242 0.758 0 0
              0     0     0     1 0
            "/>
          </filter>
          <filter id="colorblind-deuteranopia">
            <feColorMatrix type="matrix" values="
              0.625 0.375 0   0 0
              0.7   0.3   0   0 0
              0     0.3   0.7 0 0
              0     0     0   1 0
            "/>
          </filter>
          <filter id="colorblind-tritanopia">
            <feColorMatrix type="matrix" values="
              0.95  0.05  0     0 0
              0     0.433 0.567 0 0
              0     0.475 0.525 0 0
              0     0     0     1 0
            "/>
          </filter>
        </defs>
      </svg>

      <div className="grid md:grid-cols-2 gap-6">
        <ColorInput label="前景色" value={baseColor} onChange={setBaseColor} swatchPosition="left" />
        <ColorInput label="背景色" value={bgColor} onChange={setBgColor} swatchPosition="right" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">调色板预览</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
            <p className="text-sm font-medium text-zinc-700 mb-3">正常视觉</p>
            <div className="grid grid-cols-5 gap-1">
              {sampleColors.map((color) => (
                <div
                  key={color}
                  className="aspect-square rounded-md border border-zinc-200"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {types.map((type) => (
            <div key={type} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-zinc-700">{colorblindInfo[type].name}</p>
                <span className="text-xs text-zinc-400">{type}</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {sampleColors.map((color) => (
                  <div
                    key={color}
                    className="aspect-square rounded-md border border-zinc-200"
                    style={{ backgroundColor: simulateColorblind(color, type) }}
                    title={`${color} → ${simulateColorblind(color, type)}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">文字预览</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            className="rounded-xl p-5 border border-zinc-200 shadow-sm"
            style={{ backgroundColor: bgColor }}
          >
            <p className="text-xs text-zinc-500 mb-2" style={{ color: baseColor, opacity: 0.6 }}>
              正常
            </p>
            <p style={{ color: baseColor, fontSize: '20px', fontWeight: 'bold' }}>
              Aa 文字测试
            </p>
            <p style={{ color: baseColor, fontSize: '13px', marginTop: '8px' }}>
              这是一段测试文字
            </p>
          </div>

          {types.map((type) => (
            <div
              key={type}
              className="rounded-xl p-5 border border-zinc-200 shadow-sm"
              style={{ backgroundColor: simulateColorblind(bgColor, type) }}
            >
              <p className="text-xs mb-2" style={{ color: simulateColorblind(baseColor, type), opacity: 0.6 }}>
                {colorblindInfo[type].name}
              </p>
              <p style={{ color: simulateColorblind(baseColor, type), fontSize: '20px', fontWeight: 'bold' }}>
                Aa 文字测试
              </p>
              <p style={{ color: simulateColorblind(baseColor, type), fontSize: '13px', marginTop: '8px' }}>
                这是一段测试文字
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">图片模拟</h2>
          <label className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <Image size={14} />
              上传图片
            </button>
          </label>
        </div>

        {!previewImage && (
          <div
            className="border-2 border-dashed border-zinc-200 rounded-xl p-12 text-center"
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => setPreviewImage(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload size={32} className="mx-auto text-zinc-400 mb-3" />
            <p className="text-sm text-zinc-500">拖拽图片到此处或点击上传</p>
            <p className="text-xs text-zinc-400 mt-1">支持 PNG、JPG 格式</p>
          </div>
        )}

        {previewImage && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <p className="text-xs font-medium text-zinc-500 px-3 py-2 border-b border-zinc-100">正常</p>
              <img
                src={previewImage}
                alt="Normal vision"
                className="w-full aspect-video object-cover"
              />
            </div>

            {types.map((type) => (
              <div key={type} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <p className="text-xs font-medium text-zinc-500 px-3 py-2 border-b border-zinc-100">
                  {colorblindInfo[type].name}
                </p>
                <div style={{ filter: getFilterUrl(type) }}>
                  <img
                    src={previewImage}
                    alt={`${type} simulation`}
                    className="w-full aspect-video object-cover"
                    style={{ filter: getFilterUrl(type) }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {types.map((type) => (
          <div key={type} className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
            <h3 className="font-medium text-zinc-800 mb-1">{colorblindInfo[type].name}</h3>
            <p className="text-xs text-zinc-500">{colorblindInfo[type].description}</p>
            <div className="mt-3 flex gap-1">
              {['#EF4444', '#22C55E', '#3B82F6'].map((c) => (
                <div
                  key={c}
                  className="w-6 h-6 rounded border border-zinc-300"
                  style={{ backgroundColor: simulateColorblind(c, type) }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
