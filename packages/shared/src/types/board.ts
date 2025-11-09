/**
 * Transport types available in Scotland Yard
 * - black: Mr. X only - can use any transport type
 */
export type TransportType = 'taxi' | 'bus' | 'underground' | 'water' | 'black';

/**
 * Station representation with position and available transport
 */
export interface Station {
  id: number;
  position: {
    x: number;
    y: number;
  };
  geoCoordinates?: {
    lat: number;
    lng: number;
  };
  transports: TransportType[];
}

/**
 * Connection between two stations
 */
export interface Connection {
  from: number;
  to: number;
  type: TransportType;
}

/**
 * Raw station data from stations.txt
 */
export interface RawStationData {
  id: number;
  x: number;
  y: number;
  transports: string;
}

/**
 * Raw connection data from connections.txt
 */
export interface RawConnectionData {
  from: number;
  to: number;
  type: string;
}

/**
 * Parsed board data
 */
export interface BoardData {
  stations: Station[];
  connections: Connection[];
}
