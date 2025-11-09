/**
 * Structured logging utility
 * - info: Important events (game created, player joined) - logged in production
 * - debug: Detailed debugging info - development only
 * - error: Errors - always logged
 * - warn: Warnings - always logged
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = {
  /**
   * Important application events - logged in production
   * Use for: game created, player joined, game started, etc.
   */
  info: (...args: any[]) => {
    console.log(...args);
  },

  /**
   * Detailed debugging information - development only
   * Use for: state changes, internal flow, detailed tracking
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Errors - always logged
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Warnings - always logged
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  }
};
