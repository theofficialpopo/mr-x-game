import { Page, expect } from '@playwright/test';

/**
 * Helper to create a game and return the game ID
 */
export async function createGame(page: Page, playerName: string): Promise<string> {
  await page.goto('/');

  // Enter player name
  await page.fill('input[placeholder="Enter your name"]', playerName);

  // Click Create Game button (goes to confirmation screen)
  await page.click('button:has-text("Create Game")');

  // Wait for confirmation dialog and click Create
  await expect(page.locator('h2:has-text("Create Game")')).toBeVisible();
  await page.click('button:has-text("Create"):not(:has-text("Create Game"))');

  // Wait for lobby to load
  await expect(page.locator('h2:has-text("Game Lobby")')).toBeVisible({ timeout: 10000 });

  // Wait a bit for socket updates to arrive and state to sync
  await page.waitForTimeout(1000);

  // Extract and return game ID
  const gameIdElement = page.locator('p.text-2xl.font-mono.font-bold.text-cyan-400');
  await expect(gameIdElement).toBeVisible();
  const gameId = await gameIdElement.textContent();

  if (!gameId) {
    throw new Error('Failed to get game ID');
  }

  return gameId.trim();
}

/**
 * Helper to join a game
 */
export async function joinGame(page: Page, playerName: string, gameId: string): Promise<void> {
  await page.goto('/');

  // Enter player name
  await page.fill('input[placeholder="Enter your name"]', playerName);

  // Click Join Game button
  await page.click('button:has-text("Join Game")');

  // Wait for join form
  await expect(page.locator('h2:has-text("Join Game")')).toBeVisible();

  // Enter game ID
  await page.fill('input[placeholder="Enter Game ID"]', gameId);

  // Click Join button
  await page.click('button:has-text("Join"):not(:has-text("Join Game"))');

  // Wait for lobby to load
  await expect(page.locator('h2:has-text("Game Lobby")')).toBeVisible({ timeout: 10000 });

  // Wait a bit for socket updates to arrive and state to sync
  await page.waitForTimeout(1000);
}

/**
 * Helper to set ready status
 */
export async function setReady(page: Page): Promise<void> {
  const readyButton = page.locator('button:has-text("Ready"), button:has-text("Not Ready")');
  await expect(readyButton).toBeVisible();
  await readyButton.click();
}

/**
 * Helper to verify player is in lobby
 */
export async function verifyPlayerInLobby(page: Page, playerName: string): Promise<void> {
  await expect(page.locator(`text=${playerName}`)).toBeVisible({ timeout: 5000 });
}

/**
 * Helper to verify host badge is visible for a player
 */
export async function verifyHostBadge(page: Page): Promise<void> {
  await expect(page.locator('span:has-text("Host")')).toBeVisible();
}

/**
 * Helper to verify ready badge is visible
 */
export async function verifyReadyBadge(page: Page, playerName: string): Promise<void> {
  const playerRow = page.locator(`div.bg-gray-700:has-text("${playerName}")`);
  await expect(playerRow.locator('span:has-text("Ready")')).toBeVisible();
}

/**
 * Helper to verify player count in lobby
 */
export async function verifyPlayerCount(page: Page, expectedCount: number): Promise<void> {
  await expect(page.locator(`text=Players (${expectedCount}/6)`)).toBeVisible();
}

/**
 * Helper to verify Start Game button state
 */
export async function verifyStartGameButton(
  page: Page,
  options: { visible: boolean; enabled?: boolean }
): Promise<void> {
  const startButton = page.locator('button:has-text("Start Game"), button:has-text("Waiting for players"), button:has-text("Waiting for ready")');

  if (options.visible) {
    await expect(startButton).toBeVisible();
    if (options.enabled !== undefined) {
      if (options.enabled) {
        await expect(startButton).toBeEnabled();
      } else {
        await expect(startButton).toBeDisabled();
      }
    }
  } else {
    await expect(startButton).not.toBeVisible();
  }
}

/**
 * Helper to get game ID from lobby page
 */
export async function getGameIdFromLobby(page: Page): Promise<string> {
  const gameIdElement = page.locator('p.text-2xl.font-mono.font-bold.text-cyan-400');
  await expect(gameIdElement).toBeVisible();
  const gameId = await gameIdElement.textContent();

  if (!gameId) {
    throw new Error('Failed to get game ID from lobby');
  }

  return gameId.trim();
}
