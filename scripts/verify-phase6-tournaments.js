/**
 * Phase 6 Master Verification Script
 * Validates tournament lifecycle, temporary teams, application workflow,
 * negative invariants (zero scoring/wallet/rankings), and runs the automated test suite.
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
console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 6 AUDIT');
console.log('====================================================\n');

// 1. Check Source Files Existence
console.log('1. Checking Phase 6 Source Architecture:');
const requiredFiles = [
  path.join(serverDir, 'src', 'repositories', 'tournament.repository.ts'),
  path.join(serverDir, 'src', 'repositories', 'team.repository.ts'),
  path.join(serverDir, 'src', 'repositories', 'application.repository.ts'),
  path.join(serverDir, 'src', 'repositories', 'notification.repository.ts'),
  path.join(serverDir, 'src', 'modules', 'tournament', 'tournament.service.ts'),
  path.join(serverDir, 'src', 'modules', 'tournament', 'tournament.routes.ts'),
  path.join(serverDir, 'src', 'modules', 'team', 'team.service.ts'),
  path.join(serverDir, 'src', 'modules', 'team', 'team.routes.ts'),
  path.join(serverDir, 'src', 'modules', 'notification', 'notification.routes.ts'),
  path.join(serverDir, 'tests', 'tournaments-and-teams.test.js')
];

requiredFiles.forEach(file => {
  const relative = path.relative(rootDir, file);
  assert(fs.existsSync(file), `Source file exists: ${relative}`);
});

// 2. Negative Invariant Checks: Zero Scoring, Zero Vanity, Zero Points Table
console.log('\n2. Checking Zero Scoring / Vanity / Standings Invariants:');
const tournamentService = fs.readFileSync(path.join(serverDir, 'src', 'modules', 'tournament', 'tournament.service.ts'), 'utf8');
const teamService = fs.readFileSync(path.join(serverDir, 'src', 'modules', 'team', 'team.service.ts'), 'utf8');

assert(!tournamentService.includes('points_table'), 'points_table is absent in tournament service');
assert(!tournamentService.includes('live_score'), 'live_score is absent in tournament service');
assert(!tournamentService.includes('mvp_award'), 'mvp_award is absent in tournament service');
assert(!teamService.includes('strike_rate'), 'strike_rate is absent in team service');
assert(!teamService.includes('bowling_average'), 'bowling_average is absent in team service');
assert(!teamService.includes('team_ranking'), 'team_ranking is absent in team service');

// 3. Negative Invariant Checks: Zero In-App Payments / Wallets / Escrow
console.log('\n3. Checking Zero Payment Gateway / Wallet Invariants:');
assert(!tournamentService.includes('razorpay'), 'Razorpay is absent in tournament service');
assert(!tournamentService.includes('stripe'), 'Stripe is absent in tournament service');
assert(!tournamentService.includes('wallet_balance'), 'wallet_balance is absent in tournament service');
assert(!teamService.includes('payment_gateway'), 'payment_gateway is absent in team service');

// 4. Bhadohi District Block Integrity
console.log('\n4. Checking Bhadohi District Enforcements:');
const bhadohiBlocks = ['GYANPUR', 'AURAI', 'BHADOHI', 'SURIYAWAN', 'DEEGH', 'ABHOLI'];
bhadohiBlocks.forEach(block => {
  assert(tournamentService.includes(block), `Bhadohi block ${block} is strictly recognized in tournament rules`);
});

// 5. Execute Phase 6 Test Suite Subprocess
console.log('\n5. Executing Phase 6 Automated Test Suite:');
try {
  const testOutput = execSync('node apps/server/tests/tournaments-and-teams.test.js', {
    cwd: rootDir,
    encoding: 'utf8'
  });
  console.log(testOutput);
  assert(testOutput.includes('ALL PHASE 6 TOURNAMENT & TEAM TESTS PASSED'), 'All 33 tournament & team unit tests passed');
} catch (err) {
  console.error('Test execution failed:', err);
  assert(false, 'Phase 6 automated test suite failed');
}

console.log('\n----------------------------------------------------');
console.log(`TOTAL PHASE 6 AUDIT TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 6 VERIFICATION AUDITS PASSED!\n');
  process.exit(0);
}
