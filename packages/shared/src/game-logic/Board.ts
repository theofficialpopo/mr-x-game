import type { Station, Connection, TransportType } from '../types/board';

/**
 * Scotland Yard Board represented as an undirected graph
 * Uses adjacency list for efficient pathfinding and move validation
 */
export class Board {
  private stations: Map<number, Station>;
  private adjacencyList: Map<number, Connection[]>;

  constructor() {
    this.stations = new Map();
    this.adjacencyList = new Map();
  }

  /**
   * Initialize board with stations and connections data
   */
  initialize(stations: Station[], connections: Connection[]): void {
    // Clear existing data
    this.stations.clear();
    this.adjacencyList.clear();

    // Add all stations
    for (const station of stations) {
      this.stations.set(station.id, station);
      this.adjacencyList.set(station.id, []);
    }

    // Build adjacency list (bidirectional edges)
    for (const conn of connections) {
      // Add forward edge
      this.adjacencyList.get(conn.from)?.push(conn);

      // Add reverse edge (since graph is undirected)
      this.adjacencyList.get(conn.to)?.push({
        from: conn.to,
        to: conn.from,
        type: conn.type,
      });
    }

    console.log(`Board initialized: ${this.stations.size} stations, ${connections.length} connections`);
  }

  /**
   * Get station by ID
   */
  getStation(stationId: number): Station | undefined {
    return this.stations.get(stationId);
  }

  /**
   * Get all stations
   */
  getAllStations(): Station[] {
    return Array.from(this.stations.values());
  }

  /**
   * Get all connections from a station
   */
  getConnections(stationId: number): Connection[] {
    return this.adjacencyList.get(stationId) || [];
  }

  /**
   * Get valid moves from a station using specific transport type
   */
  getValidMoves(stationId: number, transport: TransportType): number[] {
    const connections = this.adjacencyList.get(stationId) || [];
    return connections
      .filter((conn) => conn.type === transport)
      .map((conn) => conn.to);
  }

  /**
   * Get all available transport types from a station
   */
  getAvailableTransports(stationId: number): TransportType[] {
    const connections = this.adjacencyList.get(stationId) || [];
    const transports = new Set<TransportType>();

    for (const conn of connections) {
      transports.add(conn.type);
    }

    return Array.from(transports);
  }

  /**
   * Check if two stations are connected by a specific transport
   */
  areConnected(fromId: number, toId: number, transport: TransportType): boolean {
    const connections = this.adjacencyList.get(fromId) || [];
    return connections.some((conn) => conn.to === toId && conn.type === transport);
  }

  /**
   * Get number of connections for a station (used for hub detection)
   */
  getConnectionCount(stationId: number): number {
    return this.adjacencyList.get(stationId)?.length || 0;
  }

  /**
   * BFS to find shortest path (by number of hops)
   * Returns array of station IDs representing the path
   */
  findShortestPath(
    startId: number,
    endId: number,
    allowedTransports: TransportType[]
  ): number[] {
    if (startId === endId) return [startId];

    const queue: Array<{ stationId: number; path: number[] }> = [
      { stationId: startId, path: [startId] },
    ];
    const visited = new Set<number>([startId]);

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Get all valid next stations
      const connections = this.adjacencyList.get(current.stationId) || [];
      const validConnections = connections.filter((conn) =>
        allowedTransports.includes(conn.type)
      );

      for (const conn of validConnections) {
        if (visited.has(conn.to)) continue;

        const newPath = [...current.path, conn.to];

        if (conn.to === endId) {
          return newPath; // Found shortest path
        }

        visited.add(conn.to);
        queue.push({ stationId: conn.to, path: newPath });
      }
    }

    return []; // No path found
  }

  /**
   * Get all stations within N moves from a starting station
   */
  getStationsWithinDistance(
    startId: number,
    maxDistance: number,
    allowedTransports: TransportType[]
  ): Map<number, number> {
    const distances = new Map<number, number>();
    distances.set(startId, 0);

    const queue: Array<{ stationId: number; distance: number }> = [
      { stationId: startId, distance: 0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.distance >= maxDistance) continue;

      const connections = this.adjacencyList.get(current.stationId) || [];
      const validConnections = connections.filter((conn) =>
        allowedTransports.includes(conn.type)
      );

      for (const conn of validConnections) {
        const newDistance = current.distance + 1;

        if (!distances.has(conn.to) || distances.get(conn.to)! > newDistance) {
          distances.set(conn.to, newDistance);
          queue.push({ stationId: conn.to, distance: newDistance });
        }
      }
    }

    return distances;
  }

  /**
   * Dijkstra's algorithm for shortest path with weighted edges
   * (Currently all edges have weight 1, but prepared for future enhancements)
   */
  dijkstra(
    startId: number,
    endId: number,
    allowedTransports: TransportType[]
  ): { path: number[]; distance: number } {
    const distances = new Map<number, number>();
    const previous = new Map<number, { station: number; transport: TransportType }>();
    const unvisited = new Set<number>();

    // Initialize distances
    for (const stationId of this.stations.keys()) {
      distances.set(stationId, Infinity);
      unvisited.add(stationId);
    }
    distances.set(startId, 0);

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current: number | undefined;
      let minDistance = Infinity;

      for (const stationId of unvisited) {
        const dist = distances.get(stationId)!;
        if (dist < minDistance) {
          minDistance = dist;
          current = stationId;
        }
      }

      // If no reachable nodes or reached destination
      if (current === undefined || current === endId) {
        break;
      }

      unvisited.delete(current);

      // Check all neighbors
      const connections = this.adjacencyList.get(current) || [];
      const validConnections = connections.filter((conn) =>
        allowedTransports.includes(conn.type)
      );

      for (const conn of validConnections) {
        if (!unvisited.has(conn.to)) continue;

        const newDistance = distances.get(current)! + 1; // Weight = 1 for all edges

        if (newDistance < distances.get(conn.to)!) {
          distances.set(conn.to, newDistance);
          previous.set(conn.to, { station: current, transport: conn.type });
        }
      }
    }

    // Reconstruct path
    const path: number[] = [];
    let current: number | undefined = endId;

    while (current !== undefined) {
      path.unshift(current);
      if (current === startId) break;
      current = previous.get(current)?.station;
    }

    return {
      path: path.length > 1 ? path : [],
      distance: distances.get(endId) || Infinity,
    };
  }
}
