# Mr. X Game - Scotland Yard Web Implementation

A modern web-based implementation of the classic Scotland Yard board game using real-world map data from Mapbox and OpenStreetMap.

## 🎮 Features (Planned)

- **Real Map Integration**: Play on actual London streets using Mapbox
- **Multiplayer**: Real-time gameplay with WebSocket support (2-6 players)
- **AI Opponents**: Single-player mode with intelligent AI (Easy/Medium/Hard)
- **Official Board Layout**: Uses authentic Scotland Yard station data (199 stations, 559 connections)
- **Game-like UI**: Dark theme with neon aesthetics and smooth animations
- **Custom Boards** (Future): Generate personalized game boards from any location

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 9.0.0 (Install: `npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))

Optional (for full local development):
- **Docker** (for Redis and PostgreSQL)
- **PostgreSQL** >= 16
- **Redis** >= 7

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/theofficialpopo/mr-x-game.git
cd mr-x-game
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the client, server, and shared packages.

### 3. Get Mapbox Access Token

1. Create a free account at [Mapbox](https://account.mapbox.com/auth/signup/)
2. Go to your [Account Dashboard](https://account.mapbox.com/)
3. Copy your **Default Public Token**

### 4. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Mapbox token
# On Windows: notepad .env
# On Mac/Linux: nano .env
```

Replace `your_mapbox_token_here` with your actual Mapbox token.

### 5. Download Scotland Yard Game Data

```bash
# Create data directory if it doesn't exist
mkdir -p packages/client/public/data

# Download the official Scotland Yard board data
curl -o packages/client/public/data/stations.txt https://raw.githubusercontent.com/AlexElvers/scotland-yard-data/master/stations.txt
curl -o packages/client/public/data/connections.txt https://raw.githubusercontent.com/AlexElvers/scotland-yard-data/master/connections.txt
```

**Windows users** can manually download:
- [stations.txt](https://raw.githubusercontent.com/AlexElvers/scotland-yard-data/master/stations.txt)
- [connections.txt](https://raw.githubusercontent.com/AlexElvers/scotland-yard-data/master/connections.txt)

Save both files to `packages/client/public/data/`

### 6. Start Development Server

```bash
# Start both client and server
pnpm dev

# Or start them separately:
pnpm dev:client  # Frontend only (http://localhost:3000)
pnpm dev:server  # Backend only (http://localhost:3001)
```

The game should now be running at **http://localhost:3000**

## 📁 Project Structure

```
mr-x-game/
├── packages/
│   ├── client/          # React frontend (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── pages/        # Route pages
│   │   │   ├── store/        # Zustand state management
│   │   │   └── services/     # API and WebSocket services
│   │   └── public/data/      # Game board data (stations.txt, connections.txt)
│   ├── server/          # Node.js backend (Express + Socket.IO)
│   │   ├── src/
│   │   │   ├── game/         # Game logic and state management
│   │   │   ├── socket/       # WebSocket handlers
│   │   │   ├── ai/           # AI opponent implementations
│   │   │   └── db/           # Database and Redis clients
│   │   └── prisma/           # Database schema
│   └── shared/          # Shared code between client/server
│       ├── game-logic/       # Core game rules
│       ├── types/            # TypeScript type definitions
│       └── constants.ts      # Shared constants
├── data/                # Processed game data (JSON)
├── docs/                # Documentation and ADRs
└── package.json         # Root workspace configuration
```

## 🛠️ Available Scripts

### Root Commands
```bash
pnpm dev              # Start both client and server
pnpm build            # Build both client and server
pnpm test             # Run all tests
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier
pnpm clean            # Remove all build artifacts and node_modules
```

### Client-Specific
```bash
pnpm dev:client       # Start frontend dev server
pnpm build:client     # Build frontend for production
pnpm --filter client test        # Run client tests
pnpm --filter client test:e2e    # Run E2E tests (Playwright)
```

### Server-Specific
```bash
pnpm dev:server       # Start backend dev server
pnpm build:server     # Build backend for production
pnpm --filter server test        # Run server tests
pnpm --filter server db:generate # Generate Prisma client
pnpm --filter server db:push     # Push schema to database
pnpm --filter server db:studio   # Open Prisma Studio
```

## 🗄️ Database Setup (Optional for MVP)

For Phase 3+ (multiplayer), you'll need PostgreSQL and Redis:

### Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Initialize database
pnpm --filter server db:push
```

### Manual Setup

**PostgreSQL:**
```bash
# Install PostgreSQL 16+
# Create database
createdb scotlandyard

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/scotlandyard

# Run migrations
pnpm --filter server db:push
```

**Redis:**
```bash
# Install Redis 7+
# Or use cloud service: Upstash (free tier)
# Update REDIS_URL in .env
REDIS_URL=redis://localhost:6379
```

## 🎯 Development Roadmap

Current status: **Phase 1 - Foundation**

- [x] Project setup and structure
- [ ] Phase 1: Board rendering with Mapbox (Week 1-2)
- [ ] Phase 2: Core game logic (Week 3-4)
- [ ] Phase 3: Multiplayer infrastructure (Week 5-7)
- [ ] Phase 4: AI opponents (Week 8-9)
- [ ] Phase 5: Polish & features (Week 10-12)
- [ ] Phase 6: Custom boards (Post-MVP)

See [Issue #1](https://github.com/theofficialpopo/mr-x-game/issues/1) for detailed implementation plan.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines (coming soon) before submitting PRs.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📚 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Mapping**: Mapbox GL JS, react-map-gl
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Real-time**: Socket.IO
- **Database**: PostgreSQL, Prisma ORM
- **Cache**: Redis
- **Testing**: Vitest, Playwright

## 📖 Resources

- [Scotland Yard Official Rules](https://www.ravensburger.org/spielanleitungen/ecm/Spielanleitungen/26646%20anl%202050897_2.pdf)
- [Scotland Yard Board Data](https://github.com/AlexElvers/scotland-yard-data)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/guides/)
- [OpenStreetMap Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a fan-made project and is not affiliated with or endorsed by Ravensburger, the publisher of Scotland Yard. This project is for educational purposes only.

## 🙏 Acknowledgments

- [AlexElvers/scotland-yard-data](https://github.com/AlexElvers/scotland-yard-data) for the official board data
- Ravensburger for creating the amazing Scotland Yard board game
- The Mapbox and OpenStreetMap communities

---

**Need Help?** Open an issue or check out the [detailed implementation plan](https://github.com/theofficialpopo/mr-x-game/issues/1).
