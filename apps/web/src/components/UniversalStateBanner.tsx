'use client';

import React from 'react';
import { UniversalState } from './Header';

interface UniversalStateBannerProps {
  state: UniversalState;
  onRetry?: () => void;
}

export const UniversalStateBanner: React.FC<UniversalStateBannerProps> = ({ state, onRetry }) => {
  if (state === 'NORMAL') return null;

  if (state === 'LOADING') {
    return (
      <div className="bg-white rounded-2xl border border-[#E1E8E1] p-12 text-center shadow-sm">
        <div className="inline-block w-8 h-8 border-4 border-[#1E7A4C] border-t-transparent rounded-full animate-spin mb-3"></div>
        <h3 className="font-bold text-base text-[#172019]">डेटा लोड हो रहा है...</h3>
        <p className="text-xs text-[#68756C] mt-1">कृपया प्रतीक्षा करें, नवीनतम जानकारी प्राप्त की जा रही है।</p>
      </div>
    );
  }

  if (state === 'EMPTY') {
    return (
      <div className="bg-white rounded-2xl border border-[#E1E8E1] p-12 text-center shadow-sm">
        <span className="text-4xl block mb-2">📭</span>
        <h3 className="font-bold text-base text-[#172019]">कोई टीम आवेदन नहीं मिला</h3>
        <p className="text-xs text-[#68756C] mt-1">इस टूर्नामेंट के लिए अभी तक किसी भी टीम ने आवेदन नहीं किया है।</p>
      </div>
    );
  }

  if (state === 'ERROR') {
    return (
      <div className="bg-red-50 rounded-2xl border border-[#C74D4D]/30 p-8 text-center shadow-sm">
        <span className="text-4xl block mb-2">⚠️</span>
        <h3 className="font-bold text-base text-[#C74D4D]">सर्वर से कनेक्ट करने में त्रुटि</h3>
        <p className="text-xs text-red-800 mt-1">नेटवर्क समस्या के कारण डेटा लोड नहीं हो सका। कृपया पुनः प्रयास करें।</p>
        {onRetry ? (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-[#C74D4D] text-white rounded-xl text-xs font-bold hover:bg-red-800 min-touch"
          >
            पुनः प्रयास करें (Retry)
          </button>
        ) : null}
      </div>
    );
  }

  if (state === 'EXPIRED') {
    return (
      <div className="bg-amber-50 rounded-2xl border border-[#F4B942] p-6 shadow-sm flex items-center gap-4">
        <span className="text-3xl">⏰</span>
        <div>
          <h3 className="font-bold text-sm text-amber-900">पंजीकरण समय सीमा समाप्त (Registration Deadline Passed)</h3>
          <p className="text-xs text-amber-800 mt-0.5">
            इस टूर्नामेंट के लिए आवेदन की अंतिम तिथि समाप्त हो चुकी है। अब नए आवेदन स्वीकार नहीं किए जाएंगे।
          </p>
        </div>
      </div>
    );
  }

  if (state === 'CANCELLED') {
    return (
      <div className="bg-red-50 rounded-2xl border border-[#C74D4D] p-6 shadow-sm flex items-center gap-4">
        <span className="text-3xl">🛑</span>
        <div>
          <h3 className="font-bold text-sm text-[#C74D4D]">टूर्नामेंट रद्द कर दिया गया है (Tournament Cancelled)</h3>
          <p className="text-xs text-red-900 mt-0.5">
            <strong>रद्दीकरण का कारण:</strong> भारी वर्षा एवं जलभराव के कारण खेल मैदान अनुपयोगी हो गया है। सभी पंजीकृत टीमों के कप्तानों को सूचित कर दिया गया है।
          </p>
        </div>
      </div>
    );
  }

  return null;
};
