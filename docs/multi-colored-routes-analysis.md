# Multi-Colored Routes Analysis - Mr. X Game

## Executive Summary

This document provides an in-depth analysis of implementing multi-colored routes between stations in the Mr. X game, leveraging Mapbox's navigation APIs to create realistic, curved route visualizations instead of straight lines.

**Goal:** Display routes between stations that:
- Follow actual streets/paths (curved, realistic geometry)
- Support multiple transport types with color-coded segments
- Visually distinguish between taxi, bus, underground, and water routes
- Provide smooth, animated transitions

---

## Table of Contents

1. [Current State & Limitations](#1-current-state--limitations)
2. [Mapbox Navigation Options](#2-mapbox-navigation-options)
3. [Approach Comparison](#3-approach-comparison)
4. [Recommended Architecture](#4-recommended-architecture)
5. [Technical Implementation](#5-technical-implementation)
6. [Rendering Multi-Colored Routes](#6-rendering-multi-colored-routes)
7. [Performance Considerations](#7-performance-considerations)
8. [Cost Analysis](#8-cost-analysis)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Alternative Approaches](#10-alternative-approaches)

---

## 1. Current State & Limitations

### What We Have

**✅ Solid Foundation:**
- Board graph with 199 stations, 468 connections
- Pathfinding algorithms (BFS, Dijkstra) implemented
- Mapbox GL JS integration with dark theme
- Coordinate mapping (SVG ↔ Geographic)
- Transport type system (Taxi, Bus, Underground, Water)
- GeoJSON-based rendering

**❌ Current Limitations:**
- Routes rendered as **straight lines** between stations
- No visual path rendering (only pathfinding logic exists)
- No multi-segment route visualization
- No realistic street-following geometry
- No route animation or progression

### Why Straight Lines Are Limiting

```
Station A ------------------- Station B
          (straight line)
```

**Problems:**
- Doesn't follow actual streets
- Ignores geographic barriers (Thames, buildings, etc.)
- Unrealistic for game immersion
- Doesn't reflect real transport routes

---

## 2. Mapbox Navigation Options

Mapbox provides several APIs for generating routes with realistic geometry:

### Option A: Mapbox Directions API

**What it does:** Generates turn-by-turn directions with actual route geometry

**Endpoint:**
```
https://api.mapbox.com/directions/v5/mapbox/{profile}/{coordinates}
```

**Profiles Available:**
- `driving-traffic` - Car routes with live traffic
- `driving` - Car routes without traffic
- `walking` - Pedestrian routes
- `cycling` - Bicycle routes

**Response Contains:**
- **Route geometry** (encoded polyline or GeoJSON)
- Turn-by-turn instructions
- Distance and duration
- Alternative routes
- Waypoint snapping

**Example Request:**
```javascript
const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${token}`;
```

**Example Response:**
```json
{
  "routes": [
    {
      "geometry": {
        "coordinates": [
          [-0.1278, 51.5074],
          [-0.1275, 51.5076],
          [-0.1270, 51.5078],
          ...
        ],
        "type": "LineString"
      },
      "distance": 1234.5,
      "duration": 246.9
    }
  ]
}
```

**Pros:**
- ✅ Realistic street-following geometry
- ✅ Curved, natural-looking routes
- ✅ Multiple routing profiles
- ✅ Alternative routes available
- ✅ Well-documented, mature API

**Cons:**
- ❌ **API costs** (see section 8)
- ❌ Rate limits (300 requests/minute for enterprise)
- ❌ Doesn't inherently support "multi-transport" routes
- ❌ Network latency for API calls

---

### Option B: Mapbox Isochrone API

**What it does:** Shows areas reachable within time/distance limits

**Use Case:** Visualization of "what's within X moves" - not for individual routes

**Not recommended** for this use case.

---

### Option C: Mapbox Matrix API

**What it does:** Calculates travel time/distance between multiple points

**Use Case:** Optimization problems, heatmaps

**Not recommended** for route visualization.

---

## 3. Approach Comparison

### Approach 1: Pure Mapbox Directions API

**Strategy:** Use Mapbox Directions for every route segment

**Workflow:**
1. User selects start/end stations
2. Calculate path using game logic (respects transport constraints)
3. For each segment in path, call Mapbox Directions API
4. Render resulting geometry with segment-specific colors

**Example:**
```
Path: Station 1 → 2 (taxi) → 3 (bus) → 4 (underground)

Mapbox Calls:
1. walking/1→2 (color: gold for taxi)
2. walking/2→3 (color: green for bus)
3. walking/3→4 (color: pink for underground)
```

**Pros:**
- ✅ Most realistic routes (follows actual streets)
- ✅ Smooth, curved geometry
- ✅ Easy to understand and implement

**Cons:**
- ❌ High API usage (one call per segment)
- ❌ Expensive at scale
- ❌ Network latency
- ❌ Doesn't respect game transport semantics (bus ≠ car)

---

### Approach 2: Hybrid - Directions API + Caching

**Strategy:** Pre-compute and cache common routes

**Workflow:**
1. **Pre-compute phase:**
   - Generate routes for all direct connections (468)
   - Store geometry in local database
   - One-time API cost

2. **Runtime phase:**
   - Lookup cached geometry
   - Stitch together multi-segment routes
   - Apply colors based on transport type

**Storage Example:**
```json
{
  "connections": [
    {
      "from": 1,
      "to": 13,
      "transport": "taxi",
      "geometry": {
        "type": "LineString",
        "coordinates": [[...], [...], ...]
      }
    }
  ]
}
```

**Pros:**
- ✅ Realistic geometry without runtime API costs
- ✅ Fast performance (no network calls)
- ✅ Predictable behavior
- ✅ Works offline after initial load

**Cons:**
- ❌ Upfront API cost (~468 requests for all connections)
- ❌ Static routes (don't update with real-world changes)
- ❌ Storage overhead (~500KB estimated)
- ❌ Still doesn't perfectly map game transports to Mapbox profiles

---

### Approach 3: Custom Curve Generation (No Mapbox Directions)

**Strategy:** Generate curved geometry algorithmically

**Techniques:**
- **Bezier curves** between stations
- **Spline interpolation** for smooth paths
- **Street network snapping** using Mapbox vector tiles

**Example:**
```javascript
// Quadratic Bezier curve
function generateCurve(start, end, controlPoint) {
  const points = [];
  for (let t = 0; t <= 1; t += 0.01) {
    const x = (1-t)² * start.x + 2(1-t)t * control.x + t² * end.x;
    const y = (1-t)² * start.y + 2(1-t)t * control.y + t² * end.y;
    points.push([x, y]);
  }
  return points;
}
```

**Pros:**
- ✅ Zero API costs
- ✅ Full control over aesthetics
- ✅ No network latency
- ✅ Works entirely offline

**Cons:**
- ❌ Not realistic (doesn't follow streets)
- ❌ Complex algorithm development
- ❌ May look "fake" or artificial
- ❌ Difficult to avoid geographic obstacles (Thames, buildings)

---

### Approach 4: Mapbox GL JS Snapping (Advanced)

**Strategy:** Use Mapbox's vector tile streets as a routing network

**Workflow:**
1. Load Mapbox streets vector tiles
2. Extract road network geometry
3. Implement custom routing on client side
4. Snap routes to nearest streets

**Pros:**
- ✅ No Directions API costs
- ✅ Streets-aligned geometry
- ✅ Full customization

**Cons:**
- ❌ Extremely complex to implement
- ❌ Requires custom routing engine
- ❌ Performance overhead
- ❌ Significant development time
- ❌ May violate Mapbox Terms of Service

---

## 4. Recommended Architecture

### Recommendation: **Hybrid Approach with Smart Caching**

**Why:** Balances realism, performance, and cost

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Game Client                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐         ┌──────────────────┐            │
│  │ Route Planner│────────▶│ Geometry Service │            │
│  └──────────────┘         └──────────────────┘            │
│         │                          │                       │
│         │                          ▼                       │
│         │                  ┌──────────────┐               │
│         │                  │ Cache Layer  │               │
│         │                  └──────────────┘               │
│         │                          │                       │
│         │                          │ miss                  │
│         │                          ▼                       │
│         │                  ┌──────────────┐               │
│         │                  │  Mapbox API  │               │
│         │                  └──────────────┘               │
│         ▼                                                  │
│  ┌──────────────────────────────────────┐                │
│  │   Multi-Colored Route Renderer       │                │
│  │   (Mapbox GL JS Layers)              │                │
│  └──────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. Route Planner
- Uses existing `Board.findShortestPath()` or `Board.dijkstra()`
- Returns sequence of stations with transport types
- Example output: `[{from: 1, to: 13, type: 'taxi'}, {from: 13, to: 46, type: 'bus'}]`

#### 2. Geometry Service
- Fetches route geometry for each segment
- Checks cache first
- Falls back to Mapbox Directions API
- Returns array of styled segments

#### 3. Cache Layer
- **IndexedDB** for persistent storage
- Stores pre-computed geometries for all 468 connections
- TTL: Never expire (static game board)
- Fallback: LocalStorage or in-memory cache

#### 4. Multi-Colored Route Renderer
- Creates Mapbox layers for each segment
- Applies transport-specific colors
- Handles animations and transitions

---

## 5. Technical Implementation

### Phase 1: Pre-compute Connection Geometries

**Goal:** Generate and cache geometry for all 468 connections

#### 5.1 Build-Time Script

Create `/packages/shared/src/scripts/generateRouteGeometry.ts`:

```typescript
import { Board } from '../game-logic/Board';
import { Connection, TransportType } from '../types/board';

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

interface ConnectionGeometry {
  from: number;
  to: number;
  transport: TransportType;
  geometry: GeoJSON.LineString;
  distance: number;
  duration: number;
}

// Map game transports to Mapbox profiles
const TRANSPORT_PROFILES: Record<TransportType, string> = {
  taxi: 'driving',      // Taxi = car
  bus: 'driving',       // Bus = car (could use 'driving-traffic')
  underground: 'walking', // Underground = straight walk (conceptual)
  water: 'walking'      // Water = boat (no boat profile, use walking)
};

async function fetchRouteGeometry(
  from: Station,
  to: Station,
  transport: TransportType
): Promise<GeoJSON.LineString> {
  const profile = TRANSPORT_PROFILES[transport];
  const coords = `${from.geoCoordinates.lng},${from.geoCoordinates.lat};${to.geoCoordinates.lng},${to.geoCoordinates.lat}`;

  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error(`No route found for ${from.id} → ${to.id}`);
  }

  return data.routes[0].geometry;
}

async function generateAllGeometries(board: Board): Promise<ConnectionGeometry[]> {
  const geometries: ConnectionGeometry[] = [];
  const connections = board.getAllConnections();

  // Rate limiting: 300 requests/minute = ~5 req/sec
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < connections.length; i++) {
    const conn = connections[i];
    const fromStation = board.getStation(conn.from);
    const toStation = board.getStation(conn.to);

    try {
      const geometry = await fetchRouteGeometry(fromStation, toStation, conn.type);

      geometries.push({
        from: conn.from,
        to: conn.to,
        transport: conn.type,
        geometry,
        distance: calculateDistance(geometry),
        duration: 0 // Not needed for game
      });

      console.log(`✓ Generated ${i + 1}/${connections.length}: ${conn.from} → ${conn.to} (${conn.type})`);

      // Rate limiting: wait 250ms between requests
      await delay(250);

    } catch (error) {
      console.error(`✗ Failed ${conn.from} → ${conn.to}:`, error.message);
    }
  }

  return geometries;
}

async function main() {
  const board = await loadBoard();
  const geometries = await generateAllGeometries(board);

  // Save to JSON file
  const output = {
    generated: new Date().toISOString(),
    count: geometries.length,
    geometries
  };

  await writeFile(
    './public/data/route-geometries.json',
    JSON.stringify(output, null, 2)
  );

  console.log(`\n✅ Generated ${geometries.length} route geometries`);
  console.log(`📁 Saved to route-geometries.json`);
}

main();
```

**Execution:**
```bash
cd packages/shared
tsx src/scripts/generateRouteGeometry.ts
```

**Output:** `/packages/client/public/data/route-geometries.json`

**Estimated Time:** 468 connections ÷ 4 req/sec ≈ **2 minutes**

**Estimated Cost:** 468 requests × $0.000 (first 100k free) = **$0**

---

### Phase 2: Geometry Service

Create `/packages/client/src/services/RouteGeometryService.ts`:

```typescript
import { TransportType } from '@mr-x/shared/types/board';

interface CachedGeometry {
  geometry: GeoJSON.LineString;
  transport: TransportType;
}

class RouteGeometryService {
  private cache: Map<string, CachedGeometry> = new Map();
  private geometriesLoaded = false;

  async initialize() {
    if (this.geometriesLoaded) return;

    const response = await fetch('/data/route-geometries.json');
    const data = await response.json();

    for (const item of data.geometries) {
      const key = this.getCacheKey(item.from, item.to, item.transport);
      this.cache.set(key, {
        geometry: item.geometry,
        transport: item.transport
      });
    }

    this.geometriesLoaded = true;
    console.log(`✅ Loaded ${this.cache.size} cached geometries`);
  }

  private getCacheKey(from: number, to: number, transport: TransportType): string {
    // Bidirectional: normalize order
    const [a, b] = from < to ? [from, to] : [to, from];
    return `${a}-${b}-${transport}`;
  }

  getGeometry(from: number, to: number, transport: TransportType): GeoJSON.LineString | null {
    const key = this.getCacheKey(from, to, transport);
    const cached = this.cache.get(key);

    if (cached) {
      return cached.geometry;
    }

    console.warn(`⚠️  No cached geometry for ${from} → ${to} (${transport})`);
    return null;
  }

  // Fallback: generate straight line
  getFallbackGeometry(from: Station, to: Station): GeoJSON.LineString {
    return {
      type: 'LineString',
      coordinates: [
        [from.geoCoordinates.lng, from.geoCoordinates.lat],
        [to.geoCoordinates.lng, to.geoCoordinates.lat]
      ]
    };
  }
}

export const routeGeometryService = new RouteGeometryService();
```

---

### Phase 3: Route Planner Integration

Create `/packages/client/src/services/RoutePlannerService.ts`:

```typescript
import { Board } from '@mr-x/shared/game-logic/Board';
import { TransportType } from '@mr-x/shared/types/board';
import { routeGeometryService } from './RouteGeometryService';

export interface RouteSegment {
  from: number;
  to: number;
  transport: TransportType;
  geometry: GeoJSON.LineString;
  color: string;
}

export interface Route {
  segments: RouteSegment[];
  totalDistance: number;
  totalHops: number;
}

const TRANSPORT_COLORS: Record<TransportType, string> = {
  taxi: '#FFD700',      // Gold
  bus: '#32CD32',       // Lime Green
  underground: '#FF1493', // Deep Pink
  water: '#00CED1'      // Dark Turquoise
};

export class RoutePlannerService {
  constructor(private board: Board) {}

  planRoute(
    startStation: number,
    endStation: number,
    allowedTransports: TransportType[]
  ): Route | null {
    // Use existing pathfinding
    const path = this.board.findShortestPath(
      startStation,
      endStation,
      allowedTransports
    );

    if (!path || path.length < 2) {
      return null;
    }

    const segments: RouteSegment[] = [];

    // Convert path to segments with geometry
    for (let i = 0; i < path.length - 1; i++) {
      const from = path[i];
      const to = path[i + 1];

      // Determine transport type for this segment
      const transport = this.getTransportForSegment(from, to, allowedTransports);

      // Get geometry (cached or fallback)
      let geometry = routeGeometryService.getGeometry(from, to, transport);

      if (!geometry) {
        const fromStation = this.board.getStation(from);
        const toStation = this.board.getStation(to);
        geometry = routeGeometryService.getFallbackGeometry(fromStation, toStation);
      }

      segments.push({
        from,
        to,
        transport,
        geometry,
        color: TRANSPORT_COLORS[transport]
      });
    }

    return {
      segments,
      totalDistance: this.calculateTotalDistance(segments),
      totalHops: segments.length
    };
  }

  private getTransportForSegment(
    from: number,
    to: number,
    allowed: TransportType[]
  ): TransportType {
    // Check which transports connect these stations
    for (const transport of allowed) {
      if (this.board.areConnected(from, to, transport)) {
        return transport;
      }
    }

    // Fallback (should never happen with valid path)
    return 'taxi';
  }

  private calculateTotalDistance(segments: RouteSegment[]): number {
    // Sum up geometry lengths
    return segments.reduce((total, seg) => {
      return total + this.getGeometryLength(seg.geometry);
    }, 0);
  }

  private getGeometryLength(geometry: GeoJSON.LineString): number {
    // Haversine distance calculation
    // Implementation available in CoordinateMapper
    return 0; // Placeholder
  }
}
```

---

## 6. Rendering Multi-Colored Routes

### Approach A: Multiple Layers (Recommended)

**Strategy:** Create one Mapbox layer per segment

**Advantages:**
- Easy to implement
- Each segment independently styled
- Easy to animate/highlight individual segments

**Implementation:**

```typescript
import { useEffect } from 'react';
import { Route, RouteSegment } from '../services/RoutePlannerService';

export function useRouteRenderer(map: mapboxgl.Map | null, route: Route | null) {
  useEffect(() => {
    if (!map || !route) return;

    // Remove previous route layers
    cleanupRouteLayers(map);

    // Add each segment as a separate layer
    route.segments.forEach((segment, index) => {
      const sourceId = `route-segment-${index}`;
      const layerId = `route-segment-layer-${index}`;

      // Add source
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: segment.geometry,
          properties: {
            transport: segment.transport,
            color: segment.color
          }
        }
      });

      // Add layer
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': segment.color,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 3,
            14, 8
          ],
          'line-opacity': 0.9
        }
      });
    });

    return () => cleanupRouteLayers(map);
  }, [map, route]);
}

function cleanupRouteLayers(map: mapboxgl.Map) {
  const layers = map.getStyle().layers;
  layers.forEach(layer => {
    if (layer.id.startsWith('route-segment')) {
      map.removeLayer(layer.id);
      map.removeSource(layer.id.replace('-layer', ''));
    }
  });
}
```

**Visual Result:**
```
Station A ~~~~gold~~~~ Station B ====green==== Station C ----pink---- Station D
           (taxi)                  (bus)                  (underground)
```

---

### Approach B: Single Layer with Gradient (Advanced)

**Strategy:** Use Mapbox GL JS line-gradient feature

**Advantages:**
- Single layer = better performance
- Smooth color transitions
- Less layer management

**Limitations:**
- Gradient must be along single LineString
- Requires merging all segments into one geometry
- Complex gradient stops calculation

**Implementation:**

```typescript
function createGradientRoute(segments: RouteSegment[]): GeoJSON.Feature {
  // Merge all segment coordinates into one LineString
  const allCoordinates: Position[] = [];
  const colorStops: [number, string][] = [];

  let totalLength = 0;
  const segmentLengths: number[] = [];

  // Calculate lengths
  segments.forEach(seg => {
    const len = getLineStringLength(seg.geometry);
    segmentLengths.push(len);
    totalLength += len;
  });

  // Build combined geometry and color stops
  let currentLength = 0;
  segments.forEach((seg, i) => {
    allCoordinates.push(...seg.geometry.coordinates);

    const startProgress = currentLength / totalLength;
    const endProgress = (currentLength + segmentLengths[i]) / totalLength;

    colorStops.push([startProgress, seg.color]);
    colorStops.push([endProgress, seg.color]);

    currentLength += segmentLengths[i];
  });

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: allCoordinates
    },
    properties: {
      colorStops: JSON.stringify(colorStops)
    }
  };
}

// In Mapbox layer:
map.addLayer({
  id: 'gradient-route',
  type: 'line',
  source: 'route',
  paint: {
    'line-width': 6,
    'line-gradient': [
      'interpolate',
      ['linear'],
      ['line-progress'],
      ...colorStops.flat() // [0, 'gold', 0.33, 'gold', 0.33, 'green', 0.66, 'green', ...]
    ]
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
});
```

**Note:** Requires `lineMetrics: true` in source configuration.

---

### Approach C: Animated Route Drawing

**Strategy:** Animate route appearance with dash-array

```typescript
function animateRoute(map: mapboxgl.Map, layerId: string) {
  let step = 0;
  const dashArraySequence = [
    [0, 4, 3],
    [0.5, 4, 2.5],
    [1, 4, 2],
    [1.5, 4, 1.5],
    [2, 4, 1],
    [2.5, 4, 0.5],
    [3, 4, 0],
    [0, 0.5, 3, 3.5]
  ];

  function animateDashArray(timestamp: number) {
    const newStep = Math.floor((timestamp / 50) % dashArraySequence.length);

    if (newStep !== step) {
      map.setPaintProperty(
        layerId,
        'line-dasharray',
        dashArraySequence[step]
      );
      step = newStep;
    }

    requestAnimationFrame(animateDashArray);
  }

  animateDashArray(0);
}
```

---

## 7. Performance Considerations

### Client-Side Performance

**Challenge:** Rendering many complex routes simultaneously

**Optimizations:**

1. **Layer Limits**
   - Mapbox GL JS handles 100+ layers efficiently
   - For 10 simultaneous routes × 3 segments = 30 layers ✅

2. **GeoJSON Simplification**
   - Use Turf.js `simplify()` to reduce coordinate count
   - Balance: accuracy vs. performance

```typescript
import { simplify } from '@turf/simplify';

const simplified = simplify(geometry, {
  tolerance: 0.0001,  // ~10 meters
  highQuality: false
});
```

3. **Visibility Culling**
   - Only render routes in current viewport
   - Use Mapbox's `filter` expressions

```typescript
map.setFilter('route-layer', [
  'within',
  ['literal', viewportBounds]
]);
```

4. **Level of Detail**
   - Show simplified routes at low zoom
   - Full detail at high zoom

```typescript
'line-width': [
  'interpolate',
  ['exponential', 2],
  ['zoom'],
  10, 2,   // Low zoom = thin lines
  18, 10   // High zoom = thick lines
]
```

---

### Network Performance

**Challenge:** Loading 500KB route-geometries.json on startup

**Solutions:**

1. **Compression**
   - gzip: ~500KB → ~80KB ✅
   - Enable in server config

2. **Lazy Loading**
   - Load geometries on-demand
   - Split into chunks by region

3. **Progressive Enhancement**
   - Show straight lines initially
   - Upgrade to curves when loaded

---

## 8. Cost Analysis

### Mapbox Directions API Pricing

**Free Tier:** 100,000 requests/month

**Our Usage:**

**One-Time Pre-computation:**
- 468 connections × 1 request = 468 requests
- **Cost: $0** (within free tier)

**Runtime (if not cached):**
- Assume 100 route requests/day
- Average 3 segments per route
- 100 × 3 × 30 days = 9,000 requests/month
- **Cost: $0** (within free tier)

**Scaling (if game becomes popular):**
- 10,000 users × 10 routes/day = 100,000 requests/day
- 3,000,000 requests/month
- Exceeds free tier by 2,900,000 requests
- At $0.50/1000 requests: **$1,450/month**

**Mitigation with Caching:**
- Pre-computed geometries eliminate runtime costs
- **Cost: $0/month** regardless of user count ✅

---

### Mapbox GL JS Costs

**Free Tier:** 50,000 map loads/month

**Our Usage:**
- Each user loads map once per session
- 1,000 users/day = 30,000 loads/month
- **Cost: $0** (within free tier) ✅

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create `generateRouteGeometry.ts` script
- [ ] Run script to generate `route-geometries.json`
- [ ] Verify all 468 connections have geometry
- [ ] Add file to git repository

**Deliverable:** Static geometry file ready for use

---

### Phase 2: Service Layer (Week 2)
- [ ] Implement `RouteGeometryService` with caching
- [ ] Implement `RoutePlannerService` integration
- [ ] Write unit tests for geometry loading
- [ ] Add error handling for missing geometries

**Deliverable:** Services ready to provide route data

---

### Phase 3: UI Integration (Week 3)
- [ ] Add route selection UI (start/end station pickers)
- [ ] Create `useRouteRenderer` hook
- [ ] Implement multi-layer rendering approach
- [ ] Add transport type filters

**Deliverable:** User can plan and visualize routes

---

### Phase 4: Visual Polish (Week 4)
- [ ] Add route animation (dash-array or path drawing)
- [ ] Implement color transitions
- [ ] Add route highlights on hover
- [ ] Create route legend
- [ ] Add distance/duration display

**Deliverable:** Polished, production-ready feature

---

### Phase 5: Optimization (Week 5)
- [ ] Implement GeoJSON simplification
- [ ] Add viewport-based culling
- [ ] Optimize layer management
- [ ] Add loading states and skeleton UI
- [ ] Performance testing with 10+ routes

**Deliverable:** Smooth, performant experience

---

## 10. Alternative Approaches

### If Mapbox Directions is Unsuitable

#### Alternative 1: OpenRouteService API

**Similar to Mapbox but open-source:**
- Free tier: 2,000 requests/day
- Multiple routing profiles
- GeoJSON responses

**Pros:**
- Open source
- Generous free tier

**Cons:**
- Slower response times
- Less reliable than Mapbox

---

#### Alternative 2: GraphHopper API

**Open-source routing engine:**
- Self-hostable
- Multiple transport modes
- Route optimization

**Pros:**
- Can self-host (no API costs)
- Full control

**Cons:**
- Infrastructure overhead
- Requires OSM data import

---

#### Alternative 3: OSRM (Open Source Routing Machine)

**Self-hosted routing:**
- Download OSM data for London
- Run OSRM Docker container
- Free routing API

**Pros:**
- Zero API costs
- Fast responses
- Full privacy

**Cons:**
- DevOps complexity
- Storage requirements (~5GB for London)
- Maintenance burden

---

## Conclusion

### Recommended Solution

**Hybrid Approach with Mapbox Directions + Caching:**

1. **Pre-compute** all 468 connection geometries (one-time, 2 minutes)
2. **Store** in `route-geometries.json` (~500KB, gzipped to 80KB)
3. **Load** on client initialization
4. **Render** multi-colored routes using multiple Mapbox layers
5. **Animate** with dash-array or gradient transitions

**Why This Wins:**
- ✅ Realistic, street-following routes
- ✅ Zero runtime API costs
- ✅ Fast performance (no network calls)
- ✅ Offline-capable
- ✅ Easy to implement and maintain
- ✅ Scales to unlimited users

---

### Next Steps

1. Review this analysis with team
2. Approve approach and budget
3. Begin Phase 1 implementation
4. Set up Mapbox token with appropriate limits
5. Create GitHub issues for each phase

---

### Visual Mock-Up

```
┌─────────────────────────────────────────────────────────────┐
│  Mr. X Game - Route Planning                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  From: [Station 1  ▼]     To: [Station 67 ▼]              │
│                                                             │
│  Transport: [✓] Taxi  [✓] Bus  [✓] Underground  [ ] Water  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                     [Map View]                        │ │
│  │                                                       │ │
│  │        Station 1                                      │ │
│  │            ●~~~~~(gold)~~~~~●                        │ │
│  │         Station 13          |                         │ │
│  │                             ===(green)===●            │ │
│  │                                      Station 46       │ │
│  │                                           |           │ │
│  │                                      ----(pink)----●  │ │
│  │                                              Station 67│ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Route Summary:                                             │
│  • 4 stations, 3 hops                                       │
│  • Distance: 5.2 km                                         │
│  • Transports: Taxi → Bus → Underground                    │
│                                                             │
│  Legend:                                                    │
│  ~~~~  Taxi (gold)        ====  Bus (green)                │
│  ----  Underground (pink) ≈≈≈≈  Water (turquoise)          │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0
**Author:** Claude Code Agent
**Date:** 2025-11-08
**Status:** Proposal - Awaiting Approval
