/**
 * Phase 10: Rural 3G Network Resilience & Latency Test Suite
 * Tests network throttling, payload budget adherence, idempotency under high latency,
 * retry mechanisms with exponential backoff, and Hindi Devanagari integrity.
 */

const assert = require('assert');
const { NetworkSimulator, BHADOHI_RURAL_3G, BHADOHI_EDGE_SLOW, ruralSimulator } = require('../dist/testing/network-simulator.js');
const { authService } = require('../dist/modules/auth/auth.service.js');
const { profileService } = require('../dist/modules/profile/profile.service.js');
const { tournamentService } = require('../dist/modules/tournament/tournament.service.js');
const { teamService } = require('../dist/modules/team/team.service.js');
const { invitationService } = require('../dist/modules/invitation/invitation.service.js');
const { userRepository } = require('../dist/repositories/user.repository.js');
const { profileRepository } = require('../dist/repositories/profile.repository.js');
const { tournamentRepository } = require('../dist/repositories/tournament.repository.js');
const { teamRepository } = require('../dist/repositories/team.repository.js');
const { applicationRepository } = require('../dist/repositories/application.repository.js');
const { invitationRepository } = require('../dist/repositories/invitation.repository.js');

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

async function runAllResilienceTests() {
  console.log('====================================================');
  console.log('BHADOHI VILLAGE CRICKET PLATFORM: RURAL 3G TESTS');
  console.log('====================================================\n');

  // Reset repositories
  userRepository.clear();
  profileRepository.clear();
  tournamentRepository.clear();
  teamRepository.clear();
  applicationRepository.clear();
  invitationRepository.clear();

  // ----------------------------------------------------
  // SECTION 1: PAYLOAD BUDGET & COMPACT SERIALIZATION
  // ----------------------------------------------------
  console.log('1. Payload Budget & Serialization Efficiency:');

  // Seed sample tournament and profiles
  const org = await authService.register({
    mobileNumber: '9876511111',
    pin: '123456',
    confirmPin: '123456',
    isAgeVerified: true
  });
  const orgUser = await userRepository.findById(org.userId);
  orgUser.role = 'ORGANIZER';

  const sampleTournament = await tournamentService.createTournament(org.userId, {
    title: 'गोपीगंज ग्रामीण प्रीमियर लीग',
    description: 'भदोही जिले के सभी 6 ब्लॉकों के लिए खुली टेनिस बॉल प्रतियोगिता।',
    groundLocation: 'गोपीगंज मैदान',
    block: 'GYANPUR',
    registrationOpenDate: new Date().toISOString(),
    registrationCloseDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    startDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    endDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    maxTeams: 16,
    entryFeeNotice: '₹500 प्रति टीम - मैदान पर नकद',
    offlinePaymentDisclaimerAccepted: true
  });
  await tournamentService.publishTournament(org.userId, sampleTournament.id);

  // Seed 20 player profiles across Bhadohi blocks
  const blocks = ['GYANPUR', 'AURAI', 'BHADOHI', 'SURIYAWAN', 'DEEGH', 'ABHOLI'];
  for (let i = 1; i <= 20; i++) {
    const pUser = await authService.register({
      mobileNumber: `98765222${String(i).padStart(2, '0')}`,
      pin: '123456',
      confirmPin: '123456',
      isAgeVerified: true
    });
    await profileService.upsertProfile(pUser.userId, {
      fullName: `खिलाड़ी ${i}`,
      village: `ग्राम ${i}`,
      block: blocks[i % blocks.length],
      primaryRole: i % 2 === 0 ? 'ALL_ROUNDER' : 'BATSMAN',
      battingStyle: 'दाएं हाथ',
      bowlingStyle: 'मध्यम गति'
    });
  }

  runTest('Tournament list payload is within rural budget (< 25 KB)', async () => {
    const list = await tournamentService.listTournaments({});
    const audit = ruralSimulator.auditPayloadBudget(list, 25);
    assert.strictEqual(audit.isCompliant, true, `Tournament payload ${audit.sizeKb}KB exceeds 25KB budget`);
    assert(audit.sizeKb < 5, `Expected tiny payload for rural networks, got ${audit.sizeKb}KB`);
  });

  runTest('Player discovery list (20 profiles) is within rural budget (< 35 KB)', async () => {
    const players = await invitationService.scoutPlayers({ availableOnly: true });
    const audit = ruralSimulator.auditPayloadBudget(players, 35);
    assert.strictEqual(audit.isCompliant, true, `Player list payload ${audit.sizeKb}KB exceeds 35KB budget`);
    assert(audit.sizeKb < 15, `Expected compact player payload, got ${audit.sizeKb}KB`);
  });

  // ----------------------------------------------------
  // SECTION 2: LATENCY ESTIMATION UNDER RURAL NETWORKS
  // ----------------------------------------------------
  console.log('\n2. Network Transfer Delay Simulation:');

  runTest('Calculates realistic transmission time on Bhadohi Rural 3G (200 kbps)', () => {
    // 5KB payload downstream
    const delayMs = ruralSimulator.calculateTransmissionDelay(5 * 1024, 'DOWN');
    // base 400ms + (5120*8 / 200,000 * 1000 = ~205ms) = ~605ms +/- 150ms jitter
    assert(delayMs >= 350 && delayMs <= 950, `Expected delay between 350-950ms, got ${delayMs}ms`);
  });

  runTest('Calculates realistic transmission time on Bhadohi Slow EDGE (64 kbps)', () => {
    const edgeSimulator = new NetworkSimulator(BHADOHI_EDGE_SLOW);
    const delayMs = edgeSimulator.calculateTransmissionDelay(2 * 1024, 'DOWN');
    // base 1200ms + (2048*8 / 64,000 * 1000 = ~256ms) = ~1456ms +/- 300ms jitter
    assert(delayMs >= 1000 && delayMs <= 2200, `Expected delay between 1000-2200ms, got ${delayMs}ms`);
  });

  // ----------------------------------------------------
  // SECTION 3: IDEMPOTENCY & DOUBLE-TAP UNDER NETWORK DELAY
  // ----------------------------------------------------
  console.log('\n3. Idempotency & Double-Tap Protection Under High Latency:');

  await runAsyncTest('Rapid duplicate registration tap safely rejected with 409', async () => {
    const regPayload = {
      mobileNumber: '9876533333',
      pin: '654321',
      confirmPin: '654321',
      isAgeVerified: true
    };

    // First request
    const res1 = await authService.register(regPayload);
    assert(res1.userId, 'First registration succeeds');

    // Second request (simulating impatient user double-tapping)
    let dupFailed = false;
    try {
      await authService.register(regPayload);
    } catch (err) {
      dupFailed = true;
      assert.strictEqual(err.message, 'MOBILE_ALREADY_REGISTERED');
    }
    assert.strictEqual(dupFailed, true, 'Second tap prevented duplicate user creation');
  });

  await runAsyncTest('Rapid duplicate team application tap safely rejected with 409', async () => {
    const captain = await authService.register({
      mobileNumber: '9876544444',
      pin: '123456',
      confirmPin: '123456',
      isAgeVerified: true
    });
    const team = await teamService.createTeam(captain.userId, sampleTournament.id, {
      teamName: 'खमरिया पैंथर्स',
      village: 'खमरिया'
    });

    // First application submission
    const app1 = await teamService.submitApplication(captain.userId, sampleTournament.id, team.id);
    assert.strictEqual(app1.status, 'PENDING');

    // Second application submission (double-tap under lag)
    let appDupFailed = false;
    try {
      await teamService.submitApplication(captain.userId, sampleTournament.id, team.id);
    } catch (err) {
      appDupFailed = true;
      assert.strictEqual(err.message, 'DUPLICATE_APPLICATION');
    }
    assert.strictEqual(appDupFailed, true, 'Second application tap prevented duplicate submission');
  });

  await runAsyncTest('Rapid duplicate squad invitation tap safely rejected', async () => {
    const captain = await authService.register({
      mobileNumber: '9876555555',
      pin: '123456',
      confirmPin: '123456',
      isAgeVerified: true
    });
    const team = await teamService.createTeam(captain.userId, sampleTournament.id, {
      teamName: 'ज्ञानपुर वॉरियर्स',
      village: 'ज्ञानपुर'
    });

    const invitee = await authService.register({
      mobileNumber: '9876566666',
      pin: '123456',
      confirmPin: '123456',
      isAgeVerified: true
    });
    const profile = await profileService.upsertProfile(invitee.userId, {
      fullName: 'सुनील बिंद',
      village: 'ज्ञानपुर',
      block: 'GYANPUR',
      primaryRole: 'ALL_ROUNDER',
      battingStyle: 'दाएं हाथ',
      bowlingStyle: 'मध्यम गति'
    });

    // First invitation
    const inv1 = await invitationService.sendInvitation(captain.userId, team.id, profile.id);
    assert.strictEqual(inv1.status, 'PENDING');

    // Second invitation
    let invDupFailed = false;
    try {
      await invitationService.sendInvitation(captain.userId, team.id, profile.id);
    } catch (err) {
      invDupFailed = true;
      assert.strictEqual(err.message, 'DUPLICATE_INVITATION');
    }
    assert.strictEqual(invDupFailed, true, 'Second invitation tap prevented duplicate record');
  });

  // ----------------------------------------------------
  // SECTION 4: TRANSIENT FAILURE & EXPONENTIAL BACKOFF
  // ----------------------------------------------------
  console.log('\n4. Transient Connection Drop & Backoff Recovery:');

  await runAsyncTest('Transient network drops recover successfully on attempt 3', async () => {
    let callCount = 0;
    const flakyApiCall = async (attempt) => {
      callCount++;
      if (attempt < 3) {
        throw new Error('ECONNRESET: Rural connection interrupted');
      }
      return { success: true, payload: 'गोपीगंज टूर्नामेंट विवरण' };
    };

    const response = await ruralSimulator.executeWithBackoff(flakyApiCall, {
      maxAttempts: 3,
      initialDelayMs: 20,
      backoffFactor: 1.5
    });

    assert.strictEqual(response.result.success, true);
    assert.strictEqual(response.attempts, 3);
    assert.strictEqual(callCount, 3, 'Took exactly 3 attempts to succeed');
  });

  await runAsyncTest('Persistent network outage times out cleanly after max retries', async () => {
    const deadApiCall = async () => {
      throw new Error('ETIMEDOUT: No network towers reachable');
    };

    let exhausted = false;
    try {
      await ruralSimulator.executeWithBackoff(deadApiCall, {
        maxAttempts: 3,
        initialDelayMs: 10,
        backoffFactor: 1.2
      });
    } catch (err) {
      exhausted = true;
      assert(err.message.includes('NETWORK_REQUEST_FAILED_AFTER_3_ATTEMPTS'));
    }
    assert.strictEqual(exhausted, true, 'Cleanly threw exhausted exception for offline UI state');
  });

  // ----------------------------------------------------
  // SECTION 5: HINDI DEVANAGARI ENCODING INTEGRITY
  // ----------------------------------------------------
  console.log('\n5. Devanagari Script Encoding Integrity Over Wire:');

  runTest('Devanagari conjuncts & ligatures preserved accurately in JSON payload', () => {
    const complexDevanagari = {
      title: 'प्रतियोगिता',
      roles: ['ऑलराउंडर', 'विकेटकीपर-बल्लेबाज', 'मध्यम गति तेज गेंदबाज'],
      status: 'स्वीकृत',
      disclaimer: 'मैदान पर नकद - कोई ऑनलाइन भुगतान नहीं'
    };

    const json = JSON.stringify(complexDevanagari);
    const parsed = JSON.parse(json);

    assert.strictEqual(parsed.title, 'प्रतियोगिता');
    assert.strictEqual(parsed.roles[0], 'ऑलराउंडर');
    assert.strictEqual(parsed.status, 'स्वीकृत');
    assert.strictEqual(parsed.disclaimer, 'मैदान पर नकद - कोई ऑनलाइन भुगतान नहीं');
  });

  // SUMMARY
  console.log('----------------------------------------------------');
  console.log(`TOTAL RESILIENCE TESTS: ${testsPassed + testsFailed} | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
  console.log('----------------------------------------------------');

  if (testsFailed > 0) {
    throw new Error(`${testsFailed} rural resilience tests failed!`);
  }
  console.log('\n🎉 ALL RURAL 3G RESILIENCE TESTS PASSED!\n');
}

if (require.main === module) {
  runAllResilienceTests().catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  });
}

module.exports = { runAllResilienceTests };
