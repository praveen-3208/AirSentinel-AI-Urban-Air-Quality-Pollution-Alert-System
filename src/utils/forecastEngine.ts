import { AQICategory, ForecastPoint } from '../types';
import { getCategoryFromAqi } from './aqiCalculator';

/**
 * AirSentinel AI - Short-Term AQI Forecast Engine
 * Clearly labeled: "Prototype 3-hour estimate"
 * 
 * Future Integration Notice:
 * This heuristic regression model serves as the edge-inference baseline.
 * It can be readily swapped with a trained ONNX / TensorFlow.js / XGBoost / Random Forest
 * regressor using meteorological feature arrays [pm25, pm10, no2, co, temp, rh, ws, wd_sin, wd_cos].
 */

interface ForecastInput {
  currentAqi: number;
  previousAqi: number;
  windSpeed: number; // km/h
  humidity: number;  // %
  temperature: number; // °C
}

export interface ForecastSummary {
  label: string;
  points: ForecastPoint[];
  overallConfidence: 'Low' | 'Medium' | 'High';
  modelType: string;
  dominantTrend: string;
}

export function generateShortTermForecast(input: ForecastInput): ForecastSummary {
  const { currentAqi, previousAqi, windSpeed, humidity } = input;
  
  // Rate of change from recent window (AQI / hour)
  const rateOfChange = currentAqi - (previousAqi || currentAqi);

  // Microclimate modifiers:
  // Low wind speed (< 3 km/h) prevents dispersion, retaining or building particulates
  // Strong wind (> 12 km/h) rapidly disperses pollutants
  let windDispersionDelta = 0;
  if (windSpeed < 2) {
    windDispersionDelta = +6; // Stagnation penalty
  } else if (windSpeed < 5) {
    windDispersionDelta = +2;
  } else if (windSpeed > 15) {
    windDispersionDelta = -10; // Rapid dispersion
  } else if (windSpeed > 8) {
    windDispersionDelta = -5;
  }

  // High humidity (> 75%) promotes condensation nuclei and hygroscopic particulate growth
  let humidityTrapDelta = 0;
  if (humidity > 80) {
    humidityTrapDelta = +4;
  } else if (humidity > 70) {
    humidityTrapDelta = +2;
  }

  // Momentum decay factor across 1h, 2h, 3h horizons
  const hourlyDecay = [0.85, 0.65, 0.45];

  const now = new Date();
  const points: ForecastPoint[] = [];

  // Point 0 (Current)
  points.push({
    hourOffset: 0,
    timeLabel: 'Now',
    predictedAqi: Math.round(currentAqi),
    category: getCategoryFromAqi(currentAqi),
    confidence: 'High',
    factors: ['Live validated reading from station telemetry'],
  });

  let accumulativeAqi = currentAqi;

  for (let i = 1; i <= 3; i++) {
    const decay = hourlyDecay[i - 1];
    
    // Step delta = dampened trend momentum + microclimate wind/humidity influence
    const stepDelta = (rateOfChange * decay) + windDispersionDelta + humidityTrapDelta;
    
    // Cumulative clamp between 10 and 500
    accumulativeAqi = Math.max(10, Math.min(500, accumulativeAqi + stepDelta));
    const roundedAqi = Math.round(accumulativeAqi);

    const targetDate = new Date(now.getTime() + i * 3600 * 1000);
    const timeLabel = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const factors: string[] = [];
    if (rateOfChange > 5) factors.push('Recent upward momentum');
    if (rateOfChange < -5) factors.push('Cleansing momentum');
    if (windSpeed < 3) factors.push('Sub-3 km/h wind stagnation');
    if (windSpeed > 10) factors.push('Strong wind dispersion');
    if (humidity > 75) factors.push('Elevated relative humidity trap');

    // Confidence decreases with time horizon
    let confidence: 'Low' | 'Medium' | 'High' = i === 1 ? 'High' : i === 2 ? 'Medium' : 'Medium';
    if (Math.abs(rateOfChange) > 25) confidence = 'Low'; // Volatile state drops confidence

    points.push({
      hourOffset: i,
      timeLabel: `+${i}h (${timeLabel})`,
      predictedAqi: roundedAqi,
      category: getCategoryFromAqi(roundedAqi),
      confidence,
      factors: factors.length > 0 ? factors : ['Typical baseline trajectory'],
    });
  }

  const overallConfidence: 'Low' | 'Medium' | 'High' = 
    Math.abs(rateOfChange) > 20 ? 'Low' : windSpeed < 1 ? 'Medium' : 'High';

  const dominantTrend = points[3].predictedAqi > points[0].predictedAqi + 10
    ? 'Rising pollution expected over the next 3 hours'
    : points[3].predictedAqi < points[0].predictedAqi - 10
    ? 'Gradual atmospheric clearance projected over the next 3 hours'
    : 'Near-steady ambient conditions projected';

  return {
    label: 'Prototype 3-hour estimate',
    points,
    overallConfidence,
    modelType: 'Meteorological Dispersion Heuristic (ML/XGBoost Ready Interface)',
    dominantTrend,
  };
}
