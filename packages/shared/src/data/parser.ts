import type { Station, Connection, TransportType, BoardData } from '../types/board';

/**
 * Parse stations.txt file format:
 * [station_id] [x_coordinate] [y_coordinate] [transport_types]
 * Example: 1 190 40 taxi,bus,underground
 */
export function parseStations(stationsText: string): Station[] {
  const stations: Station[] = [];
  const lines = stationsText.trim().split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) {
      console.warn(`Invalid station line: ${line}`);
      continue;
    }

    const id = parseInt(parts[0], 10);
    const x = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    const transports = parts[3].split(',') as TransportType[];

    if (isNaN(id) || isNaN(x) || isNaN(y)) {
      console.warn(`Invalid station data: ${line}`);
      continue;
    }

    stations.push({
      id,
      position: { x, y },
      transports,
    });
  }

  return stations;
}

/**
 * Parse connections.txt file format:
 * [station_a] [station_b] [transport_type]
 * Example: 1 46 underground
 * Note: station_a < station_b (undirected graph, each edge listed once)
 */
export function parseConnections(connectionsText: string): Connection[] {
  const connections: Connection[] = [];
  const lines = connectionsText.trim().split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.trim().split(/\s+/);
    if (parts.length < 3) {
      console.warn(`Invalid connection line: ${line}`);
      continue;
    }

    const from = parseInt(parts[0], 10);
    const to = parseInt(parts[1], 10);
    const type = parts[2] as TransportType;

    if (isNaN(from) || isNaN(to)) {
      console.warn(`Invalid connection data: ${line}`);
      continue;
    }

    connections.push({ from, to, type });
  }

  return connections;
}

/**
 * Parse both stations and connections from text data
 */
export function parseBoardData(stationsText: string, connectionsText: string): BoardData {
  const stations = parseStations(stationsText);
  const connections = parseConnections(connectionsText);

  console.log(`Parsed ${stations.length} stations and ${connections.length} connections`);

  return {
    stations,
    connections,
  };
}

/**
 * Validate parsed board data
 */
export function validateBoardData(data: BoardData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check expected counts
  if (data.stations.length !== 199) {
    errors.push(`Expected 199 stations, found ${data.stations.length}`);
  }

  if (data.connections.length !== 559) {
    errors.push(`Expected 559 connections, found ${data.connections.length}`);
  }

  // Check for duplicate station IDs
  const stationIds = new Set<number>();
  for (const station of data.stations) {
    if (stationIds.has(station.id)) {
      errors.push(`Duplicate station ID: ${station.id}`);
    }
    stationIds.add(station.id);
  }

  // Check that all connections reference valid stations
  for (const conn of data.connections) {
    if (!stationIds.has(conn.from)) {
      errors.push(`Connection references invalid station: ${conn.from}`);
    }
    if (!stationIds.has(conn.to)) {
      errors.push(`Connection references invalid station: ${conn.to}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
