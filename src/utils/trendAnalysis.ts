import { TrendDirection, TrendResult } from '../types';

/**
 * Trend Analysis Utility
 * Computes AQI delta, percentage variation, and trend trajectory
 */
export function analyzeTrend(currentAqi: number, previousAqi: number): TrendResult {
  if (!previousAqi || previousAqi === 0) {
    return {
      direction: 'Stable',
      aqiDifference: 0,
      percentageChange: 0,
      arrow: '→',
      summary: 'Baseline reading established; insufficient historical intervals for delta calculation.',
    };
  }

  const diff = currentAqi - previousAqi;
  const pct = Number(((diff / previousAqi) * 100).toFixed(1));

  let direction: TrendDirection = 'Stable';
  let arrow: '↑↑' | '↑' | '→' | '↓' | '↓↓' = '→';
  let summary = 'Air quality parameters have maintained equilibrium over the past monitoring cycle.';

  if (pct > 20) {
    direction = 'Rapidly Increasing';
    arrow = '↑↑';
    summary = `Pollution levels have surged by ${pct}% (+${diff} AQI pts) within the last hour. Immediate monitoring recommended.`;
  } else if (pct >= 5) {
    direction = 'Increasing';
    arrow = '↑';
    summary = `Pollution concentration trending upward by ${pct}% (+${diff} AQI pts) due to building emissions or dropping winds.`;
  } else if (pct <= -20) {
    direction = 'Improving Rapidly';
    arrow = '↓↓';
    summary = `Atmospheric clearance underway with significant improvement of ${Math.abs(pct)}% (${diff} AQI pts).`;
  } else if (pct <= -5) {
    direction = 'Improving';
    arrow = '↓';
    summary = `Gradual air cleansing observed with a ${Math.abs(pct)}% decline (${diff} AQI pts).`;
  } else {
    direction = 'Stable';
    arrow = '→';
    summary = `Stable ambient conditions with minimal flux (${pct >= 0 ? '+' : ''}${pct}%).`;
  }

  return {
    direction,
    aqiDifference: diff,
    percentageChange: pct,
    arrow,
    summary,
  };
}
