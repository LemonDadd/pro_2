import { useState, useEffect } from 'react';
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, isValidHex, normalizeHex } from '@/utils/color';
import type { RGB, HSL } from '@/types';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  swatchPosition?: 'left' | 'right';
}

type InputFormat = 'hex' | 'rgb' | 'hsl';

export default function ColorInput({ label, value, onChange, swatchPosition = 'left' }: ColorInputProps) {
  const [format, setFormat] = useState<InputFormat>('hex');
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const rgb = hexToRgb(value);
  const hsl = rgbToHsl(rgb);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (isValidHex(val)) {
      onChange(normalizeHex(val));
    }
  };

  const handleRgbChange = (channel: keyof RGB, val: string) => {
    const num = parseInt(val) || 0;
    const clamped = Math.max(0, Math.min(255, num));
    const newRgb = { ...rgb, [channel]: clamped };
    const newHex = rgbToHex(newRgb);
    onChange(newHex);
  };

  const handleHslChange = (channel: keyof HSL, val: string) => {
    const num = parseInt(val) || 0;
    let clamped: number;
    if (channel === 'h') {
      clamped = Math.max(0, Math.min(360, num));
    } else {
      clamped = Math.max(0, Math.min(100, num));
    }
    const newHsl = { ...hsl, [channel]: clamped };
    const newRgb = hslToRgb(newHsl);
    const newHex = rgbToHex(newRgb);
    onChange(newHex);
  };

  const formatTabs: { key: InputFormat; label: string }[] = [
    { key: 'hex', label: 'HEX' },
    { key: 'rgb', label: 'RGB' },
    { key: 'hsl', label: 'HSL' },
  ];

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-zinc-100">
        <span className="text-sm font-medium text-zinc-700">{label}</span>
        <div className="flex gap-1 bg-zinc-100 rounded-lg p-0.5">
          {formatTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFormat(tab.key)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                format === tab.key
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex gap-4">
        {swatchPosition === 'left' && (
          <div className="flex-shrink-0">
            <div
              className="w-16 h-16 rounded-lg border border-zinc-200 shadow-inner"
              style={{ backgroundColor: value }}
            />
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="w-16 h-8 mt-2 cursor-pointer rounded"
            />
          </div>
        )}

        <div className="flex-1 space-y-2">
          {format === 'hex' && (
            <div>
              <label className="text-xs text-zinc-500 block mb-1">HEX</label>
              <input
                type="text"
                value={localValue}
                onChange={handleHexChange}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="#FFFFFF"
              />
            </div>
          )}

          {format === 'rgb' && (
            <div className="grid grid-cols-3 gap-2">
              {(['r', 'g', 'b'] as const).map((channel) => (
                <div key={channel}>
                  <label className="text-xs text-zinc-500 block mb-1 uppercase">{channel}</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb[channel]}
                    onChange={(e) => handleRgbChange(channel, e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>
              ))}
            </div>
          )}

          {format === 'hsl' && (
            <div className="grid grid-cols-3 gap-2">
              {(['h', 's', 'l'] as const).map((channel) => (
                <div key={channel}>
                  <label className="text-xs text-zinc-500 block mb-1 uppercase">{channel}</label>
                  <input
                    type="number"
                    min={channel === 'h' ? 0 : 0}
                    max={channel === 'h' ? 360 : 100}
                    value={hsl[channel]}
                    onChange={(e) => handleHslChange(channel, e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {swatchPosition === 'right' && (
          <div className="flex-shrink-0">
            <div
              className="w-16 h-16 rounded-lg border border-zinc-200 shadow-inner"
              style={{ backgroundColor: value }}
            />
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="w-16 h-8 mt-2 cursor-pointer rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
