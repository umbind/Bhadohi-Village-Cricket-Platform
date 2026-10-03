'use client';

import React from 'react';

interface SidebarProps {
  activeTab: 'overview' | 'applications' | 'wizard' | 'announcements' | 'reports';
  onTabChange: (tab: 'overview' | 'applications' | 'wizard' | 'announcements' | 'reports') => void;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, pendingCount = 3 }) => {
  const navItems = [
    { id: 'overview', label: '📊 सिंहावलोकन', sub: 'Overview' },
    { id: 'applications', label: '📋 टीम आवेदन समीक्षा', sub: 'Applications Review', badge: pendingCount },
    { id: 'wizard', label: '➕ नई प्रतियोगिता बनाएं', sub: 'Tournament Wizard' },
    { id: 'announcements', label: '📢 आधिकारिक घोषणाएं', sub: 'Announcements' },
    { id: 'reports', label: '🛡️ शिकायत निवारण', sub: 'Reports Queue' },
  ] as const;

  return (
    <aside className="w-72 bg-[#123B2A] text-white flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1E7A4C]/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏏</span>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">भदोही क्रिकेट</h1>
              <p className="text-[11px] text-emerald-300">आयोजक डेस्कटॉप डैशबोर्ड</p>
            </div>
          </div>
          
          <div className="mt-4 bg-[#1E7A4C]/30 border border-[#1E7A4C]/60 rounded-xl p-2.5">
            <span className="text-[10px] text-emerald-200 block uppercase font-bold tracking-wider">सक्रिय प्रतियोगिता</span>
            <p className="text-xs font-bold text-white truncate">ज्ञानपुर ग्रामीण क्रिकेट कप 2026</p>
            <span className="inline-block mt-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
              पंजीकरण खुला है
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all min-touch ${
                  isActive
                    ? 'bg-[#1E7A4C] text-white font-bold shadow-md'
                    : 'text-emerald-100/80 hover:bg-[#1E7A4C]/20 hover:text-white'
                }`}
              >
                <div>
                  <span className="block text-xs font-semibold">{item.label}</span>
                  <span className="block text-[10px] opacity-70">{item.sub}</span>
                </div>
                {item.badge ? (
                  <span className="bg-[#F4B942] text-[#172019] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-[#1E7A4C]/30">
        <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-[#1E7A4C] flex items-center justify-center font-bold text-sm text-white shrink-0">
            आयोजक
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">राजेश त्रिपाठी</p>
            <p className="text-[10px] text-emerald-300/80">ज्ञानपुर ब्लॉक • आयोजक</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
