/**
 * Bhadohi Village Cricket Platform - Standalone Development Server
 * Runs out-of-the-box on Node.js without external dependency requirements.
 * Serves:
 * 1. Live Interactive Web Dashboard at http://localhost:4000/
 * 2. Full REST API v1 at http://localhost:4000/api/v1/...
 * 3. Health check at http://localhost:4000/health
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const { authService } = require('../apps/server/dist/modules/auth/auth.service.js');
const { profileService } = require('../apps/server/dist/modules/profile/profile.service.js');
const { tournamentService } = require('../apps/server/dist/modules/tournament/tournament.service.js');
const { teamService } = require('../apps/server/dist/modules/team/team.service.js');
const { invitationService } = require('../apps/server/dist/modules/invitation/invitation.service.js');
const { safetyService } = require('../apps/server/dist/modules/safety/safety.service.js');
const { userRepository } = require('../apps/server/dist/repositories/user.repository.js');
const { profileRepository } = require('../apps/server/dist/repositories/profile.repository.js');
const { tournamentRepository } = require('../apps/server/dist/repositories/tournament.repository.js');
const { teamRepository } = require('../apps/server/dist/repositories/team.repository.js');
const { applicationRepository } = require('../apps/server/dist/repositories/application.repository.js');
const { invitationRepository } = require('../apps/server/dist/repositories/invitation.repository.js');
const {
  renderHealthPage,
  renderTournamentsPage,
  renderTournamentDetailPage,
  renderPlayersPage
} = require('./ui-templates.js');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';

async function seedInitialData() {
  console.log('[BVCP Seed] Pre-populating Bhadohi District Pilot Data...');

  // Reset repositories
  userRepository.clear();
  profileRepository.clear();
  tournamentRepository.clear();
  teamRepository.clear();
  applicationRepository.clear();
  invitationRepository.clear();

  // 1. Seed 3 Organizers
  const org1 = await authService.register({
    mobileNumber: '9876500001',
    pin: '112233',
    confirmPin: '112233',
    isAgeVerified: true
  });
  const uOrg1 = await userRepository.findById(org1.userId);
  uOrg1.role = 'ORGANIZER';

  const org2 = await authService.register({
    mobileNumber: '9876500002',
    pin: '223344',
    confirmPin: '223344',
    isAgeVerified: true
  });
  const uOrg2 = await userRepository.findById(org2.userId);
  uOrg2.role = 'ORGANIZER';

  // 2. Seed 3 Tournaments
  const tour1 = await tournamentService.createTournament(org1.userId, {
    title: 'खमरिया ग्रामीण क्रिकेट कप 2026',
    description: 'ज्ञानपुर ब्लॉक का प्रतिष्ठित टेनिस बॉल टूर्नामेंट। सभी 6 ब्लॉकों के ग्राम्य खिलाड़ियों का स्वागत है।',
    groundLocation: 'खमरिया इंटर कॉलेज मैदान',
    block: 'GYANPUR',
    registrationOpenDate: new Date().toISOString(),
    registrationCloseDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    maxTeams: 16,
    entryFeeNotice: '₹500 प्रति टीम - मैदान पर नकद',
    offlinePaymentDisclaimerAccepted: true
  });
  await tournamentService.publishTournament(org1.userId, tour1.id);

  const tour2 = await tournamentService.createTournament(org2.userId, {
    title: 'औराई नगर पंचायत प्रीमियर लीग',
    description: 'औराई ब्लॉक के स्थानीय युवाओं के लिए मर्यादित खेल प्रतियोगिता।',
    groundLocation: 'औराई नगर पंचायत मैदान',
    block: 'AURAI',
    registrationOpenDate: new Date().toISOString(),
    registrationCloseDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 16 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 22 * 86400000).toISOString(),
    maxTeams: 8,
    entryFeeNotice: '₹400 प्रति टीम - मैदान पर नकद',
    offlinePaymentDisclaimerAccepted: true
  });
  await tournamentService.publishTournament(org2.userId, tour2.id);

  const tour3 = await tournamentService.createTournament(org1.userId, {
    title: 'सुरियावां ग्रामीण नॉकआउट कप',
    description: 'सुरियावां ब्लॉक स्तरीय क्रिकेट प्रतियोगिता।',
    groundLocation: 'सुरियावां स्टेशन रोड मैदान',
    block: 'SURIYAWAN',
    registrationOpenDate: new Date().toISOString(),
    registrationCloseDate: new Date(Date.now() + 8 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 18 * 86400000).toISOString(),
    maxTeams: 8,
    entryFeeNotice: '₹350 प्रति टीम - मैदान पर नकद',
    offlinePaymentDisclaimerAccepted: true
  });
  await tournamentService.publishTournament(org1.userId, tour3.id);

  // 3. Seed 24 Adult Players across all 6 blocks
  const blocks = ['GYANPUR', 'AURAI', 'BHADOHI', 'SURIYAWAN', 'DEEGH', 'ABHOLI'];
  const hindiNames = [
    'रामेश्वर यादव', 'दिनेश कुमार बिंद', 'कमलेश सिंह', 'सुरेश पटेल',
    'अखिलेश मौर्य', 'रोहित दुबे', 'प्रदीप कुमार', 'संजय यादव',
    'मुकेश बिंद', 'अरविंद सिंह', 'विशाल पांडेय', 'मनोज कुमार',
    'अभिषेक सरोज', 'सतीश विश्वकर्मा', 'अनिल गौतम', 'राकेश सोनकर',
    'पंकज तिवारी', 'दीपक वर्मा', 'अजय कुमार', 'संदीप यादव',
    'अशोक बिंद', 'रवि सिंह', 'धर्मेश पाल', 'विपिन दुबे'
  ];

  const seededPlayers = [];
  for (let i = 0; i < hindiNames.length; i++) {
    const mobile = `98765100${String(i + 1).padStart(2, '0')}`;
    const pUser = await authService.register({
      mobileNumber: mobile,
      pin: '123456',
      confirmPin: '123456',
      isAgeVerified: true
    });

    const block = blocks[i % blocks.length];
    const role = i % 4 === 0 ? 'ALL_ROUNDER' : (i % 4 === 1 ? 'BATSMAN' : (i % 4 === 2 ? 'BOWLER' : 'WICKET_KEEPER'));
    const prof = await profileService.upsertProfile(pUser.userId, {
      fullName: hindiNames[i],
      village: `ग्राम ${hindiNames[i].split(' ')[1] || 'खास'}`,
      block,
      primaryRole: role,
      battingStyle: i % 3 === 0 ? 'बाएं हाथ' : 'दाएं हाथ',
      bowlingStyle: i % 2 === 0 ? 'मध्यम गति' : 'स्पिनर'
    });
    seededPlayers.push({ user: pUser, profile: prof, name: hindiNames[i] });
  }

  // 4. Seed Captains & Teams
  const captain1 = seededPlayers[0].user;
  const team1 = await teamService.createTeam(captain1.userId, tour1.id, {
    teamName: 'खमरिया सुपर किंग्स',
    village: 'खमरिया'
  });

  // Add 10 players to team1 squad
  for (let i = 1; i <= 10; i++) {
    await teamRepository.addMember(team1.id, seededPlayers[i].user.userId, 'PLAYER');
  }

  // Submit and accept application for team 1
  const app1 = await teamService.submitApplication(captain1.userId, tour1.id, team1.id);
  await teamService.reviewApplication(org1.userId, app1.id, 'ACCEPTED');

  // Seed Team 2
  const captain2 = seededPlayers[11].user;
  const team2 = await teamService.createTeam(captain2.userId, tour1.id, {
    teamName: 'औराई टाइटन्स',
    village: 'औराई'
  });
  for (let i = 12; i <= 18; i++) {
    await teamRepository.addMember(team2.id, seededPlayers[i].user.userId, 'PLAYER');
  }
  await teamService.submitApplication(captain2.userId, tour1.id, team2.id);

  console.log(`[BVCP Seed] Pre-populated 3 Tournaments, 24 Players, 2 Teams across 6 Bhadohi blocks!`);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('INVALID_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

function wantsHtml(req) {
  const format = new URL(req.url, 'http://localhost').searchParams.get('format');
  if (format === 'json') return false;
  if (format === 'html') return true;
  const accept = req.headers['accept'] || '';
  return accept.includes('text/html');
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(html);
}

// Load interactive HTML prototype for browser view
const PROTOTYPE_PATH = path.resolve(__dirname, '../prototypes/index.html');
const FIELD_KIT_PATH = path.resolve(__dirname, '../prototypes/pilot-field-kit.html');
let prototypeHtml = '';
let fieldKitHtml = '';
if (fs.existsSync(PROTOTYPE_PATH)) {
  prototypeHtml = fs.readFileSync(PROTOTYPE_PATH, 'utf8');
}
if (fs.existsSync(FIELD_KIT_PATH)) {
  fieldKitHtml = fs.readFileSync(FIELD_KIT_PATH, 'utf8');
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  // Handle CORS Pre-flight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // 1. Interactive UI Dashboard at Root & /dashboard
  if ((pathname === '/' || pathname === '/dashboard') && method === 'GET') {
    sendHtml(res, 200, prototypeHtml || '<h1>Bhadohi Village Cricket Platform - Server Running</h1>');
    return;
  }

  // 1b. Printable Field Kit & Cut-Out Cards
  if ((pathname === '/field-kit' || pathname === '/pilot-field-kit') && method === 'GET') {
    sendHtml(res, 200, fieldKitHtml || '<h1>Field Kit Unavailable</h1>');
    return;
  }

  // 2. Health Check
  if (pathname === '/health' && method === 'GET') {
    const healthData = {
      status: 'UP',
      service: 'bvcp-api-server',
      district: 'Bhadohi, Uttar Pradesh',
      blocks: ['Gyanpur', 'Aurai', 'Bhadohi', 'Suriyawan', 'Deegh', 'Abholi'],
      timestamp: new Date().toISOString()
    };
    if (wantsHtml(req)) {
      sendHtml(res, 200, renderHealthPage(healthData));
    } else {
      sendJson(res, 200, healthData);
    }
    return;
  }

  // 3. API Directory
  if ((pathname === '/api/v1' || pathname === '/api/v1/') && method === 'GET') {
    sendJson(res, 200, {
      success: true,
      data: {
        message: 'भदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म REST API v1',
        endpoints: {
          health: '/health',
          dashboard: '/',
          tournaments: '/api/v1/tournaments',
          players: '/api/v1/players',
          scout: '/api/v1/players/scout',
          teams: '/api/v1/teams',
          auth_register: 'POST /api/v1/auth/register',
          auth_login: 'POST /api/v1/auth/login'
        }
      },
      error: null,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 4. Tournaments List
  if ((pathname === '/api/v1/tournaments' || pathname === '/tournaments') && method === 'GET') {
    const block = urlObj.searchParams.get('block');
    const status = urlObj.searchParams.get('status');
    const list = await tournamentService.listTournaments({ block, status });
    if (wantsHtml(req)) {
      sendHtml(res, 200, renderTournamentsPage(list));
    } else {
      sendJson(res, 200, { success: true, data: list, error: null, timestamp: new Date().toISOString() });
    }
    return;
  }

  // 5. Tournament Details
  if ((pathname.startsWith('/api/v1/tournaments/') || pathname.startsWith('/tournaments/')) && method === 'GET') {
    const id = pathname.replace('/api/v1/tournaments/', '').replace('/tournaments/', '');
    try {
      const tour = await tournamentService.getTournamentDetails(id);
      const shareText = tournamentService.generateWhatsAppShareText(tour);
      const tourData = { ...tour, whatsapp_share_text: shareText };
      if (wantsHtml(req)) {
        sendHtml(res, 200, renderTournamentDetailPage(tourData));
      } else {
        sendJson(res, 200, {
          success: true,
          data: tourData,
          error: null,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      sendJson(res, 404, { success: false, data: null, error: { code: 'NOT_FOUND', message: 'टूर्नामेंट नहीं मिला' }, timestamp: new Date().toISOString() });
    }
    return;
  }

  // 6. Players Discovery (Strict Phone Masking)
  if ((pathname === '/api/v1/players' || pathname === '/api/v1/players/scout' || pathname === '/players' || pathname === '/scout') && method === 'GET') {
    const block = urlObj.searchParams.get('block');
    const role = urlObj.searchParams.get('role');
    const players = await invitationService.scoutPlayers({ block, role, availableOnly: true });
    if (wantsHtml(req)) {
      sendHtml(res, 200, renderPlayersPage(players));
    } else {
      sendJson(res, 200, { success: true, data: players, count: players.length, error: null, timestamp: new Date().toISOString() });
    }
    return;
  }

  // 7. Team Details & Roster
  if (pathname.startsWith('/api/v1/teams/') && method === 'GET') {
    const id = pathname.replace('/api/v1/teams/', '');
    try {
      const details = await teamService.getTeamDetails(id);
      sendJson(res, 200, { success: true, data: details, error: null, timestamp: new Date().toISOString() });
    } catch (e) {
      sendJson(res, 404, { success: false, data: null, error: { code: 'NOT_FOUND', message: 'टीम नहीं मिली' }, timestamp: new Date().toISOString() });
    }
    return;
  }

  // 8. Auth: Register
  if (pathname === '/api/v1/auth/register' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const result = await authService.register(body);
      sendJson(res, 201, {
        success: true,
        data: {
          user_id: result.userId,
          recovery_code: result.recoveryCode,
          token: result.token,
          instructions: 'कृपया इस रिकवरी कोड को सुरक्षित लिख लें।'
        },
        error: null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      sendJson(res, 400, { success: false, data: null, error: { code: err.message }, timestamp: new Date().toISOString() });
    }
    return;
  }

  // 9. Auth: Login
  if (pathname === '/api/v1/auth/login' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const result = await authService.login(body);
      sendJson(res, 200, { success: true, data: result, error: null, timestamp: new Date().toISOString() });
    } catch (err) {
      sendJson(res, 401, { success: false, data: null, error: { code: err.message }, timestamp: new Date().toISOString() });
    }
    return;
  }

  // Fallback 404
  sendJson(res, 404, {
    success: false,
    data: null,
    error: { code: 'NOT_FOUND', message: 'अनुरोधित एंडपॉइंट उपलब्ध नहीं है।' },
    timestamp: new Date().toISOString()
  });
});

async function start() {
  await seedInitialData();
  server.listen(PORT, HOST, () => {
    console.log(`\n========================================================================`);
    console.log(`🏏 BHADOHI VILLAGE CRICKET PLATFORM: DEV SERVER ACTIVE`);
    console.log(`========================================================================`);
    console.log(`  🌐 Interactive Dashboard: http://${HOST}:${PORT}/`);
    console.log(`  🔌 REST API Base URL:     http://${HOST}:${PORT}/api/v1`);
    console.log(`  ❤️  Health Check URL:      http://${HOST}:${PORT}/health`);
    console.log(`  📋 Tournaments API:       http://${HOST}:${PORT}/api/v1/tournaments`);
    console.log(`  👥 Player Scouting API:   http://${HOST}:${PORT}/api/v1/players`);
    console.log(`========================================================================\n`);
  });
}

start().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
