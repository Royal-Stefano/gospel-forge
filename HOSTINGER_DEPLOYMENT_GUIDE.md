# =====================================================================
# GOSPEL FORGE — HOSTINGER CLOUD STARTUP PRODUCTION DEPLOYMENT GUIDE
# =====================================================================

This guide provides the authoritative, verified deployment blueprint for **Gospel Forge** on **Hostinger Cloud Startup**, integrated with **Supabase** (PostgreSQL, Auth, RLS) and **Cloudflare R2** (lossless media streaming & storage).

---

## 1. Hosting Environment & Deployment Options

Hostinger Cloud Startup provides high-performance cloud infrastructure running on isolated containerized cloud instances powered by Google Cloud Platform. You have two supported deployment options:

### Method A: Managed Node.js Application (Recommended for hPanel)
*Best for zero-maintenance, automated SSL, and integrated control panel.*
- **Runtime:** Node.js 20 LTS
- **Build Output:** Next.js Standalone (`.next/standalone/server.js`)
- **Web Server:** Hostinger Managed Nginx / LiteSpeed reverse proxy
- **SSL:** Free Lifetime SSL certificate (Let's Encrypt / Hostinger SSL)

### Method B: Cloud VPS / Docker Compose (Root Access)
*Best if you converted your plan to Hostinger Cloud VPS for direct SSH / Docker control.*
- **OS:** Ubuntu 22.04 LTS / Debian 12
- **Runtime:** Docker Engine & Docker Compose (`docker-compose.yml`)
- **Process Manager:** PM2 Cluster (`ecosystem.config.js`)

---

## 2. Pre-Deployment Cloud Setup

### A. Supabase PostgreSQL & Auth Setup
1. Log in to [Supabase Dashboard](https://supabase.com).
2. Open **SQL Editor** and run the three version-controlled migrations in order:
   - `supabase/migrations/20261024000001_production_backend.sql` (Core schema, RLS, 12 tables)
   - `supabase/migrations/20261024000002_analytics_and_hardening.sql` (Analytics, telemetry, super-admin RLS)
   - `supabase/migrations/20261024000003_shared_rate_limits.sql` (Distributed rate limiting RPC)
3. Navigate to **Authentication → URL Configuration**:
   - **Site URL:** `https://gospelforge.com` (or your Hostinger production domain)
   - **Redirect URLs:** `https://gospelforge.com/auth/callback`
4. Copy credentials from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` *(Server-side only — never expose to client!)*

### B. Cloudflare R2 Storage Setup
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**.
2. Create bucket: `gospel-forge-media` (Standard Storage, Automatic location).
3. Open bucket **Settings → CORS Policy** and paste:
   ```json
   [
     {
       "AllowedOrigins": ["https://gospelforge.com", "http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag", "Content-Length", "Content-Range", "Accept-Ranges"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. Generate API token with **Object Read & Write** permissions:
   - Account ID → `R2_ACCOUNT_ID`
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`

---

## 3. Production Environment Variables Reference

Configure these in Hostinger hPanel **Environment Variables** or `.env.production`:

| Variable | Scope | Description | Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public | Canonical production URL | `https://gospelforge.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase API endpoint | `https://xyzproject.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase Anonymous Client Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Supabase Service Role Key | `eyJhbGciOi...` |
| `R2_ACCOUNT_ID` | **Secret** | Cloudflare Account ID | `98a123f...` |
| `R2_ACCESS_KEY_ID` | **Secret** | Cloudflare R2 Access Key | `4f32e...` |
| `R2_SECRET_ACCESS_KEY` | **Secret** | Cloudflare R2 Secret Key | `9b87c...` |
| `R2_BUCKET_NAME` | Server | R2 Bucket Name | `gospel-forge-media` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public | Public R2 or CDN stream URL | `https://media.gospelforge.com` |
| `CRON_SECRET` | **Secret** | Webhook authorization token | *32+ random hex characters* |
| `UPSTASH_REDIS_REST_URL` | Optional | Shared rate limiting endpoint | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash Redis token | `AX...` |
| `NODE_ENV` | System | Environment flag | `production` |
| `PORT` | System | Internal listening port | `3000` |

---

## 4. Method A — Deployment via Hostinger hPanel (Managed Node.js)

1. **Connect Git Repository:**
   - In hPanel, go to **Advanced → Git**.
   - Repository: `https://github.com/Royal-Stefano/gospel-forge.git`
   - Branch: `main`
   - Install directory: `/public_html` or `/gospel-forge`
2. **Configure Node.js Application:**
   - Go to **Websites → Manage → Node.js**.
   - Node.js version: **v20.x** (or highest LTS)
   - Application root: `gospel-forge`
   - Application startup file: `.next/standalone/server.js`
3. **Build the Application:**
   - Run via SSH or hPanel Terminal:
     ```bash
     npm ci --production=false
     npm run build
     ```
   - The build will automatically compile and bundle static assets into `.next/standalone`.
4. **Start Application:**
   - Click **Restart Application** in hPanel.
   - Test `https://gospelforge.com/api/health` to confirm `status: "healthy"`.

---

## 5. Method B — Deployment via Docker / VPS

If deploying to a Hostinger Cloud VPS:

```bash
# 1. Clone repository
git clone https://github.com/Royal-Stefano/gospel-forge.git /opt/gospel-forge
cd /opt/gospel-forge

# 2. Populate environment variables
cp .env.example .env
nano .env

# 3. Launch Docker Compose container
docker compose up -d --build

# 4. Verify container status & logs
docker compose ps
docker compose logs -f gospel-forge
```

### Nginx Reverse Proxy Configuration (VPS)

```nginx
server {
    server_name gospelforge.com www.gospelforge.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Audio streaming & byte-range seeking optimization
        proxy_buffering off;
        proxy_set_header Range $http_range;
        proxy_set_header If-Range $http_if_range;
        
        # Large upload tolerance (up to 500MB audio)
        client_max_body_size 520M;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/gospelforge.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gospelforge.com/privkey.pem;
}
```

---

## 6. Super Admin Bootstrap

Once the application is connected to Supabase:

1. Sign up on the production website (`/signup`) with your primary admin email: e.g. `admin@gospelforge.com`.
2. Elevate this account to `super_admin` using the secure server CLI script:
   ```bash
   node scripts/bootstrap-super-admin.mjs admin@gospelforge.com
   ```
3. *Alternative:* Run directly in Supabase **SQL Editor**:
   ```sql
   UPDATE public.profiles
   SET role = 'super_admin', artist_status = 'approved', updated_at = NOW()
   WHERE email = 'admin@gospelforge.com';
   ```

---

## 7. Scheduled Publishing & Cron Automation

### Option 1: Hostinger hPanel Cron
In hPanel → **Advanced → Cron Jobs**:
- **Frequency:** Every 15 minutes (`*/15 * * * *`)
- **Command:**
  ```bash
  curl -s -X POST https://gospelforge.com/api/cron/publish-scheduled -H "Authorization: Bearer YOUR_CRON_SECRET"
  ```

### Option 2: Daily Abandoned Upload Cleanup
- **Frequency:** Once daily at 03:00 UTC (`0 3 * * *`)
- **Command:**
  ```bash
  curl -s -X POST https://gospelforge.com/api/media/cleanup -H "Authorization: Bearer YOUR_CRON_SECRET"
  ```

---

## 8. Health Checks, Monitoring & Rollbacks

- **Live Health Endpoint:** `https://gospelforge.com/api/health`
  - Returns database status, storage configuration, Node uptime, and memory usage.
- **Rollback Procedure:**
  ```bash
  # Check git history
  git log --oneline -n 5
  
  # Roll back to previous stable commit
  git checkout <previous_commit_hash>
  npm run build
  pm2 reload ecosystem.config.js # or restart in hPanel
  ```

---

## 9. Automated Database & Media Backup Strategy

1. **Supabase PostgreSQL:**
   - Automated Daily Backups are enabled by default on Supabase.
   - Point-in-Time Recovery (PITR) is available under **Database → Backups**.
   - Optional local dump:
     ```bash
     pg_dump -h db.xyz.supabase.co -U postgres -d postgres -F c -b -v -f backup_$(date +%Y%m%d).dump
     ```
2. **Cloudflare R2 Storage:**
   - Enable **Object Versioning** in R2 Bucket Settings to safeguard against accidental deletions or overwrites.
