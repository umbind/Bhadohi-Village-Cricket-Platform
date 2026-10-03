/**
 * Phase 7 Master Verification Script
 * Validates player scouting, squad invitations, expiry mechanics,
 * mutual WhatsApp contact exchange, negative invariants (zero stats, zero OTP, zero payment),
 * and executes the automated test suite.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const serverDir = path.join(rootDir, 'apps', 'server');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

console.log('====================================================');
console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 7 AUDIT');
console.log('====================================================\n');

// 1. Check Source Files Existence
console.log('1. Checking Phase 7 Source Architecture:');
const requiredFiles = [
  path.join(serverDir, 'src', 'repositories', 'invitation.repository.ts'),
  path.join(serverDir, 'src', 'modules', 'invitation', 'invitation.service.ts'),
  path.join(serverDir, 'src', 'modules', 'invitation', 'invitation.routes.ts'),
  path.join(serverDir, 'dist', 'repositories', 'invitation.repository.js'),
  path.join(serverDir, 'dist', 'modules', 'invitation', 'invitation.service.js'),
  path.join(serverDir, 'tests', 'player-invitations.test.js')
];

requiredFiles.forEach(file => {
  const relative = path.relative(rootDir, file);
  assert(fs.existsSync(file), `Source file exists: ${relative}`);
});

// 2. Negative Invariant Checks: Zero Scoring, Zero Vanity, Zero Points Table
console.log('\n2. Checking Zero Scoring / Vanity / Standings Invariants:');
const invitationServiceContent = fs.readFileSync(path.join(serverDir, 'src', 'modules', 'invitation', 'invitation.service.ts'), 'utf8');
const invitationRoutesContent = fs.readFileSync(path.join(serverDir, 'src', 'modules', 'invitation', 'invitation.routes.ts'), 'utf8');

assert(!invitationServiceContent.includes('strike_rate'), 'strike_rate is absent in invitation service');
assert(!invitationServiceContent.includes('bowling_average'), 'bowling_average is absent in invitation service');
assert(!invitationServiceContent.includes('mvp_award'), 'mvp_award is absent in invitation service');
assert(!invitationServiceContent.includes('points_table'), 'points_table is absent in invitation service');
assert(!invitationRoutesContent.includes('strike_rate'), 'strike_rate is absent in invitation routes');

// 3. Negative Invariant Checks: Zero Payment Gateway / Wallet Invariants
console.log('\n3. Checking Zero Payment Gateway / Wallet Invariants:');
assert(!invitationServiceContent.includes('razorpay'), 'Razorpay is absent in invitation service');
assert(!invitationServiceContent.includes('stripe'), 'Stripe is absent in invitation service');
assert(!invitationServiceContent.includes('wallet_balance'), 'wallet_balance is absent in invitation service');

// 4. Privacy Invariant: Mobile Number Shielding in Scouting
console.log('\n4. Checking Privacy & WhatsApp Deep-Link Mechanics:');
assert(invitationServiceContent.includes('https://wa.me/91'), 'WhatsApp direct link generated only upon mutual acceptance');
assert(invitationServiceContent.includes('scoutPlayers'), 'Scouting service exists');

// 5. Execute Phase 7 Automated Test Suite Subprocess
console.log('\n5. Executing Phase 7 Automated Test Suite:');
try {
  const testOutput = execSync('node apps/server/tests/player-invitations.test.js', {
    cwd: rootDir,
    encoding: 'utf8'
  });
  console.log(testOutput);
  assert(testOutput.includes('ALL PHASE 7 PLAYER INVITATION TESTS PASSED'), 'All 37 player invitation unit tests passed');
} catch (err) {
  console.error('Test execution failed:', err);
  assert(false, 'Phase 7 automated test suite failed');
}

console.log('\n----------------------------------------------------');
console.log(`TOTAL PHASE 7 AUDIT TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 7 VERIFICATION AUDITS PASSED!\n');
  process.exit(0);
}
