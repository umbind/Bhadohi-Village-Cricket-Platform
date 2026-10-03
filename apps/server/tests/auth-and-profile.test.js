/**
 * Phase 5 Comprehensive Authentication & Profile Automated Test Suite
 * Tests PIN hashing, recovery code lifecycle, 5-attempt brute force lockout,
 * Bhadohi block validation, 15-day availability, and mobile privacy shielding.
 */

const assert = require('assert');
const crypto = require('crypto');

// Direct imports using the service implementation
const { AuthService } = require('../dist/modules/auth/auth.service.js');
const { ProfileService } = require('../dist/modules/profile/profile.service.js');
const { userRepository } = require('../dist/repositories/user.repository.js');
const { profileRepository } = require('../dist/repositories/profile.repository.js');

const authService = new AuthService();
const profileService = new ProfileService();

async function runAuthAndProfileTests() {
  console.log('====================================================');
  console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 5 TEST SUITE');
  console.log('====================================================\n');

  userRepository.clear();
  profileRepository.clear();

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
  // Test 1: Cryptographic PIN & Recovery Code Routines
  // ----------------------------------------------------
  console.log('1. Cryptographic Security & Hashing Tests:');
  const plainPin = '123456';
  const hashedPin = await authService.hashPin(plainPin);
  testAssert(hashedPin !== plainPin, 'PIN hash is not equal to plaintext');
  testAssert(hashedPin.includes(':'), 'PIN hash uses salted key derivation');
  testAssert(await authService.verifyPin(plainPin, hashedPin), 'Valid PIN verifies successfully');
  testAssert(!(await authService.verifyPin('654321', hashedPin)), 'Invalid PIN rejected');

  const recoveryCode = authService.generateRecoveryCode();
  testAssert(/^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/.test(recoveryCode), `Recovery code formatted correctly (${recoveryCode})`);
  const hashedCode = await authService.hashRecoveryCode(recoveryCode);
  testAssert(await authService.verifyRecoveryCode(recoveryCode, hashedCode), 'Recovery code verifies against hash');
  testAssert(!(await authService.verifyRecoveryCode('XXXX-YYYY', hashedCode)), 'Incorrect recovery code rejected');

  // ----------------------------------------------------
  // Test 2: User Registration Workflow
  // ----------------------------------------------------
  console.log('\n2. User Registration & Validation Tests:');
  const regResult = await authService.register({
    mobileNumber: '9839123456',
    pin: '123456',
    confirmPin: '123456',
    isAgeVerified: true
  });
  testAssert(regResult.userId !== undefined, 'User registered successfully with ID');
  testAssert(regResult.recoveryCode.length === 9, 'Recovery code returned in registration response');
  testAssert(regResult.token !== undefined, 'Signed JWT token returned');

  // Negative validation tests
  await assert.rejects(
    () => authService.register({ mobileNumber: '9839123456', pin: '123456', confirmPin: '123456', isAgeVerified: false }),
    /AGE_VERIFICATION_REQUIRED/,
    'Under-18 registration rejected'
  );
  testAssert(true, 'Under-18 registration rejected with AGE_VERIFICATION_REQUIRED');

  await assert.rejects(
    () => authService.register({ mobileNumber: '12345', pin: '123456', confirmPin: '123456', isAgeVerified: true }),
    /INVALID_MOBILE_NUMBER/,
    'Invalid phone length rejected'
  );
  testAssert(true, 'Invalid mobile number rejected');

  await assert.rejects(
    () => authService.register({ mobileNumber: '9839000111', pin: '123', confirmPin: '123', isAgeVerified: true }),
    /INVALID_PIN_FORMAT/,
    'Non-6-digit PIN rejected'
  );
  testAssert(true, 'Non-6-digit PIN rejected');

  await assert.rejects(
    () => authService.register({ mobileNumber: '9839123456', pin: '123456', confirmPin: '123456', isAgeVerified: true }),
    /MOBILE_ALREADY_REGISTERED/,
    'Duplicate mobile registration rejected'
  );
  testAssert(true, 'Duplicate registration prevented');

  // ----------------------------------------------------
  // Test 3: Login & 5-Attempt Brute Force Lockout
  // ----------------------------------------------------
  console.log('\n3. Login & Brute-Force Lockout Defense Tests:');
  const loginSuccess = await authService.login({
    mobileNumber: '9839123456',
    pin: '123456'
  });
  testAssert(loginSuccess.userId === regResult.userId, 'Valid credentials login succeeds');
  testAssert(loginSuccess.hasProfile === false, 'New user correctly reports hasProfile = false');

  // Simulate 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    await assert.rejects(
      () => authService.login({ mobileNumber: '9839123456', pin: '000000' }),
      /INVALID_CREDENTIALS/
    );
  }
  testAssert(true, 'First 4 failed PIN attempts increment failure count without lockout');

  // 5th failed attempt must trigger ACCOUNT_LOCKED
  await assert.rejects(
    () => authService.login({ mobileNumber: '9839123456', pin: '000000' }),
    /ACCOUNT_LOCKED/,
    '5th failed attempt locks the account'
  );
  testAssert(true, '5th failed attempt triggered 15-minute account lockout');

  // Even with correct PIN, login is rejected while locked
  await assert.rejects(
    () => authService.login({ mobileNumber: '9839123456', pin: '123456' }),
    /ACCOUNT_LOCKED/,
    'Correct PIN rejected while account is in lockout'
  );
  testAssert(true, 'Login blocked during active lockout window');

  // ----------------------------------------------------
  // Test 4: Self-Service PIN Recovery
  // ----------------------------------------------------
  console.log('\n4. Self-Service PIN Recovery Tests:');
  const recoveryResult = await authService.recoverPin({
    mobileNumber: '9839123456',
    recoveryCode: regResult.recoveryCode,
    newPin: '654321',
    confirmNewPin: '654321'
  });
  testAssert(recoveryResult.newRecoveryCode !== regResult.recoveryCode, 'New recovery code rotated and returned');

  // Login with new PIN succeeds and clears lockout
  const loginWithNewPin = await authService.login({
    mobileNumber: '9839123456',
    pin: '654321'
  });
  testAssert(loginWithNewPin.userId === regResult.userId, 'Login with new PIN succeeds after recovery');

  // Old recovery code is invalidated
  await assert.rejects(
    () => authService.recoverPin({
      mobileNumber: '9839123456',
      recoveryCode: regResult.recoveryCode,
      newPin: '111111',
      confirmNewPin: '111111'
    }),
    /INVALID_RECOVERY_CODE/,
    'Old recovery code cannot be reused'
  );
  testAssert(true, 'Old recovery code successfully invalidated');

  // ----------------------------------------------------
  // Test 5: Player Profile & Bhadohi Blocks
  // ----------------------------------------------------
  console.log('\n5. Player Profile & Availability Tests:');
  const profile = await profileService.upsertProfile(regResult.userId, {
    fullName: 'अमित सिंह',
    village: 'गोपीगंज',
    block: 'GYANPUR',
    primaryRole: 'ALL_ROUNDER',
    battingStyle: 'दाएं हाथ',
    bowlingStyle: 'दाएं हाथ मध्यम तेज',
    allowWhatsappContact: true
  });
  testAssert(profile.fullName === 'अमित सिंह', 'Profile created with Hindi name');
  testAssert(profile.block === 'GYANPUR', 'Profile bound to Bhadohi block GYANPUR');
  testAssert(profile.isAvailable === true, 'Profile defaulted to available');

  // Validate negative block rejection
  await assert.rejects(
    () => profileService.upsertProfile(regResult.userId, {
      fullName: 'अमित सिंह',
      village: 'गोपीगंज',
      block: 'VARANASI', // Non-Bhadohi block
      primaryRole: 'BATSMAN',
      battingStyle: 'दाएं हाथ',
      bowlingStyle: 'स्पिन',
      allowWhatsappContact: true
    }),
    /INVALID_BHADOHI_BLOCK/,
    'Non-Bhadohi block rejected'
  );
  testAssert(true, 'Non-Bhadohi block rejected with INVALID_BHADOHI_BLOCK');

  // ----------------------------------------------------
  // Test 6: 15-Day Availability Window
  // ----------------------------------------------------
  console.log('\n6. Availability Expiry Calculation Tests:');
  const availUpdate = await profileService.updateAvailability(regResult.userId, true, 15);
  const diffDays = Math.round((availUpdate.availabilityExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  testAssert(diffDays === 15, `Availability correctly set to 15 days (${diffDays} days calculated)`);

  // ----------------------------------------------------
  // Test 7: Mobile Privacy Shielding in Search
  // ----------------------------------------------------
  console.log('\n7. Mobile Number Privacy Invariant Tests:');
  const searchResults = await profileService.searchPlayers({ block: 'GYANPUR', availableOnly: true });
  testAssert(searchResults.length === 1, 'Player found in Gyanpur block search');
  testAssert(searchResults[0].mobileNumber === undefined, 'CRITICAL: mobileNumber is completely absent from search result');
  testAssert(searchResults[0].fullName === 'अमित सिंह', 'Player name displayed in search');

  // ----------------------------------------------------
  // Test 8: Account Deletion & PII Scrubbing
  // ----------------------------------------------------
  console.log('\n8. Account Deletion & Right-To-Be-Forgotten Tests:');
  await authService.deleteAccount(regResult.userId, '654321');
  const userAfterDelete = await userRepository.findById(regResult.userId);
  testAssert(userAfterDelete.isActive === false, 'User account deactivated');

  const profileAfterDelete = await profileService.getMyProfile(regResult.userId);
  testAssert(profileAfterDelete.fullName === 'भूतपूर्व खिलाड़ी', 'Player name scrubbed upon account deletion');
  testAssert(profileAfterDelete.village === '---', 'Player village scrubbed upon account deletion');
  testAssert(profileAfterDelete.isAvailable === false, 'Availability disabled upon deletion');

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('----------------------------------------------------');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 ALL PHASE 5 AUTHENTICATION & PROFILE TESTS PASSED!\n');
    process.exit(0);
  }
}

runAuthAndProfileTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
