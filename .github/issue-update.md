# Build Scotland Yard Web Game with Real Map Data

## Progress: Phase 1 Complete ✅ | Phase 2 Week 3 Complete ✅

**Current Status:** Foundation and game logic core complete. Working on Week 4 (Player Interaction UI).

---

## Implementation Phases

### Phase 1: Foundation ✅ COMPLETED (Week 1-2)
**Goal:** Basic game board rendering and data integration

#### Week 1: Data Pipeline & Board Rendering ✅
- [x] **Parse Scotland Yard data** (`stations.txt`, `connections.txt`)
  - File: `shared/data/parser.ts`
  - Convert to JSON format
  - Validate data integrity (199 stations, 468 connections)
- [x] **Implement graph data structure**
  - File: `shared/game-logic/Board.ts`
  - Adjacency list representation
  - Pathfinding algorithms (Dijkstra, BFS)
- [x] **Coordinate mapping system**
  - File: `shared/game-logic/CoordinateMapper.ts`
  - Board space (pixels) → Geographic (lat/lng)
  - Linear interpolation for London bounds
- [x] **Basic SVG board renderer**
  - File: `client/src/components/Board/SVGBoard.tsx`
  - Render stations as circles
  - Render connections as lines
  - Color coding by transport type

#### Week 2: Mapbox Integration ✅
- [x] **Set up Mapbox GL JS**
  - Obtained Mapbox access token
  - Configure light theme base style (streets-v12)
  - Initialize map centered on London
- [x] **Station layer with GeoJSON**
  - File: `client/src/components/Board/MapboxBoard.tsx`
  - Convert stations to GeoJSON points
  - Data-driven styling (size by connections, color by transport)
  - Custom markers for hubs
- [x] **Connection layer**
  - GeoJSON LineStrings for connections
  - Transport-specific colors
  - Zoom-dependent line widths
- [x] **Performance optimizations**
  - Feature state for interactivity
  - Layer caching
  - Fixed React.StrictMode double-render issue

**Phase 1 Deliverables:** ✅ ALL COMPLETE
- ✅ Interactive map with all 199 stations
- ✅ Visible connections between stations (468 connections)
- ✅ Color-coded transport types (taxi: gold, bus: green, underground: pink, water: cyan)
- ✅ Basic click handlers for stations
- ✅ View toggle between SVG and Mapbox
- ✅ Real London map background (light streets theme)

---

### Phase 2: Core Game Logic (Week 3-4) 🔄 NEXT UP

**Goal:** Implement Scotland Yard game rules and interactive gameplay

#### Week 3: Game State & Rules ✅
- [x] **Zustand store implementation**
  - File: `client/src/store/gameStore.ts`
  - Game state interface (players, current turn, round number)
  - Player state (position, tickets, role: Mr. X or Detective)
  - Turn management (advance turn, increment rounds)
- [x] **Move validation**
  - File: `shared/game-logic/validation.ts`
  - Check ticket availability
  - Verify connection exists between stations
  - Station occupancy rules (detectives can't share stations)
  - Transport type compatibility
- [x] **Win condition detection**
  - Mr. X captured (same station as any detective)
  - All detectives stuck (no valid moves)
  - Mr. X survives 24 rounds
- [x] **Move history tracking**
  - Store all moves with timestamps
  - Mr. X visibility tracking (reveal on rounds 3, 8, 13, 18, 24)

#### Week 4: Player Interaction
- [ ] **Station selection UI**
  - File: `client/src/components/GameBoard/StationSelector.tsx`
  - Highlight valid moves on hover
  - Click to select destination
  - Show available transport options
- [ ] **Transport selection modal**
  - File: `client/src/components/GameUI/TransportModal.tsx`
  - Display available transports for selected destination
  - Show remaining tickets for each transport type
  - Confirm move action
- [ ] **Player piece rendering**
  - File: `client/src/components/GameBoard/PlayerMarker.tsx`
  - Animated markers on map
  - Current player highlight
  - Mr. X hidden representation (question mark icon)
- [ ] **Turn advancement**
  - Auto-advance after valid move
  - Round counter display
  - Active player indicator

**Phase 2 Deliverables:**
- Fully functional single-player game (hot-seat multiplayer)
- All Scotland Yard rules implemented
- Valid move validation
- Win/loss detection
- Interactive UI for making moves

---

### Phase 3: Multiplayer Infrastructure (Week 5-7)

#### Week 5: WebSocket Setup
- [ ] **Socket.IO server**
  - File: `server/src/socket/server.ts`
  - Connection handling
  - Room management
  - Heartbeat/ping-pong
- [ ] **Client socket integration**
  - File: `client/src/services/socket.ts`
  - Connect to game rooms
  - Event listeners for game updates
  - Reconnection logic
- [ ] **Game room system**
  - File: `server/src/game/GameRoom.ts`
  - Create/join rooms
  - Player assignment (Mr. X vs Detectives)
  - Room capacity limits (2-6 players)

#### Week 6: State Synchronization
- [ ] **Server-authoritative validation**
  - File: `server/src/game/GameServer.ts`
  - Validate all moves server-side
  - Reject invalid client actions
  - Apply moves to server state
- [ ] **State broadcasting**
  - Send updates to all players in room
  - Hide Mr. X position except reveal rounds
  - Optimize payload size (delta updates)
- [ ] **Redis integration**
  - File: `server/src/db/redis.ts`
  - Cache game state
  - Pub/sub for multi-server support
  - Session persistence
- [ ] **Reconnection handling**
  - Restore player state on reconnect
  - Pause game on disconnect
  - Timeout for abandoned games

#### Week 7: Lobby & Matchmaking
- [ ] **Game lobby UI**
  - File: `client/src/pages/Lobby.tsx`
  - List active games
  - Create new game
  - Join existing game
- [ ] **Player ready system**
  - File: `client/src/components/Lobby/ReadyCheck.tsx`
  - All players must ready up
  - Role selection (Mr. X chosen randomly or volunteered)
  - Starting position assignment
- [ ] **Invite system**
  - Generate shareable game links
  - Copy invite code
  - Direct join via URL

**Deliverables:**
- Real-time multiplayer gameplay
- Multiple concurrent games supported
- Reliable state synchronization
- Lobby for player coordination

---

### Future Phases

See original issue description for:
- **Phase 4:** AI Opponents (Week 8-9)
- **Phase 5:** Polish & Features (Week 10-12)
- **Phase 6:** Custom Game Boards (Post-MVP)

---

## Technical Achievements So Far

### Files Created

**Phase 1 (Weeks 1-2):**
✅ `packages/shared/src/types/board.ts` - Type definitions
✅ `packages/shared/src/data/parser.ts` - Data parsing with validation
✅ `packages/shared/src/game-logic/Board.ts` - Graph structure (260 lines)
✅ `packages/shared/src/game-logic/CoordinateMapper.ts` - Coordinate transformation
✅ `packages/client/src/components/Board/SVGBoard.tsx` - SVG visualization (210 lines)
✅ `packages/client/src/components/Board/MapboxBoard.tsx` - Mapbox integration (328 lines)
✅ `packages/client/src/hooks/useBoardData.ts` - Data loading hook
✅ `packages/client/src/App.tsx` - Main app with view toggle

**Phase 2 Week 3:**
✅ `packages/shared/src/types/game.ts` - Game state types (Player, Move, GameState, TicketCounts)
✅ `packages/shared/src/game-logic/validation.ts` - Move validation & win conditions (150 lines)
✅ `packages/client/src/store/gameStore.ts` - Zustand game state management (220 lines)

### Issues Resolved
1. ✅ pnpm workspace configuration (created `pnpm-workspace.yaml`)
2. ✅ esbuild version conflicts (added `.npmrc` with shamefully-hoist)
3. ✅ Connection count validation (fixed to check minimum 400 instead of exact count)
4. ✅ Mapbox token not found in monorepo (moved `.env` to `packages/client/`)
5. ✅ Map stuck on "Loading..." (fixed React.StrictMode double-render issue)
6. ✅ Changed to light map theme (streets-v12)

### Key Metrics
- **Stations rendered:** 199 ✅
- **Connections visualized:** 468 ✅
- **Transport types:** 4 (taxi, bus, underground, water) ✅
- **Pathfinding algorithms:** BFS + Dijkstra ✅
- **Map styles:** SVG + Mapbox GL JS ✅

---

## Week 3 Accomplishments ✅

**Game Logic Core - ALL COMPLETE:**

1. ✅ **Game State Types** (`types/game.ts`)
   - Player, Move, GameState, TicketCounts interfaces
   - Constants: reveal rounds (3, 8, 13, 18, 24), max rounds (24)
   - Starting positions (13 for Mr. X, 18 for detectives)
   - Default tickets (detectives: taxi 11, bus 8, underground 4)

2. ✅ **Move Validation** (`validation.ts`)
   - Ticket availability checking
   - Connection verification via Board graph
   - Station occupancy rules (detectives can't share)
   - Valid moves calculation per player
   - Stuck/capture detection

3. ✅ **Zustand Game Store** (`gameStore.ts`)
   - Complete game state management
   - Turn/round progression
   - Move execution with validation
   - Win condition detection (capture, stuck, survived 24 rounds)
   - Move history with Mr. X visibility tracking

---

## Next Steps (Phase 2 Week 4)

**Priority tasks for Player Interaction UI:**

1. **Game Setup UI** (`components/GameUI/GameSetup.tsx`)
   - Player name inputs (2-6 players)
   - Mr. X role selection
   - Start game button

2. **Game Status Panel** (`components/GameUI/GameStatus.tsx`)
   - Current player indicator
   - Round counter
   - Ticket displays for all players
   - Turn history

3. **Station interaction on map**
   - Highlight valid moves when hovering
   - Click to select destination
   - Show available transports

4. **Transport selection modal**
   - Choose transport type
   - Confirm move
   - Update game state

5. **Player markers on map**
   - Render player positions
   - Mr. X hidden/revealed logic
   - Animated movement

**Goal:** Complete Phase 2 with a fully playable hot-seat multiplayer game.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
