'use client';

import React, { useState } from 'react';

export interface TournamentFormData {
  title: string;
  groundLocation: string;
  block: 'GYANPUR' | 'AURAI' | 'BHADOHI' | 'SURIYAWAN' | 'DEEGH' | 'ABHOLI';
  village: string;
  startDate: string;
  endDate: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  maxTeams: number;
  minSquadSize: number;
  maxSquadSize: number;
  matchFormat: string;
  ballType: 'TENNIS' | 'LEATHER' | 'COSCO';
  entryFeeNote: string;
  rulesText: string;
  disclaimerText: string;
}

const DEFAULT_FORM: TournamentFormData = {
  title: 'ज्ञानपुर ग्रामीण क्रिकेट कप 2026',
  groundLocation: 'इंटर कॉलेज मैदान, ज्ञानपुर',
  block: 'GYANPUR',
  village: 'ज्ञानपुर मुख्यालय',
  startDate: '2026-11-10',
  endDate: '2026-11-15',
  registrationOpenDate: '2026-10-05',
  registrationCloseDate: '2026-11-05',
  maxTeams: 16,
  minSquadSize: 11,
  maxSquadSize: 15,
  matchFormat: '10 Overs',
  ballType: 'TENNIS',
  entryFeeNote: '₹500 प्रति टीम (मैदान पर नकद)',
  rulesText: '1. सभी खिलाड़ियों का 18 वर्ष या उससे अधिक होना अनिवार्य है।\n2. आधार कार्ड की मूल प्रति मैदान पर प्रस्तुत करनी होगी।\n3. अंपायर का निर्णय अंतिम एवं सर्वमान्य होगा।',
  disclaimerText: 'यह प्लेटफ़ॉर्म केवल टीमों के आवेदन और समन्वय की सुविधा प्रदान करता है। मैच का संचालन, अंपायरिंग, यात्रा, भोजन, सुरक्षा एवं पुरस्कार वितरण का पूरा दायित्व स्थानीय आयोजकों और कप्तानों का है।',
};

interface TournamentWizardProps {
  onPublish: (data: TournamentFormData) => void;
  onSaveDraft: (data: TournamentFormData) => void;
}

export const TournamentWizard: React.FC<TournamentWizardProps> = ({ onPublish, onSaveDraft }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<TournamentFormData>(DEFAULT_FORM);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateField = (field: keyof TournamentFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMsg(null);
  };

  const validateStep1 = () => {
    if (!form.title || !form.groundLocation || !form.village) {
      setErrorMsg('कृपया सभी अनिवार्य बुनियादी फ़ील्ड भरें।');
      return false;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setErrorMsg('टूर्नामेंट समाप्ति तिथि प्रारंभ तिथि के बाद की होनी चाहिए।');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (new Date(form.registrationOpenDate) >= new Date(form.registrationCloseDate)) {
      setErrorMsg('पंजीकरण अंतिम तिथि प्रारंभ तिथि के बाद की होनी चाहिए।');
      return false;
    }
    if (new Date(form.registrationCloseDate) > new Date(form.startDate)) {
      setErrorMsg('पंजीकरण अंतिम तिथि टूर्नामेंट प्रारंभ तिथि से पहले होनी चाहिए।');
      return false;
    }
    if (form.maxTeams < 4 || form.maxTeams > 32) {
      setErrorMsg('अधिकतम टीमें 4 से 32 के बीच होनी चाहिए।');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => Math.min(prev + 1, 4) as any);
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(prev - 1, 1) as any);
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#172019]">नई प्रतियोगिता बनाएं (Creation Wizard)</h2>
          <p className="text-xs text-[#68756C]">4 आसान चरणों में ग्रामीण टूर्नामेंट जोड़ें</p>
        </div>
        <span className="text-xs bg-[#1E7A4C] text-white px-3 py-1 rounded-full font-bold">
          चरण {step} / 4: {step === 1 ? 'बुनियादी विवरण' : step === 2 ? 'पंजीकरण एवं प्रारूप' : step === 3 ? 'नियम एवं अस्वीकरण' : 'समीक्षा एवं प्रकाशन'}
        </span>
      </div>

      {/* Wizard Step Navigation Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-bold text-center">
        {[
          { id: 1, label: '1. बुनियादी विवरण' },
          { id: 2, label: '2. पंजीकरण एवं प्रारूप' },
          { id: 3, label: '3. नियम एवं अस्वीकरण' },
          { id: 4, label: '4. समीक्षा एवं प्रकाशन' },
        ].map((s) => (
          <div
            key={s.id}
            className={`py-2.5 rounded-xl border transition-all ${
              step === s.id
                ? 'bg-[#1E7A4C] text-white border-[#1E7A4C] shadow-sm'
                : step > s.id
                ? 'bg-emerald-50 text-[#1E7A4C] border-emerald-200'
                : 'bg-white text-[#68756C] border-[#E1E8E1]'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {errorMsg ? (
        <div className="bg-red-50 border border-red-200 text-[#C74D4D] text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      ) : null}

      {/* Step Containers */}
      <div className="bg-white rounded-2xl border border-[#E1E8E1] p-6 shadow-sm">
        
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#123B2A] border-b border-[#E1E8E1] pb-2">
              प्रतियोगिता का बुनियादी विवरण
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  प्रतियोगिता का नाम (Tournament Title) *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  मैदान का नाम व पता (Ground Location) *
                </label>
                <input
                  type="text"
                  value={form.groundLocation}
                  onChange={(e) => updateField('groundLocation', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  विकास खंड (Block in Bhadohi District) *
                </label>
                <select
                  value={form.block}
                  onChange={(e) => updateField('block', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                >
                  <option value="GYANPUR">ज्ञानपुर (Gyanpur)</option>
                  <option value="AURAI">औराई (Aurai)</option>
                  <option value="BHADOHI">भदोही (Bhadohi)</option>
                  <option value="SURIYAWAN">सुरियावां (Suriyawan)</option>
                  <option value="DEEGH">डीघ (Deegh)</option>
                  <option value="ABHOLI">अभोली (Abholi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  गांव / कस्बा (Village / Town) *
                </label>
                <input
                  type="text"
                  value={form.village}
                  onChange={(e) => updateField('village', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  मैच प्रारंभ तिथि (Tournament Start Date) *
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  मैच समापन तिथि (Tournament End Date) *
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#1E7A4C] hover:bg-[#165a38] text-white rounded-xl font-bold text-xs shadow-md min-touch"
              >
                अगला चरण: पंजीकरण विवरण →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Format */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#123B2A] border-b border-[#E1E8E1] pb-2">
              पंजीकरण एवं मैच प्रारूप
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  पंजीकरण प्रारंभ तिथि *
                </label>
                <input
                  type="date"
                  value={form.registrationOpenDate}
                  onChange={(e) => updateField('registrationOpenDate', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  पंजीकरण अंतिम तिथि (Deadline) *
                </label>
                <input
                  type="date"
                  value={form.registrationCloseDate}
                  onChange={(e) => updateField('registrationCloseDate', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  अधिकतम टीमें (Max Teams: 4 - 32) *
                </label>
                <input
                  type="number"
                  min={4}
                  max={32}
                  value={form.maxTeams}
                  onChange={(e) => updateField('maxTeams', parseInt(e.target.value, 10))}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  मैच प्रारूप (Overs) *
                </label>
                <input
                  type="text"
                  value={form.matchFormat}
                  onChange={(e) => updateField('matchFormat', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  गेंद का प्रकार (Ball Type) *
                </label>
                <select
                  value={form.ballType}
                  onChange={(e) => updateField('ballType', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                >
                  <option value="TENNIS">टेनिस गेंद (Tennis Ball)</option>
                  <option value="COSCO">कॉस्को (Cosco)</option>
                  <option value="LEATHER">लेदर गेंद (Leather Ball)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#172019]">
                  प्रवेश शुल्क सूचना (Informational Only) *
                </label>
                <input
                  type="text"
                  value={form.entryFeeNote}
                  onChange={(e) => updateField('entryFeeNote', e.target.value)}
                  className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                />
              </div>
            </div>

            {/* Unskippable Offline Notice Banner */}
            <div className="bg-amber-50 border border-[#F4B942] rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
              <span className="text-base shrink-0">⚠️</span>
              <span>
                <strong>महत्वपूर्ण सूचना:</strong> इस ऐप में कोई ऑनलाइन भुगतान या वॉलेट सुविधा नहीं है। शुल्क विवरण केवल कप्तानों की सूचना हेतु है (मैदान पर नकद)।
              </span>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="px-5 py-2.5 bg-zinc-200 text-[#172019] rounded-xl font-bold text-xs min-touch"
              >
                ← पिछला चरण
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#1E7A4C] hover:bg-[#165a38] text-white rounded-xl font-bold text-xs min-touch"
              >
                अगला चरण: नियम एवं अस्वीकरण →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Rules & Disclaimer */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#123B2A] border-b border-[#E1E8E1] pb-2">
              नियम एवं ऑफलाइन जिम्मेदारी अस्वीकरण
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#172019]">
                प्रतियोगिता नियम (Rules & Regulations)
              </label>
              <textarea
                rows={3}
                value={form.rulesText}
                onChange={(e) => updateField('rulesText', e.target.value)}
                className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#172019]">
                ऑफलाइन जिम्मेदारी अस्वीकरण (Mandatory Legal Disclaimer - अपरिवर्तनीय)
              </label>
              <textarea
                rows={3}
                readOnly
                value={form.disclaimerText}
                className="w-full bg-zinc-100 border border-[#E1E8E1] rounded-xl p-2.5 text-xs text-[#68756C] outline-none cursor-not-allowed"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="px-5 py-2.5 bg-zinc-200 text-[#172019] rounded-xl font-bold text-xs min-touch"
              >
                ← पिछला चरण
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-[#1E7A4C] hover:bg-[#165a38] text-white rounded-xl font-bold text-xs min-touch"
              >
                अगला चरण: समीक्षा एवं प्रकाशन →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review and Publish */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-bold text-sm text-[#123B2A] border-b border-[#E1E8E1] pb-2">
              समीक्षा एवं लाइव मोबाइल पूर्वावलोकन (Preview)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Mobile Card Preview */}
              <div>
                <h4 className="font-bold text-xs text-[#172019] mb-2">मोबाइल कार्ड पूर्वावलोकन:</h4>
                <div className="bg-[#F6F8F3] border-2 border-[#1E7A4C] rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#1E7A4C] truncate">{form.title}</span>
                    <span className="text-[10px] bg-[#1E7A4C] text-white px-2 py-0.5 rounded-full font-bold">
                      खुला है (OPEN)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68756C]">📍 {form.groundLocation} ({form.block} ब्लॉक)</p>
                  <p className="text-[11px] text-[#172019]">📅 मैच दिनांक: {form.startDate} से {form.endDate}</p>
                  <div className="flex justify-between items-center text-[10px] bg-white p-2.5 rounded-xl border border-[#E1E8E1]">
                    <span>🏏 {form.matchFormat} ({form.ballType === 'TENNIS' ? 'टेनिस' : form.ballType})</span>
                    <span className="font-bold text-[#1E7A4C]">{form.entryFeeNote}</span>
                  </div>
                </div>
              </div>

              {/* Publish Options */}
              <div className="space-y-3 bg-[#F6F8F3] p-5 rounded-2xl border border-[#E1E8E1]">
                <h4 className="font-bold text-xs text-[#172019]">प्रकाशन स्थिति विकल्प:</h4>
                <p className="text-[11px] text-[#68756C]">
                  प्रकाशन के तुरंत बाद यह सभी खिलाड़ियों और कप्तानों को ऐप में दिखाई देगा।
                </p>
                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={() => onPublish(form)}
                    className="w-full py-3 bg-[#1E7A4C] hover:bg-[#165a38] text-white font-bold rounded-xl text-xs shadow-md min-touch transition-all"
                  >
                    🚀 अभी प्रकाशित करें (Publish Tournament)
                  </button>
                  <button
                    onClick={() => onSaveDraft(form)}
                    className="w-full py-2.5 bg-white border border-[#E1E8E1] hover:bg-zinc-50 text-[#172019] font-bold rounded-xl text-xs min-touch transition-all"
                  >
                    💾 ड्राफ्ट सहेजें (Save as Draft)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <button
                onClick={handleBack}
                className="px-5 py-2.5 bg-zinc-200 text-[#172019] rounded-xl font-bold text-xs min-touch"
              >
                ← पिछला चरण
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
