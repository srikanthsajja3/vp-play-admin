import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  BookOpen, 
  Video, 
  Menu, 
  X, 
  GraduationCap
} from 'lucide-react';

const Layout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Categories', path: '/categories', icon: FolderKanban },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Videos', path: '/videos', icon: Video },
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-850">
          <div className="p-2 bg-violet-650 rounded-xl shadow-lg shadow-violet-550/20 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">VR Play</h1>
            <p className="text-xs text-slate-400 font-medium">Learning CMS</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/15 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">© 2026 VR Play Portal</p>
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-950/80 backdrop-blur-sm">
          <aside className="flex flex-col w-64 bg-slate-950 border-r border-slate-800 animate-slide-in">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-650 rounded-xl text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-white">VR Play</h1>
                  <p className="text-xs text-slate-400">Learning CMS</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-violet-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-850 shrink-0 md:justify-end">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl md:hidden hover:bg-slate-800/50 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-xs px-2.5 py-1 font-semibold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/25">
              Admin Portal
            </span>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-650 flex items-center justify-between text-sm font-semibold text-white justify-center shadow-md">
                AD
              </div>
              <span className="text-sm font-medium text-slate-200 hidden sm:inline-block">Administrator</span>
            </div>
          </div>
        </header>

        {/* Main View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
