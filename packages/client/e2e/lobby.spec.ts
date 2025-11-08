import { test, expect } from '@playwright/test';
import {
  createGame,
  joinGame,
  setReady,
  verifyPlayerInLobby,
  verifyHostBadge,
  verifyReadyBadge,
  verifyPlayerCount,
  verifyStartGameButton,
} from './helpers';

test.describe('Multiplayer Lobby - 2 Players', () => {
  test('should allow 2 players to create, join, and ready up in lobby', async ({ browser }) => {
    // Create two browser contexts (like two different users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Player 1 creates game
      const gameId = await createGame(page1, 'Player1');
      console.log(`Game created with ID: ${gameId}`);

      // Verify Player 1 is in lobby as host
      await verifyPlayerInLobby(page1, 'Player1');
      await verifyHostBadge(page1);
      await verifyPlayerCount(page1, 1);

      // Verify host has Ready badge (auto-ready)
      await verifyReadyBadge(page1, 'Player1');

      // Verify Start Game button is disabled (not enough players)
      await verifyStartGameButton(page1, { visible: true, enabled: false });

      // Player 2 joins game
      await joinGame(page2, 'Player2', gameId);
      console.log('Player 2 joined game');

      // Verify both players see each other
      await verifyPlayerInLobby(page1, 'Player2');
      await verifyPlayerInLobby(page2, 'Player1');
      await verifyPlayerInLobby(page2, 'Player2');

      // Verify player count
      await verifyPlayerCount(page1, 2);
      await verifyPlayerCount(page2, 2);

      // Verify Player 2 sees host badge on Player 1
      await expect(page2.locator('div.bg-gray-700:has-text("Player1")')).toContainText('Host');

      // Verify Start Game button is still disabled (Player 2 not ready)
      await verifyStartGameButton(page1, { visible: true, enabled: false });

      // Player 2 clicks Ready
      await setReady(page2);
      console.log('Player 2 is ready');

      // Wait a bit for state to sync
      await page1.waitForTimeout(500);

      // Verify Player 2 has Ready badge
      await verifyReadyBadge(page1, 'Player2');
      await verifyReadyBadge(page2, 'Player2');

      // Verify Start Game button is now enabled
      await verifyStartGameButton(page1, { visible: true, enabled: true });

      // Verify non-host doesn't see Start Game button
      await verifyStartGameButton(page2, { visible: false });

      console.log('✅ 2-player lobby test passed');
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});

test.describe('Multiplayer Lobby - 3 Players', () => {
  test('should allow 3 players to create, join, and ready up in lobby', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();

    try {
      // Player 1 creates game
      const gameId = await createGame(page1, 'Player1');

      // Player 2 joins
      await joinGame(page2, 'Player2', gameId);

      // Player 3 joins
      await joinGame(page3, 'Player3', gameId);

      // Verify all players see each other
      await verifyPlayerCount(page1, 3);
      await verifyPlayerCount(page2, 3);
      await verifyPlayerCount(page3, 3);

      await verifyPlayerInLobby(page1, 'Player1');
      await verifyPlayerInLobby(page1, 'Player2');
      await verifyPlayerInLobby(page1, 'Player3');

      // Verify host is auto-ready
      await verifyReadyBadge(page1, 'Player1');

      // Start Game should be disabled (not all ready)
      await verifyStartGameButton(page1, { visible: true, enabled: false });

      // Player 2 and 3 ready up
      await setReady(page2);
      await setReady(page3);

      await page1.waitForTimeout(500);

      // Verify all players ready
      await verifyReadyBadge(page1, 'Player2');
      await verifyReadyBadge(page1, 'Player3');

      // Start Game should be enabled
      await verifyStartGameButton(page1, { visible: true, enabled: true });

      console.log('✅ 3-player lobby test passed');
    } finally {
      await context1.close();
      await context2.close();
      await context3.close();
    }
  });
});

test.describe('Multiplayer Lobby - 4 Players', () => {
  test('should allow 4 players to create, join, and ready up in lobby', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    try {
      // Player 1 creates game
      const gameId = await createGame(pages[0], 'Player1');

      // Players 2-4 join
      await joinGame(pages[1], 'Player2', gameId);
      await joinGame(pages[2], 'Player3', gameId);
      await joinGame(pages[3], 'Player4', gameId);

      // Verify player count
      await verifyPlayerCount(pages[0], 4);

      // Verify all players see each other
      for (let i = 1; i <= 4; i++) {
        await verifyPlayerInLobby(pages[0], `Player${i}`);
      }

      // Players 2-4 ready up
      await setReady(pages[1]);
      await setReady(pages[2]);
      await setReady(pages[3]);

      await pages[0].waitForTimeout(500);

      // Verify all ready
      for (let i = 1; i <= 4; i++) {
        await verifyReadyBadge(pages[0], `Player${i}`);
      }

      // Start Game should be enabled
      await verifyStartGameButton(pages[0], { visible: true, enabled: true });

      console.log('✅ 4-player lobby test passed');
    } finally {
      await Promise.all(contexts.map(ctx => ctx.close()));
    }
  });
});

test.describe('Multiplayer Lobby - 5 Players', () => {
  test('should allow 5 players to create, join, and ready up in lobby', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    try {
      // Player 1 creates game
      const gameId = await createGame(pages[0], 'Player1');

      // Players 2-5 join
      for (let i = 1; i < 5; i++) {
        await joinGame(pages[i], `Player${i + 1}`, gameId);
      }

      // Verify player count
      await verifyPlayerCount(pages[0], 5);

      // Verify all players see each other
      for (let i = 1; i <= 5; i++) {
        await verifyPlayerInLobby(pages[0], `Player${i}`);
      }

      // Players 2-5 ready up
      for (let i = 1; i < 5; i++) {
        await setReady(pages[i]);
      }

      await pages[0].waitForTimeout(500);

      // Verify all ready
      for (let i = 1; i <= 5; i++) {
        await verifyReadyBadge(pages[0], `Player${i}`);
      }

      // Start Game should be enabled
      await verifyStartGameButton(pages[0], { visible: true, enabled: true });

      console.log('✅ 5-player lobby test passed');
    } finally {
      await Promise.all(contexts.map(ctx => ctx.close()));
    }
  });
});

test.describe('Multiplayer Lobby - 6 Players (Maximum)', () => {
  test('should allow 6 players to create, join, and ready up in lobby', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    try {
      // Player 1 creates game
      const gameId = await createGame(pages[0], 'Player1');

      // Players 2-6 join
      for (let i = 1; i < 6; i++) {
        await joinGame(pages[i], `Player${i + 1}`, gameId);
      }

      // Verify player count is at maximum
      await verifyPlayerCount(pages[0], 6);

      // Verify all players see each other
      for (let i = 1; i <= 6; i++) {
        await verifyPlayerInLobby(pages[0], `Player${i}`);
      }

      // Players 2-6 ready up
      for (let i = 1; i < 6; i++) {
        await setReady(pages[i]);
      }

      await pages[0].waitForTimeout(500);

      // Verify all ready
      for (let i = 1; i <= 6; i++) {
        await verifyReadyBadge(pages[0], `Player${i}`);
      }

      // Start Game should be enabled
      await verifyStartGameButton(pages[0], { visible: true, enabled: true });

      console.log('✅ 6-player lobby test passed');
    } finally {
      await Promise.all(contexts.map(ctx => ctx.close()));
    }
  });

  test('should prevent 7th player from joining when lobby is full', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

    try {
      // Player 1 creates game
      const gameId = await createGame(pages[0], 'Player1');

      // Players 2-6 join successfully
      for (let i = 1; i < 6; i++) {
        await joinGame(pages[i], `Player${i + 1}`, gameId);
      }

      // Verify lobby is full
      await verifyPlayerCount(pages[0], 6);

      // Try to join as 7th player
      await pages[6].goto('/');
      await pages[6].fill('input[placeholder="Enter your name"]', 'Player7');
      await pages[6].click('button:has-text("Join Game")');
      await expect(pages[6].locator('h2:has-text("Join Game")')).toBeVisible();
      await pages[6].fill('input[placeholder="Enter Game ID"]', gameId);
      await pages[6].click('button:has-text("Join"):not(:has-text("Join Game"))');

      // Should see error message or remain on join page
      await pages[6].waitForTimeout(1000);

      // Should not be in lobby
      const isInLobby = await pages[6].locator('h2:has-text("Game Lobby")').isVisible();
      expect(isInLobby).toBeFalsy();

      console.log('✅ 7th player correctly prevented from joining full lobby');
    } finally {
      await Promise.all(contexts.map(ctx => ctx.close()));
    }
  });
});

test.describe('Multiplayer Lobby - Host Transfer', () => {
  test('should transfer host when original host leaves', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();

    try {
      // Player 1 creates game (host)
      const gameId = await createGame(page1, 'Player1');

      // Players 2 and 3 join
      await joinGame(page2, 'Player2', gameId);
      await joinGame(page3, 'Player3', gameId);

      await verifyPlayerCount(page2, 3);

      // Verify Player 1 is host
      await expect(page2.locator('div.bg-gray-700:has-text("Player1")')).toContainText('Host');

      // Player 1 (host) leaves by closing their page
      await page1.close();
      await context1.close();

      // Wait for host transfer
      await page2.waitForTimeout(1500);

      // Verify Player 2 is now the host (first remaining player)
      await verifyHostBadge(page2);
      await verifyReadyBadge(page2, 'Player2'); // New host should be auto-ready

      // Verify player count decreased
      await verifyPlayerCount(page2, 2);

      console.log('✅ Host transfer test passed');
    } finally {
      await context2.close();
      await context3.close();
    }
  });
});

test.describe('Multiplayer Lobby - Ready Toggle', () => {
  test('should allow players to toggle ready status', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Setup: 2 players in lobby
      const gameId = await createGame(page1, 'Player1');
      await joinGame(page2, 'Player2', gameId);

      // Player 2 clicks Ready
      await setReady(page2);
      await page1.waitForTimeout(500);

      // Verify Ready badge appears
      await verifyReadyBadge(page1, 'Player2');

      // Player 2 clicks Ready again (toggle off)
      await setReady(page2);
      await page1.waitForTimeout(500);

      // Verify Ready badge disappears
      const player2Row = page1.locator('div.bg-gray-700:has-text("Player2")');
      await expect(player2Row.locator('span:has-text("Ready")')).not.toBeVisible();

      // Verify Start Game is disabled again
      await verifyStartGameButton(page1, { visible: true, enabled: false });

      console.log('✅ Ready toggle test passed');
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});
