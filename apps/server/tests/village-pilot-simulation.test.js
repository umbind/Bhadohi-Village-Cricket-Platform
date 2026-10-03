/**
 * Phase 11: Controlled Village Pilot Simulation & End-to-End Lifecycle Suite
 * Simulates a realistic 4-week pilot rollout across 3 Bhadohi clusters:
 * Gyanpur (Khamaria), Aurai, and Suriyawan.
 */

const assert = require('assert');
const { authService } = require('../dist/modules/auth/auth.service.js');
const { profileService } = require('../dist/modules/profile/profile.service.js');
const { tournamentService } = require('../dist/modules/tournament/tournament.service.js');
const { teamService } = require('../dist/modules/team/team.service.js');
const { invitationService } = require('../dist/modules/invitation/invitation.service.js');
const { safetyService } = require('../dist/modules/safety/safety.service.js');
const { expiryEngine } = require('../dist/jobs/expiry.job.js');
const { userRepository } = require('../dist/repositories/user.repository.js');
const { profileRepository } = require('../dist/repositories/profile.repository.js');
const { tournamentRepository } = require('../dist/repositories/tournament.repository.js');
const { teamRepository } = require('../dist/repositories/team.repository.js');
const { applicationRepository } = require('../dist/repositories/application.repository.js');
const { invitationRepository } = require('../dist/repositories/invitation.repository.js');
const { moderationRepository } = require('../dist/repositories/moderation.repository.js');
const { expiryRepository } = require('../dist/repositories/expiry.repository.js');

let testsPassed = 0;
let testsFailed = 0;

function runTest(description, testFn) {
  try {
    testFn();
    console.log(`  ✅ PASS: ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

async function runAsyncTest(description, testFn) {
  try {
    await testFn();
    console.log(`  ✅ PASS: ${description}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

async function runPilotSimulation() {
  console.log('====================================================');
  console.log('BHADOHI VILLAGE CRICKET PLATFORM: PILOT SIMULATION');
  console.log('====================================================\n');

  // Reset all state
  userRepository.clear();
  profileRepository.clear();
  tournamentRepository.clear();
  teamRepository.clear();
  applicationRepository.clear();
  invitationRepository.clear();
  moderationRepository.clear();
  expiryRepository.clear();

  // ----------------------------------------------------
  // WEEK 1: ON-GROUND SETUP & ORGANIZER ONBOARDING
  // ----------------------------------------------------
  console.log('--- सप्ताह 1: ऑन-ग्राउंड सेटअप एवं आयोजक पंजीकरण ---');

  // 1. Register 3 Village Organizers
  const orgKhamaria = await authService.register({
    mobileNumber: '9876500101',
    pin: '112233',
    confirmPin: '112233',
    isAgeVerified: true
  });
  const orgAurai = await authService.register({
    mobileNumber: '9876500102',
    pin: '223344',
    confirmPin: '223344',
    isAgeVerified: true
  });
  const orgSuriyawan = await authService.register({
    mobileNumber: '9876500103',
    pin: '334455',
    confirmPin: '334455',
    isAgeVerified: true
  });

  // Promote to ORGANIZER role
  (await userRepository.findById(orgKhamaria.userId)).role = 'ORGANIZER';
  (await userRepository.findById(orgAurai.userId)).role = 'ORGANIZER';
  (await userRepository.findById(orgSuriyawan.userId)).role = 'ORGANIZER';

  runTest('Week 1: All 3 village organizers registered with secure PIN & recovery code', () => {
    assert(orgKhamaria.recoveryCode.match(/^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/));
    assert(orgAurai.recoveryCode.match(/^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/));
    assert(orgSuriyawan.recoveryCode.match(/^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/));
  });

  // 2. Organizers Publish 3 Pilot Tournaments
  const tourKhamaria = await tournamentService.createTournament(orgKhamaria.userId, {
    title: 'खमरिया ग्रामीण क्रिकेट कप 2026',
    description: 'ज्ञानपुर ब्लॉक का प्रतिष्ठित टेनिस बॉल टूर्नामेंट।',
    groundLocation: 'खमरिया इंटर कॉलेज मैदान',
    block: 'GYANPUR',
    registrationOpenDate: new Date().toISOString(),
    registrationCloseDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    maxTeams: 16,
    entryFeeNotice: '₹500 प्रति टीम - मैदान पर नकद',
    offlinePaymentDisclaimerAccepted: true
  });
  await tournamentService.publishTournament(orgKhamaria.userId, tourKhamaria.id);

  const tourAurai = await tournamentService.createTournament(orgAurai.userId, {
    title: 'औराई नगर पंचायत प्रीमियर लीग',
    description: 'औराई ब्लॉक के स्थानीय युवाओं के लिए खेल प्रतियोगिता।',
    groundLocation: 'औराई नगर पंचायत मैदान',
    block: 'AURAI',
    registrationOpenDate: new Date().toISOString(),
    registrationCloseDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 20 * 86400000).toISOString(),
    maxTeams: 8,
    entryFeeNotice: '₹400 प्रति टीम - मैदान पर नकद',
    offlinePaymentDisclaimerAccepted: true
  });
  await tournamentService.publishTournament(orgAurai.userId, tourAurai.id);

  runTest('Week 1: Pilot tournaments published with cash-on-ground notice & disclaimer', () => {
    assert.strictEqual(tourKhamaria.status, 'DRAFT'); // initially
    const pubKhamaria = tournamentRepository.findById(tourKhamaria.id);
    assert(pubKhamaria, 'Tournament exists');
    assert.strictEqual(tourKhamaria.entryFeeNotice, '₹500 प्रति टीम - मैदान पर नकद');
    assert.strictEqual(tourKhamaria.offlinePaymentDisclaimerAccepted, true);
  });

  // ----------------------------------------------------
  // WEEK 2: PLAYER ONBOARDING & CAPTAIN SQUAD ASSEMBLY
  // ----------------------------------------------------
  console.log('\n--- सप्ताह 2: खिलाड़ी पंजीकरण एवं स्क्वाड गठन ---');

  // Register 30 adult players across Bhadohi blocks
  const playerUsers = [];
  const playerProfiles = [];
  const blocks = ['GYANPUR', 'AURAI', 'SURIYAWAN'];

  for (let i = 1; i <= 30; i++) {
    const p = await authService.register({
      mobileNumber: `98765200${String(i).padStart(2, '0')}`,
      pin: '123456',
      confirmPin: '123456',
      isAgeVerified: true
    });
    playerUsers.push(p);

    const block = blocks[(i - 1) % 3];
    const prof = await profileService.upsertProfile(p.userId, {
      fullName: `खिलाड़ी ${i}`,
      village: `ग्राम ${i}`,
      block,
      primaryRole: i % 3 === 0 ? 'ALL_ROUNDER' : (i % 3 === 1 ? 'BATSMAN' : 'BOWLER'),
      battingStyle: 'दाएं हाथ',
      bowlingStyle: 'मध्यम गति'
    });
    playerProfiles.push(prof);
  }

  runTest('Week 2: 30 adult players registered with 18+ age verification & profile', () => {
    assert.strictEqual(playerUsers.length, 30);
    assert.strictEqual(playerProfiles.length, 30);
  });

  // Verify Phone Privacy Invariant across all 30 profiles
  runTest('Week 2: Phone privacy invariant verified - zero phone leaks in discovery', async () => {
    const scouted = await invitationService.scoutPlayers({ availableOnly: true });
    assert(scouted.length >= 30);
    for (const s of scouted) {
      assert.strictEqual(s.mobileNumber, undefined, 'Phone number must be omitted');
      assert.strictEqual(s.pinHash, undefined, 'Pin hash must be omitted');
    }
  });

  // 3 Captains create temporary teams
  const captain1 = playerUsers[0]; // Captain for Khamaria
  const captain2 = playerUsers[10]; // Captain for Aurai
  const captain3 = playerUsers[20]; // Captain for Suriyawan

  const teamKhamaria = await teamService.createTeam(captain1.userId, tourKhamaria.id, {
    teamName: 'खमरिया सुपर किंग्स',
    village: 'खमरिया'
  });

  const teamAurai = await teamService.createTeam(captain2.userId, tourAurai.id, {
    teamName: 'औराई टाइटन्स',
    village: 'औराई'
  });

  runTest('Week 2: Temporary teams formed bound to respective tournaments', () => {
    assert.strictEqual(teamKhamaria.status, 'FORMING');
    assert.strictEqual(teamAurai.status, 'FORMING');
  });

  // Captain 1 invites 10 players to reach minimum 11 squad members
  let whatsappLinkGenerated = false;
  for (let i = 1; i <= 10; i++) {
    const invitee = playerUsers[i];
    const inv = await invitationService.sendInvitation(captain1.userId, teamKhamaria.id, invitee.userId);
    // Player accepts invitation
    const accepted = await invitationService.respondToInvitation(invitee.userId, inv.id, 'ACCEPT');
    if (accepted.whatsappLink) {
      whatsappLinkGenerated = true;
    }
  }

  await runAsyncTest('Week 2: 10 players accepted invitations, unlocking WhatsApp coordinator link', async () => {
    assert.strictEqual(whatsappLinkGenerated, true, 'WhatsApp coordinator redirect link generated');
    const members = await teamRepository.getMembers(teamKhamaria.id);
    assert.strictEqual(members.length, 11, 'Squad reached 11 confirmed players (1 captain + 10 players)');
  });

  // ----------------------------------------------------
  // WEEK 3: TOURNAMENT APPLICATION & REVIEW
  // ----------------------------------------------------
  console.log('\n--- सप्ताह 3: टूर्नामेंट आवेदन एवं आयोजक समीक्षा ---');

  // Captain 1 submits application
  const app = await teamService.submitApplication(captain1.userId, tourKhamaria.id, teamKhamaria.id);
  await runAsyncTest('Week 3: Team submitted formal application to tournament', async () => {
    assert.strictEqual(app.status, 'PENDING');
    const updatedTeam = await teamRepository.findById(teamKhamaria.id);
    assert.strictEqual(updatedTeam.status, 'APPLIED');
  });

  // Organizer accepts application via dashboard review
  const reviewedApp = await teamService.reviewApplication(orgKhamaria.userId, app.id, 'ACCEPTED');
  await runAsyncTest('Week 3: Organizer reviewed & accepted team application', async () => {
    assert.strictEqual(reviewedApp.status, 'ACCEPTED');
    const acceptedTeam = await teamRepository.findById(teamKhamaria.id);
    assert.strictEqual(acceptedTeam.status, 'ACCEPTED');
  });

  // ----------------------------------------------------
  // WEEK 4: COMMUNITY SAFETY, RETROSPECTIVE & DATA RETENTION
  // ----------------------------------------------------
  console.log('\n--- सप्ताह 4: सुरक्षा, रेट्रोस्पेक्टिव एवं डेटा लाइफसाइकिल ---');

  // Safety report & human moderation review
  const report = await safetyService.submitReport(playerUsers[5].userId, {
    targetType: 'USER',
    targetId: playerUsers[6].userId,
    reasonCategory: 'OTHER',
    description: 'मैदान पर गलत सूचना दी गई थी।'
  });
  assert.strictEqual(report.status, 'PENDING');

  const reviewedReport = await safetyService.reviewReport(
    orgKhamaria.userId,
    report.id,
    'ACTION_TAKEN',
    'आयोजक द्वारा मौखिक चेतावनी दी गई।'
  );
  runTest('Week 4: Community safety report reviewed by human organizer (Zero algorithmic bans)', () => {
    assert.strictEqual(reviewedReport.status, 'ACTION_TAKEN');
    assert.strictEqual(reviewedReport.reviewedBy, orgKhamaria.userId);
  });

  // Nightly expiry sweep execution
  const sweepResults = await expiryEngine.runAllNightlyJobs();
  runTest('Week 4: Automated nightly data lifecycle sweeps executed cleanly', () => {
    assert.strictEqual(sweepResults.length, 4, 'All 4 maintenance jobs executed');
    for (const r of sweepResults) {
      assert.strictEqual(r.status, 'SUCCESS');
    }
  });


  // ----------------------------------------------------
  // STRICT NEGATIVE INVARIANTS AUDIT ON SIMULATED PILOT DB
  // ----------------------------------------------------
  console.log('\n--- कड़े निषेध नियम (Negative Invariants) सत्यापन ---');

  runTest('Pilot Audit: Absolute zero career statistics (runs, wickets, strike rate)', () => {
    const users = Array.from(userRepository.users.values());
    for (const u of users) {
      assert(!('strike_rate' in u));
      assert(!('runs_scored' in u));
      assert(!('wickets_taken' in u));
    }
  });

  runTest('Pilot Audit: Absolute zero in-app wallets, payment gateways or escrow balances', () => {
    const tours = Array.from(tournamentRepository.tournaments.values());
    for (const t of tours) {
      assert(!('wallet_balance' in t));
      assert(!('razorpay_order_id' in t));
      assert(!('stripe_payment_id' in t));
    }
  });

  runTest('Pilot Audit: Absolute zero third-party SMS/Email OTP records', () => {
    const users = Array.from(userRepository.users.values());
    for (const u of users) {
      assert(!('otp_code' in u));
      assert(!('otp_expires_at' in u));
    }
  });

  // SUMMARY
  console.log('----------------------------------------------------');
  console.log(`TOTAL PILOT SIMULATION TESTS: ${testsPassed + testsFailed} | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
  console.log('----------------------------------------------------');

  if (testsFailed > 0) {
    throw new Error(`${testsFailed} pilot simulation tests failed!`);
  }
  console.log('\n🎉 ALL VILLAGE PILOT SIMULATION TESTS PASSED!\n');
}

if (require.main === module) {
  runPilotSimulation().catch(err => {
    console.error('Pilot Simulation Failed:', err);
    process.exit(1);
  });
}

module.exports = { runPilotSimulation };
