import { NavLink } from 'react-router-dom';
import { Contrast, Palette, Eye, FileText, Image } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: '双色检查', icon: <Contrast size={20} /> },
  { path: '/palette', label: '调色板批量', icon: <Palette size={20} /> },
  { path: '/simulate', label: '色盲模拟', icon: <Eye size={20} /> },
  { path: '/sampler', label: '图片取样', icon: <Image size={20} /> },
  { path: '/report', label: '报告导出', icon: <FileText size={20} /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-zinc-900 text-zinc-100 transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-16 flex items-center px-4 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-900 font-bold text-sm flex-shrink-0">
          A11y
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <h1 className="font-semibold text-sm text-white whitespace-nowrap">对比度审计</h1>
            <p className="text-xs text-zinc-500 whitespace-nowrap">WCAG 2.1</p>
          </div>
        )}
      </div>

      <nav className="py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mx-2 my-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`
            }
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-zinc-500 hover:text-zinc-300 text-xs"
        >
          {collapsed ? '→' : '← 收起'}
        </button>
      </div>
    </aside>
  );
}
