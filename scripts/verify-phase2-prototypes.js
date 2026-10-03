/**
 * Phase 2 Prototype Verification Script
 * Validates UX specifications, screen coverage, color tokens, and state engines.
 */

const fs = require('fs');
const path = require('path');

const prototypePath = path.join(__dirname, '..', 'prototypes', 'index.html');
const content = fs.readFileSync(prototypePath, 'utf8');

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
console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 2 TEST SUITE');
console.log('====================================================\n');

// 1. Verify all 25 screens exist in the SCREENS array
console.log('1. Checking 25 Screen Registry Coverage:');
for (let i = 1; i <= 25; i++) {
  const screenId = `SCR-${String(i).padStart(2, '0')}`;
  assert(content.includes(`'${screenId}'`) || content.includes(`"${screenId}"`), `Screen ${screenId} exists in catalog`);
}

// 2. Verify all approved color tokens exist
console.log('\n2. Checking Approved Visual Palette Tokens:');
const requiredTokens = [
  { name: 'Primary Green', hex: '#1E7A4C' },
  { name: 'Deep Forest', hex: '#123B2A' },
  { name: 'Cream Background', hex: '#F6F8F3' },
  { name: 'Amber Highlight', hex: '#F4B942' },
  { name: 'Main Text', hex: '#172019' },
  { name: 'Muted Text', hex: '#68756C' },
  { name: 'Error / Cancel', hex: '#C74D4D' },
  { name: 'Border Color', hex: '#E1E8E1' }
];

requiredTokens.forEach(token => {
  assert(content.toLowerCase().includes(token.hex.toLowerCase()), `Color token ${token.name} (${token.hex}) is present`);
});

// 3. Verify all 6 UI States are modeled
console.log('\n3. Checking Universal UI States Modeling:');
const requiredStates = ['NORMAL', 'LOADING', 'EMPTY', 'ERROR', 'EXPIRED', 'CANCELLED'];
requiredStates.forEach(state => {
  assert(content.includes(`'${state}'`) || content.includes(`"${state}"`), `UI State ${state} is defined and handled`);
});

// 4. Verify Touch Target and Typography Requirements
console.log('\n4. Checking Accessibility & Typography:');
assert(content.includes('Noto Sans Devanagari'), 'Noto Sans Devanagari font is included');
assert(content.includes('min-height: 48px') && content.includes('min-width: 48px'), '48px minimum touch target CSS rule is enforced');

// 5. Verify Desktop Organizer Dashboard Elements
console.log('\n5. Checking Desktop Dashboard Elements:');
assert(content.includes('id="desktop-view-container"'), 'Desktop container exists');
assert(content.includes('id="desk-tab-wizard"'), '4-Step Tournament Creation Wizard exists');
assert(content.includes('id="desk-tab-applications"'), 'Team Applications data table exists');
assert(content.includes('id="roster-drawer"'), 'Roster inspection slide-over drawer exists');

// 6. Verify Strict Omission of Prohibited Vanity / Scoring Features
console.log('\n6. Checking Negative Invariant Assertions:');
assert(!content.includes('strike_rate'), 'Prohibited field "strike_rate" is absent');
assert(!content.includes('bowling_average'), 'Prohibited field "bowling_average" is absent');
assert(!content.includes('points_table'), 'Prohibited feature "points_table" is absent');
assert(!content.includes('wallet_balance'), 'Prohibited feature "wallet_balance" is absent');

console.log('\n----------------------------------------------------');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 2 PROTOTYPE TESTS PASSED!\n');
  process.exit(0);
}
