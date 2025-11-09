# Scotland Yard Web Game - Complete Action Plan

**Last Updated:** November 9, 2025
**Project Status:** 85% Complete - Production-ready with critical fixes needed
**Target Users:** Europe/Germany

---

## 📊 Quick Status Overview

| Category | Status | Priority | Estimated Time |
|----------|--------|----------|----------------|
| **Security Fixes** | 🔴 0/6 | CRITICAL | 2-3 hours |
| **Code Quality** | 🟡 0/8 | HIGH | 8-12 hours |
| **Deployment (Hetzner)** | 🟢 0/7 | HIGH | 2-3 hours |
| **Performance & Scaling** | 🟡 0/4 | MEDIUM | 6-8 hours |
| **Testing & Monitoring** | 🔴 0/5 | HIGH | 8-10 hours |
| **Polish & Features** | 🟢 0/6 | LOW | 12-16 hours |

**Total Estimated Time to Production-Ready:** 30-40 hours

---

## 🔴 GROUP 1: CRITICAL SECURITY FIXES (PRIORITY 1)

**Must complete before public release**
**Estimated Time:** 2-3 hours
**Risk Level:** HIGH - Current vulnerabilities allow unauthorized access

### Security Issues to Fix

- [ ] **1.1 Fix CORS Vulnerability** (15 min)
  - **Issue:** Server accepts requests from ANY origin
  - **Location:** `packages/server/src/index.ts:15`
  - **Current Code:**
    ```typescript
    app.use(cors());
    ```
  - **Fix Required:**
    ```typescript
    app.use(cors({
      origin: process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    }));
    ```
  - **Impact:** Prevents unauthorized cross-origin API access
  - **Reference:** SECURITY_AUDIT_REPORT.md (CVSS 8.1)

- [ ] **1.2 Add Security Headers (helmet)** (30 min)
  - **Issue:** Missing CSP, HSTS, X-Frame-Options headers
  - **Location:** `packages/server/src/index.ts`
  - **Install:** `pnpm add helmet --filter server`
  - **Implementation:**
    ```typescript
    import helmet from 'helmet';

    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", "https://api.mapbox.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://api.mapbox.com"],
          scriptSrc: ["'self'", "https://api.mapbox.com"],
          imgSrc: ["'self'", "data:", "https://*.mapbox.com"],
          workerSrc: ["'self'", "blob:"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));
    ```
  - **Impact:** Protects against XSS, clickjacking, MITM attacks

- [ ] **1.3 Add Rate Limiting** (30 min)
  - **Issue:** No rate limiting on WebSocket or HTTP endpoints
  - **Location:** `packages/server/src/index.ts`
  - **Install:** `pnpm add express-rate-limit --filter server`
  - **Implementation:**
    ```typescript
    import rateLimit from 'express-rate-limit';

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests, please try again later'
    });

    app.use('/api/', limiter);
    app.use('/health', rateLimit({ windowMs: 60000, max: 10 }));
    ```
  - **Impact:** Prevents DoS attacks, API abuse

- [ ] **1.4 Add Input Validation with Zod** (45 min)
  - **Issue:** Player names and game IDs not sanitized (XSS risk)
  - **Locations:**
    - `packages/server/src/socket/server.ts` (lobby:create, lobby:join)
    - `packages/server/src/game/GameRoom.ts` (addPlayer)
  - **Implementation:**
    ```typescript
    import { z } from 'zod';

    const playerNameSchema = z.string()
      .min(1, 'Name required')
      .max(50, 'Name too long')
      .regex(/^[a-zA-Z0-9\s_-]+$/, 'Invalid characters in name');

    const gameIdSchema = z.string()
      .length(6, 'Game ID must be 6 characters')
      .regex(/^[a-f0-9]{6}$/, 'Invalid game ID format');

    // In socket handlers:
    socket.on('lobby:create', async (playerName, playerUUID, callback) => {
      try {
        const validatedName = playerNameSchema.parse(playerName);
        // ... rest of handler
      } catch (error) {
        callback({ success: false, error: 'Invalid player name' });
      }
    });
    ```
  - **Impact:** Prevents XSS attacks, SQL injection via names

- [ ] **1.5 Remove Debug Logging** (30 min)
  - **Issue:** 122 console.log statements in production code
  - **Action:**
    - Search all files for `console.log`
    - Remove or replace with proper logging
    - Add environment-based logging
  - **Files to Check:**
    - `packages/server/src/socket/server.ts`
    - `packages/server/src/game/GameRoom.ts`
    - `packages/client/src/components/**/*.tsx`
  - **Implementation:**
    ```typescript
    // Replace console.log with conditional logging
    const log = process.env.NODE_ENV === 'development' ? console.log : () => {};
    ```
  - **Impact:** Cleaner logs, no sensitive data leakage

- [ ] **1.6 Environment Variable Validation** (15 min)
  - **Issue:** No validation that required env vars are set
  - **Location:** `packages/server/src/index.ts` (startup)
  - **Implementation:**
    ```typescript
    import { z } from 'zod';

    const envSchema = z.object({
      DATABASE_URL: z.string().url(),
      PORT: z.string().default('3001'),
      NODE_ENV: z.enum(['development', 'production', 'test']),
      CLIENT_URL: z.string().url()
    });

    const env = envSchema.parse(process.env);
    ```
  - **Impact:** Fail fast on misconfiguration

---

## 🟡 GROUP 2: CODE QUALITY IMPROVEMENTS (PRIORITY 2)

**Technical debt and maintainability**
**Estimated Time:** 8-12 hours
**Risk Level:** MEDIUM - Won't break production but affects maintainability

### Code Issues to Fix

- [ ] **2.1 Fix React Hook Dependency Array Bug** (5 min) ⚠️ **CRITICAL BUG**
  - **Issue:** Missing dependencies causes stale UI state
  - **Location:** `packages/client/src/components/Board/GameBoard.tsx:59`
  - **Current Code:**
    ```typescript
    useEffect(() => {
      // ... uses validMoves, players, isRevealed
      setHighlightedStations(combined);
    }, [currentPlayerIndex, phase, round, players.length]); // ❌ WRONG
    ```
  - **Fix:**
    ```typescript
    }, [currentPlayerIndex, phase, round, players, validMoves, isRevealed]); // ✅ CORRECT
    ```
  - **Impact:** Player positions update correctly when they change
  - **Reference:** COMPREHENSIVE_ANALYSIS (verified bug)

- [ ] **2.2 Remove Unused Dependencies** (15 min)
  - **Issue:** 2-3 MB wasted in production bundle
  - **Location:** `packages/client/package.json`
  - **Dependencies to Remove:**
    - `framer-motion` (0 imports found)
    - `lucide-react` (0 imports found)
  - **Action:**
    ```bash
    pnpm remove framer-motion lucide-react --filter client
    pnpm build:client  # Verify build still works
    ```
  - **Impact:** Smaller bundle size, faster load times

- [ ] **2.3 Refactor GameRoom God Object** (4-6 hours)
  - **Issue:** GameRoom.ts has too many responsibilities (500 lines)
  - **Location:** `packages/server/src/game/GameRoom.ts`
  - **Current Responsibilities:**
    - Database operations
    - Game logic
    - Player management
    - Validation
    - State management
  - **Refactoring Plan:**
    ```
    GameRoom.ts (core game state)
    ├── GameRepository.ts (database operations)
    ├── GameValidator.ts (move validation)
    ├── PlayerService.ts (player CRUD - already exists, use more)
    └── WinConditionChecker.ts (win detection logic)
    ```
  - **Benefits:** Better testability, easier to maintain, clearer separation

- [ ] **2.4 Extract Duplicated Broadcast Logic** (30 min)
  - **Issue:** Game state broadcast logic repeated 3 times
  - **Locations:**
    - `packages/server/src/socket/server.ts:255-265`
    - `packages/server/src/socket/server.ts:318-325`
    - `packages/server/src/socket/server.ts:383-393`
  - **Implementation:**
    ```typescript
    // Create helper function
    async function broadcastGameState(gameRoom: GameRoom, io: Server, gameId: string) {
      const sockets = await io.in(gameId).fetchSockets();
      for (const s of sockets) {
        const clientState = await gameRoom.getClientGameState(s.id);
        if (clientState) {
          s.emit('game:state', clientState);
        }
      }
    }

    // Replace all 3 occurrences with:
    await broadcastGameState(gameRoom, io, gameId);
    ```

- [ ] **2.5 Refactor Large Lobby Component** (3-4 hours)
  - **Issue:** Lobby.tsx is 466 lines with multiple responsibilities
  - **Location:** `packages/client/src/components/GameUI/Lobby.tsx`
  - **Split Into:**
    ```
    Lobby.tsx (main container)
    ├── LobbyMenu.tsx (create/join decision)
    ├── LobbyCreate.tsx (create game flow)
    ├── LobbyJoin.tsx (join game flow)
    └── LobbyWaiting.tsx (waiting room with player list)
    ```
  - **Benefits:** Easier to test, better code organization

- [ ] **2.6 Fix innerHTML XSS Risk** (5 min)
  - **Issue:** Using innerHTML for player markers (low risk but bad practice)
  - **Location:** `packages/client/src/components/Board/MapboxBoard.tsx:335`
  - **Current Code:**
    ```typescript
    el.innerHTML = player.role === 'mr-x' ? '❓' : '🔍';
    ```
  - **Fix:**
    ```typescript
    el.textContent = player.role === 'mr-x' ? '❓' : '🔍';
    ```
  - **Impact:** Safer code, eliminates XSS vector

- [ ] **2.7 Add TypeScript Types for Database Results** (1-2 hours)
  - **Issue:** 31 occurrences of `any` type in database code
  - **Locations:**
    - `packages/server/src/config/database.ts:31, 62, 116`
    - `packages/server/src/game/GameRoom.ts:293, 329, 338`
  - **Implementation:**
    ```typescript
    // Create types/database.ts
    interface DBGame {
      id: string;
      phase: 'waiting' | 'playing' | 'finished';
      current_player_index: number;
      round: number;
      mr_x_last_revealed_position: number | null;
      winner: 'mr-x' | 'detectives' | null;
      created_at: Date;
      updated_at: Date;
    }

    interface DBPlayer {
      id: string;
      player_uuid: string;
      game_id: string;
      name: string;
      role: 'mr-x' | 'detective';
      position: number;
      is_host: boolean;
      is_ready: boolean;
      is_stuck: boolean;
      tickets: Record<string, number>;
      player_order: number;
      created_at: Date;
    }

    // Use in queries:
    const result = await sql<DBGame[]>`SELECT * FROM games WHERE id = ${gameId}`;
    ```

- [ ] **2.8 Add ESLint Rule to Prevent Future Issues** (15 min)
  - **Location:** `packages/client/.eslintrc.cjs`
  - **Add Rules:**
    ```javascript
    module.exports = {
      rules: {
        'react-hooks/exhaustive-deps': 'error', // Catches missing dependencies
        'no-console': 'warn', // Warns on console.log
        '@typescript-eslint/no-explicit-any': 'error', // Prevents any type
      }
    }
    ```

---

## 💰 GROUP 3: DEPLOYMENT MIGRATION TO HETZNER (PRIORITY 2)

**Switch from Railway (US) to Hetzner (Germany) for EU users**
**Estimated Time:** 2-3 hours (one-time setup)
**Cost Savings:** ~$120-180/year
**Performance Gain:** 150ms → 15ms latency (10x faster)

### Migration Steps

- [ ] **3.1 Create Hetzner Account & Server** (30 min)
  - **Action:**
    1. Sign up at https://www.hetzner.com/cloud
    2. Create new project: "mr-x-game-production"
    3. Create server:
       - **Location:** Falkenstein, Germany (or Nuremberg)
       - **Type:** CX22 (2 vCPU, 4GB RAM, 40GB SSD)
       - **Cost:** €3.79/month
       - **OS:** Ubuntu 22.04 LTS
    4. Note the server IP address
  - **Documentation:** Save login credentials securely

- [ ] **3.2 Set Up Neon PostgreSQL (Frankfurt)** (20 min)
  - **Action:**
    1. Go to https://neon.tech
    2. Create new project in **Frankfurt** region (EU)
    3. Get connection string
    4. Test connection: `psql "postgresql://..."`
    5. Run migrations:
       ```bash
       # Copy schema from existing DB or run migration script
       psql $DATABASE_URL < packages/server/src/db/schema.sql
       ```
  - **Free Tier Limits:** 0.5GB storage, sufficient for 10,000+ games
  - **Backup Current DB:** Export from Railway before switching

- [ ] **3.3 Install Docker on Hetzner Server** (15 min)
  - **SSH into server:**
    ```bash
    ssh root@YOUR_SERVER_IP
    ```
  - **Install Docker:**
    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    docker --version  # Verify installation
    ```

- [ ] **3.4 Deploy Application with Docker** (30 min)
  - **On Hetzner server:**
    ```bash
    # Clone repository
    git clone https://github.com/theofficialpopo/mr-x-game.git
    cd mr-x-game

    # Create .env file
    cat > .env << 'EOF'
    NODE_ENV=production
    PORT=3001
    CLIENT_URL=https://yourdomain.com
    DATABASE_URL=postgresql://...  # Neon Frankfurt connection string
    VITE_SERVER_URL=https://yourdomain.com
    VITE_MAPBOX_ACCESS_TOKEN=your_token_here
    EOF

    # Build and run
    docker build -t mr-x-game .
    docker run -d \
      --name mr-x-game \
      -p 80:3001 \
      --env-file .env \
      --restart unless-stopped \
      mr-x-game

    # Check logs
    docker logs -f mr-x-game
    ```

- [ ] **3.5 Set Up SSL with Caddy** (30 min)
  - **Install Caddy (reverse proxy with automatic HTTPS):**
    ```bash
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update
    apt install caddy
    ```
  - **Configure Caddy:**
    ```bash
    cat > /etc/caddy/Caddyfile << 'EOF'
    yourdomain.com {
      reverse_proxy localhost:3001
      encode gzip
    }
    EOF

    systemctl restart caddy
    ```
  - **Caddy automatically gets Let's Encrypt SSL certificate!**

- [ ] **3.6 Point DNS to Hetzner** (15 min)
  - **Update DNS A record:**
    - Go to your domain registrar
    - Set A record: `yourdomain.com` → `YOUR_HETZNER_IP`
    - Wait 5-60 minutes for propagation
  - **Verify:**
    ```bash
    dig yourdomain.com  # Should show Hetzner IP
    curl https://yourdomain.com/health  # Should return {"status":"ok"}
    ```

- [ ] **3.7 Test & Keep Railway Backup** (30 min)
  - **Testing Checklist:**
    - [ ] Homepage loads correctly
    - [ ] Can create new game
    - [ ] Can join game via code
    - [ ] WebSocket connection works
    - [ ] Can make moves
    - [ ] Database persists data
    - [ ] SSL certificate valid (https://)
  - **Keep Railway running for 1 week as backup**
  - **Monitor Hetzner logs:**
    ```bash
    docker logs -f mr-x-game
    ```

### Cost Comparison

| Service | Railway (Current) | Hetzner (New) |
|---------|------------------|---------------|
| Server | $15-20/month | €3.79/month ($4) |
| Database | Included | Free (Neon) |
| SSL | Included | Free (Let's Encrypt) |
| **Total** | **$15-20/month** | **€3.79/month (~$4)** |
| **Annual** | **$180-240** | **€45.48 (~$50)** |
| **Savings** | - | **$130-190/year** |

**Latency Improvement:**
- Railway (US): ~150-200ms from Germany
- Hetzner (Germany): ~15-20ms from Germany
- **10x faster for your target users!**

---

## 🚀 GROUP 4: PERFORMANCE & SCALABILITY (PRIORITY 3)

**Handle growth beyond 100-200 concurrent games**
**Estimated Time:** 6-8 hours
**Current Limit:** ~500-1000 concurrent games (single instance)

### Scalability Improvements

- [ ] **4.1 Add Redis for Session Storage** (3-4 hours)
  - **Issue:** Games stored in memory, can't scale horizontally
  - **Current:** `Map<string, GameRoom>` in `packages/server/src/socket/server.ts`
  - **Install Redis:**
    ```bash
    # On Hetzner server:
    apt install redis-server
    systemctl enable redis-server
    systemctl start redis-server
    ```
  - **Install Node.js client:**
    ```bash
    pnpm add redis ioredis --filter server
    ```
  - **Implementation:**
    ```typescript
    // packages/server/src/config/redis.ts
    import Redis from 'ioredis';

    export const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    // Store game state in Redis instead of memory
    async function saveGameState(gameId: string, state: GameState) {
      await redis.set(`game:${gameId}`, JSON.stringify(state), 'EX', 86400); // 24hr expiry
    }

    async function loadGameState(gameId: string): Promise<GameState | null> {
      const data = await redis.get(`game:${gameId}`);
      return data ? JSON.parse(data) : null;
    }
    ```
  - **Benefits:** Can run multiple server instances, better fault tolerance

- [ ] **4.2 Add Socket.IO Redis Adapter** (2 hours)
  - **Issue:** Socket.IO can't broadcast across multiple server instances
  - **Install:**
    ```bash
    pnpm add @socket.io/redis-adapter --filter server
    ```
  - **Implementation:**
    ```typescript
    // packages/server/src/socket/server.ts
    import { createAdapter } from '@socket.io/redis-adapter';
    import { createClient } from 'redis';

    const pubClient = createClient({ url: 'redis://localhost:6379' });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    ```
  - **Benefits:** Horizontal scaling, load balancing across multiple servers

- [ ] **4.3 Add Database Connection Pooling Monitoring** (1 hour)
  - **Add metrics to track pool usage:**
    ```typescript
    // packages/server/src/config/database.ts
    setInterval(() => {
      console.log('DB Pool Status:', {
        total: sql.options.max,
        idle: sql.options.idle_timeout,
        waiting: sql.options.connect_timeout
      });
    }, 60000); // Log every minute
    ```
  - **Set up alerts if pool exhausted**

- [ ] **4.4 Implement Graceful Degradation** (1-2 hours)
  - **Handle database failures gracefully:**
    ```typescript
    // If DB is down, allow games to continue in-memory
    try {
      await saveGameToDatabase(gameState);
    } catch (error) {
      logger.error('Database save failed, continuing in-memory', error);
      // Game continues, state in Redis/memory
    }
    ```
  - **Add health check endpoint with DB status:**
    ```typescript
    app.get('/health', async (req, res) => {
      const dbHealthy = await checkDatabaseConnection();
      const redisHealthy = await checkRedisConnection();

      res.status(dbHealthy && redisHealthy ? 200 : 503).json({
        status: dbHealthy && redisHealthy ? 'ok' : 'degraded',
        database: dbHealthy,
        redis: redisHealthy
      });
    });
    ```

---

## 🧪 GROUP 5: TESTING & MONITORING (PRIORITY 2)

**Catch bugs before users do**
**Estimated Time:** 8-10 hours
**Current Coverage:** ~5% (only basic E2E tests)

### Testing Infrastructure

- [ ] **5.1 Add Unit Tests for Game Logic** (4-5 hours)
  - **Target:** 80% coverage for core game logic
  - **Files to Test:**
    - `packages/shared/src/game-logic/validation.ts` (move validation)
    - `packages/shared/src/game-logic/Board.ts` (pathfinding)
    - `packages/server/src/game/GameRoom.ts` (game state)
  - **Setup Vitest:**
    ```bash
    # Already installed, just create tests
    mkdir -p packages/shared/src/__tests__
    ```
  - **Example Test:**
    ```typescript
    // packages/shared/src/__tests__/validation.test.ts
    import { describe, it, expect } from 'vitest';
    import { getValidMoves, isPlayerStuck } from '../game-logic/validation';

    describe('Move Validation', () => {
      it('should return empty array if player has no tickets', () => {
        const player = { position: 1, tickets: { taxi: 0, bus: 0 }, role: 'detective' };
        const moves = getValidMoves(player, board, []);
        expect(moves).toHaveLength(0);
      });

      it('should detect stuck player', () => {
        const player = { position: 1, tickets: { taxi: 0 }, role: 'detective' };
        const stuck = isPlayerStuck(player, board, []);
        expect(stuck).toBe(true);
      });
    });
    ```
  - **Run tests:**
    ```bash
    pnpm test --filter shared
    ```

- [ ] **5.2 Add Integration Tests for Socket.IO** (2-3 hours)
  - **Test WebSocket event flows:**
    ```typescript
    // packages/server/src/__tests__/socket.test.ts
    import { io as Client } from 'socket.io-client';
    import { describe, it, expect, beforeAll, afterAll } from 'vitest';

    describe('Socket.IO Integration', () => {
      let clientSocket;

      beforeAll((done) => {
        clientSocket = Client('http://localhost:3001');
        clientSocket.on('connect', done);
      });

      afterAll(() => {
        clientSocket.disconnect();
      });

      it('should create game and receive game ID', (done) => {
        clientSocket.emit('lobby:create', 'TestPlayer', 'uuid-123', (response) => {
          expect(response.success).toBe(true);
          expect(response.gameId).toHaveLength(6);
          done();
        });
      });

      it('should reject invalid player name', (done) => {
        clientSocket.emit('lobby:create', '', 'uuid-123', (response) => {
          expect(response.success).toBe(false);
          expect(response.error).toContain('name');
          done();
        });
      });
    });
    ```

- [ ] **5.3 Add E2E Tests for Critical User Flows** (2-3 hours)
  - **Expand Playwright tests:**
    ```typescript
    // packages/client/e2e/gameplay.spec.ts
    import { test, expect } from '@playwright/test';

    test('complete game flow', async ({ page, context }) => {
      // Player 1 creates game
      await page.goto('http://localhost:3000');
      await page.fill('[data-testid="player-name"]', 'Player1');
      await page.click('[data-testid="create-game"]');

      const gameId = await page.textContent('[data-testid="game-id"]');

      // Player 2 joins game (new tab)
      const page2 = await context.newPage();
      await page2.goto(`http://localhost:3000/${gameId}`);
      await page2.fill('[data-testid="player-name"]', 'Player2');
      await page2.click('[data-testid="join-game"]');

      // Both players ready up
      await page.click('[data-testid="ready-button"]');
      await page2.click('[data-testid="ready-button"]');

      // Host starts game
      await page.click('[data-testid="start-game"]');

      // Verify game started
      await expect(page.locator('[data-testid="game-phase"]')).toHaveText('playing');
      await expect(page2.locator('[data-testid="game-phase"]')).toHaveText('playing');
    });
    ```

- [ ] **5.4 Add Logging Framework** (1-2 hours)
  - **Replace console.log with structured logging:**
  - **Install:**
    ```bash
    pnpm add winston --filter server
    ```
  - **Setup:**
    ```typescript
    // packages/server/src/utils/logger.ts
    import winston from 'winston';

    export const logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        ...(process.env.NODE_ENV !== 'production'
          ? [new winston.transports.Console({ format: winston.format.simple() })]
          : []
        )
      ]
    });

    // Usage:
    logger.info('Game created', { gameId, playerCount });
    logger.error('Database error', { error, gameId });
    ```

- [ ] **5.5 Add Performance Monitoring** (1 hour)
  - **Track key metrics:**
    ```typescript
    // packages/server/src/utils/metrics.ts
    class Metrics {
      private metrics = {
        activeGames: 0,
        totalPlayers: 0,
        movesPerSecond: 0,
        avgResponseTime: 0
      };

      increment(metric: string) {
        this.metrics[metric]++;
      }

      get() {
        return this.metrics;
      }
    }

    export const metrics = new Metrics();

    // Expose via endpoint
    app.get('/metrics', (req, res) => {
      res.json(metrics.get());
    });
    ```

---

## 🎨 GROUP 6: POLISH & FEATURES (PRIORITY 4)

**Nice-to-have improvements for better UX**
**Estimated Time:** 12-16 hours
**Impact:** Medium - Improves user experience but not critical

### UI/UX Enhancements

- [ ] **6.1 Add Visual Player Markers on Map** (3-4 hours)
  - **Issue:** Player positions tracked in state but not shown on Mapbox
  - **Location:** Create `packages/client/src/components/Board/PlayerMarker.tsx`
  - **Implementation:**
    ```typescript
    import { Marker } from 'react-map-gl';

    function PlayerMarker({ player, isRevealed }) {
      if (player.role === 'mr-x' && !isRevealed) return null;

      return (
        <Marker
          longitude={player.coordinates.lng}
          latitude={player.coordinates.lat}
          anchor="center"
        >
          <div className={`player-marker ${player.role}`}>
            {player.role === 'mr-x' ? '❓' : '🔍'}
            <span className="player-name">{player.name}</span>
          </div>
        </Marker>
      );
    }
    ```
  - **Benefits:** Players can see their positions on the map

- [ ] **6.2 Add Movement Animations** (2-3 hours)
  - **Animate piece movement between stations:**
    ```typescript
    // Use Mapbox flyTo animation
    map.flyTo({
      center: [newLng, newLat],
      duration: 1000,
      essential: true
    });

    // Or use CSS transitions for markers
    .player-marker {
      transition: transform 0.8s ease-in-out;
    }
    ```

- [ ] **6.3 Add Sound Effects** (2-3 hours)
  - **Sounds to Add:**
    - Move made (different sound per transport type)
    - Mr. X revealed
    - Game won/lost
    - Player joined lobby
  - **Implementation:**
    ```typescript
    // packages/client/src/utils/sounds.ts
    const sounds = {
      taxi: new Audio('/sounds/taxi.mp3'),
      bus: new Audio('/sounds/bus.mp3'),
      underground: new Audio('/sounds/underground.mp3'),
      reveal: new Audio('/sounds/reveal.mp3'),
      win: new Audio('/sounds/win.mp3')
    };

    export function playSound(type: keyof typeof sounds) {
      sounds[type].play();
    }
    ```
  - **Find free sounds:** https://freesound.org/

- [ ] **6.4 Add Hover Effects for Valid Moves** (1-2 hours)
  - **Highlight stations on hover:**
    ```typescript
    // In MapboxBoard.tsx
    map.on('mouseenter', 'stations-layer', (e) => {
      const stationId = e.features[0].properties.id;
      if (validMoves.includes(stationId)) {
        map.getCanvas().style.cursor = 'pointer';
        map.setPaintProperty('stations-layer', 'circle-stroke-width', [
          'case',
          ['==', ['get', 'id'], stationId],
          4,
          1
        ]);
      }
    });
    ```

- [ ] **6.5 Improve Mobile Responsiveness** (2-3 hours)
  - **Issues:**
    - Small touch targets
    - Map controls too small
    - Modals don't fit on small screens
  - **Fixes:**
    ```css
    /* Larger touch targets on mobile */
    @media (max-width: 768px) {
      .station-marker {
        width: 48px;
        height: 48px;
      }

      .modal {
        width: 90vw;
        max-height: 80vh;
      }
    }
    ```

- [ ] **6.6 Add Keyboard Navigation** (2-3 hours)
  - **Accessibility improvements:**
    ```typescript
    // Allow keyboard navigation in lobby
    useEffect(() => {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && canStartGame) {
          startGame();
        }
        if (e.key === 'Escape' && showModal) {
          closeModal();
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [canStartGame, showModal]);
    ```

---

## 📋 IMPLEMENTATION TIMELINE

### Week 1: Critical Fixes (Priority 1)
**Goal:** Production-ready security
**Time:** 6-8 hours

- [ ] Day 1-2: GROUP 1 - All security fixes (2-3 hours)
- [ ] Day 2-3: GROUP 2 tasks 2.1, 2.2, 2.6 - Quick code fixes (30 min)
- [ ] Day 3-5: GROUP 5 task 5.4 - Add logging (1-2 hours)
- [ ] Day 5-7: GROUP 5 tasks 5.1, 5.2 - Core tests (6-8 hours)

**Deliverable:** Secure, tested application ready for migration

### Week 2: Deployment Migration (Priority 2)
**Goal:** Move to Hetzner for EU performance
**Time:** 3-4 hours

- [ ] Day 1: GROUP 3 tasks 3.1, 3.2, 3.3 - Set up Hetzner + Neon (1 hour)
- [ ] Day 2: GROUP 3 tasks 3.4, 3.5 - Deploy app + SSL (1 hour)
- [ ] Day 3: GROUP 3 tasks 3.6, 3.7 - DNS + testing (1 hour)
- [ ] Day 4-7: Monitor production, keep Railway as backup

**Deliverable:** Application running on Hetzner with EU latency

### Week 3: Code Quality (Priority 2)
**Goal:** Reduce technical debt
**Time:** 8-12 hours

- [ ] Day 1-3: GROUP 2 task 2.3 - Refactor GameRoom (4-6 hours)
- [ ] Day 4-5: GROUP 2 task 2.5 - Refactor Lobby component (3-4 hours)
- [ ] Day 6-7: GROUP 2 tasks 2.4, 2.7, 2.8 - Remaining quality fixes (2-3 hours)

**Deliverable:** Cleaner, more maintainable codebase

### Week 4: Scalability (Priority 3)
**Goal:** Support 1000+ concurrent users
**Time:** 6-8 hours

- [ ] Day 1-2: GROUP 4 task 4.1 - Redis session storage (3-4 hours)
- [ ] Day 3-4: GROUP 4 task 4.2 - Socket.IO Redis adapter (2 hours)
- [ ] Day 5: GROUP 4 tasks 4.3, 4.4 - Monitoring + graceful degradation (2 hours)

**Deliverable:** Horizontally scalable application

### Week 5+: Polish (Priority 4)
**Goal:** Enhanced user experience
**Time:** 12-16 hours (spread over multiple weeks)

- [ ] GROUP 6 task 6.1 - Player markers (3-4 hours)
- [ ] GROUP 6 task 6.2 - Movement animations (2-3 hours)
- [ ] GROUP 6 task 6.3 - Sound effects (2-3 hours)
- [ ] GROUP 6 tasks 6.4, 6.5, 6.6 - UX improvements (5-8 hours)

**Deliverable:** Polished, production-quality game

---

## 🎯 QUICK START: First 3 Things to Do

If you're ready to start right now, here are the **3 most critical tasks** to tackle first:

### 1. Fix React Hook Bug (5 minutes) ⚡
**File:** `packages/client/src/components/Board/GameBoard.tsx:59`
```typescript
// Change this line:
}, [currentPlayerIndex, phase, round, players.length]);

// To:
}, [currentPlayerIndex, phase, round, players, validMoves, isRevealed]);
```
This is a real bug causing UI state issues.

### 2. Add CORS Security (15 minutes) 🔒
**File:** `packages/server/src/index.ts:15`
```typescript
// Replace:
app.use(cors());

// With:
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST']
}));
```

### 3. Remove Unused Dependencies (15 minutes) 🗑️
```bash
cd packages/client
pnpm remove framer-motion lucide-react
pnpm build  # Verify build works
```
Saves 2-3 MB in production bundle.

**Total Time: 35 minutes**
**Impact: Critical bug fixed, security improved, bundle size reduced**

---

## 📊 Progress Tracking

Use this to track your progress through all groups:

**Overall Completion:**
- 🔴 GROUP 1 (Security): 0/6 complete (0%)
- 🟡 GROUP 2 (Code Quality): 0/8 complete (0%)
- 💰 GROUP 3 (Deployment): 0/7 complete (0%)
- 🚀 GROUP 4 (Performance): 0/4 complete (0%)
- 🧪 GROUP 5 (Testing): 0/5 complete (0%)
- 🎨 GROUP 6 (Polish): 0/6 complete (0%)

**Total: 0/36 tasks complete (0%)**

Update this section as you complete tasks!

---

## 🔗 Related Documentation

- **PROJECT_STATUS.md** - Comprehensive project status
- **ARCHITECTURE_REVIEW.md** - Architecture analysis (Grade: B+)
- **CODE_QUALITY_REPORT.md** - Code quality details (Score: 7.5/10)
- **SECURITY_AUDIT_REPORT.md** - Security vulnerabilities (Risk: HIGH)
- **.github/issue-update.md** - GitHub issue tracker

---

**Last Updated:** November 9, 2025
**Maintained By:** Development Team
**Questions?** Check related documentation or open a GitHub issue.

---

**Ready to start?** Pick a group and start checking off tasks! 🚀
