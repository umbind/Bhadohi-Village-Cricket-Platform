'use client';

import React, { useState } from 'react';
import { TeamApplicationData } from './RosterDrawer';

interface ApplicationsTableProps {
  applications: TeamApplicationData[];
  onInspect: (team: TeamApplicationData) => void;
  onAccept: (teamId: string) => void;
  onReject: (teamId: string) => void;
}

export const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  onInspect,
  onAccept,
  onReject,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = applications.filter((app) => {
    if (filter !== 'ALL' && app.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        app.teamName.toLowerCase().includes(q) ||
        app.village.toLowerCase().includes(q) ||
        app.captainName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#E1E8E1] shadow-sm overflow-hidden">
      {/* Table Controls */}
      <div className="p-5 border-b border-[#E1E8E1] flex flex-wrap items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#F6F8F3] p-1 rounded-xl">
          {[
            { id: 'ALL', label: 'सभी (All)' },
            { id: 'PENDING', label: 'लंबित (Pending)' },
            { id: 'ACCEPTED', label: 'स्वीकृत (Accepted)' },
            { id: 'REJECTED', label: 'अस्वीकृत (Rejected)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-touch ${
                filter === tab.id
                  ? 'bg-[#1E7A4C] text-white shadow-xs'
                  : 'text-[#68756C] hover:text-[#172019]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="टीम या गांव खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl pl-9 pr-3 py-2 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
          />
          <span className="absolute left-3 top-2.5 text-xs text-[#68756C]">🔍</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F6F8F3] text-[#68756C] border-b border-[#E1E8E1]">
              <th className="py-3.5 px-5 font-bold">टीम का नाम (Team)</th>
              <th className="py-3.5 px-5 font-bold">गांव / कस्बा (Village)</th>
              <th className="py-3.5 px-5 font-bold">कप्तान (Captain)</th>
              <th className="py-3.5 px-5 font-bold">स्क्वाड (Squad)</th>
              <th className="py-3.5 px-5 font-bold">आवेदन तिथि (Applied Date)</th>
              <th className="py-3.5 px-5 font-bold">स्थिति (Status)</th>
              <th className="py-3.5 px-5 font-bold text-right">कार्रवाई (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1E8E1]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#68756C]">
                  कोई टीम आवेदन नहीं मिला।
                </td>
              </tr>
            ) : (
              filtered.map((team) => (
                <tr key={team.id} className="hover:bg-[#F6F8F3]/60 transition-colors">
                  <td className="py-4 px-5 font-bold text-[#172019]">
                    {team.teamName}
                  </td>
                  <td className="py-4 px-5 text-[#68756C]">{team.village}</td>
                  <td className="py-4 px-5 text-[#172019] font-medium">{team.captainName}</td>
                  <td className="py-4 px-5">
                    <span className="inline-block bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      {team.members.length}/15 पूर्ण
                    </span>
                  </td>
                  <td className="py-4 px-5 text-[#68756C]">{team.appliedDate}</td>
                  <td className="py-4 px-5">
                    {team.status === 'PENDING' && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        लंबित (Pending)
                      </span>
                    )}
                    {team.status === 'ACCEPTED' && (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        स्वीकृत (Accepted)
                      </span>
                    )}
                    {team.status === 'REJECTED' && (
                      <span className="bg-red-100 text-red-900 border border-red-300 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        अस्वीकृत (Rejected)
                      </span>
                    )}
                    {team.status === 'WITHDRAWN' && (
                      <span className="bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        वापस लिया गया
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right space-x-2">
                    <button
                      onClick={() => onInspect(team)}
                      className="px-3 py-1.5 bg-[#F6F8F3] hover:bg-[#E1E8E1] text-[#172019] border border-[#E1E8E1] rounded-lg font-bold min-touch transition-all"
                    >
                      रोस्टर देखें
                    </button>
                    {team.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => onAccept(team.id)}
                          className="px-3 py-1.5 bg-[#1E7A4C] hover:bg-[#165a38] text-white rounded-lg font-bold min-touch shadow-xs transition-all"
                        >
                          स्वीकार
                        </button>
                        <button
                          onClick={() => onReject(team.id)}
                          className="px-3 py-1.5 bg-white border border-[#C74D4D] text-[#C74D4D] hover:bg-red-50 rounded-lg font-bold min-touch transition-all"
                        >
                          अस्वीकार
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
