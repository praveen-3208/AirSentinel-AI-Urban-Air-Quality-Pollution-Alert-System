import { NormalizedDatasetRecord } from './datasetParser';
import { AQICategory, RiskLevel } from '../types';

export interface LocationAggregatedStats {
  location: string;
  latitude: number | null;
  longitude: number | null;
  recordsCount: number;
  averageAqi: number;
  highestAqi: number;
  lowestAqi: number;
  dominantPollutant: string;
  isHotspot: boolean;
  category: AQICategory;
}

export interface CategoryDistribution {
  category: AQICategory;
  count: number;
  percentage: number;
  color: string;
}

export interface TrendDataPoint {
  timeLabel: string;
  timestamp: string;
  avgAqi: number;
  avgPm25: number;
  avgPm10: number;
  avgNo2: number;
  avgCo: number;
}

export interface DatasetAnalysisReport {
  overall: {
    totalRecords: number;
    locationsCount: number;
    timeRange: string;
    averageAqi: number;
    maxAqi: number;
    minAqi: number;
    averagePm25: number;
    averagePm10: number;
    averageNo2: number;
    averageCo: number;
    highestPollutionLocation: string;
    cleanestLocation: string;
    hotspotCount: number;
    highRiskRecordsCount: number;
    moderateRiskRecordsCount: number;
    lowRiskRecordsCount: number;
  };
  categoryDistribution: CategoryDistribution[];
  locationStats: LocationAggregatedStats[];
  trendPoints: TrendDataPoint[];
  overallTrendDirection: 'Increasing' | 'Decreasing' | 'Stable';
  dominantPollutantsCounts: Record<string, number>;
  narrativeInterpretation: string;
  forecastNotice: string;
  forecastPoints?: { hour: string; aqi: number }[];
}

export function analyzeDataset(records: NormalizedDatasetRecord[]): DatasetAnalysisReport | null {
  if (!records || records.length === 0) return null;

  // 1. Overall Metrics
  const totalRecords = records.length;
  const aqiValues = records.map((r) => r.aqi);
  const maxAqi = Math.max(...aqiValues);
  const minAqi = Math.min(...aqiValues);
  const averageAqi = Math.round(aqiValues.reduce((a, b) => a + b, 0) / totalRecords);

  const averagePm25 = Number((records.reduce((sum, r) => sum + r.pm25, 0) / totalRecords).toFixed(1));
  const averagePm10 = Number((records.reduce((sum, r) => sum + r.pm10, 0) / totalRecords).toFixed(1));
  const averageNo2 = Number((records.reduce((sum, r) => sum + r.no2, 0) / totalRecords).toFixed(1));
  const averageCo = Number((records.reduce((sum, r) => sum + r.co, 0) / totalRecords).toFixed(2));

  // Time range
  const timestamps = records.map((r) => new Date(r.timestamp).getTime()).filter((t) => !isNaN(t));
  let timeRange = 'Single Epoch';
  if (timestamps.length > 0) {
    const minTime = new Date(Math.min(...timestamps));
    const maxTime = new Date(Math.max(...timestamps));
    timeRange = `${minTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${minTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${maxTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // 2. Category Distribution
  const categoryCounts: Record<AQICategory, number> = {
    Good: 0,
    Satisfactory: 0,
    'Moderately Polluted': 0,
    Poor: 0,
    'Very Poor': 0,
    Severe: 0,
  };

  const categoryColors: Record<AQICategory, string> = {
    Good: '#059669',
    Satisfactory: '#0891B2',
    'Moderately Polluted': '#D97706',
    Poor: '#EA580C',
    'Very Poor': '#DC2626',
    Severe: '#991B1B',
  };

  records.forEach((r) => {
    if (categoryCounts[r.category] !== undefined) {
      categoryCounts[r.category]++;
    }
  });

  const categoryDistribution: CategoryDistribution[] = (Object.keys(categoryCounts) as AQICategory[]).map((cat) => ({
    category: cat,
    count: categoryCounts[cat],
    percentage: Number(((categoryCounts[cat] / totalRecords) * 100).toFixed(1)),
    color: categoryColors[cat],
  }));

  // 3. Location aggregation & Hotspots
  const locationGroups: Record<string, NormalizedDatasetRecord[]> = {};
  records.forEach((r) => {
    if (!locationGroups[r.location]) {
      locationGroups[r.location] = [];
    }
    locationGroups[r.location].push(r);
  });

  const locationStats: LocationAggregatedStats[] = Object.entries(locationGroups).map(([locName, locRecords]) => {
    const locAqiList = locRecords.map((r) => r.aqi);
    const avgAqi = Math.round(locAqiList.reduce((a, b) => a + b, 0) / locRecords.length);
    const highestAqi = Math.max(...locAqiList);
    const lowestAqi = Math.min(...locAqiList);

    // Dominant pollutant in location
    const polCount: Record<string, number> = {};
    locRecords.forEach((r) => {
      polCount[r.dominantPollutant] = (polCount[r.dominantPollutant] || 0) + 1;
    });
    const dominantPollutant = Object.entries(polCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'PM2.5';

    const validCoord = locRecords.find((r) => r.latitude !== null && r.longitude !== null);

    let category: AQICategory = 'Good';
    if (avgAqi > 400) category = 'Severe';
    else if (avgAqi > 300) category = 'Very Poor';
    else if (avgAqi > 200) category = 'Poor';
    else if (avgAqi > 100) category = 'Moderately Polluted';
    else if (avgAqi > 50) category = 'Satisfactory';

    return {
      location: locName,
      latitude: validCoord ? validCoord.latitude : null,
      longitude: validCoord ? validCoord.longitude : null,
      recordsCount: locRecords.length,
      averageAqi: avgAqi,
      highestAqi,
      lowestAqi,
      dominantPollutant,
      isHotspot: avgAqi > 150 || highestAqi > 150,
      category,
    };
  });

  // Sort locations by highest AQI descending
  locationStats.sort((a, b) => b.highestAqi - a.highestAqi);

  const highestPollutionLocation = locationStats[0]?.location || 'N/A';
  const cleanestLocation = locationStats[locationStats.length - 1]?.location || 'N/A';
  const hotspotCount = locationStats.filter((l) => l.isHotspot).length;

  // 4. Weather Risk Breakdown
  let highRiskRecordsCount = 0;
  let moderateRiskRecordsCount = 0;
  let lowRiskRecordsCount = 0;

  records.forEach((r) => {
    if (r.weatherRisk === 'High') highRiskRecordsCount++;
    else if (r.weatherRisk === 'Moderate') moderateRiskRecordsCount++;
    else lowRiskRecordsCount++;
  });

  // Dominant pollutants count across entire dataset
  const dominantPollutantsCounts: Record<string, number> = {};
  records.forEach((r) => {
    dominantPollutantsCounts[r.dominantPollutant] = (dominantPollutantsCounts[r.dominantPollutant] || 0) + 1;
  });
  const mostCommonPollutant = Object.entries(dominantPollutantsCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'PM2.5';

  // 5. Time series trend points
  const timeBuckets: Record<string, NormalizedDatasetRecord[]> = {};
  records.forEach((r) => {
    const d = new Date(r.timestamp);
    const key = isNaN(d.getTime()) ? r.timestamp : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!timeBuckets[key]) timeBuckets[key] = [];
    timeBuckets[key].push(r);
  });

  const trendPoints: TrendDataPoint[] = Object.entries(timeBuckets).map(([label, bucket]) => {
    const avgAqi = Math.round(bucket.reduce((s, r) => s + r.aqi, 0) / bucket.length);
    const avgPm25 = Number((bucket.reduce((s, r) => s + r.pm25, 0) / bucket.length).toFixed(1));
    const avgPm10 = Number((bucket.reduce((s, r) => s + r.pm10, 0) / bucket.length).toFixed(1));
    const avgNo2 = Number((bucket.reduce((s, r) => s + r.no2, 0) / bucket.length).toFixed(1));
    const avgCo = Number((bucket.reduce((s, r) => s + r.co, 0) / bucket.length).toFixed(2));
    return {
      timeLabel: label,
      timestamp: bucket[0].timestamp,
      avgAqi,
      avgPm25,
      avgPm10,
      avgNo2,
      avgCo,
    };
  });

  // Calculate overall trend trajectory
  let overallTrendDirection: 'Increasing' | 'Decreasing' | 'Stable' = 'Stable';
  if (trendPoints.length >= 2) {
    const firstAqi = trendPoints[0].avgAqi;
    const lastAqi = trendPoints[trendPoints.length - 1].avgAqi;
    const diff = lastAqi - firstAqi;
    if (diff > 10) overallTrendDirection = 'Increasing';
    else if (diff < -10) overallTrendDirection = 'Decreasing';
  }

  // 6. Forecast generation
  let forecastNotice = 'Not enough historical data for a reliable forecast.';
  let forecastPoints: { hour: string; aqi: number }[] | undefined = undefined;

  if (trendPoints.length >= 3) {
    forecastNotice = 'Prototype 3-hour estimate based on recent uploaded trend momentum and atmospheric dispersion.';
    const latestAqi = trendPoints[trendPoints.length - 1].avgAqi;
    const prevAqi = trendPoints[trendPoints.length - 2].avgAqi;
    const momentum = latestAqi - prevAqi;

    forecastPoints = [
      { hour: '+1h Horizon', aqi: Math.max(10, Math.min(500, Math.round(latestAqi + momentum * 0.8))) },
      { hour: '+2h Horizon', aqi: Math.max(10, Math.min(500, Math.round(latestAqi + momentum * 0.5))) },
      { hour: '+3h Horizon', aqi: Math.max(10, Math.min(500, Math.round(latestAqi + momentum * 0.3))) },
    ];
  }

  // 7. Dynamic Narrative Interpretation
  const peakTime = trendPoints.sort((a, b) => b.avgAqi - a.avgAqi)[0]?.timeLabel || 'morning hours';
  const weatherRiskSummary = highRiskRecordsCount > 0
    ? `Pollution risk is elevated during low-wind periods with ${highRiskRecordsCount} stagnation events detected.`
    : `Atmospheric dispersion remained largely favorable across recorded observation periods.`;

  const narrativeInterpretation = `Dataset analysis shows that ${highestPollutionLocation} has the highest average AQI (reaching ${locationStats[0]?.highestAqi} pts). ${mostCommonPollutant} is the dominant pollutant across ${dominantPollutantsCounts[mostCommonPollutant] || 0} readings. ${weatherRiskSummary} ${hotspotCount > 0 ? `${hotspotCount} location${hotspotCount > 1 ? 's are' : ' is'} classified as hotspots exceeding CPCB 150 benchmark.` : 'No sustained hotspots were identified.'} Peak ambient pollution occurred around ${peakTime}. Cleanest air quality was recorded at ${cleanestLocation}. Outdoor activity should be reduced during the highest AQI period.`;

  return {
    overall: {
      totalRecords,
      locationsCount: locationStats.length,
      timeRange,
      averageAqi,
      maxAqi,
      minAqi,
      averagePm25,
      averagePm10,
      averageNo2,
      averageCo,
      highestPollutionLocation,
      cleanestLocation,
      hotspotCount,
      highRiskRecordsCount,
      moderateRiskRecordsCount,
      lowRiskRecordsCount,
    },
    categoryDistribution,
    locationStats,
    trendPoints,
    overallTrendDirection,
    dominantPollutantsCounts,
    narrativeInterpretation,
    forecastNotice,
    forecastPoints,
  };
}
