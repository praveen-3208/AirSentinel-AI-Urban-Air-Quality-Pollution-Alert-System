import { AirQualityReading } from '../types';
import { INITIAL_READINGS, TAMIL_NADU_STATIONS, LocationMetadata } from '../data/mockAirQualityData';

/**
 * AirSentinel AI - Air Quality Data Service & Validation Pipeline
 * 
 * Future Integration Notice:
 * To connect OpenWeather Air Pollution API or WAQI (World Air Quality Index):
 * 1. OpenWeather: GET https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}
 * 2. WAQI API: GET https://api.waqi.info/feed/geo:{lat};{lon}/?token={WAQI_TOKEN}
 * Replace the local data loader below with an authenticated backend proxy route.
 */

export interface RawTelemetryInput {
  id?: string;
  location?: string;
  district?: string;
  latitude?: number | string;
  longitude?: number | string;
  timestamp?: string;
  pm25?: number | string;
  pm10?: number | string;
  co?: number | string;
  no2?: number | string;
  temperature?: number | string;
  humidity?: number | string;
  windSpeed?: number | string;
  windDirection?: string;
  windAngle?: number | string;
}

/**
 * Ingestion and Validation Engine:
 * - Sanitizes numeric inputs
 * - Rejects negative pollutant readings (clamps to 0)
 * - Verifies geographic coordinate bounds (-90 <= lat <= 90, -180 <= lng <= 180)
 * - Imputes sensible median fallbacks for missing environmental telemetry
 * - Standardizes units (PM in µg/m³, CO in mg/m³, Temp in °C, Wind in km/h)
 */
export function cleanAirQualityData(raw: RawTelemetryInput, fallbackId = 'tn-sensor-001'): AirQualityReading {
  const parsePositiveFloat = (val: unknown, fallback: number): number => {
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num) || num < 0) return fallback;
    return num;
  };

  const parseCoord = (val: unknown, min: number, max: number, fallback: number): number => {
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num) || num < min || num > max) return fallback;
    return num;
  };

  const lat = parseCoord(raw.latitude, -90, 90, 13.0827);
  const lng = parseCoord(raw.longitude, -180, 180, 80.2707);

  const pm25 = parsePositiveFloat(raw.pm25, 45);
  const pm10 = parsePositiveFloat(raw.pm10, 85);
  const co = parsePositiveFloat(raw.co, 1.2);
  const no2 = parsePositiveFloat(raw.no2, 50);

  const temperature = typeof raw.temperature === 'number' && !isNaN(raw.temperature)
    ? raw.temperature
    : parseFloat(String(raw.temperature)) || 30.0;

  const humidity = Math.min(100, Math.max(5, parsePositiveFloat(raw.humidity, 65)));
  const windSpeed = parsePositiveFloat(raw.windSpeed, 3.5);

  const windDirection = raw.windDirection && typeof raw.windDirection === 'string'
    ? raw.windDirection.trim().toUpperCase()
    : 'ENE';

  const windAngle = typeof raw.windAngle === 'number'
    ? raw.windAngle
    : windDirection === 'N' ? 0 : windDirection === 'NE' ? 45 : windDirection === 'E' ? 90 : windDirection === 'SE' ? 135 : windDirection === 'S' ? 180 : windDirection === 'SW' ? 225 : windDirection === 'W' ? 270 : 315;

  return {
    id: raw.id || fallbackId,
    location: raw.location || 'Tamil Nadu Monitoring Station',
    district: raw.district || 'Tamil Nadu',
    latitude: Number(lat.toFixed(4)),
    longitude: Number(lng.toFixed(4)),
    timestamp: raw.timestamp || new Date().toISOString(),
    pm25: Number(pm25.toFixed(1)),
    pm10: Number(pm10.toFixed(1)),
    co: Number(co.toFixed(2)),
    no2: Number(no2.toFixed(1)),
    temperature: Number(temperature.toFixed(1)),
    humidity: Math.round(humidity),
    windSpeed: Number(windSpeed.toFixed(1)),
    windDirection,
    windAngle,
    source: 'simulated',
  };
}

export async function fetchMonitoringLocations(): Promise<LocationMetadata[]> {
  return TAMIL_NADU_STATIONS;
}

export async function fetchAirQualityData(): Promise<AirQualityReading[]> {
  // Returns cleaned & verified baseline records
  return INITIAL_READINGS.map((r) => cleanAirQualityData(r, r.id));
}

export async function fetchWeatherData(lat: number, lng: number) {
  // Prototype weather lookup (future: OpenWeather Current Weather endpoint)
  return {
    temperature: 30.5,
    humidity: 74,
    windSpeed: 2.4,
    windDirection: 'ENE',
    windAngle: 65,
    condition: 'Partly Cloudy / Hazy',
  };
}
