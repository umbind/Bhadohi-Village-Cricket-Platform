'use client';

import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header, UniversalState } from '../components/Header';
import { UniversalStateBanner } from '../components/UniversalStateBanner';
import { ApplicationsTable } from '../components/ApplicationsTable';
import { TournamentWizard, TournamentFormData } from '../components/TournamentWizard';
import { RosterDrawer, TeamApplicationData, RosterMember } from '../components/RosterDrawer';

const SAMPLE_ROSTER_GYANPUR: RosterMember[] = [
  { id: 'm1', name: 'रामसेवक यादव', village: 'ज्ञानपुर मुख्यालय', role: 'ऑलराउंडर', style: 'दाएं हाथ बल्लेबाज • मध्यम तेज', isCaptain: true },
  { id: 'm2', name: 'अमित कुमार सिंह', village: 'गोपीगंज', role: 'बल्लेबाज', style: 'दाएं हाथ बल्लेबाज' },
  { id: 'm3', name: 'संदीप यादव', village: 'औराई', role: 'गेंदबाज', style: 'बाएं हाथ तेज गेंदबाज' },
  { id: 'm4', name: 'विकास बिंद', village: 'जंगीगंज', role: 'ऑलराउंडर', style: 'दाएं हाथ' },
  { id: 'm5', name: 'दीपक तिवारी', village: 'खमरिया', role: 'विकेटकीपर', style: 'दाएं हाथ बल्लेबाज' },
  { id: 'm6', name: 'प्रदीप पाल', village: 'ज्ञानपुर', role: 'गेंदबाज', style: 'ऑफ स्पिन' },
  { id: 'm7', name: 'सुरेश मौर्या', village: 'सुरियावां', role: 'बल्लेबाज', style: 'बाएं हाथ' },
  { id: 'm8', name: 'अखिलेश मिश्रा', village: 'डीघ', role: 'ऑलराउंडर', style: 'दाएं हाथ' },
  { id: 'm9', name: 'राजकुमार सरोज', village: 'गोपीगंज', role: 'गेंदबाज', style: 'मध्यम गति' },
  { id: 'm10', name: 'विनोद गौतम', village: 'अभोली', role: 'बल्लेबाज', style: 'दाएं हाथ' },
  { id: 'm11', name: 'संजय कुमार', village: 'ज्ञानपुर', role: 'ऑलराउंडर', style: 'लेग स्पिन' },
  { id: 'm12', name: 'अनिल विश्वकर्मा', village: 'खमरिया', role: 'गेंदबाज', style: 'तेज' },
  { id: 'm13', name: 'मनोज कुमार', village: 'औराई', role: 'बल्लेबाज', style: 'दाएं हाथ' },
  { id: 'm14', name: 'रवि प्रकाश', village: 'जंगीगंज', role: 'विकेटकीपर', style: 'दाएं हाथ' },
  { id: 'm15', name: 'पंकज दुबे', village: 'ज्ञानपुर', role: 'ऑलराउंडर', style: 'दाएं हाथ' },
];

const INITIAL_APPLICATIONS: TeamApplicationData[] = [
  {
    id: 'team-app-1',
    teamName: 'ज्ञानपुर वॉरियर्स',
    village: 'ज्ञानपुर मुख्यालय',
    captainName: 'रामसेवक यादव',
    captainMobile: '9876543210',
    status: 'PENDING',
    appliedDate: '02 अक्टू 2026',
    members: SAMPLE_ROSTER_GYANPUR,
  },
  {
    id: 'team-app-2',
    teamName: 'औराई स्ट्राइकर्स',
    village: 'औराई खास',
    captainName: 'संदीप यादव',
    captainMobile: '9876543211',
    status: 'ACCEPTED',
    appliedDate: '01 अक्टू 2026',
    members: SAMPLE_ROSTER_GYANPUR,
  },
  {
    id: 'team-app-3',
    teamName: 'सुरियावां लायंस',
    village: 'सुरियावां देहात',
    captainName: 'अखिलेश सिंह',
    captainMobile: '9876543212',
    status: 'PENDING',
    appliedDate: '02 अक्टू 2026',
    members: SAMPLE_ROSTER_GYANPUR,
  },
  {
    id: 'team-app-4',
    teamName: 'गोपीगंज पैंथर्स',
    village: 'गोपीगंज कस्बा',
    captainName: 'अमित कुमार',
    captainMobile: '9876543213',
    status: 'REJECTED',
    appliedDate: '30 सितं 2026',
    members: SAMPLE_ROSTER_GYANPUR,
  },
  {
    id: 'team-app-5',
    teamName: 'डीघ सुपरकिंग्स',
    village: 'जंगीगंज, डीघ',
    captainName: 'विकास बिंद',
    captainMobile: '9876543214',
    status: 'PENDING',
    appliedDate: '03 अक्टू 2026',
    members: SAMPLE_ROSTER_GYANPUR,
  },
];

export default function OrganizerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'wizard' | 'announcements' | 'reports'>('overview');
  const [currentState, setCurrentState] = useState<UniversalState>('NORMAL');
  const [applications, setApplications] = useState<TeamApplicationData[]>(INITIAL_APPLICATIONS);
  const [selectedTeam, setSelectedTeam] = useState<TeamApplicationData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleInspectTeam = (team: TeamApplicationData) => {
    setSelectedTeam(team);
    setIsDrawerOpen(true);
  };

  const handleAcceptTeam = (teamId: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === teamId ? { ...app, status: 'ACCEPTED' } : app))
    );
    if (selectedTeam && selectedTeam.id === teamId) {
      setSelectedTeam((prev) => (prev ? { ...prev, status: 'ACCEPTED' } : null));
    }
    showToast('✓ टीम आवेदन सफलतापूर्वक स्वीकार कर लिया गया है!');
  };

  const handleRejectTeam = (teamId: string, reason?: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === teamId ? { ...app, status: 'REJECTED' } : app))
    );
    if (selectedTeam && selectedTeam.id === teamId) {
      setSelectedTeam((prev) => (prev ? { ...prev, status: 'REJECTED' } : null));
    }
    showToast('✕ टीम आवेदन अस्वीकृत कर दिया गया है।');
  };

  const handlePublishTournament = (data: TournamentFormData) => {
    showToast(`🚀 "${data.title}" सफलतापूर्वक प्रकाशित कर दिया गया है!`);
    setActiveTab('overview');
  };

  const handleSaveDraft = (data: TournamentFormData) => {
    showToast(`💾 ड्राफ्ट "${data.title}" सहेज लिया गया है।`);
    setActiveTab('overview');
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8F3]">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentState('NORMAL');
        }}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <Header
          title={
            activeTab === 'overview'
              ? 'डैशबोर्ड सिंहावलोकन'
              : activeTab === 'applications'
              ? 'टीम आवेदन समीक्षा'
              : activeTab === 'wizard'
              ? 'प्रतियोगिता निर्माण विज़ार्ड'
              : activeTab === 'announcements'
              ? 'आधिकारिक घोषणाएं'
              : 'शिकायत निवारण कतार'
          }
          subtitle="ज्ञानपुर ग्रामीण क्रिकेट कप 2026 • आयोजन समिति"
          currentState={currentState}
          onStateChange={setCurrentState}
        />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 bg-[#1E7A4C] text-white px-5 py-3 rounded-xl shadow-lg font-bold text-xs flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="p-8 flex-1 space-y-6">
          {/* Universal State Overrides */}
          <UniversalStateBanner state={currentState} onRetry={() => setCurrentState('NORMAL')} />

          {currentState === 'NORMAL' && (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-[#E1E8E1] p-5 shadow-xs">
                      <span className="text-xs text-[#68756C] font-semibold block">कुल प्राप्त आवेदन</span>
                      <span className="text-2xl font-bold text-[#172019] mt-1 block">
                        {applications.length}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                        भदोही के 4 ब्लॉकों से
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E1E8E1] p-5 shadow-xs">
                      <span className="text-xs text-[#68756C] font-semibold block">स्वीकृत टीमें (स्लॉट)</span>
                      <span className="text-2xl font-bold text-[#1E7A4C] mt-1 block">
                        {acceptedCount} / 16
                      </span>
                      <span className="text-[10px] text-[#68756C] block mt-1">
                        8 स्लॉट अभी रिक्त हैं
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E1E8E1] p-5 shadow-xs">
                      <span className="text-xs text-[#68756C] font-semibold block">लंबित समीक्षा (Pending)</span>
                      <span className="text-2xl font-bold text-amber-600 mt-1 block">
                        {pendingCount}
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold block mt-1">
                        त्वरित समीक्षा अपेक्षित
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E1E8E1] p-5 shadow-xs">
                      <span className="text-xs text-[#68756C] font-semibold block">पंजीकरण अंतिम तिथि</span>
                      <span className="text-2xl font-bold text-[#172019] mt-1 block">
                        14 दिन
                      </span>
                      <span className="text-[10px] text-red-600 font-semibold block mt-1">
                        05 नवं 2026 को समाप्त
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Banner */}
                  <div className="bg-gradient-to-r from-[#123B2A] to-[#1E7A4C] text-white rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-base">नया टूर्नामेंट जोड़ना चाहते हैं?</h3>
                      <p className="text-xs text-emerald-100 mt-0.5">
                        4 चरणों में नया ग्रामीण टूर्नामेंट बनाएं और व्हाट्सएप पर सीधा साझा करें।
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('wizard')}
                        className="px-4 py-2 bg-white text-[#123B2A] hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs min-touch"
                      >
                        + नया टूर्नामेंट बनाएं
                      </button>
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="px-4 py-2 bg-[#123B2A]/40 border border-white/30 text-white rounded-xl text-xs font-bold min-touch"
                      >
                        आवेदन देखें ({pendingCount})
                      </button>
                    </div>
                  </div>

                  {/* Recent Applications Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm text-[#172019]">हालिया टीम आवेदन</h3>
                      <button
                        onClick={() => setActiveTab('applications')}
                        className="text-xs font-bold text-[#1E7A4C] hover:underline"
                      >
                        सभी {applications.length} आवेदन देखें →
                      </button>
                    </div>

                    <ApplicationsTable
                      applications={applications.slice(0, 3)}
                      onInspect={handleInspectTeam}
                      onAccept={handleAcceptTeam}
                      onReject={(id) => handleRejectTeam(id)}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: APPLICATIONS REVIEW */}
              {activeTab === 'applications' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-[#172019]">टीम आवेदन प्रबंधन तालिका</h3>
                      <p className="text-xs text-[#68756C]">
                        कप्तानों द्वारा जमा किए गए आवेदनों की समीक्षा करें एवं रोस्टर सत्यापित करें
                      </p>
                    </div>
                  </div>

                  <ApplicationsTable
                    applications={applications}
                    onInspect={handleInspectTeam}
                    onAccept={handleAcceptTeam}
                    onReject={(id) => handleRejectTeam(id)}
                  />
                </div>
              )}

              {/* TAB 3: TOURNAMENT CREATION WIZARD */}
              {activeTab === 'wizard' && (
                <TournamentWizard
                  onPublish={handlePublishTournament}
                  onSaveDraft={handleSaveDraft}
                />
              )}

              {/* TAB 4: ANNOUNCEMENTS */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-[#E1E8E1] p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base text-[#123B2A] border-b border-[#E1E8E1] pb-2">
                      स्वीकृत टीमों को आधिकारिक संदेश प्रसारित करें (Broadcast)
                    </h3>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#172019]">
                        संदेश का विषय एवं विवरण:
                      </label>
                      <textarea
                        rows={4}
                        placeholder="उदा: मैच का पहला राउंड दिनांक 10 नवंबर 2026 को प्रातः 08:30 बजे इंटर कॉलेज ग्राउंड पर प्रारंभ होगा। सभी कप्तानों से अनुरोध है कि वे समय से पहुंचे..."
                        className="w-full bg-[#F6F8F3] border border-[#E1E8E1] rounded-xl p-3 text-xs text-[#172019] outline-none focus:ring-1 focus:ring-[#1E7A4C]"
                      />
                    </div>
                    <button
                      onClick={() => showToast('📢 घोषणा सभी 8 स्वीकृत टीमों के कप्तानों को प्रसारित कर दी गई है!')}
                      className="px-5 py-2.5 bg-[#1E7A4C] hover:bg-[#165a38] text-white rounded-xl text-xs font-bold shadow-md min-touch"
                    >
                      📢 घोषणा प्रसारित करें (Send Broadcast)
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: REPORTS QUEUE */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-[#E1E8E1] p-6 shadow-sm space-y-4">
                    <h3 className="font-bold text-base text-[#123B2A] border-b border-[#E1E8E1] pb-2">
                      शिकायत निवारण एवं सत्यापन कतार (Reports Queue)
                    </h3>
                    
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-bold block text-sm">शिकायत #R-102 • संदिग्ध आयु सीमा</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          टीम: औराई वॉरियर्स • खिलाड़ी: राहुल कुमार • विवरण: मूल आधार कार्ड मैदान पर सत्यापन आवश्यक
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => showToast('सत्यापन की पुष्टि हो गई है')}
                          className="px-3 py-1.5 bg-[#1E7A4C] text-white rounded-lg font-bold min-touch text-xs"
                        >
                          सत्यापित
                        </button>
                        <button
                          onClick={() => showToast('शिकायत खारिज कर दी गई')}
                          className="px-3 py-1.5 bg-[#C74D4D] text-white rounded-lg font-bold min-touch text-xs"
                        >
                          अमान्य
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Roster Slide-Over Drawer */}
      <RosterDrawer
        isOpen={isDrawerOpen}
        team={selectedTeam}
        onClose={() => setIsDrawerOpen(false)}
        onAccept={handleAcceptTeam}
        onReject={handleRejectTeam}
      />
    </div>
  );
}
