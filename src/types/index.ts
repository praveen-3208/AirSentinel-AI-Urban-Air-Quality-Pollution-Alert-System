export type AQICategory = 
  | 'Good'
  | 'Satisfactory'
  | 'Moderately Polluted'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface AirQualityReading {
  id: string;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  pm25: number;        // µg/m³
  pm10: number;        // µg/m³
  co: number;          // mg/m³
  no2: number;         // µg/m³
  temperature: number; // °C
  humidity: number;    // %
  windSpeed: number;   // km/h
  windDirection: string; // e.g. "NE", "E", "SW"
  windAngle?: number;  // degrees (0-360)
  source?: 'sensor' | 'simulated' | 'api';
}

export interface PollutantSubIndex {
  pollutant: 'PM2.5' | 'PM10' | 'CO' | 'NO2';
  value: number;
  subIndex: number;
  category: AQICategory;
}

export interface AQIResult {
  aqi: number;
  category: AQICategory;
  dominantPollutant: 'PM2.5' | 'PM10' | 'CO' | 'NO2';
  color: string;
  textColor: string;
  badgeBg: string;
  healthImplication: string;
  recommendation: string;
  subIndices: Record<'PM2.5' | 'PM10' | 'CO' | 'NO2', PollutantSubIndex>;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High';

export interface WeatherRiskResult {
  riskLevel: RiskLevel;
  explanation: string;
  affectedLocation: string;
  recommendedAction: string;
  dispersionFactor: 'Poor' | 'Moderate' | 'Favorable';
}

export interface HotspotLocation {
  id: string;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  aqi: number;
  category: AQICategory;
  dominantPollutant: string;
  severity: 'Moderate' | 'High' | 'Critical';
}

export interface HotspotZone {
  zoneName: string;
  locations: HotspotLocation[];
  averageAqi: number;
  highestAqi: number;
  dominantPollutant: string;
  severity: 'Moderate' | 'High' | 'Critical';
  estimatedRisk: string;
  centerLat: number;
  centerLng: number;
}

export type TrendDirection = 
  | 'Rapidly Increasing'
  | 'Increasing'
  | 'Stable'
  | 'Improving'
  | 'Improving Rapidly';

export interface TrendResult {
  direction: TrendDirection;
  aqiDifference: number;
  percentageChange: number;
  arrow: '↑↑' | '↑' | '→' | '↓' | '↓↓';
  summary: string;
}

export interface ForecastPoint {
  hourOffset: number; // 0, 1, 2, 3
  timeLabel: string;
  predictedAqi: number;
  category: AQICategory;
  confidence: 'Low' | 'Medium' | 'High';
  factors: string[];
}

export interface AlertItem {
  id: string;
  severity: 'warning' | 'danger' | 'critical' | 'info';
  title: string;
  location: string;
  aqi: number;
  dominantPollutant: string;
  possibleCause: string;
  timestamp: string;
  recommendedAction: string;
  isRead: boolean;
}

export interface SimulationState {
  isActive: boolean;
  step: number;
  phaseName: string;
  speedMultiplier: number;
  lastUpdated: string;
}
