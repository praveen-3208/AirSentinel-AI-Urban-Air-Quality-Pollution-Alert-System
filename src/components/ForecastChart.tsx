import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { BrainCircuit, Sparkles, AlertCircle, Info, Wind } from 'lucide-react';
import { ForecastSummary } from '../utils/forecastEngine';
import { getCategoryColor } from '../utils/aqiCalculator';

interface ForecastChartProps {
  forecast: ForecastSummary;
  locationName: string;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecast,
  locationName,
}) => {
  const chartData = forecast.points.map((pt) => ({
    timeLabel: pt.timeLabel,
    aqi: pt.predictedAqi,
    category: pt.category,
    confidence: pt.confidence,
    factors: pt.factors,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = getCategoryColor(data.category);

      return (
        <div className="rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] p-3 shadow-lg text-xs">
          <div className="font-semibold text-[#0F172A] mb-1">
            Projection Horizon: {label}
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[#64748B]">Predicted AQI:</span>
            <span className="font-mono font-bold text-base" style={{ color: color.hex }}>
              {data.aqi}
            </span>
            <span className={`text-[11px] font-bold ${color.text}`}>({data.category})</span>
          </div>
          <div className="text-[11px] text-[#475569]">
            Confidence: <strong className="text-[#0F172A]">{data.confidence}</strong>
          </div>
          <div className="mt-2 border-t border-[#E2E8F0] pt-1.5">
            <span className="text-[10px] uppercase font-semibold text-[#64748B]">Key Drivers:</span>
            <ul className="list-disc pl-3 text-[10px] text-[#475569] space-y-0.5 mt-0.5">
              {data.factors.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
              Predictive Modeling
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-xs font-bold text-[#D97706] font-mono">
              {forecast.label}
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">
            Short-Term Forward Trajectory – {locationName}
          </h3>
        </div>

        {/* Confidence badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#64748B]">Inference Confidence:</span>
          <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${
            forecast.overallConfidence === 'High'
              ? 'border-[#059669]/40 bg-[#059669]/10 text-[#059669]'
              : forecast.overallConfidence === 'Medium'
              ? 'border-[#D97706]/40 bg-[#D97706]/10 text-[#D97706]'
              : 'border-[#DC2626]/40 bg-[#DC2626]/10 text-[#DC2626]'
          }`}>
            {forecast.overallConfidence}
          </span>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastGradLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0891B2" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0891B2" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="timeLabel" stroke="#64748B" tick={{ fontSize: 11 }} />
            <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={100} stroke="#D97706" strokeDasharray="3 3" label={{ value: 'Satisfactory limit', fill: '#D97706', fontSize: 10 }} />
            <ReferenceLine y={200} stroke="#DC2626" strokeDasharray="3 3" label={{ value: 'Poor threshold', fill: '#DC2626', fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#0891B2"
              strokeWidth={3}
              dot={{ r: 5, fill: '#0891B2', stroke: '#FFFFFF', strokeWidth: 2 }}
              fillOpacity={1}
              fill="url(#forecastGradLight)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Projection Strip */}
      <div className="mt-3 grid grid-cols-4 gap-2 border-t border-[#E2E8F0] pt-3">
        {forecast.points.map((pt) => {
          const color = getCategoryColor(pt.category);
          return (
            <div key={pt.timeLabel} className="rounded-lg bg-[#F8FAFC] p-2 text-center border border-[#E2E8F0]">
              <div className="text-[10px] text-[#64748B] font-medium truncate">{pt.timeLabel}</div>
              <div className="text-base font-bold font-mono" style={{ color: color.hex }}>
                {pt.predictedAqi}
              </div>
              <div className="text-[9px] text-[#475569] font-medium truncate">{pt.category}</div>
            </div>
          );
        })}
      </div>

      {/* Rule & Model Explanation footer */}
      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#64748B]">
        <div className="flex items-center gap-1.5 text-[#0891B2] font-semibold mb-1">
          <BrainCircuit className="h-4 w-4" />
          <span>Inference Diagnostic: {forecast.dominantTrend}</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#475569]">
          Forecast logic combines recent 1-hour momentum with wind dispersion cooling and humidity stagnation coefficients. 
          Architecture contains ready interface hooks for scikit-learn / XGBoost regression models trained on CPCB historical datasets.
        </p>
      </div>

    </div>
  );
};
