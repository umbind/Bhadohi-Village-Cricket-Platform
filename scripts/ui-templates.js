/**
 * UI View Templates for Standalone Dev Server
 * Renders rich Devanagari web pages for browsers opening API endpoints.
 */

function renderPageLayout({ title, activeTab, content }) {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - भदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #0d2117;
      color: #172019;
    }
  </style>
</head>
<body class="p-2 sm:p-6 min-h-screen flex flex-col items-center">

  <!-- Top Global Navigation Bar -->
  <header class="w-full max-w-6xl bg-[#123B2A] text-white rounded-2xl p-4 sm:p-5 mb-6 shadow-2xl border border-[#1E7A4C]/50 flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 rounded-xl bg-[#1E7A4C] flex items-center justify-center text-2xl shadow-inner font-bold text-[#F4B942]">
        🏏
      </div>
      <div>
        <h1 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          भदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म
          <span class="text-xs bg-[#F4B942] text-[#123B2A] px-2.5 py-0.5 rounded-full font-extrabold uppercase">Live Dev Server</span>
        </h1>
        <p class="text-xs text-emerald-200">जिला भदोhi (संत रविदास नगर), उत्तर प्रदेश • 18+ केवल</p>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="flex flex-wrap items-center gap-2 text-xs font-semibold">
      <a href="/" class="px-3.5 py-2 rounded-xl transition ${activeTab === 'home' ? 'bg-[#1E7A4C] text-white shadow' : 'bg-[#0b1f16] text-emerald-200 hover:text-white border border-[#1E7A4C]/40'}">
        📱 मुख्य ऐप (Prototype)
      </a>
      <a href="/api/v1/tournaments" class="px-3.5 py-2 rounded-xl transition ${activeTab === 'tournaments' ? 'bg-[#1E7A4C] text-white shadow' : 'bg-[#0b1f16] text-emerald-200 hover:text-white border border-[#1E7A4C]/40'}">
        🏆 टूर्नामेंट्स सूची
      </a>
      <a href="/api/v1/players" class="px-3.5 py-2 rounded-xl transition ${activeTab === 'players' ? 'bg-[#1E7A4C] text-white shadow' : 'bg-[#0b1f16] text-emerald-200 hover:text-white border border-[#1E7A4C]/40'}">
        👥 खिलाड़ी खोज
      </a>
      <a href="/health" class="px-3.5 py-2 rounded-xl transition ${activeTab === 'health' ? 'bg-[#1E7A4C] text-white shadow' : 'bg-[#0b1f16] text-emerald-200 hover:text-white border border-[#1E7A4C]/40'}">
        🩺 सर्वर स्थिति
      </a>
      <a href="/field-kit" class="px-3.5 py-2 rounded-xl transition ${activeTab === 'field-kit' ? 'bg-[#1E7A4C] text-white shadow' : 'bg-[#0b1f16] text-[#F4B942] hover:text-white border border-[#1E7A4C]/40'}">
        🖨️ फ़ील्ड किट (Print Cards)
      </a>
    </nav>
  </header>

  <!-- Page Main Content Area -->
  <main class="w-full max-w-6xl">
    ${content}
  </main>

  <!-- Footer -->
  <footer class="w-full max-w-6xl mt-8 text-center text-xs text-emerald-400/80 py-4 border-t border-[#1E7A4C]/30 flex flex-wrap items-center justify-between gap-2">
    <div>भदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म (BVCP) • शून्य डिजिटल स्कोरिंग • शून्य ऑनलाइन भुगतान • 100% निजता सुरक्षित</div>
    <div class="flex items-center gap-3">
      <a href="?format=json" class="underline hover:text-white">📄 Raw JSON देखें</a>
      <span>•</span>
      <a href="/" class="underline hover:text-white">वापस मुख्य ऐप जाएं</a>
    </div>
  </footer>

</body>
</html>`;
}

function renderHealthPage(data) {
  const blocksList = data.blocks.map(b => `
    <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1E7A4C]/30 text-emerald-200 border border-[#1E7A4C]">
      📍 ${b}
    </span>
  `).join('');

  const content = `
    <div class="bg-[#123B2A] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#1E7A4C]/50 text-white">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#1E7A4C]/40 pb-5 mb-6">
        <div>
          <div class="flex items-center gap-3">
            <span class="relative flex h-4 w-4">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
            <h2 class="text-2xl font-bold text-white">सिस्टम स्थिति: सक्रिय (System Online)</h2>
          </div>
          <p class="text-sm text-emerald-300 mt-1">भदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म बैकएंड सर्वर सामान्य रूप से कार्य कर रहा है।</p>
        </div>
        <div class="text-right">
          <span class="text-xs font-mono bg-[#0b1f16] px-3 py-1.5 rounded-lg border border-[#1E7A4C] text-[#F4B942]">HTTP 200 OK</span>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-[#0b1f16] p-4 rounded-xl border border-[#1E7A4C]/40">
          <div class="text-xs text-emerald-300 font-semibold uppercase">सेवा का नाम</div>
          <div class="text-lg font-bold text-white mt-1">${data.service}</div>
        </div>
        <div class="bg-[#0b1f16] p-4 rounded-xl border border-[#1E7A4C]/40">
          <div class="text-xs text-emerald-300 font-semibold uppercase">कार्यक्षेत्र (District)</div>
          <div class="text-lg font-bold text-[#F4B942] mt-1">${data.district}</div>
        </div>
        <div class="bg-[#0b1f16] p-4 rounded-xl border border-[#1E7A4C]/40">
          <div class="text-xs text-emerald-300 font-semibold uppercase">सत्यापन समय (Timestamp)</div>
          <div class="text-xs font-mono text-emerald-200 mt-2">${data.timestamp}</div>
        </div>
      </div>

      <!-- District Blocks Covered -->
      <div class="bg-[#0b1f16] p-5 rounded-xl border border-[#1E7A4C]/40 mb-6">
        <h3 class="text-sm font-bold text-[#F4B942] mb-3">सक्रिय ब्लॉक (6 Bhadohi Blocks Covered):</h3>
        <div class="flex flex-wrap gap-2.5">
          ${blocksList}
        </div>
      </div>

      <!-- Architecture Compliance Checklist -->
      <div class="bg-[#0b1f16] p-5 rounded-xl border border-[#1E7A4C]/40 mb-6">
        <h3 class="text-sm font-bold text-emerald-300 mb-3">सख्त परिचालन सीमाएं (Universal Negative Invariants):</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="flex items-center gap-2 text-emerald-200">
            <span class="text-emerald-400 font-bold">✓</span> शून्य SMS / OTP गेटवे (PIN + प्रश्न आधारित)
          </div>
          <div class="flex items-center gap-2 text-emerald-200">
            <span class="text-emerald-400 font-bold">✓</span> शून्य डिजिटल लाइव स्कोरिंग (विवाद मुक्ति)
          </div>
          <div class="flex items-center gap-2 text-emerald-200">
            <span class="text-emerald-400 font-bold">✓</span> शून्य इन-ऐप भुगतान / वॉलेट (केवल मैदान पर नकद)
          </div>
          <div class="flex items-center gap-2 text-emerald-200">
            <span class="text-emerald-400 font-bold">✓</span> शून्य करियर आँकड़े या रैंकिंग
          </div>
          <div class="flex items-center gap-2 text-emerald-200">
            <span class="text-emerald-400 font-bold">✓</span> 100% मोबाइल नंबर मास्किंग (98XXXXXX21)
          </div>
          <div class="flex items-center gap-2 text-emerald-200">
            <span class="text-emerald-400 font-bold">✓</span> केवल 18+ वयस्क पंजीकृत
          </div>
        </div>
      </div>

      <!-- Raw JSON viewer toggle -->
      <div class="border-t border-[#1E7A4C]/40 pt-4 flex items-center justify-between">
        <span class="text-xs text-emerald-300">डेवलपर या ऑटोमेशन टूल के लिए JSON डेटा:</span>
        <a href="/health?format=json" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1E7A4C] hover:bg-emerald-600 text-white transition">
          📄 View Raw JSON Output
        </a>
      </div>
    </div>
  `;

  return renderPageLayout({
    title: 'सर्वर स्थिति (Health Check)',
    activeTab: 'health',
    content
  });
}

function renderTournamentsPage(tournaments) {
  const cardsHtml = tournaments.map(t => `
    <div class="bg-[#123B2A] rounded-2xl p-5 shadow-xl border border-[#1E7A4C]/40 text-white flex flex-col justify-between hover:border-[#F4B942]/60 transition">
      <div>
        <div class="flex items-start justify-between gap-3 mb-2">
          <span class="text-xs bg-[#1E7A4C] text-emerald-100 px-2.5 py-1 rounded-md font-bold">
            📍 ब्लॉक: ${t.block}
          </span>
          <span class="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold">
            ${t.status === 'PUBLISHED' ? 'पंजीकरण खुला' : t.status}
          </span>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">${t.title}</h3>
        <p class="text-xs text-emerald-200 mb-4 line-clamp-2">${t.description}</p>

        <div class="space-y-1.5 text-xs text-emerald-300 bg-[#0b1f16] p-3 rounded-xl border border-[#1E7A4C]/30 mb-4">
          <div>🏟️ <strong class="text-white">मैदान:</strong> ${t.groundLocation}</div>
          <div>👥 <strong class="text-white">अधिकतम टीमें:</strong> ${t.maxTeams} टीमें</div>
          <div>💵 <strong class="text-white">शुल्क सूचना:</strong> <span class="text-[#F4B942] font-semibold">${t.entryFeeNotice}</span></div>
          <div>📅 <strong class="text-white">आरंभ तिथि:</strong> ${t.startDate ? t.startDate.substring(0, 10) : 'शीघ्र घोषित'}</div>
        </div>
      </div>

      <div class="space-y-2 pt-2 border-t border-[#1E7A4C]/30">
        <a href="/api/v1/tournaments/${t.id}" class="w-full text-center block px-3 py-2 rounded-xl text-xs font-bold bg-[#1E7A4C] hover:bg-emerald-600 text-white transition">
          टूर्नामेंट विवरण व WhatsApp शेयर देखें →
        </a>
      </div>
    </div>
  `).join('');

  const content = `
    <div class="space-y-6">
      <div class="bg-[#123B2A] rounded-2xl p-5 shadow-xl border border-[#1E7A4C]/50 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            🏆 भदोही जिला ग्रामीण क्रिकेट टूर्नामेंट्स
          </h2>
          <p class="text-xs text-emerald-300 mt-1">ज्ञानपुर, औराई, भदोही, सुरियावां, डीघ, और अभोली ब्लॉक में वर्तमान में पंजीकृत प्रतियोगिताएं</p>
        </div>
        <div class="flex items-center gap-3">
          <a href="/api/v1/tournaments?format=json" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0b1f16] border border-[#1E7A4C] text-[#F4B942] hover:bg-[#1E7A4C] hover:text-white transition">
            📄 Raw JSON Data
          </a>
        </div>
      </div>

      <!-- Warning Notice on Cash Payment -->
      <div class="bg-amber-950/40 border border-amber-600/50 rounded-xl p-4 text-xs text-amber-200 flex items-start gap-3">
        <span class="text-lg">⚠️</span>
        <div>
          <strong class="font-bold text-amber-300">महत्वपूर्ण सूचना (Strict Offline Rule):</strong>
          प्लेटफ़ॉर्म पर कोई ऑनलाइन लेनदेन, UPI या डिजिटल वॉलेट नहीं है। प्रवेश शुल्क केवल मैदान पर नकद (Cash on Ground) लिया जाएगा।
        </div>
      </div>

      <!-- Tournaments Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        ${cardsHtml}
      </div>
    </div>
  `;

  return renderPageLayout({
    title: 'टूर्नामेंट्स सूची (Tournaments)',
    activeTab: 'tournaments',
    content
  });
}

function renderTournamentDetailPage(tour) {
  const content = `
    <div class="bg-[#123B2A] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#1E7A4C]/50 text-white max-w-3xl mx-auto">
      <a href="/api/v1/tournaments" class="text-xs text-emerald-300 hover:text-white flex items-center gap-1 mb-4">
        ← सभी टूर्नामेंट्स पर वापस जाएं
      </a>

      <div class="flex items-start justify-between gap-4 border-b border-[#1E7A4C]/40 pb-4 mb-5">
        <div>
          <span class="text-xs bg-[#1E7A4C] text-emerald-100 px-2.5 py-1 rounded-md font-bold">
            📍 ब्लॉक: ${tour.block}
          </span>
          <h2 class="text-2xl font-bold text-white mt-2">${tour.title}</h2>
          <p class="text-xs text-emerald-200 mt-1">${tour.description}</p>
        </div>
        <span class="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold">
          ${tour.status}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0b1f16] p-4 rounded-xl border border-[#1E7A4C]/40 mb-6 text-xs text-emerald-200">
        <div>🏟️ <strong class="text-white">स्थान:</strong> ${tour.groundLocation}</div>
        <div>👥 <strong class="text-white">कुल टीम सीमा:</strong> ${tour.maxTeams} टीमें</div>
        <div>💵 <strong class="text-white">शुल्क नोटिस:</strong> <span class="text-[#F4B942] font-semibold">${tour.entryFeeNotice}</span></div>
        <div>📅 <strong class="text-white">टूर्नामेंट अवधि:</strong> ${tour.startDate?.substring(0,10)} से ${tour.endDate?.substring(0,10)}</div>
      </div>

      <!-- WhatsApp Share Preview -->
      <div class="bg-[#0b1f16] p-4 rounded-xl border border-[#1E7A4C]/40 mb-6">
        <h4 class="text-xs font-bold text-[#F4B942] uppercase mb-2">📲 WhatsApp आमंत्रण संदेश (Hindi Share Template):</h4>
        <pre class="bg-black/40 p-3 rounded-lg text-xs text-emerald-200 whitespace-pre-wrap font-sans border border-[#1E7A4C]/30">${tour.whatsapp_share_text || 'टूर्नामेंट की जानकारी उपलब्ध है।'}</pre>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1E7A4C]/40">
        <a href="/api/v1/tournaments/${tour.id}?format=json" class="text-xs text-[#F4B942] underline">
          📄 View JSON Response
        </a>
        <a href="https://wa.me/?text=${encodeURIComponent(tour.whatsapp_share_text || tour.title)}" target="_blank" class="px-4 py-2 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-emerald-500 text-[#123B2A] font-extrabold transition flex items-center gap-2">
          <span>📲</span> WhatsApp पर साझा करें
        </a>
      </div>
    </div>
  `;

  return renderPageLayout({
    title: tour.title,
    activeTab: 'tournaments',
    content
  });
}

function renderPlayersPage(players) {
  const cardsHtml = players.map(p => `
    <div class="bg-[#123B2A] rounded-2xl p-4 shadow-xl border border-[#1E7A4C]/40 text-white flex flex-col justify-between hover:border-[#F4B942]/60 transition">
      <div>
        <div class="flex items-start justify-between gap-2 mb-2">
          <span class="text-xs bg-[#1E7A4C] text-emerald-100 px-2 py-0.5 rounded font-bold">
            ${p.block}
          </span>
          <span class="text-xs ${p.role === 'ALL_ROUNDER' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'} border px-2 py-0.5 rounded-full font-bold">
            ${p.role === 'ALL_ROUNDER' ? 'ऑल-राउंडर' : p.role === 'BATSMAN' ? 'बल्लेबाज' : 'गेंदबाज'}
          </span>
        </div>

        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-[#1E7A4C] flex items-center justify-center font-bold text-lg text-white">
            ${p.fullName.charAt(0)}
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">${p.fullName}</h3>
            <p class="text-xs text-emerald-300">ग्राम: ${p.village}</p>
          </div>
        </div>

        <div class="bg-[#0b1f16] p-2.5 rounded-xl border border-[#1E7A4C]/30 space-y-1 text-xs text-emerald-200 mb-3">
          <div>🏏 <span class="text-emerald-400">बल्लेबाजी:</span> ${p.battingStyle || 'दाएं हाथ'}</div>
          <div>🎯 <span class="text-emerald-400">गेंदबाजी:</span> ${p.bowlingStyle || 'दाएं हाथ मध्यम गति'}</div>
          <div class="pt-1 border-t border-[#1E7A4C]/30 flex items-center justify-between">
            <span class="text-emerald-400">मोबाइल:</span>
            <span class="font-mono bg-black/40 px-2 py-0.5 rounded text-amber-300 font-bold">${p.mobileMasked}</span>
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between text-xs text-emerald-300 mb-2">
          <span>उपलब्धता:</span>
          <span class="text-emerald-400 font-semibold">15 दिन सक्रिय</span>
        </div>
        <button onclick="alert('खिलाड़ी आमंत्रण सिमुलेशन: कप्तान की ओर से आमंत्रण भेजा गया! (खिलाड़ी के स्वीकार करने पर WhatsApp चैट लिंक उपलब्ध होगा)')" class="w-full text-center block px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1E7A4C] hover:bg-emerald-600 text-white transition">
          + टीम में आमंत्रित करें
        </button>
      </div>
    </div>
  `).join('');

  const content = `
    <div class="space-y-6">
      <div class="bg-[#123B2A] rounded-2xl p-5 shadow-xl border border-[#1E7A4C]/50 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            👥 भदोhi स्थानीय खिलाड़ी खोज व स्काउटिंग
          </h2>
          <p class="text-xs text-emerald-300 mt-1">
            सभी 6 ब्लॉकों (ज्ञानपुर, औराई, भदोही, सुरियावां, डीघ, अभोली) के उपलब्ध 18+ वयस्क खिलाड़ी (कुल: ${players.length})
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a href="/api/v1/players?format=json" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0b1f16] border border-[#1E7A4C] text-[#F4B942] hover:bg-[#1E7A4C] hover:text-white transition">
            📄 Raw JSON Data
          </a>
        </div>
      </div>

      <!-- Privacy Assurance Banner -->
      <div class="bg-emerald-950/40 border border-emerald-600/50 rounded-xl p-4 text-xs text-emerald-200 flex items-start gap-3">
        <span class="text-lg">🔒</span>
        <div>
          <strong class="font-bold text-white">गोपनीयता सुरक्षा (Strict Privacy Invariant):</strong>
          खिलाड़ियों के फोन नंबर कभी सार्वजनिक रूप से नहीं दिखाए जाते हैं (उदा. <code class="bg-black/40 px-1 py-0.5 rounded text-amber-300 font-mono">98XXXXXX21</code>)। कप्तान द्वारा आमंत्रण स्वीकार होने के बाद केवल संबंधित टीम के साथ निजी WhatsApp रिडायरेक्ट एक्टिव होता है।
        </div>
      </div>

      <!-- Players Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${cardsHtml}
      </div>
    </div>
  `;

  return renderPageLayout({
    title: 'खिलाड़ी खोज (Player Scouting)',
    activeTab: 'players',
    content
  });
}

module.exports = {
  renderHealthPage,
  renderTournamentsPage,
  renderTournamentDetailPage,
  renderPlayersPage
};
