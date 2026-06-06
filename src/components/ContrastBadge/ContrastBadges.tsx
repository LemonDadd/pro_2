import type { ContrastResult } from '@/types';

interface ContrastBadgeProps {
  result: ContrastResult;
}

export default function ContrastBadges({ result }: ContrastBadgeProps) {
  const badges = [
    { label: 'AA 正文', pass: result.passAANormal, standard: '≥ 4.5' },
    { label: 'AA 大字', pass: result.passAALarge, standard: '≥ 3' },
    { label: 'AAA 正文', pass: result.passAAANormal, standard: '≥ 7' },
    { label: 'AAA 大字', pass: result.passAAALarge, standard: '≥ 4.5' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-all duration-300 ${
            badge.pass
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
              : 'bg-red-500/10 text-red-600 border border-red-200'
          }`}
        >
          <span>{badge.label}</span>
          <span className="text-xs font-mono opacity-70">{badge.pass ? '✓' : '✗'}</span>
        </div>
      ))}
    </div>
  );
}
