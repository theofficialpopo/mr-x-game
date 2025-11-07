import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Station, Connection } from '@shared/types/board';

interface MapboxBoardProps {
  stations: Station[];
  connections: Connection[];
  onStationClick?: (stationId: number) => void;
  highlightedStations?: number[];
}

// Transport colors matching game theme
const TRANSPORT_COLORS = {
  taxi: '#FFD700',      // Gold
  bus: '#32CD32',       // Lime green
  underground: '#FF1493', // Deep pink
  water: '#00CED1',     // Dark turquoise
};

export function MapboxBoard({
  stations,
  connections,
  onStationClick,
  highlightedStations = [],
}: MapboxBoardProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Already initialized
    if (!mapContainer.current) return;

    // Check for Mapbox token
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.error('❌ Mapbox token not found!');
      console.error('💡 Make sure VITE_MAPBOX_ACCESS_TOKEN is set in .env');
      console.error('🔄 Restart the dev server after adding the token: pnpm dev');
      return;
    }

    mapboxgl.accessToken = token;

    // Get center from first station with geo coordinates
    const centerStation = stations.find(s => s.geoCoordinates);
    const center: [number, number] = centerStation?.geoCoordinates
      ? [centerStation.geoCoordinates.lng, centerStation.geoCoordinates.lat]
      : [-0.1278, 51.5074]; // London center fallback

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark theme
      center,
      zoom: 12,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
      addLayers();
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Add map layers
  const addLayers = () => {
    if (!map.current) return;

    // Convert stations to GeoJSON
    const stationsGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: stations
        .filter(s => s.geoCoordinates)
        .map(station => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [station.geoCoordinates!.lng, station.geoCoordinates!.lat],
          },
          properties: {
            id: station.id,
            transports: station.transports,
            // Calculate connection count for sizing
            connections: connections.filter(
              c => c.from === station.id || c.to === station.id
            ).length,
          },
        })),
    };

    // Convert connections to GeoJSON LineStrings
    const connectionsGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: connections
        .map(conn => {
          const from = stations.find(s => s.id === conn.from);
          const to = stations.find(s => s.id === conn.to);

          if (!from?.geoCoordinates || !to?.geoCoordinates) return null;

          return {
            type: 'Feature' as const,
            geometry: {
              type: 'LineString' as const,
              coordinates: [
                [from.geoCoordinates.lng, from.geoCoordinates.lat],
                [to.geoCoordinates.lng, to.geoCoordinates.lat],
              ],
            },
            properties: {
              type: conn.type,
              from: conn.from,
              to: conn.to,
            },
          };
        })
        .filter((f): f is GeoJSON.Feature => f !== null),
    };

    // Add connection lines source
    map.current!.addSource('connections', {
      type: 'geojson',
      data: connectionsGeoJSON,
    });

    // Add connection lines layer
    map.current!.addLayer({
      id: 'connection-lines',
      type: 'line',
      source: 'connections',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': [
          'match',
          ['get', 'type'],
          'taxi', TRANSPORT_COLORS.taxi,
          'bus', TRANSPORT_COLORS.bus,
          'underground', TRANSPORT_COLORS.underground,
          'water', TRANSPORT_COLORS.water,
          '#FFFFFF',
        ],
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 1,
          14, 3,
        ],
        'line-opacity': 0.6,
      },
    });

    // Add stations source
    map.current!.addSource('stations', {
      type: 'geojson',
      data: stationsGeoJSON,
    });

    // Add station circles layer
    map.current!.addLayer({
      id: 'station-circles',
      type: 'circle',
      source: 'stations',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'connections'],
          0, 6,
          5, 8,
          10, 10,
          15, 14,
        ],
        'circle-color': [
          'case',
          ['in', 'underground', ['get', 'transports']],
          TRANSPORT_COLORS.underground,
          ['in', 'bus', ['get', 'transports']],
          TRANSPORT_COLORS.bus,
          TRANSPORT_COLORS.taxi,
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF',
      },
    });

    // Add station labels for major hubs
    map.current!.addLayer({
      id: 'station-labels',
      type: 'symbol',
      source: 'stations',
      filter: ['>', ['get', 'connections'], 8],
      layout: {
        'text-field': ['get', 'id'],
        'text-size': 11,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': '#000000',
        'text-halo-width': 2,
      },
    });

    // Add click handler
    map.current!.on('click', 'station-circles', (e) => {
      if (e.features && e.features.length > 0) {
        const stationId = e.features[0].properties?.id;
        if (stationId && onStationClick) {
          onStationClick(stationId);
        }
      }
    });

    // Change cursor on hover
    map.current!.on('mouseenter', 'station-circles', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current!.on('mouseleave', 'station-circles', () => {
      map.current!.getCanvas().style.cursor = '';
    });
  };

  // Update highlighted stations
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Reset all stations
    stations.forEach(station => {
      map.current!.setFeatureState(
        { source: 'stations', id: station.id },
        { highlighted: false }
      );
    });

    // Highlight selected stations
    highlightedStations.forEach(stationId => {
      map.current!.setFeatureState(
        { source: 'stations', id: stationId },
        { highlighted: true }
      );
    });
  }, [highlightedStations, mapLoaded, stations]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h3 className="font-bold text-white mb-2 text-sm">Transport Types</h3>
        <div className="space-y-1">
          {Object.entries(TRANSPORT_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-8 h-0.5"
                style={{ backgroundColor: color }}
              />
              <span className="text-white text-xs capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-2"></div>
            <p className="text-white text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
