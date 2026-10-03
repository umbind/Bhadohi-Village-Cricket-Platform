# Developer Environment & Repository Setup Guide

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**SDLC Phase:** Phase 4 (Repository Setup)  

---

## 1. Prerequisites

Before setting up the project locally, ensure the following toolchains are installed:
- **Node.js:** v20.x or v22.x LTS (Node v24.x supported)
- **npm:** v10.x or higher
- **PostgreSQL:** v15+ (with `pgcrypto` extension support)
- **Flutter SDK:** v3.19+ (with Android SDK & build-tools for mobile development)
- **Git:** v2.30+

---

## 2. Monorepo Structure

```text
bhadohi-cricket-platform/
├── apps/
│   ├── server/             # Node.js/TypeScript REST API backend
│   │   ├── src/            # Express controllers, routes, and config
│   │   ├── tests/          # Health check and domain tests
│   │   ├── package.json    # @bvcp/server workspace
│   │   └── .env.example    # Required backend environment variables
│   ├── web/                # Next.js/React Organizer Desktop Dashboard
│   │   ├── src/            # Next.js app pages and components
│   │   ├── package.json    # @bvcp/web workspace
│   │   └── .env.example    # Frontend environment configuration
│   └── mobile/             # Flutter Android Mobile Application
│       ├── lib/            # Dart UI widgets and state management
│       └── pubspec.yaml    # Flutter dependencies and Devanagari fonts
├── database/
│   ├── schema.sql          # Master PostgreSQL 15 DDL file (13 tables, 17 enums)
│   ├── schema.prisma       # Typed Prisma ORM schema
│   └── seed-data.sql       # Initial Bhadohi admin, organizers, and tournaments
├── docs/                   # 20 Complete Architecture, PRD, and Test Specifications
├── prototypes/             # Interactive standalone HTML/JS prototypes
├── scripts/                # Automated verification and linting test scripts
├── .github/workflows/      # GitHub Actions CI workflow (ci.yml)
├── .editorconfig           # Editor indentation and line-ending rules
├── .prettierrc             # Code formatting configuration
├── .gitignore              # Ignored files (node_modules, .env, build output)
├── tsconfig.base.json      # Shared TypeScript base configuration
├── package.json            # Root workspace configuration
└── README.md               # Master project index and status board
```

---

## 3. Step-by-Step Setup

### Step 3.1: Environment File Configuration
Copy the provided `.env.example` templates to `.env`:
```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

### Step 3.2: Database Initialization
Create a local PostgreSQL 15 database:
```bash
createdb bvcp_dev
psql -d bvcp_dev -f database/schema.sql
psql -d bvcp_dev -f database/seed-data.sql
```

### Step 3.3: Running Automated Phase Verification Tests
Run the automated verification suite across all completed phases:
```bash
npm run test:all
```
This executes:
- `scripts/verify-phase2-prototypes.js` (49 tests)
- `scripts/verify-phase3-schema.js` (62 tests)
- `scripts/verify-phase4-setup.js` (Repository, workspace, and config tests)

---

## 4. Git Hygiene & Security Guidelines

1. **Never Commit Secrets:** Real `.env` files containing `JWT_SECRET`, database passwords, or SMS keys must never be staged or committed. The root `.gitignore` enforces this rule.
2. **Pre-Commit Verification:** Run `npm run test:all` before opening any Pull Request or committing changes.
3. **Branch Protection:** All PRs targeting `main` must pass the GitHub Actions CI workflow (`.github/workflows/ci.yml`).
