/**
 * Phase 6 Comprehensive Tournaments & Teams Automated Test Suite
 * Tests tournament creation, publishing, WhatsApp share payload, temporary teams,
 * squad capacity, application lifecycle, withdrawals, reviews, and cancellation cascade.
 */

const assert = require('assert');

const { TournamentService } = require('../dist/modules/tournament/tournament.service.js');
const { TeamService } = require('../dist/modules/team/team.service.js');
const { tournamentRepository } = require('../dist/repositories/tournament.repository.js');
const { teamRepository } = require('../dist/repositories/team.repository.js');
const { applicationRepository } = require('../dist/repositories/application.repository.js');
const { notificationRepository } = require('../dist/repositories/notification.repository.js');

const tournamentService = new TournamentService();
const teamService = new TeamService();

async function runTournamentAndTeamTests() {
  console.log('====================================================');
  console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 6 TEST SUITE');
  console.log('====================================================\n');

  tournamentRepository.clear();
  teamRepository.clear();
  applicationRepository.clear();
  notificationRepository.clear();

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

  const organizerId = 'org-user-001';
  const otherUserId = 'other-user-002';
  const captainId = 'cap-user-003';
  const player1Id = 'play-user-004';
  const player2Id = 'play-user-005';

  // ----------------------------------------------------
  // Test 1: Tournament Creation & Date Validations
  // ----------------------------------------------------
  console.log('1. Tournament Creation & Guard Validations:');
  const draftTour = await tournamentService.createTournament(organizerId, {
    title: 'औराई प्रीमियर कप 2026',
    groundLocation: 'इंटर कॉलेज ग्राउंड, औराई',
    village: 'औराई खास',
    block: 'AURAI',
    startDate: '2026-11-10',
    endDate: '2026-11-15',
    registrationOpenDate: '2026-10-05',
    registrationCloseDate: '2026-11-05',
    maxTeams: 16,
    minSquadSize: 11,
    maxSquadSize: 15,
    matchFormat: '12 Overs',
    ballType: 'TENNIS',
    entryFeeNote: '₹600 प्रति टीम (मैदान पर नकद)',
    rulesText: '18+ अनिवार्य। आधार कार्ड लाना होगा।',
    disclaimerText: 'मैच संचालन व अंपायरिंग का दायित्व आयोजकों का है।',
    status: 'DRAFT'
  });

  testAssert(draftTour.id !== undefined, 'Draft tournament created successfully');
  testAssert(draftTour.status === 'DRAFT', 'Initial status is DRAFT');
  testAssert(draftTour.block === 'AURAI', 'Bound to Bhadohi block AURAI');

  // Negative validation: start date after end date
  await assert.rejects(
    () => tournamentService.createTournament(organizerId, {
      ...draftTour,
      startDate: '2026-11-20',
      endDate: '2026-11-15'
    }),
    /INVALID_TOURNAMENT_DATES/,
    'Invalid tournament date order rejected'
  );
  testAssert(true, 'Invalid tournament date order rejected with INVALID_TOURNAMENT_DATES');

  // Negative validation: non-Bhadohi block
  await assert.rejects(
    () => tournamentService.createTournament(organizerId, {
      ...draftTour,
      block: 'LUCKNOW'
    }),
    /INVALID_BHADOHI_BLOCK/,
    'Non-Bhadohi block rejected'
  );
  testAssert(true, 'Non-Bhadohi block rejected with INVALID_BHADOHI_BLOCK');

  // ----------------------------------------------------
  // Test 2: Tournament Publishing & WhatsApp Share Text
  // ----------------------------------------------------
  console.log('\n2. Tournament Publishing & WhatsApp Share Text:');
  // Non-organizer attempt to publish
  await assert.rejects(
    () => tournamentService.publishTournament(otherUserId, draftTour.id),
    /FORBIDDEN_NOT_ORGANIZER/,
    'Non-organizer cannot publish'
  );
  testAssert(true, 'Non-organizer publish rejected with FORBIDDEN_NOT_ORGANIZER');

  const publishedTour = await tournamentService.publishTournament(organizerId, draftTour.id);
  testAssert(publishedTour.status === 'PUBLISHED', 'Tournament status transitioned to PUBLISHED');

  const shareText = tournamentService.generateWhatsAppShareText(publishedTour);
  testAssert(shareText.includes('औराई प्रीमियर कप 2026'), 'WhatsApp share text includes title');
  testAssert(shareText.includes('AURAI ब्लॉक, भदोही'), 'WhatsApp share text includes Bhadohi block');
  testAssert(shareText.includes('कोई ऑनलाइन भुगतान नहीं'), 'WhatsApp share text includes zero-online-payment disclaimer');

  // ----------------------------------------------------
  // Test 3: Temporary Team Formation & Roster
  // ----------------------------------------------------
  console.log('\n3. Temporary Team Formation & Squad Management:');
  const team = await teamService.createTeam(captainId, publishedTour.id, {
    teamName: 'ज्ञानपुर वॉरियर्स',
    village: 'ज्ञानपुर'
  });
  testAssert(team.id !== undefined, 'Temporary team created for tournament');
  testAssert(team.status === 'FORMING', 'Initial team status is FORMING');

  const details = await teamService.getTeamDetails(team.id);
  testAssert(details.members.length === 1, 'Captain automatically placed in squad');
  testAssert(details.members[0].memberRole === 'CAPTAIN', 'Creator assigned role CAPTAIN');

  // Duplicate team name in same tournament
  await assert.rejects(
    () => teamService.createTeam(otherUserId, publishedTour.id, {
      teamName: 'ज्ञानपुर वॉरियर्स',
      village: 'गोपीगंज'
    }),
    /DUPLICATE_TEAM_NAME_FOR_TOURNAMENT/,
    'Duplicate team name rejected'
  );
  testAssert(true, 'Duplicate team name in same tournament rejected');

  // Add players
  const mem1 = await teamService.addPlayerToTeam(captainId, team.id, player1Id);
  testAssert(mem1.playerUserId === player1Id, 'Player 1 added to squad');

  // Non-captain cannot add members
  await assert.rejects(
    () => teamService.addPlayerToTeam(otherUserId, team.id, player2Id),
    /FORBIDDEN_NOT_CAPTAIN/,
    'Non-captain cannot add players'
  );
  testAssert(true, 'Non-captain roster edits rejected with FORBIDDEN_NOT_CAPTAIN');

  // ----------------------------------------------------
  // Test 4: Team Application & Withdrawal Workflow
  // ----------------------------------------------------
  console.log('\n4. Team Application & Withdrawal Workflow:');
  const app = await teamService.submitApplication(captainId, publishedTour.id, team.id);
  testAssert(app.status === 'PENDING', 'Application status is PENDING');

  const teamAfterApp = await teamRepository.findById(team.id);
  testAssert(teamAfterApp.status === 'APPLIED', 'Team status transitioned to APPLIED');

  // Duplicate application
  await assert.rejects(
    () => teamService.submitApplication(captainId, publishedTour.id, team.id),
    /DUPLICATE_APPLICATION/,
    'Duplicate application rejected'
  );
  testAssert(true, 'Duplicate application rejected with DUPLICATE_APPLICATION');

  // Captain withdraws application
  const withdrawnApp = await teamService.withdrawApplication(captainId, app.id);
  testAssert(withdrawnApp.status === 'WITHDRAWN', 'Application status marked WITHDRAWN');
  const teamAfterWithdraw = await teamRepository.findById(team.id);
  testAssert(teamAfterWithdraw.status === 'FORMING', 'Team status returned to FORMING');

  // ----------------------------------------------------
  // Test 5: Organizer Review & Notification Emission
  // ----------------------------------------------------
  console.log('\n5. Organizer Review & Notification Dispatch:');
  // Re-submit application
  const newApp = await teamService.submitApplication(captainId, publishedTour.id, team.id);

  // Non-organizer attempt to review
  await assert.rejects(
    () => teamService.reviewApplication(otherUserId, newApp.id, 'ACCEPTED'),
    /FORBIDDEN_NOT_ORGANIZER/,
    'Non-organizer cannot review applications'
  );
  testAssert(true, 'Non-organizer review rejected with FORBIDDEN_NOT_ORGANIZER');

  // Organizer accepts application
  const reviewedApp = await teamService.reviewApplication(organizerId, newApp.id, 'ACCEPTED');
  testAssert(reviewedApp.status === 'ACCEPTED', 'Application status marked ACCEPTED');

  const teamAccepted = await teamRepository.findById(team.id);
  testAssert(teamAccepted.status === 'ACCEPTED', 'Team status transitioned to ACCEPTED');

  // Check notification emitted to captain
  const captainNotifs = await notificationRepository.findByUserId(captainId);
  testAssert(captainNotifs.length > 0, 'Captain received in-app notification');
  testAssert(captainNotifs[0].type === 'APPLICATION_ACCEPTED', 'Notification type is APPLICATION_ACCEPTED');

  // ----------------------------------------------------
  // Test 6: Tournament Cancellation Reason Cascade
  // ----------------------------------------------------
  console.log('\n6. Tournament Cancellation & Cascade Notifications:');
  // Rejection of short reason (< 10 chars)
  await assert.rejects(
    () => tournamentService.cancelTournament(organizerId, publishedTour.id, 'बारिश'),
    /CANCELLATION_REASON_TOO_SHORT/,
    'Short cancellation reason rejected'
  );
  testAssert(true, 'Cancellation reason < 10 chars rejected');

  // Cancel with valid reason
  const cancelledTour = await tournamentService.cancelTournament(
    organizerId,
    publishedTour.id,
    'लगातार भारी बारिश के कारण मैदान जलमग्न है।'
  );
  testAssert(cancelledTour.status === 'CANCELLED', 'Tournament status is CANCELLED');
  testAssert(cancelledTour.cancellationReason.includes('भारी बारिश'), 'Cancellation reason recorded');

  // Captain receives tournament cancelled notification
  const captainNotifsAfterCancel = await notificationRepository.findByUserId(captainId);
  const cancelNotif = captainNotifsAfterCancel.find(n => n.type === 'TOURNAMENT_CANCELLED');
  testAssert(cancelNotif !== undefined, 'Captain notified of tournament cancellation');
  testAssert(cancelNotif.message.includes('भारी बारिश'), 'Notification contains cancellation reason');

  // New applications cannot be submitted to cancelled tournament
  await assert.rejects(
    () => teamService.createTeam(captainId, publishedTour.id, { teamName: 'दूसरी टीम', village: 'औराई' }),
    /TOURNAMENT_NOT_ACCEPTING_TEAMS/,
    'Cannot form team for cancelled tournament'
  );
  testAssert(true, 'New teams blocked for cancelled tournament');

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('----------------------------------------------------');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 6 TOURNAMENT & TEAM TESTS PASSED!\n');
    process.exit(0);
  }
}

runTournamentAndTeamTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
