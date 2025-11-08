/**
 * Transport type constants
 * Centralized definition of colors, icons, and names for all transport types
 */

export const TRANSPORT_COLORS = {
  taxi: '#FFD700',      // Gold
  bus: '#32CD32',       // Lime green
  underground: '#FF1493', // Deep pink
  water: '#00CED1',     // Cyan
  black: '#1a1a1a',     // Dark gray/black
} as const;

export const TRANSPORT_ICONS = {
  taxi: '🚕',
  bus: '🚌',
  underground: '🚇',
  water: '⛴️',
  black: '🎫',
} as const;

export const TRANSPORT_NAMES = {
  taxi: 'Taxi',
  bus: 'Bus',
  underground: 'Underground',
  water: 'Water',
  black: 'Black Ticket',
} as const;

/**
 * Combined transport information
 */
export const TRANSPORT_INFO = {
  taxi: {
    icon: TRANSPORT_ICONS.taxi,
    color: TRANSPORT_COLORS.taxi,
    name: TRANSPORT_NAMES.taxi,
  },
  bus: {
    icon: TRANSPORT_ICONS.bus,
    color: TRANSPORT_COLORS.bus,
    name: TRANSPORT_NAMES.bus,
  },
  underground: {
    icon: TRANSPORT_ICONS.underground,
    color: TRANSPORT_COLORS.underground,
    name: TRANSPORT_NAMES.underground,
  },
  water: {
    icon: TRANSPORT_ICONS.water,
    color: TRANSPORT_COLORS.water,
    name: TRANSPORT_NAMES.water,
  },
  black: {
    icon: TRANSPORT_ICONS.black,
    color: TRANSPORT_COLORS.black,
    name: TRANSPORT_NAMES.black,
  },
} as const;
