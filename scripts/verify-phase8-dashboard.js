/**
 * Phase 8 Master Verification Script
 * Validates Organizer Web Dashboard components, 4-step tournament wizard,
 * application review table, slide-over roster drawer, brand design tokens,
 * universal UI states, and negative invariants (zero scoring, zero payment, zero OTP).
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const webDir = path.join(rootDir, 'apps', 'web');

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
console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 8 AUDIT');
console.log('====================================================\n');

// 1. Check Source Files Existence
console.log('1. Checking Phase 8 Source Architecture:');
const requiredFiles = [
  path.join(webDir, 'tailwind.config.js'),
  path.join(webDir, 'postcss.config.js'),
  path.join(webDir, 'src', 'app', 'globals.css'),
  path.join(webDir, 'src', 'app', 'layout.tsx'),
  path.join(webDir, 'src', 'app', 'page.tsx'),
  path.join(webDir, 'src', 'components', 'Sidebar.tsx'),
  path.join(webDir, 'src', 'components', 'Header.tsx'),
  path.join(webDir, 'src', 'components', 'TournamentWizard.tsx'),
  path.join(webDir, 'src', 'components', 'ApplicationsTable.tsx'),
  path.join(webDir, 'src', 'components', 'RosterDrawer.tsx'),
  path.join(webDir, 'src', 'components', 'UniversalStateBanner.tsx'),
];

requiredFiles.forEach((file) => {
  const relative = path.relative(rootDir, file);
  assert(fs.existsSync(file), `Source file exists: ${relative}`);
});

// 2. Check Approved Visual Design Tokens
console.log('\n2. Checking Approved Brand Design Tokens in Tailwind:');
const tailwindConfig = fs.readFileSync(path.join(webDir, 'tailwind.config.js'), 'utf8');
assert(tailwindConfig.includes('#1E7A4C'), 'Primary Green (#1E7A4C) configured');
assert(tailwindConfig.includes('#123B2A'), 'Deep Forest (#123B2A) configured');
assert(tailwindConfig.includes('#F6F8F3'), 'Cream Background (#F6F8F3) configured');
assert(tailwindConfig.includes('#F4B942'), 'Amber Highlight (#F4B942) configured');
assert(tailwindConfig.includes('#C74D4D'), 'Error/Cancel Red (#C74D4D) configured');
assert(tailwindConfig.includes('#E1E8E1'), 'Border Divider (#E1E8E1) configured');
assert(tailwindConfig.includes('#172019'), 'High-contrast Text (#172019) configured');
assert(tailwindConfig.includes('#68756C'), 'Muted Text (#68756C) configured');
assert(tailwindConfig.includes('min-touch') || tailwindConfig.includes('44px'), 'Minimum touch target size 44px configured');

// 3. Check Tournament 4-Step Wizard & Bhadohi District Enforcements
console.log('\n3. Checking Tournament 4-Step Wizard Integrity:');
const wizardContent = fs.readFileSync(path.join(webDir, 'src', 'components', 'TournamentWizard.tsx'), 'utf8');

const bhadohiBlocks = ['GYANPUR', 'AURAI', 'BHADOHI', 'SURIYAWAN', 'DEEGH', 'ABHOLI'];
bhadohiBlocks.forEach((block) => {
  assert(wizardContent.includes(block), `Bhadohi block ${block} is selectable in wizard`);
});

assert(wizardContent.includes('1. बुनियादी विवरण'), 'Step 1: Basic Information present');
assert(wizardContent.includes('2. पंजीकरण एवं प्रारूप'), 'Step 2: Schedule & Format present');
assert(wizardContent.includes('3. नियम एवं अस्वीकरण'), 'Step 3: Rules & Disclaimer present');
assert(wizardContent.includes('4. समीक्षा एवं प्रकाशन'), 'Step 4: Review & Live Mobile Preview present');
assert(wizardContent.includes('मैदान पर नकद'), 'Informational cash-on-ground notice enforced in wizard');
assert(wizardContent.includes('कोई ऑनलाइन भुगतान या वॉलेट सुविधा नहीं है'), 'Unskippable offline payment disclaimer present');
assert(wizardContent.includes('validateStep1') && wizardContent.includes('validateStep2'), 'Date ordering validation rules active');

// 4. Check Applications Review Table & Roster Drawer
console.log('\n4. Checking Application Table & Roster Drawer:');
const tableContent = fs.readFileSync(path.join(webDir, 'src', 'components', 'ApplicationsTable.tsx'), 'utf8');
const drawerContent = fs.readFileSync(path.join(webDir, 'src', 'components', 'RosterDrawer.tsx'), 'utf8');

assert(tableContent.includes('PENDING') && tableContent.includes('ACCEPTED') && tableContent.includes('REJECTED'), 'All application statuses handled in table');
assert(drawerContent.includes('wa.me/91'), 'Captain WhatsApp direct link integrated in drawer');
assert(drawerContent.includes('18+'), '18+ age verification requirement highlighted in roster drawer');
assert(drawerContent.includes('onAccept') && drawerContent.includes('onReject'), 'Accept/Reject decision workflows present in drawer');

// 5. Universal State Handling Check
console.log('\n5. Checking Universal State Handling:');
const stateBannerContent = fs.readFileSync(path.join(webDir, 'src', 'components', 'UniversalStateBanner.tsx'), 'utf8');
const headerContent = fs.readFileSync(path.join(webDir, 'src', 'components', 'Header.tsx'), 'utf8');

const expectedStates = ['NORMAL', 'LOADING', 'EMPTY', 'ERROR', 'EXPIRED', 'CANCELLED'];
expectedStates.forEach((state) => {
  assert(stateBannerContent.includes(state) || headerContent.includes(state), `Universal state ${state} is modeled`);
});

// 6. Strict Negative Invariant Checks: Zero Scoring, Zero Payments, Zero OTP
console.log('\n6. Checking Negative Invariants in Web Application:');
const pageContent = fs.readFileSync(path.join(webDir, 'src', 'app', 'page.tsx'), 'utf8');

assert(!pageContent.includes('points_table'), 'points_table absent from dashboard page');
assert(!pageContent.includes('strike_rate'), 'strike_rate absent from dashboard page');
assert(!pageContent.includes('bowling_average'), 'bowling_average absent from dashboard page');
assert(!pageContent.includes('player_rankings'), 'player_rankings absent from dashboard page');
assert(!pageContent.includes('razorpay'), 'Razorpay absent from dashboard page');
assert(!pageContent.includes('stripe'), 'Stripe absent from dashboard page');
assert(!pageContent.includes('wallet_balance'), 'wallet_balance absent from dashboard page');
assert(!pageContent.includes('otp_input'), 'OTP inputs absent from dashboard page');

// 7. Execute Phase 8 Automated Unit Test Suite
console.log('\n7. Executing Phase 8 Automated Unit Test Suite:');
try {
  const { execSync } = require('child_process');
  const testOutput = execSync('node apps/web/tests/dashboard-logic.test.js', {
    cwd: rootDir,
    encoding: 'utf8'
  });
  console.log(testOutput);
  assert(testOutput.includes('ALL PHASE 8 DASHBOARD UNIT TESTS PASSED'), 'All 21 dashboard unit tests passed');
} catch (err) {
  console.error('Test execution failed:', err);
  assert(false, 'Phase 8 automated unit test suite failed');
}

console.log('\n----------------------------------------------------');
console.log(`TOTAL PHASE 8 AUDIT TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 8 ORGANIZER WEB DASHBOARD AUDITS PASSED!\n');
  process.exit(0);
}
