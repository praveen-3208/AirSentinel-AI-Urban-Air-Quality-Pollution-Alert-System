import React from 'react';
import { 
  Wind, 
  Droplets, 
  Thermometer, 
  Compass, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { AirQualityReading, AQIResult } from '../types';

interface ParameterCardsProps {
  reading: AirQualityReading;
  aqiResult: AQIResult;
}

export const ParameterCards: React.FC<ParameterCardsProps> = ({
  reading,
  aqiResult,
}) => {
  const parameters = [
    {
      title: 'PM2.5 Particulates',
      subtitle: 'Fine Inhalable Particles (<2.5µm)',
      value: reading.pm25,
      unit: 'µg/m³',
      safeLimit: 60,
      subIndex: aqiResult.subIndices['PM2.5']?.subIndex,
      isDominant: aqiResult.dominantPollutant === 'PM2.5',
      percentageOfLimit: Math.round((reading.pm25 / 60) * 100),
      description: 'Penetrates deep into pulmonary alveoli; primary vehicle combustion and smoke indicator.',
      gaugeColor: reading.pm25 > 120 ? '#DC2626' : reading.pm25 > 60 ? '#D97706' : '#059669',
    },
    {
      title: 'PM10 Particulates',
      subtitle: 'Coarse Dust & Aerosols (<10µm)',
      value: reading.pm10,
      unit: 'µg/m³',
      safeLimit: 100,
      subIndex: aqiResult.subIndices['PM10']?.subIndex,
      isDominant: aqiResult.dominantPollutant === 'PM10',
      percentageOfLimit: Math.round((reading.pm10 / 100) * 100),
      description: 'Suspended road dust, construction fly ash, and mechanical abrasion particles.',
      gaugeColor: reading.pm10 > 250 ? '#DC2626' : reading.pm10 > 100 ? '#D97706' : '#059669',
    },
    {
      title: 'Nitrogen Dioxide (NO2)',
      subtitle: 'Vehicular & Industrial Exhaust',
      value: reading.no2,
      unit: 'µg/m³',
      safeLimit: 80,
      subIndex: aqiResult.subIndices['NO2']?.subIndex,
      isDominant: aqiResult.dominantPollutant === 'NO2',
      percentageOfLimit: Math.round((reading.no2 / 80) * 100),
      description: 'Emitted from internal combustion engines; precursor to secondary nitrate particulates.',
      gaugeColor: reading.no2 > 180 ? '#DC2626' : reading.no2 > 80 ? '#D97706' : '#059669',
    },
    {
      title: 'Carbon Monoxide (CO)',
      subtitle: 'Incomplete Combustion Gas',
      value: reading.co,
      unit: 'mg/m³',
      safeLimit: 2.0,
      subIndex: aqiResult.subIndices['CO']?.subIndex,
      isDominant: aqiResult.dominantPollutant === 'CO',
      percentageOfLimit: Math.round((reading.co / 2.0) * 100),
      description: 'Toxic odorless byproduct of idling vehicular engines in high-density congestion.',
      gaugeColor: reading.co > 10 ? '#DC2626' : reading.co > 2 ? '#D97706' : '#059669',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 bg-[#F8FAFC]">
      
      <div className="mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
          Atmospheric Telemetry & Meteorology
        </span>
        <h3 className="text-xl font-bold text-[#0F172A]">
          Real-Time Sensor Ingestion Breakdown
        </h3>
      </div>

      {/* Grid of 4 Major Pollutants */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {parameters.map((param) => (
          <div
            key={param.title}
            className={`relative rounded-xl border p-5 shadow-sm transition-all bg-[#FFFFFF] ${
              param.isDominant
                ? 'border-[#D97706]/50 shadow-md ring-1 ring-[#D97706]/20'
                : 'border-[#E2E8F0]'
            }`}
          >
            {param.isDominant && (
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded bg-[#D97706]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#D97706] border border-[#D97706]/30">
                <span>Dominant</span>
              </div>
            )}

            <div className="text-xs font-semibold text-[#0F172A]">
              {param.title}
            </div>
            <div className="text-[11px] text-[#64748B] truncate">
              {param.subtitle}
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#0F172A] font-mono">
                {param.value}
              </span>
              <span className="text-xs text-[#64748B] font-mono">
                {param.unit}
              </span>
            </div>

            {/* Gauge progress bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                <span>CPCB Benchmark: {param.safeLimit} {param.unit}</span>
                <span className="font-mono">{param.percentageOfLimit}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, param.percentageOfLimit)}%`,
                    backgroundColor: param.gaugeColor,
                  }}
                ></div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-2 text-[11px]">
              <span className="text-[#64748B]">Sub-Index Contribution:</span>
              <span className="font-mono font-bold text-[#0891B2]">{param.subIndex}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid of 4 Microclimate Weather Variables */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        
        {/* Temperature */}
        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EA580C]/10 border border-[#EA580C]/30 text-[#EA580C]">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Ambient Temp</div>
            <div className="text-lg font-bold text-[#0F172A] font-mono">
              {reading.temperature}°C
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0284C7]/10 border border-[#0284C7]/30 text-[#0284C7]">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Relative Humidity</div>
            <div className="text-lg font-bold text-[#0F172A] font-mono">
              {reading.humidity}%
            </div>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#059669]/10 border border-[#059669]/30 text-[#059669]">
            <Wind className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Wind Velocity</div>
            <div className="text-lg font-bold text-[#0F172A] font-mono">
              {reading.windSpeed} km/h
            </div>
          </div>
        </div>

        {/* Wind Direction */}
        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 shadow-2xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0891B2]/10 border border-[#0891B2]/30 text-[#0891B2]">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-[#64748B]">Wind Direction</div>
            <div className="text-lg font-bold text-[#0891B2] font-mono">
              {reading.windDirection} ({reading.windAngle ?? 90}°)
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
