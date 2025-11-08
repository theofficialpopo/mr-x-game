import { useMemo } from 'react';
import type { Station, Connection, TransportType } from '@shared/types/board';
import type { Player } from '@shared/types/game';
import { TRANSPORT_COLORS } from '@shared';

interface SVGBoardProps {
  stations: Station[];
  connections: Connection[];
  onStationClick?: (stationId: number) => void;
  highlightedStations?: number[];
  players?: Player[];
  isMrXRevealed?: boolean;
  currentPlayerId?: string;
}

export function SVGBoard({
  stations,
  connections,
  onStationClick,
  highlightedStations = [],
  players = [],
  isMrXRevealed = false,
  currentPlayerId,
}: SVGBoardProps) {
  // Calculate viewBox from station positions
  const viewBox = useMemo(() => {
    if (stations.length === 0) return '0 0 1600 1200';

    const xs = stations.map((s) => s.position.x);
    const ys = stations.map((s) => s.position.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padding = 50;
    return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
  }, [stations]);

  // Create station lookup for faster connection rendering
  const stationMap = useMemo(() => {
    const map = new Map<number, Station>();
    stations.forEach((s) => map.set(s.id, s));
    return map;
  }, [stations]);

  return (
    <div className="w-full h-full bg-gray-900">
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        style={{ maxHeight: '100vh' }}
      >
        {/* Background */}
        <rect
          x={viewBox.split(' ')[0]}
          y={viewBox.split(' ')[1]}
          width={viewBox.split(' ')[2]}
          height={viewBox.split(' ')[3]}
          fill="#0a0a14"
        />

        {/* Connection lines */}
        <g className="connections">
          {connections.map((conn: Connection, idx: number) => {
            const from = stationMap.get(conn.from);
            const to = stationMap.get(conn.to);

            if (!from || !to) return null;

            return (
              <line
                key={`${conn.from}-${conn.to}-${idx}`}
                x1={from.position.x}
                y1={from.position.y}
                x2={to.position.x}
                y2={to.position.y}
                stroke={TRANSPORT_COLORS[conn.type as TransportType]}
                strokeWidth="2"
                opacity="0.6"
                className="transition-opacity hover:opacity-100"
              />
            );
          })}
        </g>

        {/* Station nodes */}
        <g className="stations">
          {stations.map((station) => {
            const isHighlighted = highlightedStations.includes(station.id);
            const connectionCount = connections.filter(
              (c) => c.from === station.id || c.to === station.id
            ).length;

            // Size stations based on number of connections (hub detection)
            const baseRadius = 4;
            const radius = baseRadius + Math.min(connectionCount / 2, 6);

            // Determine station color based on available transports
            let fillColor = '#FFFFFF';
            if (station.transports.includes('underground')) {
              fillColor = TRANSPORT_COLORS.underground;
            } else if (station.transports.includes('bus')) {
              fillColor = TRANSPORT_COLORS.bus;
            } else {
              fillColor = TRANSPORT_COLORS.taxi;
            }

            return (
              <g key={station.id}>
                {/* Glow effect for highlighted stations */}
                {isHighlighted && (
                  <circle
                    cx={station.position.x}
                    cy={station.position.y}
                    r={radius + 6}
                    fill={fillColor}
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}

                {/* Station circle */}
                <circle
                  cx={station.position.x}
                  cy={station.position.y}
                  r={radius}
                  fill={fillColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  opacity={isHighlighted ? "1" : "0.8"}
                  className="cursor-pointer transition-all hover:opacity-100 hover:scale-110"
                  onClick={() => onStationClick?.(station.id)}
                  style={{ transformOrigin: `${station.position.x}px ${station.position.y}px` }}
                />

                {/* Station ID label for major hubs */}
                {connectionCount > 8 && (
                  <text
                    x={station.position.x}
                    y={station.position.y + radius + 14}
                    fill="#FFFFFF"
                    fontSize="10"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {station.id}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Stats */}
        <g className="stats" transform={`translate(${Number(viewBox.split(' ')[0]) + 20}, ${Number(viewBox.split(' ')[1]) + 180})`}>
          <rect width="180" height="70" fill="#000000" opacity="0.8" rx="5" />

          <text x="10" y="20" fill="#FFFFFF" fontSize="14" fontWeight="bold">
            Board Stats
          </text>
          <text x="10" y="40" fill="#FFFFFF" fontSize="12">
            Stations: {stations.length}
          </text>
          <text x="10" y="58" fill="#FFFFFF" fontSize="12">
            Connections: {connections.length}
          </text>
        </g>

        {/* Player markers */}
        <g className="player-markers">
          {players.map((player: Player) => {
            const station = stations.find(s => s.id === player.position);
            if (!station) return null;

            const isMrX = player.role === 'mr-x';
            const isCurrentPlayer = player.id === currentPlayerId;
            const markerColor = isMrX ? '#FF1493' : '#00CED1';
            const markerSize = 20;

            // Adjust opacity and glow based on whether this is the current player
            const outerGlowOpacity = isCurrentPlayer ? 0.4 : 0.08;
            const middleGlowOpacity = isCurrentPlayer ? 0.5 : 0.15;
            const markerOpacity = isCurrentPlayer ? 1 : 0.6;

            return (
              <g key={player.id} className="pointer-events-none">
                {/* Extra outer glow for current player */}
                {isCurrentPlayer && (
                  <circle
                    cx={station.position.x}
                    cy={station.position.y}
                    r={markerSize + 14}
                    fill={markerColor}
                    opacity="0.2"
                    className="animate-pulse"
                  />
                )}

                {/* Outer glow ring */}
                <circle
                  cx={station.position.x}
                  cy={station.position.y}
                  r={markerSize + 8}
                  fill={markerColor}
                  opacity={outerGlowOpacity}
                  className={isCurrentPlayer ? "animate-pulse" : ""}
                />

                {/* Middle glow ring */}
                <circle
                  cx={station.position.x}
                  cy={station.position.y}
                  r={markerSize + 4}
                  fill={markerColor}
                  opacity={middleGlowOpacity}
                />

                {/* Main marker background */}
                <circle
                  cx={station.position.x}
                  cy={station.position.y}
                  r={markerSize}
                  fill={markerColor}
                  opacity={markerOpacity}
                >
                  <title>{player.name}</title>
                </circle>

                {/* White inner circle */}
                <circle
                  cx={station.position.x}
                  cy={station.position.y}
                  r={markerSize - 3}
                  fill="#FFFFFF"
                  opacity={markerOpacity}
                />

                {/* Icon circle background */}
                <circle
                  cx={station.position.x}
                  cy={station.position.y}
                  r={markerSize - 6}
                  fill={markerColor}
                  opacity={markerOpacity}
                />

                {/* Player icon */}
                <text
                  x={station.position.x}
                  y={station.position.y}
                  fill="#FFFFFF"
                  fontSize="18"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                  opacity={markerOpacity}
                  className="select-none"
                >
                  {isMrX ? '?' : 'D'}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
