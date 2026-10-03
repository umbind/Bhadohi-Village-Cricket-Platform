'use client';

import React, { useState } from 'react';

export interface RosterMember {
  id: string;
  name: string;
  village: string;
  role: 'बल्लेबाज' | 'गेंदबाज' | 'ऑलराउंडर' | 'विकेटकीपर';
  style: string;
  isCaptain?: boolean;
}

export interface TeamApplicationData {
  id: string;
  teamName: string;
  village: string;
  captainName: string;
  captainMobile: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  appliedDate: string;
  members: RosterMember[];
}

interface RosterDrawerProps {
  isOpen: boolean;
  team: TeamApplicationData | null;
  onClose: () => void;
  onAccept: (teamId: string) => void;
  onReject: (teamId: string, reason: string) => void;
}

export const RosterDrawer: React.FC<RosterDrawerProps> = ({
  isOpen,
  team,
  onClose,
  onAccept,
  onReject,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen || !team) return null;

  const handleRejectClick = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    onReject(team.id, rejectReason || 'प्रतियोगिता नियमों के अनुसार आवेदन अस्वीकृत');
    setShowRejectInput(false);
    setRejectReason('');
  };

  const whatsappMessage = encodeURIComponent(
    `नमस्ते कप्तान ${team.captainName} जी, मैं भदोही क्रिकेट कप आयोजक बात कर रहा हूँ। आपकी टीम "${team.teamName}" के आवेदन के संदर्भ में:`
  );
  const whatsappUrl = `https://wa.me/91${team.captainMobile}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white border-l border-[#E1E8E1] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-[#E1E8E1] bg-[#F6F8F3]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-[#1E7A4C] text-white px-2 py-0.5 rounded font-bold uppercase">
                  टीम रोस्टर सत्यापन
                </span>
                <h3 className="font-bold text-lg text-[#123B2A] mt-1">{team.teamName}</h3>
                <p className="text-xs text-[#68756C]">📍 {team.village} • कप्तान: {team.captainName}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border border-[#E1E8E1] flex items-center justify-center font-bold text-[#172019] hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            {/* Direct WhatsApp Action for Organizer */}
            <div className="mt-4 pt-3 border-t border-[#E1E8E1] flex items-center justify-between">
              <span className="text-xs text-[#68756C]">कप्तान संपर्क (WhatsApp):</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold shadow-xs min-touch"
              >
                <span>💬</span>
                <span>कॉल/मैसेज करें</span>
              </a>
            </div>
          </div>

          {/* Squad Member List */}
          <div className="p-6 overflow-y-auto flex-1 space-y-2.5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-[#172019]">पंजीकृत खिलाड़ी ({team.members.length}/15)</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                आयु 18+ अनिवार्य
              </span>
            </div>

            {team.members.map((member, idx) => (
              <div
                key={member.id}
                className="p-3 bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#172019]">
                      {idx + 1}. {member.name}
                    </span>
                    {member.isCaptain ? (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                        (कप्तान)
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-[#68756C] mt-0.5">
                    {member.role} • {member.style} • {member.village}
                  </p>
                </div>
                <span className="text-[10px] bg-white border border-[#E1E8E1] text-[#1E7A4C] font-bold px-2 py-0.5 rounded">
                  ✓ सत्यापित
                </span>
              </div>
            ))}
          </div>

          {/* Review Decision Actions */}
          <div className="p-6 border-t border-[#E1E8E1] bg-[#F6F8F3] space-y-3">
            {team.status === 'PENDING' ? (
              <>
                {showRejectInput ? (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#172019]">
                      अस्वीकृति का कारण (Reason for Rejection):
                    </label>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="उदा: टीम का नाम पहले से पंजीकृत है..."
                      className="w-full bg-white border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#C74D4D]"
                    />
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <button
                    onClick={() => onAccept(team.id)}
                    className="flex-1 py-3 bg-[#1E7A4C] hover:bg-[#165a38] text-white rounded-xl text-xs font-bold shadow-md min-touch"
                  >
                    ✓ टीम स्वीकार करें (Accept)
                  </button>
                  <button
                    onClick={handleRejectClick}
                    className="py-3 px-4 bg-white border border-[#C74D4D] text-[#C74D4D] hover:bg-red-50 rounded-xl text-xs font-bold min-touch"
                  >
                    ✕ {showRejectInput ? 'अस्वीकृति की पुष्टि' : 'अस्वीकार करें'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    team.status === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  स्थिति: {team.status === 'ACCEPTED' ? 'स्वीकृत (ACCEPTED)' : 'अस्वीकृत (REJECTED)'}
                </span>
              </div>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
};
