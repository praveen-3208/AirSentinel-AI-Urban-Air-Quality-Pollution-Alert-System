import React from 'react';

export const MapLegend: React.FC = () => {
  const categories = [
    { label: 'Good', range: '0–50', color: '#059669', border: '#047857' },
    { label: 'Satisfactory', range: '51–100', color: '#0891B2', border: '#0e7490' },
    { label: 'Moderately Polluted', range: '101–200', color: '#D97706', border: '#b45309' },
    { label: 'Poor', range: '201–300', color: '#EA580C', border: '#c2410c' },
    { label: 'Very Poor', range: '301–400', color: '#DC2626', border: '#b91c1c' },
    { label: 'Severe', range: '401–500', color: '#991B1B', border: '#7f1d1d' },
  ];

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 shadow-sm text-xs">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-2">
        <span className="font-semibold text-[#0F172A]">CPCB AQI Index Scale</span>
        <span className="text-[10px] text-[#64748B] font-mono">µg/m³ benchmarks</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full flex-shrink-0 shadow-xs"
              style={{ backgroundColor: cat.color }}
            ></span>
            <div className="leading-tight">
              <div className="font-medium text-[#0F172A] text-[11px] truncate">{cat.label}</div>
              <div className="text-[10px] text-[#64748B] font-mono">{cat.range}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-2 text-[10px] text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#DC2626] ring-2 ring-[#DC2626]/40"></span>
          <span>Pulsing halo indicates AQI &gt; 200 (Active Hazard)</span>
        </div>
        <div className="text-[#64748B] italic">
          Prototype AQI based on CPCB-inspired thresholds
        </div>
      </div>
    </div>
  );
};
