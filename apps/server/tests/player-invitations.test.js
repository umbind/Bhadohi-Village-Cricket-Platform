/**
 * Phase 7 Comprehensive Player Invitations Automated Test Suite
 * Tests player scouting, filtered searches, zero-mobile privacy masking,
 * captain invitations, expiry calculations, mutual acceptance, WhatsApp contact reveal,
 * and roster inclusion.
 */

const assert = require('assert');

const { InvitationService } = require('../dist/modules/invitation/invitation.service.js');
const { TournamentService } = require('../dist/modules/tournament/tournament.service.js');
const { TeamService } = require('../dist/modules/team/team.service.js');
const { invitationRepository } = require('../dist/repositories/invitation.repository.js');
const { tournamentRepository } = require('../dist/repositories/tournament.repository.js');
const { teamRepository } = require('../dist/repositories/team.repository.js');
const { userRepository } = require('../dist/repositories/user.repository.js');
const { profileRepository } = require('../dist/repositories/profile.repository.js');
const { notificationRepository } = require('../dist/repositories/notification.repository.js');

const invitationService = new InvitationService();
const tournamentService = new TournamentService();
const teamService = new TeamService();

async function runPlayerInvitationTests() {
  console.log('====================================================');
  console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 7 TEST SUITE');
  console.log('====================================================\n');

  invitationRepository.clear();
  tournamentRepository.clear();
  teamRepository.clear();
  userRepository.clear();
  profileRepository.clear();
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

  // ----------------------------------------------------
  // Test Setup: Seed Users & Profiles across Bhadohi
  // ----------------------------------------------------
  // 1. Organizer
  const orgUser = await userRepository.create({
    mobileNumber: '9876500001',
    pinHash: 'hash1',
    recoveryCodeHash: 'rec1',
    isAgeVerified: true,
    role: 'ORGANIZER',
    isActive: true
  });

  // 2. Captain
  const capUser = await userRepository.create({
    mobileNumber: '9876500002',
    pinHash: 'hash2',
    recoveryCodeHash: 'rec2',
    isAgeVerified: true,
    role: 'PLAYER',
    isActive: true
  });
  await profileRepository.upsert(capUser.id, {
    fullName: 'राहुल सिंह',
    village: 'खमरिया',
    block: 'AURAI',
    primaryRole: 'ALL_ROUNDER',
    battingStyle: 'दाएं हाथ',
    bowlingStyle: 'मध्यम तेज',
    allowWhatsappContact: true
  });

  // 3. Player A (Available Batsman in Gyanpur)
  const playerA = await userRepository.create({
    mobileNumber: '9876500003',
    pinHash: 'hash3',
    recoveryCodeHash: 'rec3',
    isAgeVerified: true,
    role: 'PLAYER',
    isActive: true
  });
  const profA = await profileRepository.upsert(playerA.id, {
    fullName: 'अमित कुमार',
    village: 'गोपीगंज',
    block: 'GYANPUR',
    primaryRole: 'BATSMAN',
    battingStyle: 'दाएं हाथ',
    bowlingStyle: 'ऑफ स्पिन',
    allowWhatsappContact: true
  });

  // 4. Player B (Available Bowler in Aurai)
  const playerB = await userRepository.create({
    mobileNumber: '9876500004',
    pinHash: 'hash4',
    recoveryCodeHash: 'rec4',
    isAgeVerified: true,
    role: 'PLAYER',
    isActive: true
  });
  const profB = await profileRepository.upsert(playerB.id, {
    fullName: 'संदीप यादव',
    village: 'औराई खास',
    block: 'AURAI',
    primaryRole: 'BOWLER',
    battingStyle: 'बाएं हाथ',
    bowlingStyle: 'तेज',
    allowWhatsappContact: true
  });

  // 5. Player C (Unavailable / Expired)
  const playerC = await userRepository.create({
    mobileNumber: '9876500005',
    pinHash: 'hash5',
    recoveryCodeHash: 'rec5',
    isAgeVerified: true,
    role: 'PLAYER',
    isActive: true
  });
  await profileRepository.upsert(playerC.id, {
    fullName: 'विकास बिंद',
    village: 'जंगीगंज',
    block: 'DEEGH',
    primaryRole: 'ALL_ROUNDER',
    battingStyle: 'दाएं हाथ',
    bowlingStyle: 'मध्यम तेज',
    allowWhatsappContact: false
  });
  await profileRepository.updateAvailability(playerC.id, false);

  // ----------------------------------------------------
  // Test 1: Player Scouting & Privacy Masking
  // ----------------------------------------------------
  console.log('1. Player Scouting & Search Filters:');
  const allScouted = await invitationService.scoutPlayers({ availableOnly: true });
  testAssert(allScouted.length === 3, 'Scout query returns 3 available players (captain, A, B)');
  testAssert(!allScouted.some(p => p.id === playerC.id), 'Unavailable player C is excluded from scouting');

  const auraiPlayers = await invitationService.scoutPlayers({ block: 'AURAI' });
  testAssert(auraiPlayers.every(p => p.block === 'AURAI'), 'Block filter returns only Aurai players');

  const bowlers = await invitationService.scoutPlayers({ role: 'BOWLER' });
  testAssert(bowlers.length === 1 && bowlers[0].fullName === 'संदीप यादव', 'Role filter returns only Sandeep Yadav (Bowler)');

  // Critical Privacy Invariant
  testAssert(!allScouted.some(p => p.mobileNumber || p.mobile_number), 'CRITICAL: Mobile numbers are strictly absent from scouting results');
  testAssert(!allScouted.some(p => p.strike_rate || p.bowling_average || p.mvp_award), 'CRITICAL: Career stats & vanity metrics are strictly absent');

  // ----------------------------------------------------
  // Test 2: Captain Sending Squad Invitations
  // ----------------------------------------------------
  console.log('\n2. Captain Sending Squad Invitations:');
  const tour = await tournamentService.createTournament(orgUser.id, {
    title: 'भदोही ग्रामीण शील्ड 2026',
    groundLocation: 'स्टेडियम ग्राउंड, ज्ञानपुर',
    village: 'ज्ञानपुर',
    block: 'GYANPUR',
    startDate: '2026-11-20',
    endDate: '2026-11-25',
    registrationOpenDate: '2026-10-01',
    registrationCloseDate: '2026-11-15',
    maxTeams: 16,
    minSquadSize: 11,
    maxSquadSize: 15,
    matchFormat: '10 Overs',
    ballType: 'TENNIS',
    entryFeeNote: '₹500 प्रति टीम (मैदान पर नकद)',
    rulesText: '18+ केवल',
    disclaimerText: 'नियम मान्य',
    status: 'DRAFT'
  });
  await tournamentService.publishTournament(orgUser.id, tour.id);

  const team = await teamService.createTeam(capUser.id, tour.id, {
    teamName: 'खमरिया पैंथर्स',
    village: 'खमरिया'
  });

  // Send invitation to Player A
  const invA = await invitationService.sendInvitation(capUser.id, team.id, playerA.id);
  testAssert(invA.status === 'PENDING', 'Invitation created with status PENDING');
  testAssert(invA.teamId === team.id, 'Invitation bound to correct team');
  testAssert(invA.inviteeUserId === playerA.id, 'Invitation bound to Player A');

  // Check 5-day / regClose expiry calculation
  const fiveDaysMax = Date.now() + 5 * 24 * 60 * 60 * 1000 + 1000;
  testAssert(invA.expiresAt.getTime() <= fiveDaysMax, 'Invitation expires within 5 days');

  // Verify In-App Notification dispatched to Player A
  const notifsA = await notificationRepository.findByUserId(playerA.id);
  testAssert(notifsA.length === 1, 'Player A received in-app notification');
  testAssert(notifsA[0].type === 'INVITE_RECEIVED', 'Notification type is INVITE_RECEIVED');
  testAssert(notifsA[0].message.includes('खमरिया पैंथर्स'), 'Notification message mentions team name');

  // Non-captain cannot send invitations
  let nonCapFailed = false;
  try {
    await invitationService.sendInvitation(playerB.id, team.id, playerA.id);
  } catch (err) {
    nonCapFailed = err.message === 'FORBIDDEN_NOT_CAPTAIN';
  }
  testAssert(nonCapFailed, 'Non-captain sending invitation rejected with FORBIDDEN_NOT_CAPTAIN');

  // Captain cannot invite himself
  let selfInviteFailed = false;
  try {
    await invitationService.sendInvitation(capUser.id, team.id, capUser.id);
  } catch (err) {
    selfInviteFailed = err.message === 'CANNOT_INVITE_SELF';
  }
  testAssert(selfInviteFailed, 'Captain inviting himself rejected with CANNOT_INVITE_SELF');

  // Cannot invite unavailable player C
  let unavailFailed = false;
  try {
    await invitationService.sendInvitation(capUser.id, team.id, playerC.id);
  } catch (err) {
    unavailFailed = err.message === 'PLAYER_NOT_AVAILABLE';
  }
  testAssert(unavailFailed, 'Inviting unavailable player rejected with PLAYER_NOT_AVAILABLE');

  // Duplicate invitation rejected
  let dupFailed = false;
  try {
    await invitationService.sendInvitation(capUser.id, team.id, playerA.id);
  } catch (err) {
    dupFailed = err.message === 'DUPLICATE_INVITATION';
  }
  testAssert(dupFailed, 'Duplicate invitation rejected with DUPLICATE_INVITATION');

  // ----------------------------------------------------
  // Test 3: Captain Cancellation of Pending Invitation
  // ----------------------------------------------------
  console.log('\n3. Captain Cancellation of Pending Invitation:');
  const invB = await invitationService.sendInvitation(capUser.id, team.id, playerB.id);
  testAssert(invB.status === 'PENDING', 'Invitation to Player B created');

  const cancelledB = await invitationService.cancelInvitation(capUser.id, invB.id);
  testAssert(cancelledB.status === 'CANCELLED', 'Invitation to Player B transitioned to CANCELLED');

  // ----------------------------------------------------
  // Test 4: Accepting Invitation & WhatsApp Contact Exchange
  // ----------------------------------------------------
  console.log('\n4. Player Responding to Invitation (ACCEPT):');
  // Re-invite Player B
  const freshInvB = await invitationService.sendInvitation(capUser.id, team.id, playerB.id);

  // Non-invitee cannot respond
  let forbiddenRespond = false;
  try {
    await invitationService.respondToInvitation(playerA.id, freshInvB.id, 'ACCEPT');
  } catch (err) {
    forbiddenRespond = err.message === 'FORBIDDEN_NOT_INVITED_PLAYER';
  }
  testAssert(forbiddenRespond, 'Non-invitee response rejected with FORBIDDEN_NOT_INVITED_PLAYER');

  // Player B accepts
  const acceptResult = await invitationService.respondToInvitation(playerB.id, freshInvB.id, 'ACCEPT');
  testAssert(acceptResult.invitation.status === 'ACCEPTED', 'Invitation status updated to ACCEPTED');

  // Verify Player B added to team squad roster
  const squad = await teamRepository.getMembers(team.id);
  testAssert(squad.some(m => m.playerUserId === playerB.id && m.status === 'CONFIRMED'), 'Player B automatically added to squad roster');

  // Verify Captain received notification
  const capNotifs = await notificationRepository.findByUserId(capUser.id);
  testAssert(capNotifs.some(n => n.type === 'INVITE_ACCEPTED'), 'Captain received INVITE_ACCEPTED notification');

  // Verify mutual WhatsApp link is revealed only upon acceptance
  testAssert(acceptResult.whatsappLink && acceptResult.whatsappLink.includes('wa.me/919876500002'), 'Mutual WhatsApp redirect link generated with captain mobile');

  // Cannot respond again to already accepted invitation
  let alreadyResponded = false;
  try {
    await invitationService.respondToInvitation(playerB.id, freshInvB.id, 'ACCEPT');
  } catch (err) {
    alreadyResponded = err.message === 'INVITATION_ALREADY_RESPONDED';
  }
  testAssert(alreadyResponded, 'Double response rejected with INVITATION_ALREADY_RESPONDED');

  // Cannot invite player who is already in squad
  let alreadyInSquad = false;
  try {
    await invitationService.sendInvitation(capUser.id, team.id, playerB.id);
  } catch (err) {
    alreadyInSquad = err.message === 'PLAYER_ALREADY_IN_TEAM';
  }
  testAssert(alreadyInSquad, 'Inviting confirmed squad member rejected with PLAYER_ALREADY_IN_TEAM');

  // ----------------------------------------------------
  // Test 5: Declining Invitation
  // ----------------------------------------------------
  console.log('\n5. Player Responding to Invitation (DECLINE):');
  // Player A declines their pending invitation
  const declineResult = await invitationService.respondToInvitation(playerA.id, invA.id, 'DECLINE');
  testAssert(declineResult.invitation.status === 'DECLINED', 'Invitation status updated to DECLINED');

  const currentSquad = await teamRepository.getMembers(team.id);
  testAssert(!currentSquad.some(m => m.playerUserId === playerA.id), 'Declining player is NOT added to squad');

  const capNotifsAfterDecline = await notificationRepository.findByUserId(capUser.id);
  testAssert(capNotifsAfterDecline.some(n => n.type === 'INVITE_DECLINED'), 'Captain received INVITE_DECLINED notification');
  testAssert(!declineResult.whatsappLink, 'No WhatsApp contact link is generated on decline');

  // ----------------------------------------------------
  // Test 6: Invitation Expiration Guards
  // ----------------------------------------------------
  console.log('\n6. Invitation Expiry Guards:');
  // Create an already-expired invitation
  const expiredInv = await invitationRepository.create({
    teamId: team.id,
    tournamentId: tour.id,
    inviterUserId: capUser.id,
    inviteeUserId: playerA.id,
    expiresAt: new Date(Date.now() - 10000) // 10 seconds ago
  });

  let expiredFailed = false;
  try {
    await invitationService.respondToInvitation(playerA.id, expiredInv.id, 'ACCEPT');
  } catch (err) {
    expiredFailed = err.message === 'INVITATION_EXPIRED';
  }
  testAssert(expiredFailed, 'Responding to expired invitation rejected with INVITATION_EXPIRED');

  const checkedInv = await invitationRepository.findById(expiredInv.id);
  testAssert(checkedInv.status === 'EXPIRED', 'Expired invitation status marked EXPIRED');

  // ----------------------------------------------------
  // Test 7: Received & Sent Listing Endpoints
  // ----------------------------------------------------
  console.log('\n7. Invitation Query & Inbox Enriched Views:');
  const receivedA = await invitationService.getReceivedInvitations(playerA.id);
  testAssert(receivedA.length >= 2, 'Player A can view all received invitations');
  testAssert(receivedA[0].teamName === 'खमरिया पैंथर्स', 'Received invitation includes populated team name');
  testAssert(receivedA[0].tournamentTitle === 'भदोही ग्रामीण शील्ड 2026', 'Received invitation includes tournament title');

  const sentByTeam = await invitationService.getSentInvitations(capUser.id, team.id);
  testAssert(sentByTeam.length >= 2, 'Captain can view all invitations sent for team');
  testAssert(sentByTeam[0].inviteeName !== '', 'Sent invitation includes invitee full name');

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('----------------------------------------------------');

  if (failCount > 0) {
    console.error('\n❌ SOME PHASE 7 TESTS FAILED!\n');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 7 PLAYER INVITATION TESTS PASSED!\n');
  }
}

runPlayerInvitationTests().catch(err => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
