/**
 * Phase 5 Master Verification Script
 * Validates authentication domain, profile services, zero-OTP invariants,
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
console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 5 AUDIT');
console.log('====================================================\n');

// 1. Check Source Files Existence
console.log('1. Checking Phase 5 Source Architecture:');
const requiredFiles = [
  path.join(serverDir, 'src', 'modules', 'auth', 'auth.service.ts'),
  path.join(serverDir, 'src', 'modules', 'auth', 'auth.routes.ts'),
  path.join(serverDir, 'src', 'modules', 'profile', 'profile.service.ts'),
  path.join(serverDir, 'src', 'modules', 'profile', 'profile.routes.ts'),
  path.join(serverDir, 'src', 'middleware', 'authenticate.ts'),
  path.join(serverDir, 'src', 'repositories', 'user.repository.ts'),
  path.join(serverDir, 'src', 'repositories', 'profile.repository.ts'),
  path.join(serverDir, 'tests', 'auth-and-profile.test.js')
];

requiredFiles.forEach(file => {
  const relative = path.relative(rootDir, file);
  assert(fs.existsSync(file), `Source file exists: ${relative}`);
});

// 2. Negative Invariant Checks: Zero OTP Gateway Dependencies
console.log('\n2. Checking Zero OTP Gateway Invariants:');
const serverPkg = fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8');
assert(!serverPkg.includes('twilio'), 'Twilio is absent');
assert(!serverPkg.includes('msg91'), 'MSG91 is absent');
assert(!serverPkg.includes('fast2sms'), 'Fast2SMS is absent');
assert(!serverPkg.includes('firebase-admin'), 'Firebase Phone Auth is absent');

// 3. Negative Invariant Checks: Zero Vanity Invariants in Services
console.log('\n3. Checking Zero Vanity / Scoring Invariants:');
const profileServiceContent = fs.readFileSync(path.join(serverDir, 'src', 'modules', 'profile', 'profile.service.ts'), 'utf8');
assert(!profileServiceContent.includes('strike_rate'), 'Strike rate absent in profile service');
assert(!profileServiceContent.includes('bowling_average'), 'Bowling average absent in profile service');
assert(!profileServiceContent.includes('player_rating'), 'Player rating absent in profile service');

// 4. Execute Phase 5 Test Suite Subprocess
console.log('\n4. Executing Phase 5 Automated Test Suite:');
try {
  const testOutput = execSync('node apps/server/tests/auth-and-profile.test.js', {
    cwd: rootDir,
    encoding: 'utf8'
  });
  console.log(testOutput);
  assert(testOutput.includes('ALL PHASE 5 AUTHENTICATION & PROFILE TESTS PASSED'), 'All 34 auth & profile unit tests passed');
} catch (err) {
  console.error('Test execution failed:', err);
  assert(false, 'Phase 5 automated test suite failed');
}

console.log('\n----------------------------------------------------');
console.log(`TOTAL PHASE 5 AUDIT TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 5 VERIFICATION AUDITS PASSED!\n');
  process.exit(0);
}
