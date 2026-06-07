import type { ReportItem, AuditReport, TokenPair } from '@/types';
import { getContrastResult } from './color';
import { suggestBetterPair } from './suggest';

export function buildReportItem(
  source: string,
  role: string,
  fg: string,
  bg: string,
  targetRatio: number = 4.5
): ReportItem {
  const contrast = getContrastResult(fg, bg);
  const suggestion = suggestBetterPair(fg, bg, targetRatio);
  return {
    source,
    role,
    fg,
    bg,
    ratio: contrast.ratio,
    passAA: contrast.passAANormal,
    passAAA: contrast.passAAANormal,
    suggestedFg: suggestion?.suggestedFg,
    suggestedBg: suggestion?.suggestedBg,
    suggestedRatio: suggestion?.suggestedRatio,
  };
}

export function generateMarkdownReport(report: AuditReport): string {
  const lines: string[] = [];

  lines.push('# 无障碍配色对比度审计报告');
  lines.push('');
  lines.push(`生成时间: ${report.generatedAt}`);
  lines.push('');
  lines.push('## 概览');
  lines.push('');
  lines.push(`| 指标 | 数值 |`);
  lines.push(`|------|------|`);
  lines.push(`| 总检查项 | ${report.total} |`);
  lines.push(`| AA 级通过 | ${report.passAA} (${((report.passAA / report.total) * 100).toFixed(1)}%) |`);
  lines.push(`| AAA 级通过 | ${report.passAAA} (${((report.passAAA / report.total) * 100).toFixed(1)}%) |`);
  lines.push(`| 未通过项 | ${report.failCount} |`);
  lines.push('');

  lines.push('## 未通过项详情');
  lines.push('');

  const failItems = report.items.filter(item => !item.passAA);
  if (failItems.length === 0) {
    lines.push('🎉 所有配对均通过 AA 级标准！');
  } else {
    for (const item of failItems) {
      lines.push(`### ${item.role}`);
      lines.push('');
      lines.push(`- **来源**: ${item.source}`);
      lines.push(`- **前景色**: \`${item.fg}\``);
      lines.push(`- **背景色**: \`${item.bg}\``);
      lines.push(`- **对比度**: ${item.ratio.toFixed(2)}:1`);
      lines.push(`- **AA 级 (4.5:1)**: ${item.passAA ? '✅ 通过' : '❌ 未通过'}`);
      lines.push(`- **AAA 级 (7:1)**: ${item.passAAA ? '✅ 通过' : '❌ 未通过'}`);
      lines.push('');

      if (item.suggestedFg || item.suggestedBg) {
        lines.push('#### 建议修正');
        lines.push('');
        if (item.suggestedFg) {
          lines.push(`- **建议前景色**: \`${item.suggestedFg}\``);
        }
        if (item.suggestedBg) {
          lines.push(`- **建议背景色**: \`${item.suggestedBg}\``);
        }
        if (item.suggestedRatio) {
          lines.push(`- **修正后对比度**: ${item.suggestedRatio.toFixed(2)}:1`);
        }
        lines.push('');
      }
    }
  }

  lines.push('## 全部检查结果');
  lines.push('');
  lines.push('| 角色 | 前景 | 背景 | 对比度 | AA | AAA |');
  lines.push('|------|------|------|--------|----|-----|');

  for (const item of report.items) {
    lines.push(
      `| ${item.role} | \`${item.fg}\` | \`${item.bg}\` | ${item.ratio.toFixed(2)}:1 | ${
        item.passAA ? '✅' : '❌'
      } | ${item.passAAA ? '✅' : '❌'} |`
    );
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*报告由无障碍配色对比度审计工具生成*');

  return lines.join('\n');
}

export function buildAuditReport(items: ReportItem[]): AuditReport {
  const total = items.length;
  const passAA = items.filter(i => i.passAA).length;
  const passAAA = items.filter(i => i.passAAA).length;
  const failCount = total - passAA;

  return {
    total,
    passAA,
    passAAA,
    failCount,
    items,
    generatedAt: new Date().toLocaleString('zh-CN'),
  };
}

export function tokenPairsToReportItems(
  pairs: TokenPair[],
  source: string
): ReportItem[] {
  return pairs.map(pair => ({
    source,
    role: pair.role,
    fg: pair.fg,
    bg: pair.bg,
    ratio: pair.ratio,
    passAA: pair.passAA,
    passAAA: pair.passAAA,
    suggestedFg: pair.suggestedFg,
    suggestedBg: pair.suggestedBg,
    suggestedRatio: pair.suggestedRatio,
  }));
}

export function downloadMarkdown(content: string, filename: string = 'contrast-audit-report.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printReport() {
  window.print();
}
