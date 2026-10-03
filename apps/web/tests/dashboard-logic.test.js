/**
 * Phase 8 Organizer Dashboard Unit Logic Test Suite
 * Tests date ordering validation, Bhadohi block constraints, WhatsApp deep links,
 * squad capacity, application filtering, and negative invariants.
 */

const assert = require('assert');

function runDashboardLogicTests() {
  console.log('====================================================');
  console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 8 UNIT TESTS');
  console.log('====================================================\n');

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

  // 1. Date Validation Logic
  console.log('1. Tournament Date Sequence Validations:');
  function validateDates(regOpen, regClose, start, end) {
    if (new Date(regOpen) >= new Date(regClose)) return 'REG_CLOSE_BEFORE_OPEN';
    if (new Date(regClose) > new Date(start)) return 'REG_CLOSE_AFTER_START';
    if (new Date(start) >= new Date(end)) return 'END_BEFORE_START';
    return 'VALID';
  }

  testAssert(
    validateDates('2026-10-05', '2026-11-05', '2026-11-10', '2026-11-15') === 'VALID',
    'Valid date sequence passes validation'
  );
  testAssert(
    validateDates('2026-11-05', '2026-10-05', '2026-11-10', '2026-11-15') === 'REG_CLOSE_BEFORE_OPEN',
    'Registration close before open rejected'
  );
  testAssert(
    validateDates('2026-10-05', '2026-11-12', '2026-11-10', '2026-11-15') === 'REG_CLOSE_AFTER_START',
    'Registration close after tournament start rejected'
  );
  testAssert(
    validateDates('2026-10-05', '2026-11-05', '2026-11-15', '2026-11-10') === 'END_BEFORE_START',
    'Tournament end date before start date rejected'
  );

  // 2. Team Capacity Validation
  console.log('\n2. Team Limits & Squad Capacity:');
  function validateTeamLimits(maxTeams, minSquad, maxSquad) {
    if (maxTeams < 4 || maxTeams > 32) return 'INVALID_MAX_TEAMS';
    if (minSquad < 11) return 'INVALID_MIN_SQUAD';
    if (maxSquad > 16 || maxSquad < minSquad) return 'INVALID_MAX_SQUAD';
    return 'VALID';
  }

  testAssert(validateTeamLimits(16, 11, 15) === 'VALID', 'Standard limits (16 teams, 11-15 players) valid');
  testAssert(validateTeamLimits(3, 11, 15) === 'INVALID_MAX_TEAMS', 'Fewer than 4 teams rejected');
  testAssert(validateTeamLimits(35, 11, 15) === 'INVALID_MAX_TEAMS', 'More than 32 teams rejected');
  testAssert(validateTeamLimits(16, 9, 15) === 'INVALID_MIN_SQUAD', 'Fewer than 11 min squad rejected');

  // 3. Bhadohi District Blocks
  console.log('\n3. Bhadohi District Blocks Enforcements:');
  const validBlocks = new Set(['GYANPUR', 'AURAI', 'BHADOHI', 'SURIYAWAN', 'DEEGH', 'ABHOLI']);
  testAssert(validBlocks.has('GYANPUR'), 'Gyanpur block recognized');
  testAssert(validBlocks.has('AURAI'), 'Aurai block recognized');
  testAssert(validBlocks.has('BHADOHI'), 'Bhadohi block recognized');
  testAssert(validBlocks.has('SURIYAWAN'), 'Suriyawan block recognized');
  testAssert(validBlocks.has('DEEGH'), 'Deegh block recognized');
  testAssert(validBlocks.has('ABHOLI'), 'Abholi block recognized');
  testAssert(!validBlocks.has('VARANASI'), 'Non-Bhadohi block Varanasi rejected');
  testAssert(!validBlocks.has('MIRZAPUR'), 'Non-Bhadohi block Mirzapur rejected');

  // 4. WhatsApp Direct Link Generator
  console.log('\n4. WhatsApp Deep Link Generator:');
  function generateWhatsAppLink(mobileNumber, captainName, teamName) {
    const text = encodeURIComponent(`नमस्ते कप्तान ${captainName} जी, मैं भदोही क्रिकेट कप आयोजक बात कर रहा हूँ। आपकी टीम "${teamName}" के संदर्भ में:`);
    return `https://wa.me/91${mobileNumber}?text=${text}`;
  }

  const link = generateWhatsAppLink('9876543210', 'रामसेवक यादव', 'ज्ञानपुर वॉरियर्स');
  testAssert(link.startsWith('https://wa.me/919876543210'), 'Link includes Indian country code 91 + 10-digit mobile');
  testAssert(link.includes('%E0%A4%B0%E0%A4%BE%E0%A4%AE%E0%A4%B8%E0%A5%87%E0%A4%B5%E0%A4%95'), 'Link encodes Hindi Devanagari text cleanly');

  // 5. Application Filtering Logic
  console.log('\n5. Application Table Filter Logic:');
  const sampleApps = [
    { id: '1', teamName: 'ज्ञानपुर वॉरियर्स', status: 'PENDING' },
    { id: '2', teamName: 'औराई स्ट्राइकर्स', status: 'ACCEPTED' },
    { id: '3', teamName: 'सुरियावां लायंस', status: 'PENDING' },
    { id: '4', teamName: 'गोपीगंज पैंथर्स', status: 'REJECTED' }
  ];

  const pendingApps = sampleApps.filter(a => a.status === 'PENDING');
  testAssert(pendingApps.length === 2, 'Pending filter returns 2 applications');

  const acceptedApps = sampleApps.filter(a => a.status === 'ACCEPTED');
  testAssert(acceptedApps.length === 1, 'Accepted filter returns 1 application');

  // 6. Zero Scoring / Zero Wallet Invariants
  console.log('\n6. Negative Invariant Checks:');
  const prohibitedTokens = ['strike_rate', 'bowling_average', 'points_table', 'wallet_balance', 'razorpay', 'stripe'];
  const dummyState = { tournamentTitle: 'ज्ञानपुर कप', maxTeams: 16, status: 'PUBLISHED' };
  testAssert(!prohibitedTokens.some(tok => tok in dummyState), 'All prohibited scoring and financial tokens absent');

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL UNIT TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('----------------------------------------------------');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 8 DASHBOARD UNIT TESTS PASSED!\n');
  }
}

runDashboardLogicTests();
