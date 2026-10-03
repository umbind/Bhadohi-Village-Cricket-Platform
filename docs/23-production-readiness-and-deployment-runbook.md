# Production Readiness & Deployment Runbook

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**Production Target:** Cloud / VPS Cluster (Mumbai Region / Local Data Center)  
**Target Availability:** 99.5% Uptime  
**RPO (Recovery Point Objective):** < 15 minutes  
**RTO (Recovery Time Objective):** < 60 minutes  

---

## 1. System Architecture Overview

```mermaid
flowchart TD
    Client1[Mobile Clients - Flutter] --> Cloudflare[Cloudflare CDN & DDoS Protection]
    Client2[Desktop Dashboard - Next.js] --> Cloudflare
    Cloudflare --> Nginx[Nginx Reverse Proxy & SSL Termination]
    Nginx --> NodeCluster[Node.js Express Cluster - PM2 / Docker]
    NodeCluster --> PG[(PostgreSQL 16 Primary)]
    PG -. WAL Streaming .-> Standby[(PostgreSQL Read Standby / Backup)]
    Cron[Systemd Cron Runner] --> |Nightly 02:00 IST| NodeCluster
```

---

## 2. Environment Configuration Matrix

The following environment variables must be configured in `/etc/bvcp/production.env` (permissions `0600`, owned by `bvcp` service user):

| Variable | Recommended Production Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enforces production mode, suppresses stack traces |
| `PORT` | `3000` | Internal listening port |
| `DATABASE_URL` | `postgresql://bvcp_app:SECRET@db.internal:5432/bvcp_prod?sslmode=require` | TLS encrypted PostgreSQL connection |
| `JWT_SECRET` | 64-character random hex string | HMAC secret for session authentication tokens |
| `JWT_EXPIRES_IN` | `7d` | Token validity duration |
| `CORS_ORIGINS` | `https://dashboard.bvcp.org,https://api.bvcp.org` | Strict CORS origin whitelist |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 mins) | Sliding rate limit window |
| `RATE_LIMIT_MAX` | `100` | Max requests per IP per window |

---

## 3. Database Hardening & Maintenance

### 3.1 Connection Pooling
- Deploy **PgBouncer** in transaction pooling mode between Node.js cluster and PostgreSQL.
- Pool sizing: `max_client_conn = 1000`, `default_pool_size = 25`.

### 3.2 Continuous WAL Archiving & Backups
```bash
# Automated Daily Backup Script (/opt/bvcp/scripts/db-backup.sh)
#!/bin/bash
set -e
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/bvcp"
mkdir -p "$BACKUP_DIR"

pg_dump -Fc -U bvcp_backup -d bvcp_prod > "$BACKUP_DIR/bvcp_prod_$TIMESTAMP.dump"
gzip -9 "$BACKUP_DIR/bvcp_prod_$TIMESTAMP.dump"

# Retain 30 daily backups locally; sync to remote encrypted object store
find "$BACKUP_DIR" -name "*.dump.gz" -mtime +30 -delete
```

---

## 4. Scheduled Background Sweeps (Nightly Cron)

Systemd timer triggers the maintenance runner every night at 02:00 IST:

```ini
# /etc/systemd/system/bvcp-nightly.service
[Unit]
Description=BVCP Nightly Maintenance and Expiry Sweeps
After=network.target

[Service]
Type=oneshot
User=bvcp
WorkingDirectory=/opt/bvcp/apps/server
ExecStart=/usr/bin/node dist/jobs/expiry.job.js
StandardOutput=append:/var/log/bvcp/nightly-sweeps.log
StandardError=append:/var/log/bvcp/nightly-sweeps-error.log

# /etc/systemd/system/bvcp-nightly.timer
[Unit]
Description=Run BVCP Nightly Sweeps at 02:00 IST

[Timer]
OnCalendar=*-*-* 02:00:00 Asia/Kolkata
Persistent=true

[Install]
WantedBy=timers.target
```

---

## 5. Security Checklist Prior to Public Go-Live

- [x] **Zero OTP:** Confirmed zero reliance on third-party SMS or Email OTP gateways.
- [x] **Zero Vanity Stats:** Confirmed zero runs, wickets, strike rates, bowling averages, or MVP calculations.
- [x] **Zero Payments:** Confirmed zero in-app wallets, payment gateways, or banking integrations.
- [x] **PII Masking:** Verified all public scouting endpoints omit phone numbers and hashes.
- [x] **Brute-Force Lockout:** Verified 5-attempt limit with 15-minute lockout is active.
- [x] **SSL/TLS 1.3:** Enforced via Nginx with HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains`).
- [x] **Helmet Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy`.

---

## 6. Incident Response & Rollback Procedures

### 6.1 Service Health Check
```bash
curl -f -s https://api.bvcp.org/health | jq .
# Expected output:
# { "status": "UP", "service": "bvcp-api-server", "district": "Bhadohi, Uttar Pradesh" }
```

### 6.2 Zero-Downtime Rollback
```bash
# Rollback PM2 deployment to previous release
cd /opt/bvcp
git checkout HEAD^
npm install --production
pm2 reload ecosystem.config.js --update-env
```
