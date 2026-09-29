import React from 'react';
import { 
  Gauge, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Wind, 
  Droplets, 
  Thermometer, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import { AQIResult, WeatherRiskResult, TrendResult, AirQualityReading } from '../types';

interface SummaryCardsProps {
  reading: AirQualityReading;
  aqiResult: AQIResult;
  weatherRisk: WeatherRiskResult;
  trend: TrendResult;
  hotspotCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  reading,
  aqiResult,
  weatherRisk,
  trend,
  hotspotCount,
}) => {
  const getTrendIcon = () => {
    if (trend.direction.includes('Increasing')) {
      return <TrendingUp className="h-5 w-5 text-[#DC2626]" />;
    }
    if (trend.direction.includes('Improving')) {
      return <TrendingDown className="h-5 w-5 text-[#059669]" />;
    }
    return <Minus className="h-5 w-5 text-[#64748B]" />;
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30';
      case 'Moderate':
        return 'text-[#D97706] bg-[#D97706]/10 border-[#D97706]/30';
      default:
        return 'text-[#059669] bg-[#059669]/10 border-[#059669]/30';
    }
  };

  return (
    <div id="summary-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 bg-[#FFFFFF]">
      
      {/* Station context bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
            Selected Station Telemetry
          </span>
          <h2 className="text-xl font-bold text-[#0F172A]">
            {reading.location}, {reading.district}
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748B]">
          <span>Lat: {reading.latitude}°N</span>
          <span aria-hidden="true">·</span>
          <span>Lng: {reading.longitude}°E</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[#0891B2] font-semibold">
            {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Grid of 5 Key Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        
        {/* Card 1: AQI & Category */}
        <div 
          className="relative overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm"
          style={{ borderTop: `4px solid ${aqiResult.color}` }}
        >
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Ambient AQI</span>
            <Gauge className="h-4 w-4 text-[#0891B2]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span 
              className="text-4xl font-extrabold font-mono tracking-tight"
              style={{ color: aqiResult.color }}
            >
              {aqiResult.aqi}
            </span>
            <span className="text-xs text-[#64748B] font-mono">/ 500</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span 
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: aqiResult.color }}
            ></span>
            <span className="text-xs font-bold text-[#0F172A]">
              {aqiResult.category}
            </span>
          </div>
          <p className="mt-2 text-[10px] text-[#64748B] italic">
            Prototype AQI based on CPCB-inspired thresholds
          </p>
        </div>

        {/* Card 2: Dominant Pollutant */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Dominant Pollutant</span>
            <span className="text-xs font-mono text-[#D97706] font-bold">Sub-Index</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-[#0F172A] font-mono">
              {aqiResult.dominantPollutant}
            </span>
          </div>
          <div className="mt-2 text-xs text-[#475569]">
            Sub-Index Score: <strong className="font-mono text-[#0891B2]">{aqiResult.subIndices[aqiResult.dominantPollutant]?.subIndex}</strong>
          </div>
          <p className="mt-2 text-[11px] text-[#64748B]">
            Current concentration: {aqiResult.subIndices[aqiResult.dominantPollutant]?.value} {aqiResult.dominantPollutant === 'CO' ? 'mg/m³' : 'µg/m³'}
          </p>
        </div>

        {/* Card 3: Active Hotspots */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Active Hotspots</span>
            <Flame className={`h-4 w-4 ${hotspotCount > 0 ? 'text-[#D97706]' : 'text-[#64748B]'}`} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold font-mono ${hotspotCount > 0 ? 'text-[#D97706]' : 'text-[#0F172A]'}`}>
              {hotspotCount}
            </span>
            <span className="text-xs text-[#64748B]">Zones &gt; 150</span>
          </div>
          <div className="mt-2 text-xs text-[#475569]">
            {reading.pm25 > 90 || aqiResult.aqi > 150 ? (
              <span className="text-[#D97706] font-semibold">Active hotspot node</span>
            ) : (
              <span className="text-[#059669] font-medium">Below hotspot threshold</span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-[#64748B]">
            DBSCAN / Proximity clustered
          </p>
        </div>

        {/* Card 4: Pollution Trend */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">1-Hour Trend</span>
            {getTrendIcon()}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#0F172A]">
              {trend.direction}
            </span>
            <span className="text-sm font-mono text-[#0891B2] font-bold">{trend.arrow}</span>
          </div>
          <div className="mt-2 text-xs text-[#475569] font-mono">
            {trend.percentageChange > 0 ? `+${trend.percentageChange}%` : `${trend.percentageChange}%`} ({trend.aqiDifference > 0 ? `+${trend.aqiDifference}` : trend.aqiDifference} AQI)
          </div>
          <p className="mt-2 text-[11px] text-[#64748B] line-clamp-1">
            {trend.summary}
          </p>
        </div>

        {/* Card 5: Weather-Trap Risk */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">Weather-Trap Risk</span>
            <AlertTriangle className={`h-4 w-4 ${weatherRisk.riskLevel === 'High' ? 'text-[#DC2626]' : weatherRisk.riskLevel === 'Moderate' ? 'text-[#D97706]' : 'text-[#059669]'}`} />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getRiskBadgeColor(weatherRisk.riskLevel)}`}>
              {weatherRisk.riskLevel} Risk
            </span>
          </div>
          <div className="mt-2.5 text-xs text-[#475569]">
            Dispersion: <strong className="text-[#0F172A]">{weatherRisk.dispersionFactor}</strong>
          </div>
          <p className="mt-1 text-[10px] text-[#64748B] italic">
            Estimated pollution-trap risk
          </p>
        </div>

      </div>

    </div>
  );
};
