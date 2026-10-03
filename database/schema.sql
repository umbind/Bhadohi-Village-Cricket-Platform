-- =====================================================================
-- Bhadohi Village Cricket Platform (bvcp)
-- Master Relational Database Schema (PostgreSQL 15+)
-- Version: Baseline v1
-- Prohibited Entities: Strictly ZERO tables or columns for scores,
--                      rankings, averages, strike rates, or in-app money.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. ENUMERATION TYPES
-- ==========================================

CREATE TYPE user_role_enum AS ENUM (
    'PLAYER',
    'ORGANIZER',
    'ADMIN'
);

CREATE TYPE cricket_role_enum AS ENUM (
    'BATSMAN',
    'BOWLER',
    'ALL_ROUNDER',
    'WICKET_KEEPER'
);

CREATE TYPE bhadohi_block_enum AS ENUM (
    'GYANPUR',
    'AURAI',
    'BHADOHI',
    'SURIYAWAN',
    'DEEGH',
    'ABHOLI'
);

CREATE TYPE tournament_status_enum AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'REGISTRATION_CLOSED',
    'ONGOING',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE ball_type_enum AS ENUM (
    'TENNIS',
    'LEATHER',
    'COSCO'
);

CREATE TYPE team_status_enum AS ENUM (
    'FORMING',
    'APPLIED',
    'ACCEPTED',
    'ARCHIVED'
);

CREATE TYPE member_role_enum AS ENUM (
    'CAPTAIN',
    'VICE_CAPTAIN',
    'PLAYER'
);

CREATE TYPE member_status_enum AS ENUM (
    'CONFIRMED',
    'REMOVED'
);

CREATE TYPE application_status_enum AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN'
);

CREATE TYPE invitation_status_enum AS ENUM (
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED',
    'CANCELLED'
);

CREATE TYPE notification_type_enum AS ENUM (
    'INVITE_RECEIVED',
    'INVITE_ACCEPTED',
    'INVITE_DECLINED',
    'APPLICATION_ACCEPTED',
    'APPLICATION_REJECTED',
    'TOURNAMENT_ANNOUNCEMENT',
    'TOURNAMENT_CANCELLED',
    'SYSTEM'
);

CREATE TYPE report_target_enum AS ENUM (
    'USER',
    'TEAM',
    'TOURNAMENT'
);

CREATE TYPE report_reason_enum AS ENUM (
    'FAKE_INFO',
    'MISBEHAVIOR',
    'INAPPROPRIATE_CONTENT',
    'UNDERAGE',
    'OTHER'
);

CREATE TYPE report_status_enum AS ENUM (
    'PENDING',
    'REVIEWED',
    'DISMISSED',
    'ACTION_TAKEN'
);

CREATE TYPE expiry_job_type_enum AS ENUM (
    'AVAILABILITY_EXPIRY',
    'INVITATION_EXPIRY',
    'TOURNAMENT_ARCHIVAL',
    'PII_SCRUBBING'
);

CREATE TYPE job_status_enum AS ENUM (
    'RUNNING',
    'SUCCESS',
    'FAILED'
);

CREATE TYPE support_status_enum AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);

-- ==========================================
-- 2. CORE IDENTITY & AUTHENTICATION
-- ==========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number CHAR(10) NOT NULL UNIQUE,
    pin_hash VARCHAR(255) NOT NULL,
    recovery_code_hash VARCHAR(255) NOT NULL,
    is_age_verified BOOLEAN NOT NULL DEFAULT FALSE CHECK (is_age_verified = TRUE),
    role user_role_enum NOT NULL DEFAULT 'PLAYER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INT NOT NULL DEFAULT 0 CHECK (failed_login_attempts >= 0),
    locked_until TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_active_role ON users(is_active, role);

-- ==========================================
-- 3. PLAYER PROFILES & AVAILABILITY
-- ==========================================

CREATE TABLE player_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    block bhadohi_block_enum NOT NULL,
    primary_role cricket_role_enum NOT NULL,
    batting_style VARCHAR(50) NOT NULL,
    bowling_style VARCHAR(50) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    availability_expires_at TIMESTAMPTZ NOT NULL,
    allow_whatsapp_contact BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_player_profiles_search ON player_profiles(block, primary_role, is_available);
CREATE INDEX idx_player_profiles_expiry ON player_profiles(is_available, availability_expires_at);

-- ==========================================
-- 4. TOURNAMENTS
-- ==========================================

CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    ground_location VARCHAR(150) NOT NULL,
    village VARCHAR(100) NOT NULL,
    block bhadohi_block_enum NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_open_date DATE NOT NULL,
    registration_close_date DATE NOT NULL,
    max_teams INT NOT NULL CHECK (max_teams >= 2 AND max_teams <= 64),
    min_squad_size INT NOT NULL DEFAULT 11 CHECK (min_squad_size >= 7),
    max_squad_size INT NOT NULL DEFAULT 15 CHECK (max_squad_size >= min_squad_size),
    match_format VARCHAR(50) NOT NULL, -- Informational note (e.g. "10 Overs")
    ball_type ball_type_enum NOT NULL DEFAULT 'TENNIS',
    entry_fee_note VARCHAR(255) NOT NULL, -- Informational notice only, NO in-app payment
    rules_text TEXT NOT NULL,
    disclaimer_text TEXT NOT NULL,
    status tournament_status_enum NOT NULL DEFAULT 'DRAFT',
    cancellation_reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_tour_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_tour_reg_dates CHECK (registration_close_date >= registration_open_date),
    CONSTRAINT chk_tour_start_after_reg CHECK (start_date >= registration_close_date)
);

CREATE INDEX idx_tournaments_block_status ON tournaments(block, status, start_date);
CREATE INDEX idx_tournaments_organizer ON tournaments(organizer_user_id, status);

-- ==========================================
-- 5. TEMPORARY TEAMS & SQUADS
-- ==========================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    captain_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    team_name VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    status team_status_enum NOT NULL DEFAULT 'FORMING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_team_tournament_name UNIQUE (tournament_id, team_name)
);

CREATE INDEX idx_teams_tournament ON teams(tournament_id, status);
CREATE INDEX idx_teams_captain ON teams(captain_user_id);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    player_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_role member_role_enum NOT NULL DEFAULT 'PLAYER',
    status member_status_enum NOT NULL DEFAULT 'CONFIRMED',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_team_player UNIQUE (team_id, player_user_id)
);

CREATE INDEX idx_team_members_player ON team_members(player_user_id);
CREATE INDEX idx_team_members_team ON team_members(team_id, status);

-- ==========================================
-- 6. APPLICATIONS & INVITATIONS
-- ==========================================

CREATE TABLE tournament_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    captain_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status application_status_enum NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ NULL,
    reviewed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_tournament_team_app UNIQUE (tournament_id, team_id)
);

CREATE INDEX idx_applications_tournament_status ON tournament_applications(tournament_id, status);
CREATE INDEX idx_applications_captain ON tournament_applications(captain_user_id);

CREATE TABLE player_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    inviter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    invitee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status invitation_status_enum NOT NULL DEFAULT 'PENDING',
    invited_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_invitations_invitee_status ON player_invitations(invitee_user_id, status);
CREATE INDEX idx_invitations_team ON player_invitations(team_id, status);
CREATE INDEX idx_invitations_expiry ON player_invitations(status, expires_at);

-- ==========================================
-- 7. NOTIFICATIONS
-- ==========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum NOT NULL,
    reference_id UUID NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ==========================================
-- 8. SAFETY, MODERATION & BLOCKING
-- ==========================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    target_type report_target_enum NOT NULL,
    target_id UUID NOT NULL,
    reason_category report_reason_enum NOT NULL,
    description VARCHAR(255) NULL,
    status report_status_enum NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMPTZ NULL,
    reviewed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_reports_status ON reports(status, created_at);
CREATE INDEX idx_reports_reporter ON reports(reporter_user_id, created_at);

CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_block_pair UNIQUE (blocker_user_id, blocked_user_id),
    CONSTRAINT chk_no_self_block CHECK (blocker_user_id <> blocked_user_id)
);

CREATE INDEX idx_blocks_lookup ON blocks(blocker_user_id, blocked_user_id);

-- ==========================================
-- 9. AUDITING, EXPIRY JOBS & SUPPORT
-- ==========================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NULL,
    details JSONB NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

CREATE TABLE expiry_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type expiry_job_type_enum NOT NULL,
    status job_status_enum NOT NULL,
    records_affected INT NOT NULL DEFAULT 0 CHECK (records_affected >= 0),
    error_details TEXT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_expiry_jobs_status ON expiry_jobs(job_type, status, started_at DESC);

CREATE TABLE support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    mobile_number CHAR(10) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    status support_status_enum NOT NULL DEFAULT 'OPEN',
    admin_notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_requests_status ON support_requests(status, created_at DESC);

-- ==========================================
-- 10. AUTOMATIC TIMESTAMP TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON player_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tournaments_updated_at
BEFORE UPDATE ON tournaments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_support_updated_at
BEFORE UPDATE ON support_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
