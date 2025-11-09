# Railway Deployment Guide - Two Services

This guide shows how to deploy the Scotland Yard game to Railway with two separate services (server + client) connecting to an external Neon database.

---

## Prerequisites

- Railway account: https://railway.app
- Neon database already created
- GitHub repository connected

---

## Architecture

```
Railway Project: mr-x-game
├── Service 1: Server (Node.js backend)
│   └── Connects to: External Neon DB
└── Service 2: Client (Vite static site)
    └── Connects to: Service 1 (server)
```

---

## Method 1: Railway Dashboard (Recommended)

### Step 1: Create Railway Project

1. Go to https://railway.app/dashboard
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose: `theofficialpopo/mr-x-game`

---

### Step 2: Configure Server Service

Railway will create one service automatically. Configure it for the server:

#### Settings → General
```
Service Name: mr-x-server
Root Directory: packages/server
```

#### Settings → Build
```
Builder: Nixpacks (default)
Build Command: (auto-detected from package.json)
Watch Paths: packages/server/**, packages/shared/**
```

#### Settings → Deploy
```
Start Command: pnpm start
```

#### Variables Tab
Add these environment variables:

```bash
# Required: Neon Database
DATABASE_URL=postgresql://your-user:your-password@your-host.neon.tech/your-db?sslmode=require

# Optional: Server Config
PORT=3001
NODE_ENV=production

# Optional: CORS (add after client deployed)
CLIENT_URL=https://your-client-url.up.railway.app
```

**Where to get DATABASE_URL:**
1. Go to Neon dashboard: https://console.neon.tech
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string
5. Make sure it includes `?sslmode=require`

#### Deploy
Click **Deploy** - Railway will:
1. Clone your repo
2. Install dependencies with pnpm
3. Build shared + server packages
4. Start the server
5. Give you a public URL like: `https://mr-x-server-production.up.railway.app`

---

### Step 3: Add Client Service

In the same Railway project:

1. Click **New** → **GitHub Repo**
2. Select same repo: `theofficialpopo/mr-x-game`
3. Click **Add Service**

#### Settings → General
```
Service Name: mr-x-client
Root Directory: packages/client
```

#### Settings → Build
```
Build Command: pnpm install && pnpm build
Watch Paths: packages/client/**, packages/shared/**
```

#### Settings → Deploy
```
Start Command: pnpm preview
```

#### Variables Tab
```bash
# Server connection
VITE_SERVER_URL=https://mr-x-server-production.up.railway.app

# Mapbox
VITE_MAPBOX_TOKEN=your-mapbox-public-token
```

**Where to get Mapbox token:**
1. Go to https://account.mapbox.com
2. Create account or log in
3. Go to "Access tokens"
4. Copy your default public token (starts with `pk.`)

#### Deploy
Railway will:
1. Build the Vite app
2. Serve static files
3. Give you a URL like: `https://mr-x-client-production.up.railway.app`

---

### Step 4: Update CORS

Go back to **Server Service** → Variables:

```bash
CLIENT_URL=https://mr-x-client-production.up.railway.app
```

This tells the server which domain to allow for CORS.

Railway will auto-redeploy the server.

---

## Method 2: Railway CLI

### Install Railway CLI

```bash
npm i -g @railway/cli
railway login
```

### Deploy Server

```bash
cd packages/server

# Link to Railway project (first time only)
railway link

# Add environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set PORT=3001
railway variables set NODE_ENV=production

# Deploy
railway up
```

### Deploy Client

```bash
cd packages/client

# Create new service in same project
railway service create mr-x-client

# Add environment variables
railway variables set VITE_SERVER_URL="https://your-server-url.railway.app"
railway variables set VITE_MAPBOX_TOKEN="pk.your-token"

# Deploy
railway up
```

---

## Verification Checklist

### Server is Running ✓
```bash
# Test server health
curl https://your-server-url.railway.app

# Should return: Cannot GET / (or similar)

# Test Socket.IO
curl https://your-server-url.railway.app/socket.io/

# Should return: {"code":0,"message":"Transport unknown"}
```

### Database Connected ✓
Check Railway logs for:
```
✅ Database schema initialized
✅ Board data loaded for game server
🚀 Server running on http://0.0.0.0:3001
```

### Client is Running ✓
```bash
# Visit client URL in browser
https://your-client-url.railway.app

# Should show: Scotland Yard lobby page
```

---

## Environment Variables Reference

### Server (Backend)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | `postgresql://user:pass@host.neon.tech/db?sslmode=require` | Neon database connection |
| `PORT` | ❌ No | `3001` | Server port (Railway auto-sets) |
| `NODE_ENV` | ❌ No | `production` | Environment mode |
| `CLIENT_URL` | ⚠️ Recommended | `https://client.railway.app` | For CORS configuration |

### Client (Frontend)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_SERVER_URL` | ✅ Yes | `https://server.railway.app` | Backend API URL |
| `VITE_MAPBOX_TOKEN` | ✅ Yes | `pk.eyJ1...` | Mapbox public token |

---

## Troubleshooting

### Server fails to start

**Check logs for:**
```
Error: DATABASE_URL is not defined
```

**Fix:** Add DATABASE_URL in Railway variables

---

### Client can't connect to server

**Check:**
1. VITE_SERVER_URL is correct
2. Server is running (check server logs)
3. CORS is configured (CLIENT_URL set on server)

**Test connection:**
```javascript
// In browser console on client page
fetch('https://your-server-url.railway.app/socket.io/')
  .then(r => console.log('Server reachable:', r.ok))
```

---

### Database connection fails

**Check:**
1. DATABASE_URL includes `?sslmode=require`
2. Neon database is not paused (happens on free tier)
3. IP whitelist in Neon (Railway IPs should be allowed)

**Fix:** Go to Neon dashboard → Settings → Compute → Resume if paused

---

### Build fails on Railway

**Check Railway build logs for:**
```
error TS6059: File is not under 'rootDir'
```

**Fix:** Already fixed in latest commit (dc56159)

**If still happening:**
```bash
git pull origin master
git push origin master --force
```

---

## Cost Estimation

### Railway Free Tier
- $5 credit/month
- Server: ~$5-10/month (always running)
- Client: ~$2-5/month (static site)

### Neon Free Tier
- Free forever
- 0.5 GB storage
- Auto-pause after inactivity
- Perfect for testing

### Mapbox Free Tier
- 50,000 free map loads/month
- More than enough for testing

**Total for testing:** FREE (within free tiers)

---

## Production Checklist

Before going live with real users:

- [ ] Add authentication (JWT)
- [ ] Add input validation (Zod schemas)
- [ ] Configure CORS properly (restrict to your domain)
- [ ] Add rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Add Redis for scaling (Socket.IO adapter)
- [ ] Set up custom domain
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Add health check endpoint
- [ ] Set up logging (structured logs)

---

## Monitoring

### Railway Logs
```bash
# View server logs
railway logs --service mr-x-server

# View client logs
railway logs --service mr-x-client

# Follow logs in real-time
railway logs --service mr-x-server --follow
```

### Neon Monitoring
- Go to Neon dashboard
- Check "Monitoring" tab for:
  - Active connections
  - Query performance
  - Database size

---

## Scaling

### Current Setup (MVP)
- ✅ Handles: 50-100 concurrent games
- ✅ Single server instance
- ✅ Neon serverless DB (auto-scales)

### For Production (>100 games)
1. Add Redis (Railway Redis addon)
2. Enable Socket.IO Redis adapter
3. Add horizontal scaling (multiple server instances)
4. Add CDN for static assets (Cloudflare)

---

## Next Steps

After successful deployment:

1. **Test the game:**
   - Create a game
   - Join from another device
   - Test reconnection (refresh browser)
   - Play a full game

2. **Monitor for errors:**
   - Check Railway logs
   - Check browser console
   - Test edge cases (disconnect, rejoin, etc.)

3. **Share for testing:**
   - Send client URL to friends
   - Get feedback
   - Fix issues from analysis reports

4. **Address security issues:**
   - See SECURITY_AUDIT_REPORT.md
   - Add input validation
   - Configure CORS properly

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Neon Docs: https://neon.tech/docs
- Project Issues: https://github.com/theofficialpopo/mr-x-game/issues
