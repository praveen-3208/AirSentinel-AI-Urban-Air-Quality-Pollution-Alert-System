import { WeatherRiskResult, RiskLevel } from '../types';

/**
 * Weather Risk Assessment Engine
 * Detects estimated pollution-trap conditions based on microclimate variables
 */
export function calculateWeatherRisk(
  aqi: number,
  windSpeed: number,
  humidity: number,
  locationName: string
): WeatherRiskResult {
  let riskLevel: RiskLevel = 'Low';
  let explanation = 'Atmospheric dispersion conditions are favorable; air currents are actively diluting ambient particulates.';
  let recommendedAction = 'Outdoor activities are safe based on prevailing wind dispersion.';
  let dispersionFactor: 'Poor' | 'Moderate' | 'Favorable' = 'Favorable';

  if (aqi > 150 && windSpeed < 2 && humidity > 70) {
    riskLevel = 'High';
    dispersionFactor = 'Poor';
    explanation = 'Estimated pollution-trap risk: Pollution may remain heavily concentrated near ground level because AQI is high, wind speed is low, and humidity is elevated (atmospheric inversion effect).';
    recommendedAction = 'Limit outdoor exertion immediately. High particulate density will stagnate in local streets until wind speeds increase.';
  } else if (aqi > 100 && windSpeed < 5) {
    riskLevel = 'Moderate';
    dispersionFactor = 'Moderate';
    explanation = 'Estimated pollution-trap risk: Moderate accumulation danger. Gentle breezes are insufficient to clear vehicular and industrial emissions rapidly.';
    recommendedAction = 'Vulnerable individuals should avoid prolonged exposure near congested junctions.';
  } else if (windSpeed < 3 && humidity > 80) {
    riskLevel = 'Moderate';
    dispersionFactor = 'Moderate';
    explanation = 'Estimated pollution-trap risk: High moisture content with stagnant airflow may slow pollutant clearance even under current baseline readings.';
    recommendedAction = 'Monitor air quality trends as traffic volume changes during peak hours.';
  }

  return {
    riskLevel,
    explanation,
    affectedLocation: locationName,
    recommendedAction,
    dispersionFactor,
  };
}
