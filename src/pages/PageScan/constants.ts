export interface ScanItem {
  id: string;
  selector: string;
  fg: string;
  bg: string;
}

export const defaultSelectors = [
  { selector: 'h1', fg: '#111827', bg: '#FFFFFF' },
  { selector: 'p', fg: '#374151', bg: '#FFFFFF' },
  { selector: '.btn-primary', fg: '#FFFFFF', bg: '#6366F1' },
  { selector: '.btn-secondary', fg: '#374151', bg: '#F3F4F6' },
  { selector: 'a', fg: '#6366F1', bg: '#FFFFFF' },
];

export const devToolsSnippet = `// 在目标页面控制台运行此脚本，复制输出结果
// 粘贴到下方"批量导入"区域

(function() {
  const selectors = ['h1', 'h2', 'h3', 'p', 'a', 'button', '.btn', '.btn-primary', '.btn-secondary', 'input', 'textarea', 'select'];
  const results = [];
  const seen = new Set();
  
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const styles = window.getComputedStyle(el);
    const fg = styles.color;
    const bg = styles.backgroundColor;
    
    const rgbToHex = (rgb) => {
      const m = rgb.match(/\\d+/g);
      if (!m || m.length < 3) return null;
      return '#' + m.slice(0,3).map(x => (+x).toString(16).padStart(2,'0')).join('').toUpperCase();
    };
    
    const fgHex = rgbToHex(fg);
    const bgHex = rgbToHex(bg);
    const key = sel + '-' + fgHex + '-' + bgHex;
    
    if (fgHex && bgHex && !seen.has(key)) {
      seen.add(key);
      results.push({ selector: sel, fg: fgHex, bg: bgHex });
    }
  }
  
  console.log(JSON.stringify(results, null, 2));
  console.log('请复制上面的 JSON 粘贴到对比度审计工具中');
  return JSON.stringify(results, null, 2);
})();`;
