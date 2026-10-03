'use client';

import React from 'react';

export type UniversalState = 'NORMAL' | 'LOADING' | 'EMPTY' | 'ERROR' | 'EXPIRED' | 'CANCELLED';

interface HeaderProps {
  title: string;
  subtitle: string;
  currentState: UniversalState;
  onStateChange: (state: UniversalState) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  currentState,
  onStateChange,
}) => {
  return (
    <header className="bg-white border-b border-[#E1E8E1] px-8 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-[#172019] leading-tight">{title}</h2>
        <p className="text-xs text-[#68756C]">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* District Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#F6F8F3] border border-[#E1E8E1] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#172019]">
          <span>📍</span>
          <span>भदोही जिला, उ.प्र.</span>
        </div>

        {/* Universal State Switcher (Audit & Demo Control) */}
        <div className="flex items-center gap-1.5 bg-[#F6F8F3] border border-[#E1E8E1] p-1 rounded-xl text-xs">
          <span className="text-[10px] text-[#68756C] font-bold px-2">UI स्थिति:</span>
          <select
            value={currentState}
            onChange={(e) => onStateChange(e.target.value as UniversalState)}
            className="bg-white border border-[#E1E8E1] rounded-lg px-2.5 py-1 font-semibold text-xs text-[#172019] focus:outline-none focus:ring-1 focus:ring-[#1E7A4C]"
          >
            <option value="NORMAL">सामान्य (NORMAL)</option>
            <option value="LOADING">लोड हो रहा है (LOADING)</option>
            <option value="EMPTY">रिक्त (EMPTY)</option>
            <option value="ERROR">त्रुटि (ERROR)</option>
            <option value="EXPIRED">समाप्त (EXPIRED)</option>
            <option value="CANCELLED">रद्द (CANCELLED)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
