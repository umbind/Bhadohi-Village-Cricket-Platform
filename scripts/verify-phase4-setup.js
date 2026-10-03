/**
 * Phase 4 Repository Setup Verification Script
 * Validates monorepo workspace configuration, lint/format settings,
 * server/web/mobile app scaffolding, CI workflow, and developer guide.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

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
console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 4 TEST SUITE');
console.log('====================================================\n');

// 1. Root Configuration Files
console.log('1. Checking Root Configuration Files:');
assert(fs.existsSync(path.join(rootDir, 'package.json')), 'Root package.json exists');
assert(fs.existsSync(path.join(rootDir, '.gitignore')), 'Root .gitignore exists');
assert(fs.existsSync(path.join(rootDir, '.editorconfig')), 'Root .editorconfig exists');
assert(fs.existsSync(path.join(rootDir, '.prettierrc')), 'Root .prettierrc exists');
assert(fs.existsSync(path.join(rootDir, 'tsconfig.base.json')), 'Root tsconfig.base.json exists');

// Verify Root Workspaces
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
assert(Array.isArray(rootPkg.workspaces) && rootPkg.workspaces.includes('apps/*'), 'Workspaces configured for "apps/*"');

// Verify .gitignore contains sensitive ignores
const gitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
assert(gitignore.includes('.env'), '.gitignore ignores .env files');
assert(gitignore.includes('node_modules/'), '.gitignore ignores node_modules');

// 2. Apps Scaffolding - Server
console.log('\n2. Checking Server Application Scaffolding:');
const serverDir = path.join(rootDir, 'apps', 'server');
assert(fs.existsSync(path.join(serverDir, 'package.json')), 'apps/server/package.json exists');
assert(fs.existsSync(path.join(serverDir, 'tsconfig.json')), 'apps/server/tsconfig.json exists');
assert(fs.existsSync(path.join(serverDir, '.env.example')), 'apps/server/.env.example exists');
assert(fs.existsSync(path.join(serverDir, 'src', 'config', 'environment.ts')), 'apps/server environment.ts exists');
assert(fs.existsSync(path.join(serverDir, 'src', 'app.ts')), 'apps/server app.ts exists');
assert(fs.existsSync(path.join(serverDir, 'src', 'server.ts')), 'apps/server server.ts exists');
assert(fs.existsSync(path.join(serverDir, 'tests', 'health.test.js')), 'apps/server health.test.js exists');

const serverPkg = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
assert(serverPkg.name === '@bvcp/server', 'Server package name is @bvcp/server');

// 3. Apps Scaffolding - Web
console.log('\n3. Checking Web Application Scaffolding:');
const webDir = path.join(rootDir, 'apps', 'web');
assert(fs.existsSync(path.join(webDir, 'package.json')), 'apps/web/package.json exists');
assert(fs.existsSync(path.join(webDir, 'tsconfig.json')), 'apps/web/tsconfig.json exists');
assert(fs.existsSync(path.join(webDir, '.env.example')), 'apps/web/.env.example exists');

const webPkg = JSON.parse(fs.readFileSync(path.join(webDir, 'package.json'), 'utf8'));
assert(webPkg.name === '@bvcp/web', 'Web package name is @bvcp/web');

// 4. Apps Scaffolding - Mobile
console.log('\n4. Checking Mobile Application Scaffolding:');
const mobilePubspecPath = path.join(rootDir, 'apps', 'mobile', 'pubspec.yaml');
assert(fs.existsSync(mobilePubspecPath), 'apps/mobile/pubspec.yaml exists');
const pubspecContent = fs.readFileSync(mobilePubspecPath, 'utf8');
assert(pubspecContent.includes('name: bvcp_mobile'), 'Mobile app name is bvcp_mobile');
assert(pubspecContent.includes('NotoSansDevanagari'), 'Devanagari font declared in pubspec');

// 5. CI Workflow & Documentation
console.log('\n5. Checking CI Pipeline & Setup Guide:');
const ciWorkflowPath = path.join(rootDir, '.github', 'workflows', 'ci.yml');
assert(fs.existsSync(ciWorkflowPath), '.github/workflows/ci.yml exists');
const ciContent = fs.readFileSync(ciWorkflowPath, 'utf8');
assert(ciContent.includes('node scripts/verify-phase4-setup.js'), 'CI runs verify-phase4-setup.js');

const devGuidePath = path.join(rootDir, 'docs', '20-developer-setup-guide.md');
assert(fs.existsSync(devGuidePath), 'docs/20-developer-setup-guide.md exists');

console.log('\n----------------------------------------------------');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 4 REPOSITORY SETUP TESTS PASSED!\n');
  process.exit(0);
}
