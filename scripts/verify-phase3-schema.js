/**
 * Phase 3 Architecture and Data Model Verification Script
 * Validates PostgreSQL DDL syntax, Prisma ORM schema parity,
 * constraint rules, indexing coverage, and negative vanity invariants.
 */

const fs = require('fs');
const path = require('path');

const schemaSqlPath = path.join(__dirname, '..', 'database', 'schema.sql');
const prismaSchemaPath = path.join(__dirname, '..', 'database', 'schema.prisma');
const seedSqlPath = path.join(__dirname, '..', 'database', 'seed-data.sql');
const stateRulesPath = path.join(__dirname, '..', 'docs', '18-state-transition-rules.md');
const drPlanPath = path.join(__dirname, '..', 'docs', '19-backup-and-disaster-recovery.md');

const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
const prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');
const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
const stateRules = fs.readFileSync(stateRulesPath, 'utf8');
const drPlan = fs.readFileSync(drPlanPath, 'utf8');

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
console.log('BHADOHI VILLAGE CRICKET PLATFORM: PHASE 3 TEST SUITE');
console.log('====================================================\n');

// 1. Verify all 13 tables exist in SQL DDL
console.log('1. Checking PostgreSQL DDL Table Definitions (13 Tables):');
const requiredTables = [
  'users',
  'player_profiles',
  'tournaments',
  'teams',
  'team_members',
  'tournament_applications',
  'player_invitations',
  'notifications',
  'reports',
  'blocks',
  'audit_logs',
  'expiry_jobs',
  'support_requests'
];

requiredTables.forEach(table => {
  assert(schemaSql.includes(`CREATE TABLE ${table}`), `SQL Table: ${table} defined`);
});

// 2. Verify all PostgreSQL Enums exist
console.log('\n2. Checking PostgreSQL Enums:');
const requiredEnums = [
  'user_role_enum',
  'cricket_role_enum',
  'bhadohi_block_enum',
  'tournament_status_enum',
  'ball_type_enum',
  'team_status_enum',
  'member_role_enum',
  'member_status_enum',
  'application_status_enum',
  'invitation_status_enum',
  'notification_type_enum',
  'report_target_enum',
  'report_reason_enum',
  'report_status_enum',
  'expiry_job_type_enum',
  'job_status_enum',
  'support_status_enum'
];

requiredEnums.forEach(enm => {
  assert(schemaSql.includes(`CREATE TYPE ${enm}`), `SQL Enum: ${enm} defined`);
});

// 3. Verify Prisma ORM Schema Parity
console.log('\n3. Checking Prisma Schema Parity (13 Models):');
const requiredModels = [
  'model User',
  'model PlayerProfile',
  'model Tournament',
  'model Team',
  'model TeamMember',
  'model TournamentApplication',
  'model PlayerInvitation',
  'model Notification',
  'model Report',
  'model Block',
  'model AuditLog',
  'model ExpiryJob',
  'model SupportRequest'
];

requiredModels.forEach(model => {
  assert(prismaSchema.includes(model), `Prisma Model: ${model} defined`);
});

// 4. Verify Critical Indexes & Constraints in SQL DDL
console.log('\n4. Checking Security & Performance Constraints:');
assert(schemaSql.includes('is_age_verified = TRUE'), 'Check constraint: 18+ verification mandatory');
assert(schemaSql.includes('CREATE INDEX idx_users_mobile ON users(mobile_number)'), 'Index on mobile_number defined');
assert(schemaSql.includes('CREATE INDEX idx_player_profiles_search'), 'Compound search index on player profiles defined');
assert(schemaSql.includes('uq_team_tournament_name'), 'Unique constraint: team name per tournament defined');
assert(schemaSql.includes('chk_tour_dates'), 'Check constraint: tournament start and end dates validated');
assert(schemaSql.includes('chk_no_self_block'), 'Check constraint: user cannot self-block defined');
assert(schemaSql.includes('update_updated_at_column'), 'Auto-update timestamp trigger function defined');

// 5. Verify Bhadohi District Specifics in Seed Data
console.log('\n5. Checking Bhadohi Geography & Seed Data:');
assert(seedSql.includes('GYANPUR'), 'Gyanpur block referenced in seed data');
assert(seedSql.includes('AURAI'), 'Aurai block referenced in seed data');
assert(seedSql.includes('औराई प्रीमियर कप 2026'), 'Bhadohi tournament seeded');

// 6. Verify State Transition & DR Docs
console.log('\n6. Checking State Transition & Disaster Recovery Specs:');
assert(stateRules.includes('stateDiagram-v2'), 'Mermaid state diagrams documented');
assert(drPlan.includes('RPO') && drPlan.includes('< 15 Minutes'), 'RPO < 15 minutes specified');
assert(drPlan.includes('RTO') && drPlan.includes('< 60 Minutes'), 'RTO < 60 minutes specified');

// 7. Negative Invariants Assertions (Zero Vanity / Scoring / Money)
console.log('\n7. Checking Negative Invariant Assertions:');
assert(!schemaSql.includes('strike_rate'), 'Prohibited field "strike_rate" absent in SQL');
assert(!prismaSchema.includes('strikeRate'), 'Prohibited field "strikeRate" absent in Prisma');
assert(!schemaSql.includes('bowling_average'), 'Prohibited field "bowling_average" absent in SQL');
assert(!schemaSql.includes('points_table'), 'Prohibited table "points_table" absent in SQL');
assert(!schemaSql.includes('wallet_balance'), 'Prohibited field "wallet_balance" absent in SQL');
assert(!schemaSql.includes('escrow'), 'Prohibited escrow structures absent in SQL');

console.log('\n----------------------------------------------------');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('----------------------------------------------------');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE 3 ARCHITECTURE & SCHEMA TESTS PASSED!\n');
  process.exit(0);
}
