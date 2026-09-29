import { AirQualityReading, HotspotLocation, HotspotZone, AQICategory } from '../types';
import { calculateAQI } from './aqiCalculator';

// Distance calculation between two lat/lng points in km (Haversine formula)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function detectHotspots(readings: AirQualityReading[]): {
  individualHotspots: HotspotLocation[];
  hotspotZones: HotspotZone[];
} {
  const individualHotspots: HotspotLocation[] = [];

  for (const reading of readings) {
    const aqiResult = calculateAQI(reading.pm25, reading.pm10, reading.co, reading.no2);
    
    // Threshold: AQI > 150 marks an urban hotspot
    if (aqiResult.aqi > 150) {
      let severity: 'Moderate' | 'High' | 'Critical' = 'Moderate';
      if (aqiResult.aqi > 300) {
        severity = 'Critical';
      } else if (aqiResult.aqi > 200) {
        severity = 'High';
      }

      individualHotspots.push({
        id: reading.id,
        location: reading.location,
        district: reading.district,
        latitude: reading.latitude,
        longitude: reading.longitude,
        aqi: aqiResult.aqi,
        category: aqiResult.category,
        dominantPollutant: aqiResult.dominantPollutant,
        severity,
      });
    }
  }

  // Sort from highest AQI to lowest
  individualHotspots.sort((a, b) => b.aqi - a.aqi);

  // Proximity-based Clustering (within 25 km radius)
  const visited = new Set<string>();
  const hotspotZones: HotspotZone[] = [];
  const CLUSTER_DISTANCE_KM = 25;

  for (let i = 0; i < individualHotspots.length; i++) {
    const current = individualHotspots[i];
    if (visited.has(current.id)) continue;

    const cluster: HotspotLocation[] = [current];
    visited.add(current.id);

    for (let j = i + 1; j < individualHotspots.length; j++) {
      const neighbor = individualHotspots[j];
      if (visited.has(neighbor.id)) continue;

      const dist = getDistanceKm(current.latitude, current.longitude, neighbor.latitude, neighbor.longitude);
      if (dist <= CLUSTER_DISTANCE_KM) {
        cluster.push(neighbor);
        visited.add(neighbor.id);
      }
    }

    // Compute zone metrics
    const totalAqi = cluster.reduce((sum, loc) => sum + loc.aqi, 0);
    const avgAqi = Math.round(totalAqi / cluster.length);
    const highestAqi = Math.max(...cluster.map((loc) => loc.aqi));
    const highestLoc = cluster.find((loc) => loc.aqi === highestAqi) || cluster[0];

    const centerLat = cluster.reduce((sum, l) => sum + l.latitude, 0) / cluster.length;
    const centerLng = cluster.reduce((sum, l) => sum + l.longitude, 0) / cluster.length;

    let zoneSeverity: 'Moderate' | 'High' | 'Critical' = 'Moderate';
    if (highestAqi > 300) zoneSeverity = 'Critical';
    else if (highestAqi > 200) zoneSeverity = 'High';

    const zoneName = cluster.length > 1 
      ? `${current.district} Metro Pollution Cluster (${cluster.map(c => c.location).join(', ')})`
      : `${current.location} Hotspot Zone (${current.district})`;

    hotspotZones.push({
      zoneName,
      locations: cluster,
      averageAqi: avgAqi,
      highestAqi,
      dominantPollutant: highestLoc.dominantPollutant,
      severity: zoneSeverity,
      estimatedRisk: zoneSeverity === 'Critical' 
        ? 'Extreme atmospheric saturation with severe public health hazard.' 
        : zoneSeverity === 'High' 
        ? 'Stagnant emission corridor with heightened respiratory risk.'
        : 'Elevated particle concentration above national ambient benchmarks.',
      centerLat,
      centerLng,
    });
  }

  // Sort zones by highest AQI
  hotspotZones.sort((a, b) => b.highestAqi - a.highestAqi);

  return {
    individualHotspots,
    hotspotZones,
  };
}
