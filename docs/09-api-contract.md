# REST API Contract Specification

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**Base URL:** `/api/v1`  
**Standard Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`
- `Accept-Language: hi` (or `en`)

---

## 1. Universal Response Envelope

All API endpoints return a standardized JSON structure.

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-10-02T17:15:00Z"
}
```

### Error Response (`400`, `401`, `403`, `404`, `429`, `500`)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "बहुत सारे प्रयास। कृपया 15 मिनट बाद पुनः प्रयास करें।",
    "details": []
  },
  "timestamp": "2026-10-02T17:15:00Z"
}
```

---

## 2. Authentication & Account Endpoints

### 2.1 Register New Account
* **Endpoint:** `POST /api/v1/auth/register`
* **Access:** Anonymous
* **Request:**
```json
{
  "mobile_number": "9876543210",
  "pin": "123456",
  "confirm_pin": "123456",
  "is_age_verified": true
}
```
* **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user_id": "8f9a2b10-c3d4-4e5f-a6b7-c8d9e0f1a2b3",
    "recovery_code": "BK92-M48Z",
    "token": "eyJhbGciOi...",
    "instructions": "कृपया इस रिकवरी कोड को सुरक्षित लिख लें। यह केवल एक बार दिखाया जाता है।"
  }
}
```

### 2.2 Login with Mobile + PIN
* **Endpoint:** `POST /api/v1/auth/login`
* **Access:** Anonymous
* **Request:**
```json
{
  "mobile_number": "9876543210",
  "pin": "123456"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": "8f9a2b10-c3d4-4e5f-a6b7-c8d9e0f1a2b3",
    "role": "PLAYER",
    "token": "eyJhbGciOi...",
    "has_profile": true
  }
}
```

### 2.3 Self-Service PIN Reset via Recovery Code
* **Endpoint:** `POST /api/v1/auth/recover-pin`
* **Access:** Anonymous
* **Request:**
```json
{
  "mobile_number": "9876543210",
  "recovery_code": "BK92-M48Z",
  "new_pin": "654321",
  "confirm_new_pin": "654321"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "new_recovery_code": "ZT44-W91K",
    "token": "eyJhbGciOi...",
    "message": "पिन सफलतापूर्वक बदल दिया गया है। यह आपका नया रिकवरी कोड है।"
  }
}
```

---

## 3. Player Profiles & Discovery Endpoints

### 3.1 Get / Update My Profile
* **Endpoint:** `GET /api/v1/profiles/me` | `PUT /api/v1/profiles/me`
* **Access:** Authenticated (`PLAYER`, `CAPTAIN`)
* **Request (PUT):**
```json
{
  "full_name": "अमित सिंह",
  "village": "गोपीगंज",
  "block": "GYANPUR",
  "primary_role": "ALL_ROUNDER",
  "batting_style": "दाएं हाथ",
  "bowling_style": "दाएं हाथ मध्यम तेज",
  "allow_whatsapp_contact": true
}
```

### 3.2 Update Availability Window
* **Endpoint:** `PATCH /api/v1/profiles/me/availability`
* **Access:** Authenticated
* **Request:**
```json
{
  "is_available": true,
  "duration_days": 15
}
```

### 3.3 Search Available Players
* **Endpoint:** `GET /api/v1/players?block=GYANPUR&role=BOWLER&available_only=true`
* **Access:** Authenticated (`CAPTAIN`)
* **Response:**
```json
{
  "success": true,
  "data": [
    {
      "player_id": "7a8b9c...",
      "full_name": "विकास यादव",
      "village": "जंगीगंज",
      "block": "DEEGH",
      "primary_role": "BOWLER",
      "batting_style": "दाएं हाथ",
      "bowling_style": "दाएं हाथ तेज",
      "is_available": true,
      "allow_whatsapp_contact": true
    }
  ]
}
```

---

## 4. Tournament Management Endpoints

### 4.1 Browse Tournaments
* **Endpoint:** `GET /api/v1/tournaments?block=AURAI&status=PUBLISHED`
* **Access:** Public / Authenticated

### 4.2 Create Tournament (Wizard Draft / Publish)
* **Endpoint:** `POST /api/v1/tournaments`
* **Access:** Authenticated (`ORGANIZER`, `ADMIN`)
* **Request:**
```json
{
  "title": "औराई प्रीमियर कप 2026",
  "ground_location": "इंटर कॉलेज ग्राउंड, औराई",
  "village": "औराई खास",
  "block": "AURAI",
  "start_date": "2026-11-10",
  "end_date": "2026-11-15",
  "registration_open_date": "2026-10-05",
  "registration_close_date": "2026-11-05",
  "max_teams": 16,
  "min_squad_size": 11,
  "max_squad_size": 15,
  "match_format": "12 Overs",
  "ball_type": "TENNIS",
  "entry_fee_note": "₹600 प्रति टीम (मैदान पर नकद)",
  "rules_text": "सभी खिलाड़ियों को आधार कार्ड लाना अनिवार्य है। 18 वर्ष से कम आयु मान्य नहीं।",
  "disclaimer_text": "आयोजन समिति मैदान और अंपायरिंग का अंतिम निर्णय लेगी।",
  "status": "PUBLISHED"
}
```

### 4.3 Cancel Tournament
* **Endpoint:** `POST /api/v1/tournaments/:id/cancel`
* **Access:** Tournament Owner (`ORGANIZER`)
* **Request:**
```json
{
  "cancellation_reason": "लगातार भारी बारिश के कारण मैदान अनुपयोगी हो गया है।"
}
```

---

## 5. Team Formation & Invitations

### 5.1 Create Temporary Team
* **Endpoint:** `POST /api/v1/tournaments/:tournamentId/teams`
* **Access:** Authenticated (`PLAYER` -> becomes `CAPTAIN`)
* **Request:**
```json
{
  "team_name": "ज्ञानपुर स्ट्राइकर्स",
  "village": "ज्ञानपुर"
}
```

### 5.2 Send Squad Invitation
* **Endpoint:** `POST /api/v1/teams/:teamId/invitations`
* **Access:** Team Owner (`CAPTAIN`)
* **Request:**
```json
{
  "invitee_user_id": "7a8b9c..."
}
```

### 5.3 Respond to Invitation
* **Endpoint:** `POST /api/v1/invitations/:id/respond`
* **Access:** Invitee (`PLAYER`)
* **Request:**
```json
{
  "action": "ACCEPT" // or "DECLINE"
}
```

---

## 6. Tournament Applications

### 6.1 Submit Team Application
* **Endpoint:** `POST /api/v1/tournaments/:tournamentId/applications`
* **Access:** Team Owner (`CAPTAIN`)
* **Request:**
```json
{
  "team_id": "3f4a5b..."
}
```

### 6.2 Review Application (Accept / Reject)
* **Endpoint:** `PATCH /api/v1/applications/:id/review`
* **Access:** Tournament Owner (`ORGANIZER`)
* **Request:**
```json
{
  "status": "ACCEPTED", // or "REJECTED"
  "rejection_reason": null
}
```

---

## 7. Safety, Moderation & Blocking

### 7.1 Submit Safety Report
* **Endpoint:** `POST /api/v1/reports`
* **Access:** Authenticated
* **Request:**
```json
{
  "target_type": "USER",
  "target_id": "7a8b9c...",
  "reason_category": "MISBEHAVIOR",
  "description": "खिलाड़ी बार-बार अनुचित संदेश भेज रहा है।"
}
```

### 7.2 Block User
* **Endpoint:** `POST /api/v1/blocks`
* **Access:** Authenticated
* **Request:**
```json
{
  "blocked_user_id": "7a8b9c..."
}
```

---

## 8. Scheduled Expiry Endpoints (Internal / Admin)

* **Endpoint:** `POST /api/v1/internal/jobs/run-expiry`
* **Access:** System Secret / `ADMIN`
* **Description:** Executes nightly availability expiry, invitation timeout, and 90-day post-tournament PII scrubbing.
