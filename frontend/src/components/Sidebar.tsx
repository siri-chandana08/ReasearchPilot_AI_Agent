import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Search, Cpu, Upload, FileText, Sparkles } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Search Papers', path: '/search', icon: Search },
    { name: 'AI Tools', path: '/ai-tools', icon: Cpu },
    { name: 'Upload PDF', path: '/upload', icon: Upload },
    { name: 'DocSpace', path: '/docspace', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between p-4 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-3 py-4 mb-6 border-b border-gray-100">
          <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-md shadow-purple-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-purple-900 leading-none">ResearchHub AI</h1>
            <p className="text-xs text-gray-500 mt-1">Agentic AI Platform</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-100/70 text-purple-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-4 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
        <p className="text-xs font-semibold text-purple-900">Powered by Groq</p>
        <p className="text-[11px] text-purple-600 mt-0.5">Llama 3.3 70B Versatile</p>
      </div>
    </aside>
  );
};
