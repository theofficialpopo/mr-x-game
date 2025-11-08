# E2E Tests - Scotland Yard Game

This directory contains end-to-end tests for the multiplayer lobby functionality using Playwright.

## Test Coverage

### Lobby Tests (`lobby.spec.ts`)

The test suite covers all multiplayer scenarios from 2 to 6 players:

- **2 Players**: Basic create, join, ready, and start game flow
- **3 Players**: Multiple players joining and readying up
- **4 Players**: Mid-size lobby testing
- **5 Players**: Near-capacity lobby testing
- **6 Players (Maximum)**:
  - Full lobby with all players
  - Preventing 7th player from joining when lobby is full
- **Host Transfer**: Verifies new host assignment when original host leaves
- **Ready Toggle**: Tests players toggling ready status on/off

## Running Tests

### Prerequisites

Ensure the development servers are running:
```bash
# From the root directory
pnpm dev
```

Or if you want to run tests without manually starting servers, Playwright will auto-start them.

### Run All E2E Tests

```bash
# From packages/client directory
pnpm test:e2e
```

### Run Tests in UI Mode (Recommended for Development)

```bash
pnpm dlx playwright test --ui
```

This opens Playwright's interactive UI where you can:
- See each test step visually
- Debug failing tests
- Watch tests run in real browsers

### Run Specific Test Suite

```bash
# Run only 2-player tests
pnpm dlx playwright test -g "2 Players"

# Run only 6-player tests
pnpm dlx playwright test -g "6 Players"

# Run only host transfer test
pnpm dlx playwright test -g "Host Transfer"
```

### Run in Headed Mode (See Browser Windows)

```bash
pnpm dlx playwright test --headed
```

### Debug a Specific Test

```bash
pnpm dlx playwright test --debug -g "2 Players"
```

## Test Structure

### Helper Functions (`helpers.ts`)

The test suite uses helper functions for common operations:

- `createGame(page, playerName)` - Create a new game and return game ID
- `joinGame(page, playerName, gameId)` - Join an existing game
- `setReady(page)` - Toggle ready status
- `verifyPlayerInLobby(page, playerName)` - Assert player is visible in lobby
- `verifyHostBadge(page)` - Assert host badge is visible
- `verifyReadyBadge(page, playerName)` - Assert ready badge is visible
- `verifyPlayerCount(page, expectedCount)` - Assert correct player count
- `verifyStartGameButton(page, options)` - Verify start button state

## Writing New Tests

Example test structure:

```typescript
test('should do something', async ({ browser }) => {
  // Create browser contexts (separate users)
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  try {
    // Your test code here
    const gameId = await createGame(page1, 'Player1');
    await joinGame(page2, 'Player2', gameId);

    // Assertions
    await verifyPlayerCount(page1, 2);
  } finally {
    // Cleanup
    await context1.close();
    await context2.close();
  }
});
```

## CI/CD Integration

The tests are configured to run in CI with:
- 2 retries on failure
- HTML report generation
- Screenshots on failure
- Traces for failed tests

## Troubleshooting

### Tests Fail to Connect to Server

Make sure both client and server are running:
```bash
# Terminal 1 - Start servers
pnpm dev

# Terminal 2 - Run tests
cd packages/client
pnpm test:e2e
```

### Port Already in Use

If you see "port already in use" errors, kill the existing processes:
```bash
# Windows
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3001"
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### View Test Results

After running tests, open the HTML report:
```bash
pnpm dlx playwright show-report
```

### Update Playwright Browsers

If tests fail with browser errors:
```bash
pnpm dlx playwright install
```

## Test Scenarios Covered

- ✅ Creating games
- ✅ Joining games with game ID
- ✅ Multiple players (2-6) in lobby
- ✅ Host identification and badges
- ✅ Auto-ready for host
- ✅ Ready/Not Ready toggle
- ✅ Start game button state
- ✅ Player count display
- ✅ Host transfer on disconnect
- ✅ Maximum player limit (6)
- ✅ Preventing joins to full lobbies

## Future Test Ideas

- Game start and role assignment
- Mr. X position hiding during gameplay
- Move validation
- Turn progression
- Win conditions
- Disconnect/reconnect during gameplay
