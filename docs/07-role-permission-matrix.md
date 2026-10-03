# Role-Permission Matrix

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**Authorization Pattern:** Role-Based Access Control (RBAC) + Attribute-Based Access Control (ABAC - Resource Ownership)  

---

## 1. Roles Defined

1. **Anonymous / Visitor (`GUEST`):** Unauthenticated visitor. Can view public tournament listings and basic details.
2. **Registered Player (`PLAYER`):** Authenticated user with a player profile.
3. **Team Captain (`CAPTAIN`):** Authenticated player who is the creator/owner of a specific temporary team.
4. **Tournament Organizer (`ORGANIZER`):** Authenticated user with verified permissions to manage tournaments.
5. **Platform Administrator (`ADMIN`):** Privileged system operator responsible for safety, moderation, audits, and account recovery.

---

## 2. Granular Permissions Matrix

| Resource & Operation | GUEST | PLAYER | CAPTAIN (Owner) | ORGANIZER (Owner) | ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|
| **Authentication & Profile** | | | | | |
| Register Account (Mobile + PIN) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Login (Mobile + PIN) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Recover PIN via Recovery Code | ✅ | ❌ | ❌ | ❌ | ❌ |
| Admin-Assisted PIN Reset | ❌ | ❌ | ❌ | ❌ | ✅ (Audited) |
| View Own Player Profile | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Player Profile | ❌ | ✅ | ✅ | ✅ | ❌ |
| Edit Other's Player Profile | ❌ | ❌ | ❌ | ❌ | ❌ |
| Toggle Own Availability | ❌ | ✅ | ✅ | ✅ | ❌ |
| Delete Own Account | ❌ | ❌ | ✅ (Self) | ✅ (Self) | ✅ (Force) |
| **Tournaments** | | | | | |
| View Published Tournaments List | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Tournament Circular Details | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Draft Tournament | ❌ | ❌ | ❌ | ✅ | ✅ |
| Edit Own Tournament | ❌ | ❌ | ❌ | ✅ (Own Only) | ✅ |
| Edit Other's Tournament | ❌ | ❌ | ❌ | ❌ | ❌ |
| Publish Tournament | ❌ | ❌ | ❌ | ✅ (Own Only) | ✅ |
| Cancel Own Tournament | ❌ | ❌ | ❌ | ✅ (Own Only) | ✅ |
| Broadcast Announcement | ❌ | ❌ | ❌ | ✅ (Own Only) | ✅ |
| **Teams & Squads** | | | | | |
| Create Temporary Team | ❌ | ✅ | ✅ | ❌ | ❌ |
| Edit Own Team Details | ❌ | ❌ | ✅ (Own Only) | ❌ | ❌ |
| Edit Other's Team | ❌ | ❌ | ❌ | ❌ | ❌ |
| Search Available Players | ❌ | ❌ | ✅ | ❌ | ✅ |
| View Team Roster (Summary) | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Team Private Roster | ❌ | ❌ | ✅ (Own Only) | ✅ (Applied Tour) | ✅ |
| **Invitations** | | | | | |
| Send Squad Invitation | ❌ | ❌ | ✅ (Own Team) | ❌ | ❌ |
| Cancel Sent Invitation | ❌ | ❌ | ✅ (Own Team) | ❌ | ❌ |
| View Received Invitations | ❌ | ✅ (Own Only) | ✅ (Own Only) | ❌ | ❌ |
| Accept / Decline Invitation | ❌ | ✅ (Invited) | ✅ (Invited) | ❌ | ❌ |
| **Tournament Applications** | | | | | |
| Submit Team Application | ❌ | ❌ | ✅ (Own Team) | ❌ | ❌ |
| Withdraw Application | ❌ | ❌ | ✅ (Own Team) | ❌ | ❌ |
| Review Team Applications | ❌ | ❌ | ❌ | ✅ (Own Tour) | ✅ |
| Accept / Reject Application | ❌ | ❌ | ❌ | ✅ (Own Tour) | ✅ |
| **Safety, Moderation & Audit** | | | | | |
| Report Content / User | ❌ | ✅ | ✅ | ✅ | ✅ |
| Block / Unblock User | ❌ | ✅ | ✅ | ✅ | ❌ |
| View Moderation Reports Queue | ❌ | ❌ | ❌ | ❌ | ✅ |
| Resolve Moderation Report | ❌ | ❌ | ❌ | ❌ | ✅ |
| Suspend User Account | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Immutable Audit Logs | ❌ | ❌ | ❌ | ❌ | ✅ |
| Trigger Archival / Expiry Job | ❌ | ❌ | ❌ | ❌ | ✅ (Cron) |

---

## 3. Server-Side Enforcement Rules

1. **Deny by Default:** Any endpoint not explicitly matched to a permitted role must return `403 Forbidden`.
2. **Resource Ownership Checks (ABAC):**
   - For all `PATCH` / `PUT` / `DELETE` requests on teams: `team.captain_user_id == current_user.id`.
   - For all `PATCH` / `PUT` / `DELETE` requests on tournaments: `tournament.organizer_user_id == current_user.id`.
   - For profile updates: `profile.user_id == current_user.id`.
3. **Auditing Privileged Invocations:** Every operation executed with `ADMIN` privileges automatically creates an immutable row in the `AuditLog` table containing actor ID, target entity, action, timestamp, and IP address.
