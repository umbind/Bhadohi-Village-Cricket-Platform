/**
 * Health Check & Config Unit Test
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '..', '.env.example');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const appTsPath = path.join(__dirname, '..', 'src', 'app.ts');

console.log('Testing Server Configuration & Health Setup:');

// Test 1: Package JSON integrity
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
assert.strictEqual(pkg.name, '@bvcp/server', 'Server package name should match');
console.log('  ✅ Server package.json is valid');

// Test 2: .env.example contains necessary keys
const envContent = fs.readFileSync(envExamplePath, 'utf8');
assert(envContent.includes('DATABASE_URL'), 'Must contain DATABASE_URL');
assert(envContent.includes('JWT_SECRET'), 'Must contain JWT_SECRET');
assert(envContent.includes('PORT'), 'Must contain PORT');
console.log('  ✅ Server .env.example contains mandatory keys');

// Test 3: App.ts contains health check and 404 handler
const appTs = fs.readFileSync(appTsPath, 'utf8');
assert(appTs.includes('/health'), 'Must define /health route');
assert(appTs.includes('ROUTE_NOT_FOUND'), 'Must define 404 error handler');
assert(appTs.includes('INTERNAL_SERVER_ERROR'), 'Must define 500 error handler');
console.log('  ✅ Server app.ts includes health check and error handlers');

console.log('All Server Base Tests Passed!\n');
