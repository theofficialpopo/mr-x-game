# Scotland Yard - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Neon Database

**Create a Free Neon Database** (No installation needed!)

1. Go to [Neon Console](https://console.neon.tech)
2. Sign up for a free account (no credit card required)
3. Click "Create Project"
4. Copy your database connection string (it looks like: `postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb`)

### 3. Configure Environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Neon database URL:
DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Optional: Add your Mapbox token for map view:
VITE_MAPBOX_ACCESS_TOKEN=your_token_here
```

### 4. Start Development Servers
```bash
pnpm dev
```

This will start:
- Client (React + Vite) at http://localhost:3000
- Server (Express + Socket.IO) at http://localhost:3001
- Database schema will be automatically initialized on first run

## Testing Multiplayer

1. Open http://localhost:3000 in **multiple browser windows/tabs**
2. In window 1: Click "Create Game" (you'll get a 6-character game ID)
3. In window 2+: Click "Join Game" and enter the game ID
4. All players click "Ready"
5. Host clicks "Start Game"

**Mr. X's position will be hidden from detectives!** ✨
- Detectives only see Mr. X on reveal rounds (3, 8, 13, 18, 24)
- Mr. X always sees their own position
- All moves are server-validated

## Project Structure

```
mr-x-game/
├── packages/
│   ├── client/        # React frontend
│   ├── server/        # Express + Socket.IO backend
│   └── shared/        # Shared game logic & types
├── data/              # Board data files
└── package.json       # Root scripts
```

## Available Scripts

```bash
pnpm dev              # Start all servers (client + server)
pnpm dev:client       # Start only frontend
pnpm dev:server       # Start only backend
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Database**: Neon Postgres (serverless)
- **Game Logic**: Shared TypeScript package
- **Monorepo**: pnpm workspaces

## Troubleshooting

### Database Connection Errors
If you see `DATABASE_URL environment variable is not set`:
1. Make sure you copied `.env.example` to `.env`
2. Add your Neon database URL to the `.env` file
3. Restart the server: `pnpm dev:server`

### TypeScript Errors
```bash
# Rebuild shared package
cd packages/shared && pnpm build

# Clear TypeScript cache
rm -rf packages/*/dist
pnpm build
```

### Port Already in Use
```bash
# Find and kill process on port 3000 or 3001
# Windows:
netstat -ano | findstr ":3000"
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

## Development Notes

- The game uses **server-authoritative** validation - all moves are validated on the server
- Mr. X's real position is never sent to detective clients (except on reveal rounds)
- Game state is persisted in Neon Postgres for reliability and scalability
- Hot module replacement (HMR) is enabled for instant updates

## Database Schema

The database schema is automatically created on first run. It includes:
- **games** table: Stores game state (phase, round, winner)
- **players** table: Stores player data (name, role, position, tickets)
- **moves** table: Stores move history for each game

Old games (>24 hours) are automatically cleaned up.

## Testing

### E2E Tests

Comprehensive end-to-end tests for multiplayer lobby functionality:

```bash
# Install Playwright browsers (first time only)
cd packages/client
pnpm dlx playwright install

# Run all e2e tests
pnpm test:e2e

# Run tests in UI mode (interactive)
pnpm dlx playwright test --ui

# Run tests in headed mode (see browser)
pnpm dlx playwright test --headed
```

**Test Coverage:**
- 2-6 player lobby scenarios
- Host creation and transfer
- Ready status management
- Start game button validation
- Full lobby prevention (max 6 players)

See `packages/client/e2e/README.md` for detailed test documentation.
