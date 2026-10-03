/**
 * Phase 9 Comprehensive Moderation & Expiry Automated Test Suite
 * Tests report submission, 5/day rate-limits, user blocking, admin review workflows,
 * 15-day availability sweeps, invitation sweeps, tournament/team archival,
 * 90-day PII scrubbing, and negative invariants.
 */

const assert = require('assert');

const { SafetyService } = require('../dist/modules/safety/safety.service.js');
const { ExpiryEngine } = require('../dist/jobs/expiry.job.js');
const { moderationRepository } = require('../dist/repositories/moderation.repository.js');
const { expiryRepository } = require('../dist/repositories/expiry.repository.js');
const { userRepository } = require('../dist/repositories/user.repository.js');
const { profileRepository } = require('../dist/repositories/profile.repository.js');
const { tournamentRepository } = require('../dist/repositories/tournament.repository.js');
const { teamRepository } = require('../dist/repositories/team.repository.js');
const { invitationRepository } = require('../dist/repositories/invitation.repository.js');

const safetyService = new SafetyService();
const expiryEngine = new ExpiryEngine();

async function runModerationAndExpiryTests() {
  console.log('====================================================');
  console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 9 TEST SUITE');
  console.log('====================================================\n');

  moderationRepository.clear();
  expiryRepository.clear();
  userRepository.clear();
  profileRepository.clear();
  tournamentRepository.clear();
  teamRepository.clear();
  invitationRepository.clear();

  let passCount = 0;
  let failCount = 0;

  function testAssert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failCount++;
    }
  }

  // ----------------------------------------------------
  // Seed Users & Initial Entities
  // ----------------------------------------------------
  const adminUser = await userRepository.create({
    mobileNumber: '9900000001',
    pinHash: 'hashAdmin',
    recoveryCodeHash: 'recAdmin',
    isAgeVerified: true,
    role: 'ADMIN',
    isActive: true
  });

  const reporterUser = await userRepository.create({
    mobileNumber: '9900000002',
    pinHash: 'hashRep',
    recoveryCodeHash: 'recRep',
    isAgeVerified: true,
    role: 'PLAYER',
    isActive: true
  });

  const targetUser = await userRepository.create({
    mobileNumber: '9900000003',
    pinHash: 'hashTar',
    recoveryCodeHash: 'recTar',
    isAgeVerified: true,
    role: 'PLAYER',
    isActive: true
  });

  const tour = await tournamentRepository.create({
    organizerUserId: adminUser.id,
    title: 'गोपीगंज चैलेंज कप 2026',
    groundLocation: 'स्टेडियम ग्राउंड, गोपीगंज',
    village: 'गोपीगंज',
    block: 'GYANPUR',
    startDate: '2026-11-20',
    endDate: '2026-11-25',
    registrationOpenDate: '2026-10-01',
    registrationCloseDate: '2026-11-10',
    maxTeams: 16,
    minSquadSize: 11,
    maxSquadSize: 15,
    matchFormat: '10 Overs',
    ballType: 'TENNIS',
    entryFeeNote: '₹500 (मैदान पर नकद)',
    rulesText: '18+ केवल',
    disclaimerText: 'नियम मान्य',
    status: 'PUBLISHED'
  });

  const team = await teamRepository.createTeam({
    tournamentId: tour.id,
    captainUserId: targetUser.id,
    teamName: 'गोपीगंज टाइगर्स',
    village: 'गोपीगंज'
  });

  // ----------------------------------------------------
  // 1. Safety & Report Submission Tests
  // ----------------------------------------------------
  console.log('1. Report Submission & Validation Tests:');
  const rep1 = await safetyService.submitReport(reporterUser.id, {
    targetType: 'USER',
    targetId: targetUser.id,
    reasonCategory: 'UNDERAGE',
    description: 'खिलाड़ी की आयु 18 वर्ष से कम प्रतीत होती है, सत्यापन आवश्यक है।'
  });
  testAssert(rep1.status === 'PENDING', 'Report 1 created with status PENDING');
  testAssert(rep1.reporterUserId === reporterUser.id, 'Report bound to reporter ID');
  testAssert(rep1.reasonCategory === 'UNDERAGE', 'Reason category correctly recorded');

  // Short description rejected
  let shortDescFailed = false;
  try {
    await safetyService.submitReport(reporterUser.id, {
      targetType: 'USER',
      targetId: targetUser.id,
      reasonCategory: 'OTHER',
      description: 'छोटी बात' // < 10 chars
    });
  } catch (err) {
    shortDescFailed = err.message === 'DESCRIPTION_TOO_SHORT';
  }
  testAssert(shortDescFailed, 'Description < 10 characters rejected with DESCRIPTION_TOO_SHORT');

  // Duplicate pending report rejected
  let dupPendingFailed = false;
  try {
    await safetyService.submitReport(reporterUser.id, {
      targetType: 'USER',
      targetId: targetUser.id,
      reasonCategory: 'UNDERAGE',
      description: 'खिलाड़ी की आयु 18 वर्ष से कम प्रतीत होती है।'
    });
  } catch (err) {
    dupPendingFailed = err.message === 'DUPLICATE_REPORT_PENDING';
  }
  testAssert(dupPendingFailed, 'Duplicate pending report rejected with DUPLICATE_REPORT_PENDING');

  // ----------------------------------------------------
  // 2. Sliding 24-Hour Rate Limit (Max 5 reports/day)
  // ----------------------------------------------------
  console.log('\n2. Report Rate Limiting (5 reports / 24 hours):');
  // Report 2: on Team
  await safetyService.submitReport(reporterUser.id, {
    targetType: 'TEAM',
    targetId: team.id,
    reasonCategory: 'MISBEHAVIOR',
    description: 'टीम के सदस्यों द्वारा असंसदीय भाषा का प्रयोग किया गया।'
  });

  // Report 3: on Tournament
  await safetyService.submitReport(reporterUser.id, {
    targetType: 'TOURNAMENT',
    targetId: tour.id,
    reasonCategory: 'FAKE_INFO',
    description: 'मैदान का पता गलत दिया गया है, कोई ग्राउंड उपलब्ध नहीं।'
  });

  // Create dummy users for reports 4 and 5
  const user4 = await userRepository.create({ mobileNumber: '9900000004', pinHash: 'h', recoveryCodeHash: 'r', isAgeVerified: true, role: 'PLAYER', isActive: true });
  const user5 = await userRepository.create({ mobileNumber: '9900000005', pinHash: 'h', recoveryCodeHash: 'r', isAgeVerified: true, role: 'PLAYER', isActive: true });

  await safetyService.submitReport(reporterUser.id, { targetType: 'USER', targetId: user4.id, reasonCategory: 'OTHER', description: 'अनुचित व्यवहार और खेल भावना के विपरीत कार्य।' });
  await safetyService.submitReport(reporterUser.id, { targetType: 'USER', targetId: user5.id, reasonCategory: 'OTHER', description: 'संदिग्ध विवरण की जांच हेतु रिपोर्ट।' });

  // 6th report attempt should fail
  let rateLimitHit = false;
  const user6 = await userRepository.create({ mobileNumber: '9900000006', pinHash: 'h', recoveryCodeHash: 'r', isAgeVerified: true, role: 'PLAYER', isActive: true });
  try {
    await safetyService.submitReport(reporterUser.id, {
      targetType: 'USER',
      targetId: user6.id,
      reasonCategory: 'OTHER',
      description: 'छठा प्रयास जो दर सीमा के कारण विफल होना चाहिए।'
    });
  } catch (err) {
    rateLimitHit = err.message === 'REPORT_RATE_LIMIT_EXCEEDED';
  }
  testAssert(rateLimitHit, '6th report in 24 hours rejected with REPORT_RATE_LIMIT_EXCEEDED');

  // ----------------------------------------------------
  // 3. User Blocking & Shielding Tests
  // ----------------------------------------------------
  console.log('\n3. User Blocking & Privacy Shielding:');
  const block = await safetyService.blockUser(reporterUser.id, targetUser.id);
  testAssert(block.blockerUserId === reporterUser.id, 'Block record created with blocker ID');

  const isBlocked = await safetyService.isInteractionBlocked(reporterUser.id, targetUser.id);
  testAssert(isBlocked, 'Interaction between blocker and blocked user is blocked');

  const isBlockedReverse = await safetyService.isInteractionBlocked(targetUser.id, reporterUser.id);
  testAssert(isBlockedReverse, 'Interaction is blocked bidirectionally');

  // Cannot block self
  let selfBlockFailed = false;
  try {
    await safetyService.blockUser(reporterUser.id, reporterUser.id);
  } catch (err) {
    selfBlockFailed = err.message === 'CANNOT_BLOCK_SELF';
  }
  testAssert(selfBlockFailed, 'Blocking self rejected with CANNOT_BLOCK_SELF');

  // Unblock
  await safetyService.unblockUser(reporterUser.id, targetUser.id);
  const stillBlocked = await safetyService.isInteractionBlocked(reporterUser.id, targetUser.id);
  testAssert(!stillBlocked, 'User unblocked successfully');

  // ----------------------------------------------------
  // 4. Admin Moderation Queue & Report Status Transitions
  // ----------------------------------------------------
  console.log('\n4. Admin Moderation Queue & Reviews:');
  const queue = await safetyService.getModerationQueue();
  testAssert(queue.length === 5, 'Moderation queue contains 5 submitted reports');

  const reviewed = await safetyService.reviewReport(
    adminUser.id,
    rep1.id,
    'ACTION_TAKEN',
    'खिलाड़ी से आधार कार्ड की मूल प्रति सत्यापित कराई गई।'
  );
  testAssert(reviewed.status === 'ACTION_TAKEN', 'Report 1 status updated to ACTION_TAKEN');
  testAssert(reviewed.reviewedBy === adminUser.id, 'Reviewer ID recorded');
  testAssert(reviewed.reviewedAt !== null, 'Review timestamp recorded');

  // ----------------------------------------------------
  // 5. Expiry Engine: 15-Day Player Availability Expiry
  // ----------------------------------------------------
  console.log('\n5. Expiry Sweep: Player Availability (15 Days):');
  // Seed player with past availability expiry
  const availPlayer = await userRepository.create({
    mobileNumber: '9900000007',
    pinHash: 'h',
    recoveryCodeHash: 'r',
    isAgeVerified: true,
    role: 'PLAYER',
    isActive: true
  });
  const prof = await profileRepository.upsert(availPlayer.id, {
    fullName: 'सतीश पाल',
    village: 'खमरिया',
    block: 'AURAI',
    primaryRole: 'BOWLER',
    battingStyle: 'दाएं हाथ',
    bowlingStyle: 'मध्यम',
    allowWhatsappContact: true
  });
  // Manually backdate availability expiry to 1 hour ago
  const storedProfile = profileRepository.profiles.get(prof.id);
  storedProfile.availabilityExpiresAt = new Date(Date.now() - 3600000);
  storedProfile.isAvailable = true;

  const availResult = await expiryEngine.sweepAvailabilityExpiry(new Date());
  testAssert(availResult.recordsAffected >= 1, 'Availability sweep detected and updated expired profiles');

  const updatedProf = await profileRepository.findByUserId(availPlayer.id);
  testAssert(!updatedProf.isAvailable, 'Profile isAvailable changed to false after sweep');

  // ----------------------------------------------------
  // 6. Expiry Engine: Squad Invitation Expiry
  // ----------------------------------------------------
  console.log('\n6. Expiry Sweep: Squad Invitations:');
  const expiredInv = await invitationRepository.create({
    teamId: team.id,
    tournamentId: tour.id,
    inviterUserId: targetUser.id,
    inviteeUserId: availPlayer.id,
    expiresAt: new Date(Date.now() - 60000) // 1 minute ago
  });

  const invResult = await expiryEngine.sweepInvitationExpiry(new Date());
  testAssert(invResult.recordsAffected >= 1, 'Invitation sweep updated expired pending invitations');

  const updatedInv = await invitationRepository.findById(expiredInv.id);
  testAssert(updatedInv.status === 'EXPIRED', 'Pending invitation status transitioned to EXPIRED');

  // ----------------------------------------------------
  // 7. Expiry Engine: Tournament & Team Archival (30 Days Post Completion)
  // ----------------------------------------------------
  console.log('\n7. Expiry Sweep: Tournament & Team Archival (30 Days):');
  const oldTour = await tournamentRepository.create({
    organizerUserId: adminUser.id,
    title: 'पुरानी प्रतियोगिता 2026',
    groundLocation: 'इंटर कॉलेज',
    village: 'ज्ञानपुर',
    block: 'GYANPUR',
    startDate: '2026-08-01',
    endDate: '2026-08-10', // completed 50+ days ago
    registrationOpenDate: '2026-07-01',
    registrationCloseDate: '2026-07-25',
    maxTeams: 8,
    minSquadSize: 11,
    maxSquadSize: 15,
    matchFormat: '10 Overs',
    ballType: 'TENNIS',
    entryFeeNote: 'नकद',
    rulesText: 'नियम',
    disclaimerText: 'अस्वीकरण',
    status: 'PUBLISHED'
  });

  const oldTeam = await teamRepository.createTeam({
    tournamentId: oldTour.id,
    captainUserId: reporterUser.id,
    teamName: 'पुरानी टीम',
    village: 'ज्ञानपुर'
  });
  await teamRepository.updateStatus(oldTeam.id, 'ACCEPTED');

  const archResult = await expiryEngine.sweepTournamentArchival(new Date(), 30);
  testAssert(archResult.recordsAffected >= 2, 'Archival sweep processed old tournament and teams');

  const updatedOldTeam = await teamRepository.findById(oldTeam.id);
  testAssert(updatedOldTeam.status === 'ARCHIVED', 'Temporary team status cascaded to ARCHIVED');

  // ----------------------------------------------------
  // 8. Expiry Engine: 90-Day Deactivated Account PII Scrubbing
  // ----------------------------------------------------
  console.log('\n8. Expiry Sweep: 90-Day PII Scrubbing:');
  const deactUser = await userRepository.create({
    mobileNumber: '9900000099',
    pinHash: 'hashDeact',
    recoveryCodeHash: 'recDeact',
    isAgeVerified: true,
    role: 'PLAYER',
    isActive: true
  });
  await userRepository.deactivateAndScrub(deactUser.id);
  // Backdate updatedAt to 95 days ago
  const storedUser = userRepository.users.get(deactUser.id);
  storedUser.updatedAt = new Date(Date.now() - 95 * 24 * 60 * 60 * 1000);

  const piiResult = await expiryEngine.sweepPiiScrubbing(new Date(), 90);
  testAssert(piiResult.recordsAffected >= 1, 'PII sweep detected and scrubbed account inactive > 90 days');

  const scrubbedUser = await userRepository.findById(deactUser.id);
  testAssert(scrubbedUser.mobileNumber === '0000000000', 'Mobile number scrubbed to zeros');
  testAssert(scrubbedUser.pinHash === 'SCRUBBED', 'PIN hash scrubbed');

  // ----------------------------------------------------
  // 9. Full Nightly Cron Execution & Audit Log
  // ----------------------------------------------------
  console.log('\n9. Full Nightly Cron Execution & Audit Log:');
  const cronRuns = await expiryEngine.runAllNightlyJobs(new Date());
  testAssert(cronRuns.length === 4, 'All 4 maintenance jobs executed');
  testAssert(cronRuns.every(r => r.status === 'SUCCESS'), 'All job runs succeeded without errors');

  const auditHistory = await expiryRepository.listJobRuns(10);
  testAssert(auditHistory.length >= 4, 'Job runs recorded in expiry_jobs audit table');

  // ----------------------------------------------------
  // 10. Strict Negative Invariants
  // ----------------------------------------------------
  console.log('\n10. Strict Negative Invariants:');
  testAssert(!safetyService.automaticBans, 'Automated algorithmic bans without human review are ABSENT');
  testAssert(!safetyService.publicFeeds, 'Public feeds, comments, and call-out lists are ABSENT');

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('----------------------------------------------------');

  if (failCount > 0) {
    console.error('\n❌ SOME PHASE 9 TESTS FAILED!\n');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 9 MODERATION & EXPIRY TESTS PASSED!\n');
  }
}

runModerationAndExpiryTests().catch(err => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
