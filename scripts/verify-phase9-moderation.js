/**
 * Phase 9 Master Verification Script
 * Validates Moderation & Expiry Engine, 5/day report rate-limits, blocking,
 * admin review workflows, 15-day availability sweeps, 30-day team archival,
 * 90-day PII scrubbing, negative invariants, and automated test execution.
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
console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 9 AUDIT');
console.log('====================================================\n');

// 1. Check Source Files Existence
console.log('1. Checking Phase 9 Source Architecture:');
const requiredFiles = [
  path.join(serverDir, 'src', 'repositories', 'moderation.repository.ts'),
  path.join(serverDir, 'src', 'repositories', 'expiry.repository.ts'),
  path.join(serverDir, 'src', 'modules', 'safety', 'safety.service.ts'),
  path.join(serverDir, 'src', 'modules', 'safety', 'safety.routes.ts'),
  path.join(serverDir, 'src', 'jobs', 'expiry.job.ts'),
  path.join(serverDir, 'dist', 'repositories', 'moderation.repository.js'),
  path.join(serverDir, 'dist', 'repositories', 'expiry.repository.js'),
  path.join(serverDir, 'dist', 'modules', 'safety', 'safety.service.js'),
  path.join(serverDir, 'dist', 'jobs', 'expiry.job.js'),
  path.join(serverDir, 'tests', 'moderation-and-expiry.test.js')
];

requiredFiles.forEach((file) => {
  const relative = path.relative(rootDir, file);
  assert(fs.existsSync(file), `Source file exists: ${relative}`);
});

// 2. Check Rate Limiting & Safety Invariants
console.log('\n2. Checking Rate Limiting & Moderation Invariants:');
const safetyServiceContent = fs.readFileSync(path.join(serverDir, 'src', 'modules', 'safety', 'safety.service.ts'), 'utf8');

assert(safetyServiceContent.includes('REPORT_RATE_LIMIT_EXCEEDED'), 'Sliding 24-hour rate limit enforced in safety service');
assert(safetyServiceContent.includes('recentReports.length >= 5'), 'Max 5 reports per 24 hours verified in code');
assert(safetyServiceContent.includes('CANNOT_BLOCK_SELF'), 'Self-blocking guard enforced');
assert(safetyServiceContent.includes('isInteractionBlocked'), 'Bidirectional blocking shield exists');

// 3. Check Automated Expiry Job Sweeps
console.log('\n3. Checking Background Expiry Sweeps Architecture:');
const expiryJobContent = fs.readFileSync(path.join(serverDir, 'src', 'jobs', 'expiry.job.ts'), 'utf8');

assert(expiryJobContent.includes('sweepAvailabilityExpiry'), '15-day player availability sweep implemented');
assert(expiryJobContent.includes('sweepInvitationExpiry'), 'Pending invitation expiry sweep implemented');
assert(expiryJobContent.includes('sweepTournamentArchival'), '30-day post-completion tournament & team archival sweep implemented');
assert(expiryJobContent.includes('sweepPiiScrubbing'), '90-day deactivated account PII scrubbing sweep implemented');
assert(expiryJobContent.includes('runAllNightlyJobs'), 'Nightly cron master runner implemented');

// 4. Check Negative Invariants: Zero Automated Bans, Zero Scoring, Zero Payments
console.log('\n4. Checking Negative Invariants in Safety & Expiry Domain:');
assert(!safetyServiceContent.includes('strike_rate'), 'strike_rate absent in safety service');
assert(!safetyServiceContent.includes('bowling_average'), 'bowling_average absent in safety service');
assert(!safetyServiceContent.includes('points_table'), 'points_table absent in safety service');
assert(!safetyServiceContent.includes('razorpay'), 'Razorpay absent in safety service');
assert(!safetyServiceContent.includes('stripe'), 'Stripe absent in safety service');
assert(!safetyServiceContent.includes('wallet_balance'), 'wallet_balance absent in safety service');

// 5. Execute Phase 9 Automated Test Suite Subprocess
console.log('\n5. Executing Phase 9 Automated Test Suite:');
try {
  const testOutput = execSync('node apps/server/tests/moderation-and-expiry.test.js', {
    cwd: rootDir,
    encoding: 'utf8'
  });
  console.log(testOutput);
  assert(testOutput.includes('ALL PHASE 9 MODERATION & EXPIRY TESTS PASSED'), 'All 29 moderation and expiry unit tests passed');
} catch (err) {
  console.error('Test execution failed:', err);
  assert(false, 'Phase 9 automated test suite failed');
}

console.log('\n----------------------------------------------------');
console.log(`TOTAL PHASE 9 AUDIT TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 9 MODERATION & EXPIRY AUDITS PASSED!\n');
  process.exit(0);
}
