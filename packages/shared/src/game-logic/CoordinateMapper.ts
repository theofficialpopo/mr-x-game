/**
 * Maps board pixel coordinates to geographic coordinates (latitude/longitude)
 * for rendering on real maps like Mapbox
 */
export class CoordinateMapper {
  // Board space bounds from scotland-yard-data analysis
  private readonly BOARD_BOUNDS = {
    x: { min: 33, max: 1593 },
    y: { min: 15, max: 1191 },
  };

  // London geographic bounds for MVP (roughly Zone 1-2)
  // These bounds cover central London where the Scotland Yard game takes place
  private readonly LONDON_BOUNDS = {
    lat: { min: 51.45, max: 51.55 },
    lng: { min: -0.20, max: 0.05 },
  };

  /**
   * Convert board pixel coordinates to geographic coordinates
   * Uses linear interpolation (lerp) for mapping
   */
  boardToGeo(x: number, y: number): { lat: number; lng: number } {
    // Map X coordinate to longitude
    const lng = this.lerp(
      x,
      this.BOARD_BOUNDS.x.min,
      this.BOARD_BOUNDS.x.max,
      this.LONDON_BOUNDS.lng.min,
      this.LONDON_BOUNDS.lng.max
    );

    // Map Y coordinate to latitude (inverted because Y increases downward on screen)
    const lat = this.lerp(
      y,
      this.BOARD_BOUNDS.y.min,
      this.BOARD_BOUNDS.y.max,
      this.LONDON_BOUNDS.lat.max, // Inverted
      this.LONDON_BOUNDS.lat.min  // Inverted
    );

    return { lat, lng };
  }

  /**
   * Convert geographic coordinates back to board pixel coordinates
   */
  geoToBoard(lat: number, lng: number): { x: number; y: number } {
    const x = this.lerp(
      lng,
      this.LONDON_BOUNDS.lng.min,
      this.LONDON_BOUNDS.lng.max,
      this.BOARD_BOUNDS.x.min,
      this.BOARD_BOUNDS.x.max
    );

    const y = this.lerp(
      lat,
      this.LONDON_BOUNDS.lat.max, // Inverted
      this.LONDON_BOUNDS.lat.min,  // Inverted
      this.BOARD_BOUNDS.y.min,
      this.BOARD_BOUNDS.y.max
    );

    return { x, y };
  }

  /**
   * Get the center point of the board in geographic coordinates
   */
  getBoardCenter(): { lat: number; lng: number } {
    const centerX = (this.BOARD_BOUNDS.x.min + this.BOARD_BOUNDS.x.max) / 2;
    const centerY = (this.BOARD_BOUNDS.y.min + this.BOARD_BOUNDS.y.max) / 2;
    return this.boardToGeo(centerX, centerY);
  }

  /**
   * Get London bounds for map initialization
   */
  getLondonBounds() {
    return {
      north: this.LONDON_BOUNDS.lat.max,
      south: this.LONDON_BOUNDS.lat.min,
      east: this.LONDON_BOUNDS.lng.max,
      west: this.LONDON_BOUNDS.lng.min,
    };
  }

  /**
   * Linear interpolation helper
   * Maps a value from one range to another
   */
  private lerp(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    // Handle edge cases
    if (inMax === inMin) return outMin;

    // Linear interpolation formula
    const normalized = (value - inMin) / (inMax - inMin);
    return outMin + normalized * (outMax - outMin);
  }

  /**
   * Calculate distance between two geographic points in kilometers
   * Uses Haversine formula
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
