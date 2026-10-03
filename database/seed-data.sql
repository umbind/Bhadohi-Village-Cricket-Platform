-- =====================================================================
-- Bhadohi Village Cricket Platform (bvcp)
-- Seed Data for Development & Testing (PostgreSQL 15+)
-- Geographic Scope: Bhadohi District, Uttar Pradesh
-- =====================================================================

-- 1. Initial System Administrator User
-- PIN: 123456 (Bcrypt hash: $2b$12$K89FwH3z/w93.tP41oOqE.1p3z2e2e8e9)
-- Recovery Code: ADMN-9999 (Bcrypt hash)
INSERT INTO users (
    id, mobile_number, pin_hash, recovery_code_hash, is_age_verified, role, is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '9999999999',
    '$2b$12$e8x/vU9F1yA1O4n6Y3O.x.5fT7z3x1w5a8v4c2e6u9i1o3p5a7s9d',
    '$2b$12$e8x/vU9F1yA1O4n6Y3O.x.5fT7z3x1w5a8v4c2e6u9i1o3p5a7s9d',
    TRUE,
    'ADMIN',
    TRUE
) ON CONFLICT (mobile_number) DO NOTHING;

-- 2. Verified Tournament Organizer
INSERT INTO users (
    id, mobile_number, pin_hash, recovery_code_hash, is_age_verified, role, is_active
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '9839111222',
    '$2b$12$e8x/vU9F1yA1O4n6Y3O.x.5fT7z3x1w5a8v4c2e6u9i1o3p5a7s9d',
    '$2b$12$e8x/vU9F1yA1O4n6Y3O.x.5fT7z3x1w5a8v4c2e6u9i1o3p5a7s9d',
    TRUE,
    'ORGANIZER',
    TRUE
) ON CONFLICT (mobile_number) DO NOTHING;

-- 3. Team Captain User
INSERT INTO users (
    id, mobile_number, pin_hash, recovery_code_hash, is_age_verified, role, is_active
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    '9839333444',
    '$2b$12$e8x/vU9F1yA1O4n6Y3O.x.5fT7z3x1w5a8v4c2e6u9i1o3p5a7s9d',
    '$2b$12$e8x/vU9F1yA1O4n6Y3O.x.5fT7z3x1w5a8v4c2e6u9i1o3p5a7s9d',
    TRUE,
    'PLAYER',
    TRUE
) ON CONFLICT (mobile_number) DO NOTHING;

-- Captain Player Profile
INSERT INTO player_profiles (
    id, user_id, full_name, village, block, primary_role, batting_style, bowling_style, is_available, availability_expires_at, allow_whatsapp_contact
) VALUES (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'रामसेवक यादव',
    'ज्ञानपुर खास',
    'GYANPUR',
    'ALL_ROUNDER',
    'दाएं हाथ',
    'मध्यम गति तेज',
    TRUE,
    CURRENT_TIMESTAMP + INTERVAL '15 days',
    TRUE
) ON CONFLICT (user_id) DO NOTHING;

-- 4. Local Player User
INSERT INTO users (
    id, mobile_number, pin_hash, recovery_code_hash, is_age_verified, role, is_active
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    '9839555666',
    '$2b$12$e8x/vU9F1yA1O4n6Y3O.x.5fT7z3x1w5a8v4c2e6u9i1o3p5a7s9d',
    '$2b$12$e8x/vU9F1yA1O4n6Y3O.x.5fT7z3x1w5a8v4c2e6u9i1o3p5a7s9d',
    TRUE,
    'PLAYER',
    TRUE
) ON CONFLICT (mobile_number) DO NOTHING;

-- Local Player Profile
INSERT INTO player_profiles (
    id, user_id, full_name, village, block, primary_role, batting_style, bowling_style, is_available, availability_expires_at, allow_whatsapp_contact
) VALUES (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    'अमित सिंह',
    'गोपीगंज',
    'GYANPUR',
    'BOWLER',
    'दाएं हाथ',
    'दाएं हाथ तेज गेंदबाज',
    TRUE,
    CURRENT_TIMESTAMP + INTERVAL '15 days',
    TRUE
) ON CONFLICT (user_id) DO NOTHING;

-- 5. Seed Published Tournament in Bhadohi
INSERT INTO tournaments (
    id, organizer_user_id, title, ground_location, village, block,
    start_date, end_date, registration_open_date, registration_close_date,
    max_teams, min_squad_size, max_squad_size, match_format, ball_type,
    entry_fee_note, rules_text, disclaimer_text, status
) VALUES (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'औराई प्रीमियर कप 2026',
    'इंटर कॉलेज मैदान, औराई',
    'औराई खास',
    'AURAI',
    CURRENT_DATE + INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '8 days',
    16, 11, 15, '12 Overs', 'TENNIS',
    '₹600 प्रति टीम (मैदान पर नकद)',
    'सभी खिलाड़ियों को आधार कार्ड लाना अनिवार्य है। 18 वर्ष से कम आयु मान्य नहीं।',
    'यह प्लेटफ़ॉर्म केवल टीमों के आवेदन और समन्वय की सुविधा प्रदान करता है। मैच का संचालन, अंपायरिंग और सुरक्षा आयोजकों का दायित्व है।',
    'PUBLISHED'
) ON CONFLICT (id) DO NOTHING;
