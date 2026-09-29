import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, Clock, Info } from 'lucide-react';
import { HistoricalPoint } from '../data/mockAirQualityData';
import { TrendResult } from '../types';

interface AQIChartProps {
  data: HistoricalPoint[];
  trend: TrendResult;
  locationName: string;
}

export const AQIChart: React.FC<AQIChartProps> = ({
  data,
  trend,
  locationName,
}) => {
  const [activeMetric, setActiveMetric] = useState<'aqi' | 'particulates' | 'gases'>('aqi');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] p-3 shadow-lg text-xs">
          <div className="font-semibold text-[#0F172A] mb-1.5 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#0891B2]" />
            <span>Time: {label} (IST)</span>
          </div>
          <div className="space-y-1">
            {payload.map((item: any) => (
              <div key={item.dataKey} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-[#475569]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}:
                </span>
                <span className="font-mono font-bold text-[#0F172A]">
                  {item.value} {item.dataKey === 'co' ? 'mg/m³' : item.dataKey === 'aqi' ? 'pts' : 'µg/m³'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
      
      {/* Header with Title and Segmented Metric Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
              Temporal Telemetry
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-xs text-[#64748B]">12-Hour Retrospective</span>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">
            Historical Trend Curve – {locationName}
          </h3>
        </div>

        {/* Functional Segmented Button Filter */}
        <div className="flex items-center gap-1 rounded-lg bg-[#F8FAFC] p-1 border border-[#E2E8F0] self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('aqi')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              activeMetric === 'aqi'
                ? 'bg-[#FFFFFF] text-[#0891B2] border border-[#CBD5E1] shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            AQI Trend
          </button>
          <button
            onClick={() => setActiveMetric('particulates')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              activeMetric === 'particulates'
                ? 'bg-[#FFFFFF] text-[#0891B2] border border-[#CBD5E1] shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            PM2.5 vs PM10
          </button>
          <button
            onClick={() => setActiveMetric('gases')}
            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
              activeMetric === 'gases'
                ? 'bg-[#FFFFFF] text-[#0891B2] border border-[#CBD5E1] shadow-2xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            NO2 & CO
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'aqi' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="aqiGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891B2" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0891B2" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="aqi"
                name="AQI Index"
                stroke="#0891B2"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#aqiGradLight)"
              />
            </AreaChart>
          ) : activeMetric === 'particulates' ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="pm25"
                name="PM2.5 (Fine)"
                stroke="#D97706"
                strokeWidth={2}
                dot={{ r: 3, fill: '#D97706' }}
              />
              <Line
                type="monotone"
                dataKey="pm10"
                name="PM10 (Coarse)"
                stroke="#0284C7"
                strokeWidth={2}
                dot={{ r: 3, fill: '#0284C7' }}
              />
            </LineChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="no2"
                name="NO2 (µg/m³)"
                stroke="#DC2626"
                strokeWidth={2}
                dot={{ r: 3, fill: '#DC2626' }}
              />
              <Line
                type="monotone"
                dataKey="co"
                name="CO (mg/m³)"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3, fill: '#059669' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Analytical Trend Commentary Box */}
      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs">
        <div className="flex items-center gap-2 text-[#0891B2] font-semibold mb-1">
          <TrendingUp className="h-4 w-4" />
          <span>Trend Diagnostic: {trend.direction} ({trend.arrow})</span>
        </div>
        <p className="text-[#475569] leading-relaxed">
          {trend.summary} Diurnal patterns show morning traffic buildup between 07:00 and 09:00 with peak particulate loading.
        </p>
      </div>

    </div>
  );
};
