import { AQICategory, AQIResult, PollutantSubIndex } from '../types';

/**
 * AirSentinel AI - CPCB-Inspired AQI Calculation Utility
 * Clearly labeled: "Prototype AQI based on CPCB-inspired thresholds"
 */

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
  { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
  { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
  { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
  { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
  { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
];

const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
  { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
  { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
  { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
  { cLow: 431, cHigh: 600, iLow: 401, iHigh: 500 },
];

const NO2_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
  { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
  { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
  { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
  { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
  { cLow: 401, cHigh: 600, iLow: 401, iHigh: 500 },
];

const CO_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
  { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
  { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
  { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
  { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
  { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 },
];

function calculateSubIndex(concentration: number, breakpoints: Breakpoint[]): number {
  if (concentration < 0 || isNaN(concentration)) return 0;
  
  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const index = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(index);
    }
  }

  // If concentration exceeds highest bracket
  if (breakpoints.length > 0 && concentration > breakpoints[breakpoints.length - 1].cHigh) {
    return 500;
  }

  return 0;
}

export function getCategoryFromAqi(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderately Polluted';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function getCategoryColor(category: AQICategory): { hex: string; text: string; bg: string; border: string } {
  switch (category) {
    case 'Good':
      return { hex: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    case 'Satisfactory':
      return { hex: '#84cc16', text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30' };
    case 'Moderately Polluted':
      return { hex: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'Poor':
      return { hex: '#f97316', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'Very Poor':
      return { hex: '#ef4444', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'Severe':
      return { hex: '#991b1b', text: 'text-rose-400', bg: 'bg-rose-900/30', border: 'border-rose-600/40' };
  }
}

export function getHealthImplication(category: AQICategory, dominant: string): { implication: string; recommendation: string } {
  switch (category) {
    case 'Good':
      return {
        implication: 'Minimal air pollution impact. Safe for outdoor activities for all age groups.',
        recommendation: 'Ideal conditions for jogging, outdoor sports, and opening windows for fresh ventilation.'
      };
    case 'Satisfactory':
      return {
        implication: 'Minor breathing discomfort may be experienced by unusually sensitive individuals.',
        recommendation: 'Generally safe for all, but sensitive individuals with respiratory allergies should monitor exposure.'
      };
    case 'Moderately Polluted':
      return {
        implication: `Breathing discomfort to people with lung disease, asthma, and discomfort to children and older adults due to elevated ${dominant}.`,
        recommendation: 'Sensitive groups should reduce prolonged strenuous outdoor exertion. Consider light mask in dense traffic.'
      };
    case 'Poor':
      return {
        implication: `Breathing discomfort to most people on prolonged exposure. Significant spike in respiratory irritation caused by ${dominant}.`,
        recommendation: 'Avoid prolonged strenuous outdoor activity. Wear N95 masks in high traffic corridors and keep indoor air purifiers running.'
      };
    case 'Very Poor':
      return {
        implication: 'Respiratory illness to the people on prolonged exposure. Pronounced adverse effects on people with lung or heart disease.',
        recommendation: 'Avoid outdoor exercise early morning and late evening. Close windows during peak traffic hours; wear protective masks outdoors.'
      };
    case 'Severe':
      return {
        implication: 'Causes respiratory effects even on healthy people and serious health impacts on those with existing disease.',
        recommendation: 'Stay indoors as much as possible. High-risk groups must avoid all outdoor activity. Use HEPA purifiers and follow official district advisories.'
      };
  }
}

export function calculateAQI(pm25: number, pm10: number, co: number, no2: number): AQIResult {
  const pm25Sub = calculateSubIndex(pm25, PM25_BREAKPOINTS);
  const pm10Sub = calculateSubIndex(pm10, PM10_BREAKPOINTS);
  const no2Sub = calculateSubIndex(no2, NO2_BREAKPOINTS);
  const coSub = calculateSubIndex(co, CO_BREAKPOINTS);

  const subIndices: Record<'PM2.5' | 'PM10' | 'CO' | 'NO2', PollutantSubIndex> = {
    'PM2.5': { pollutant: 'PM2.5', value: pm25, subIndex: pm25Sub, category: getCategoryFromAqi(pm25Sub) },
    'PM10': { pollutant: 'PM10', value: pm10, subIndex: pm10Sub, category: getCategoryFromAqi(pm10Sub) },
    'NO2': { pollutant: 'NO2', value: no2, subIndex: no2Sub, category: getCategoryFromAqi(no2Sub) },
    'CO': { pollutant: 'CO', value: co, subIndex: coSub, category: getCategoryFromAqi(coSub) },
  };

  // Dominant pollutant corresponds to the maximum sub-index
  let dominantPollutant: 'PM2.5' | 'PM10' | 'CO' | 'NO2' = 'PM2.5';
  let maxSub = pm25Sub;

  if (pm10Sub > maxSub) {
    maxSub = pm10Sub;
    dominantPollutant = 'PM10';
  }
  if (no2Sub > maxSub) {
    maxSub = no2Sub;
    dominantPollutant = 'NO2';
  }
  if (coSub > maxSub) {
    maxSub = coSub;
    dominantPollutant = 'CO';
  }

  const aqi = maxSub;
  const category = getCategoryFromAqi(aqi);
  const colors = getCategoryColor(category);
  const health = getHealthImplication(category, dominantPollutant);

  return {
    aqi,
    category,
    dominantPollutant,
    color: colors.hex,
    textColor: colors.text,
    badgeBg: colors.bg,
    healthImplication: health.implication,
    recommendation: health.recommendation,
    subIndices,
  };
}
