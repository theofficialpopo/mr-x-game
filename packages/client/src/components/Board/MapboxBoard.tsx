import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Station, Connection } from '@shared/types/board';
import type { Player } from '@shared/types/game';
import { TRANSPORT_COLORS } from '@shared';

interface MapboxBoardProps {
  stations: Station[];
  connections: Connection[];
  onStationClick?: (stationId: number) => void;
  highlightedStations?: number[];
  players?: Player[];
  isMrXRevealed?: boolean;
}

export function MapboxBoard({
  stations,
  connections,
  onStationClick,
  highlightedStations = [],
  players = [],
  isMrXRevealed = false,
}: MapboxBoardProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const playerMarkers = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    console.log('🗺️ MapboxBoard useEffect triggered');

    if (map.current) {
      console.log('⏭️ Map already initialized, skipping');
      return;
    }

    if (!mapContainer.current) {
      console.log('⚠️ Map container not ready yet');
      return;
    }

    // Check for Mapbox token
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    console.log('🔑 Mapbox token check:', token ? `Found (${token.substring(0, 20)}...)` : 'NOT FOUND');

    if (!token) {
      console.error('❌ Mapbox token not found!');
      console.error('💡 Make sure VITE_MAPBOX_ACCESS_TOKEN is set in .env');
      console.error('🔄 Restart the dev server after adding the token: pnpm dev');
      return;
    }

    mapboxgl.accessToken = token;
    console.log('✅ Mapbox access token set');

    // Get center from first station with geo coordinates
    const centerStation = stations.find(s => s.geoCoordinates);
    const center: [number, number] = centerStation?.geoCoordinates
      ? [centerStation.geoCoordinates.lng, centerStation.geoCoordinates.lat]
      : [-0.1278, 51.5074]; // London center fallback

    console.log('📍 Map center:', center, 'from station:', centerStation?.id || 'fallback');

    try {
      console.log('🏗️ Creating Mapbox map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Light streets theme
        center,
        zoom: 12,
        pitch: 0,
        bearing: 0,
        antialias: true,
      });
      console.log('✅ Map instance created successfully');

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      console.log('✅ Navigation controls added');

      // Add error handler
      map.current.on('error', (e) => {
        console.error('❌ Mapbox error:', e);
      });

      map.current.on('load', () => {
        console.log('🎉 Map loaded successfully!');
        setMapLoaded(true);
        addLayers();
      });

      console.log('👂 Map load event listener attached');
    } catch (error) {
      console.error('❌ Error creating map:', error);
    }

    return () => {
      console.log('🧹 Cleaning up map instance');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add map layers
  const addLayers = () => {
    console.log('🎨 addLayers called');
    if (!map.current) {
      console.error('❌ Map instance not available in addLayers');
      return;
    }

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
    const connectionFeatures: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    connections.forEach(conn => {
      const from = stations.find(s => s.id === conn.from);
      const to = stations.find(s => s.id === conn.to);

      if (!from?.geoCoordinates || !to?.geoCoordinates) return;

      connectionFeatures.push({
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
      });
    });

    const connectionsGeoJSON: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: connectionFeatures,
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

  // Update player markers
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Remove all existing markers
    playerMarkers.current.forEach(marker => marker.remove());
    playerMarkers.current.clear();

    // Add markers for each player
    players.forEach((player: Player) => {
      const station = stations.find(s => s.id === player.position);
      if (!station?.geoCoordinates) return;

      // Hide Mr. X marker if not revealed
      if (player.role === 'mr-x' && !isMrXRevealed) {
        return;
      }

      // Create marker element
      const el = document.createElement('div');
      el.className = 'player-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.border = player.role === 'mr-x' ? '3px solid #FF1493' : '3px solid #00CED1';
      el.style.backgroundColor = player.role === 'mr-x' ? '#FF1493' : '#00CED1';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '20px';
      el.style.pointerEvents = 'none'; // Allow clicks to pass through to stations
      el.style.boxShadow = player.role === 'mr-x'
        ? '0 0 20px rgba(255, 20, 147, 0.6)'
        : '0 0 20px rgba(0, 206, 209, 0.6)';
      el.style.transition = 'all 0.3s ease';
      el.innerHTML = player.role === 'mr-x' ? '❓' : '🔍';
      el.title = player.name;

      // Create and add marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([station.geoCoordinates.lng, station.geoCoordinates.lat])
        .addTo(map.current!);

      playerMarkers.current.set(player.id, marker);
    });

    return () => {
      // Cleanup markers on unmount
      playerMarkers.current.forEach(marker => marker.remove());
      playerMarkers.current.clear();
    };
  }, [players, isMrXRevealed, mapLoaded, stations]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 z-0" />

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
