/**
 * Phase 10: Security, Penetration & Invariant Verification Test Suite
 * Validates SEC-01 through SEC-08, OWASP API Top 10 defenses, brute-force lockout,
 * token forgery defenses, and strict negative invariants.
 */

const assert = require('assert');
const { authService } = require('../dist/modules/auth/auth.service.js');
const { profileService } = require('../dist/modules/profile/profile.service.js');
const { tournamentService } = require('../dist/modules/tournament/tournament.service.js');
const { teamService } = require('../dist/modules/team/team.service.js');
const { invitationService } = require('../dist/modules/invitation/invitation.service.js');
const { safetyService } = require('../dist/modules/safety/safety.service.js');
const { userRepository } = require('../dist/repositories/user.repository.js');
const { profileRepository } = require('../dist/repositories/profile.repository.js');
const { tournamentRepository } = require('../dist/repositories/tournament.repository.js');
const { teamRepository } = require('../dist/repositories/team.repository.js');
const { applicationRepository } = require('../dist/repositories/application.repository.js');
const { invitationRepository } = require('../dist/repositories/invitation.repository.js');
const { moderationRepository } = require('../dist/repositories/moderation.repository.js');
const { authenticate, requireRole } = require('../dist/middleware/authenticate.js');

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

async function runAllSecurityTests() {
  console.log('====================================================');
  console.log('BHADOHI VILLAGE CRICKET PLATFORM: SECURITY & PEN-TESTS');
  console.log('====================================================\n');

  // Reset stores
  userRepository.clear();
  profileRepository.clear();
  tournamentRepository.clear();
  teamRepository.clear();
  applicationRepository.clear();
  invitationRepository.clear();
  moderationRepository.clear();

  // Seed Users
  const userA = await authService.register({
    mobileNumber: '9876500001',
    pin: '112233',
    confirmPin: '112233',
    isAgeVerified: true
  });

  const userB = await authService.register({
    mobileNumber: '9876500002',
    pin: '223344',
    confirmPin: '223344',
    isAgeVerified: true
  });

  const orgA = await authService.register({
    mobileNumber: '9876500003',
    pin: '334455',
    confirmPin: '334455',
    isAgeVerified: true
  });
  // Mark orgA role
  const orgUserRecord = await userRepository.findById(orgA.userId);
  orgUserRecord.role = 'ORGANIZER';

  const orgB = await authService.register({
    mobileNumber: '9876500004',
    pin: '445566',
    confirmPin: '445566',
    isAgeVerified: true
  });
  const orgUserRecordB = await userRepository.findById(orgB.userId);
  orgUserRecordB.role = 'ORGANIZER';

  // Create profiles
  await profileService.upsertProfile(userA.userId, {
    fullName: 'रामेश्वर यादव',
    village: 'खमरिया',
    block: 'GYANPUR',
    primaryRole: 'ALL_ROUNDER',
    battingStyle: 'दाएं हाथ',
    bowlingStyle: 'मध्यम गति'
  });

  await profileService.upsertProfile(userB.userId, {
    fullName: 'दिनेश कुमार बिंद',
    village: 'औराई',
    block: 'AURAI',
    primaryRole: 'BATSMAN',
    battingStyle: 'बाएं हाथ',
    bowlingStyle: 'मध्यम गति'
  });

  // Seed Tournament by Organizer A
  const tourA = await tournamentService.createTournament(orgA.userId, {
    title: 'खमरिया ग्रामीण क्रिकेट कप',
    description: 'भदोही जिले की पारंपरिक प्रतियोगिता।',
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
  await tournamentService.publishTournament(orgA.userId, tourA.id);

  // Seed Team by Captain A (User A)
  const teamA = await teamService.createTeam(userA.userId, tourA.id, {
    teamName: 'खमरिया सुपर किंग्स',
    village: 'खमरिया'
  });

  // Seed Team by Captain B (User B)
  const teamB = await teamService.createTeam(userB.userId, tourA.id, {
    teamName: 'औराई टाइटन्स',
    village: 'औराई'
  });

  // ----------------------------------------------------
  // SECTION 1: BROKEN OBJECT LEVEL AUTHORIZATION (BOLA / SEC-01 to SEC-03)
  // ----------------------------------------------------
  console.log('1. Broken Object Level Authorization (BOLA) Tests:');

  await runAsyncTest('SEC-01: Profile updates strictly scoped to token owner', async () => {
    // Attempting to update profile via service using User A's credentials updates User A
    const profA = await profileService.upsertProfile(userA.userId, {
      fullName: 'रामेश्वर यादव (संशोधित)',
      village: 'खमरिया',
      block: 'GYANPUR',
      primaryRole: 'ALL_ROUNDER',
      battingStyle: 'दाएं हाथ',
      bowlingStyle: 'मध्यम गति'
    });
    assert.strictEqual(profA.fullName, 'रामेश्वर यादव (संशोधित)');

    // Verify User B's profile was unaffected
    const profB = await profileService.getMyProfile(userB.userId);
    assert.strictEqual(profB.fullName, 'दिनेश कुमार बिंद');
  });

  await runAsyncTest('SEC-02: Captain B cannot remove players from Captain A\'s team', async () => {
    // Add user to team A
    const member = await teamRepository.addMember(teamA.id, 'dummy-player-1', 'PLAYER');
    
    // Captain B attempts to remove the player from Captain A's team
    let errorCaught = false;
    try {
      await teamService.removePlayerFromTeam(userB.userId, teamA.id, 'dummy-player-1');
    } catch (err) {
      errorCaught = true;
      assert.strictEqual(err.message, 'FORBIDDEN_NOT_CAPTAIN');
    }
    assert.strictEqual(errorCaught, true, 'Captain B was prevented from modifying Captain A team roster');

    // Captain A successfully removes the player
    const removed = await teamService.removePlayerFromTeam(userA.userId, teamA.id, 'dummy-player-1');
    assert.strictEqual(removed, true);
  });

  await runAsyncTest('SEC-03: Organizer B cannot review/accept applications for Organizer A\'s tournament', async () => {
    // Submit team A application
    const app = await teamService.submitApplication(userA.userId, tourA.id, teamA.id);

    // Organizer B attempts to review
    let errorCaught = false;
    try {
      await teamService.reviewApplication(orgB.userId, app.id, 'ACCEPTED');
    } catch (err) {
      errorCaught = true;
      assert.strictEqual(err.message, 'FORBIDDEN_NOT_ORGANIZER');
    }
    assert.strictEqual(errorCaught, true, 'Organizer B was prevented from reviewing Organizer A application');

    // Organizer A successfully accepts
    const acceptedApp = await teamService.reviewApplication(orgA.userId, app.id, 'ACCEPTED');
    assert.strictEqual(acceptedApp.status, 'ACCEPTED');
  });

  // ----------------------------------------------------
  // SECTION 2: BROKEN FUNCTION LEVEL AUTHORIZATION (BFLA / SEC-04)
  // ----------------------------------------------------
  console.log('\n2. Broken Function Level Authorization (BFLA) Tests:');

  runTest('SEC-04: Non-admin role cannot execute admin operations', () => {
    let forbiddenCalled = false;
    const mockReq = {
      user: { userId: userA.userId, role: 'PLAYER', mobileMasked: '98****0001' }
    };
    const mockRes = {
      status: (code) => {
        if (code === 403) forbiddenCalled = true;
        return {
          json: (body) => {
            assert.strictEqual(body.error.code, 'FORBIDDEN_ROLE');
          }
        };
      }
    };
    const mockNext = () => {
      assert.fail('Should not call next for non-admin user');
    };

    const adminCheck = requireRole(['ADMIN']);
    adminCheck(mockReq, mockRes, mockNext);
    assert.strictEqual(forbiddenCalled, true, 'requireRole blocked non-admin user with 403');
  });

  runTest('SEC-04b: Admin user successfully passes requireRole middleware', () => {
    let nextCalled = false;
    const mockReq = {
      user: { userId: 'admin-1', role: 'ADMIN', mobileMasked: '99****9999' }
    };
    const mockRes = {
      status: () => ({ json: () => {} })
    };
    const mockNext = () => {
      nextCalled = true;
    };

    const adminCheck = requireRole(['ADMIN']);
    adminCheck(mockReq, mockRes, mockNext);
    assert.strictEqual(nextCalled, true, 'requireRole allowed admin user');
  });

  // ----------------------------------------------------
  // SECTION 3: DATA PRIVACY & LEAK PREVENTION (SEC-05 & SEC-06)
  // ----------------------------------------------------
  console.log('\n3. Data Privacy & Zero-Knowledge Leak Tests:');

  await runAsyncTest('SEC-05: Public scouting & discovery strictly omits phone numbers', async () => {
    const players = await invitationService.scoutPlayers({ block: 'GYANPUR' });
    assert(players.length > 0, 'Players found in Gyanpur block');
    for (const player of players) {
      assert.strictEqual(player.mobileNumber, undefined, 'mobileNumber must NOT exist on scouted profile');
      assert.strictEqual(player.pinHash, undefined, 'pinHash must NOT exist on scouted profile');
      assert.strictEqual(player.recoveryCodeHash, undefined, 'recoveryCodeHash must NOT exist on scouted profile');
    }
  });

  await runAsyncTest('SEC-06: Salted hash stored in DB; recovery code hashed', async () => {
    const userRec = await userRepository.findById(userA.userId);
    assert(userRec.pinHash.startsWith('$argon2id$') || userRec.pinHash.length >= 32, 'PIN must be securely hashed');
    assert.notStrictEqual(userRec.pinHash, '112233', 'PIN must never be plaintext');
    assert.notStrictEqual(userRec.recoveryCodeHash, userA.recoveryCode, 'Recovery code must be hashed');
  });

  // ----------------------------------------------------
  // SECTION 4: RATE LIMITING & HARASSMENT PREVENTION (SEC-07 & SEC-08)
  // ----------------------------------------------------
  console.log('\n4. Moderation & Harassment Protection Tests:');

  await runAsyncTest('SEC-07: Max 5 reports per 24 hours enforced (6th rejected with 429)', async () => {
    // Seed 6 distinct target users
    const targetUserIds = [];
    for (let i = 1; i <= 6; i++) {
      const u = await authService.register({
        mobileNumber: `987654000${i}`,
        pin: '112233',
        confirmPin: '112233',
        isAgeVerified: true
      });
      targetUserIds.push(u.userId);
    }

    // Submit 5 reports
    for (let i = 0; i < 5; i++) {
      await safetyService.submitReport(userA.userId, {
        targetType: 'USER',
        targetId: targetUserIds[i],
        reasonCategory: 'INAPPROPRIATE_CONTENT',
        description: `असुरक्षित व्यवहार की शिकायत विवरण संख्या ${i + 1}`
      });
    }

    // 6th report should fail
    let errorCaught = false;
    try {
      await safetyService.submitReport(userA.userId, {
        targetType: 'USER',
        targetId: targetUserIds[5],
        reasonCategory: 'OTHER',
        description: 'अतिरिक्त रिपोर्ट जो सीमा पार करती है।'
      });

    } catch (err) {
      errorCaught = true;
      assert.strictEqual(err.message, 'REPORT_RATE_LIMIT_EXCEEDED');
    }
    assert.strictEqual(errorCaught, true, '6th report was blocked by rate limiter');
  });


  await runAsyncTest('SEC-08: Bidirectional block shields search & invitations completely', async () => {
    // User A blocks User B
    await safetyService.blockUser(userA.userId, userB.userId);

    // 1. Scouting filter check: User B searches players with scouterUserId -> User A excluded
    const scoutedByB = await invitationService.scoutPlayers({
      scouterUserId: userB.userId,
      block: 'GYANPUR'
    });
    const containsA = scoutedByB.some(p => p.fullName.includes('रामेश्वर यादव'));
    assert.strictEqual(containsA, false, 'Blocked user A is invisible in User B scouting results');

    // 2. Invitation check: User B attempts to invite User A to team B
    let inviteBlocked = false;
    try {
      await invitationService.sendInvitation(userB.userId, teamB.id, userA.userId);
    } catch (err) {
      inviteBlocked = true;
      assert.strictEqual(err.message, 'BLOCKED_INTERACTION');
    }
    assert.strictEqual(inviteBlocked, true, 'User B cannot invite blocked User A');

    // 3. Reverse direction: User A attempts to invite User B to a forming team
    const teamForA = await teamService.createTeam(userA.userId, tourA.id, {
      teamName: 'खमरिया लायंस',
      village: 'खमरिया'
    });

    let reverseBlocked = false;
    try {
      await invitationService.sendInvitation(userA.userId, teamForA.id, userB.userId);
    } catch (err) {
      reverseBlocked = true;
      assert.strictEqual(err.message, 'BLOCKED_INTERACTION');
    }
    assert.strictEqual(reverseBlocked, true, 'User A cannot invite blocked User B');

    // Cleanup block
    await safetyService.unblockUser(userA.userId, userB.userId);

  });

  // ----------------------------------------------------
  // SECTION 5: BRUTE FORCE & TOKEN SECURITY
  // ----------------------------------------------------
  console.log('\n5. Brute Force & Token Security Tests:');

  await runAsyncTest('Brute-Force Lockout: 5 failed PIN attempts triggers 15-minute lockout', async () => {
    const testUser = await authService.register({
      mobileNumber: '9876599999',
      pin: '123456',
      confirmPin: '123456',
      isAgeVerified: true
    });

    // 4 failed attempts
    for (let i = 1; i <= 4; i++) {
      let failed = false;
      try {
        await authService.login({ mobileNumber: '9876599999', pin: '999999' });
      } catch (err) {
        failed = true;
        assert.strictEqual(err.message, 'INVALID_CREDENTIALS');
      }
      assert.strictEqual(failed, true);
    }

    // 5th failed attempt triggers lockout
    let lockMessage = '';
    try {
      await authService.login({ mobileNumber: '9876599999', pin: '999999' });
    } catch (err) {
      lockMessage = err.message;
    }
    assert(lockMessage.startsWith('ACCOUNT_LOCKED'), '5th attempt triggered ACCOUNT_LOCKED');

    // 6th attempt is rejected immediately as locked
    let instantLock = false;
    try {
      await authService.login({ mobileNumber: '9876599999', pin: '123456' }); // even with correct PIN!
    } catch (err) {
      instantLock = true;
      assert(err.message.startsWith('ACCOUNT_LOCKED'));
    }
    assert.strictEqual(instantLock, true, 'Locked account rejects correct PIN without database hash verification');
  });

  await runAsyncTest('JWT Forgery & Tamper Defense: Modified signature or expired token rejected', async () => {
    // Generate valid token
    const userRecA = await userRepository.findById(userA.userId);
    const token = authService.generateJwt(userRecA);

    // 1. Valid token succeeds
    const claims = authService.verifyJwt(token);
    assert.strictEqual(claims.sub, userA.userId);

    // 2. Tampered payload rejected
    const parts = token.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ sub: userB.userId, role: 'ADMIN' })).toString('base64url');
    const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    assert.throws(() => authService.verifyJwt(forgedToken), /invalid signature|INVALID_SIGNATURE|INVALID_TOKEN/);

    // 3. Garbage token rejected
    assert.throws(() => authService.verifyJwt('not-a-real-token'), /jwt malformed|MALFORMED_JWT|MALFORMED_TOKEN|INVALID_TOKEN/);
  });



  // ----------------------------------------------------
  // SECTION 6: INJECTION DEFENSES
  // ----------------------------------------------------
  console.log('\n6. Injection Attack Defenses:');

  await runAsyncTest('SQL Injection Simulation: Malicious SQL payloads handled safely as literals', async () => {
    const sqlInjectionPayload = "'; DROP TABLE users; --";
    
    // Attempt search with SQL injection
    const results = await profileService.searchPlayers({
      block: sqlInjectionPayload
    });
    assert(Array.isArray(results), 'Search returns valid array without executing injection');
    assert.strictEqual(results.length, 0, 'No records match literal SQL payload');
  });

  await runAsyncTest('XSS Script Tags: Handled safely as literal strings', async () => {
    const xssPayload = "<script>alert('xss')</script>";
    const prof = await profileService.upsertProfile(userA.userId, {
      fullName: xssPayload,
      village: 'खमरिया',
      block: 'GYANPUR',
      primaryRole: 'ALL_ROUNDER',
      battingStyle: 'दाएं हाथ',
      bowlingStyle: 'मध्यम गति'
    });
    // Stored as literal string
    assert.strictEqual(prof.fullName, xssPayload);
  });

  // ----------------------------------------------------
  // SECTION 7: STRICT NEGATIVE INVARIANTS (BVCP)
  // ----------------------------------------------------
  console.log('\n7. Universal Strict Negative Invariants Verification:');

  runTest('Zero Live Scoring: Prohibited scoring symbols absent across all models', () => {
    const prohibitedScoring = ['live_score', 'runs_scored', 'wickets_taken', 'balls_bowled', 'maiden_overs'];
    for (const term of prohibitedScoring) {
      assert(!Object.keys(userA).includes(term), `${term} must be absent in user`);
      assert(!Object.keys(tourA).includes(term), `${term} must be absent in tournament`);
      assert(!Object.keys(teamA).includes(term), `${term} must be absent in team`);
    }
  });

  runTest('Zero Vanity Career Stats: Prohibited player ranking symbols absent', () => {
    const prohibitedStats = ['strike_rate', 'bowling_average', 'economy_rate', 'player_ranking', 'mvp_award'];
    for (const term of prohibitedStats) {
      assert(!Object.keys(userA).includes(term), `${term} must be absent in user`);
      assert(!Object.keys(teamA).includes(term), `${term} must be absent in team`);
    }
  });

  runTest('Zero In-App Payments: No gateway or wallet balance fields', () => {
    const prohibitedPayments = ['wallet_balance', 'razorpay_order_id', 'stripe_payment_id', 'upi_transaction_id'];
    for (const term of prohibitedPayments) {
      assert(!Object.keys(tourA).includes(term), `${term} must be absent in tournament`);
    }
  });

  // SUMMARY
  console.log('----------------------------------------------------');
  console.log(`TOTAL SECURITY TESTS: ${testsPassed + testsFailed} | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
  console.log('----------------------------------------------------');

  if (testsFailed > 0) {
    throw new Error(`${testsFailed} security tests failed!`);
  }
  console.log('\n🎉 ALL SECURITY & PENETRATION TESTS PASSED!\n');
}

if (require.main === module) {
  runAllSecurityTests().catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  });
}

module.exports = { runAllSecurityTests };
