import React from 'react';
import { Play, Pause, Compass, Activity, ShieldCheck, Flame, Wind, MapPin, UploadCloud } from 'lucide-react';

interface HeroSectionProps {
  simulationActive: boolean;
  onToggleSimulation: () => void;
  stationCount: number;
  hotspotCount: number;
  averageAqi: number;
  peakLocation: string;
  peakAqi: number;
  onScrollToMap: () => void;
  onScrollToUpload: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  simulationActive,
  onToggleSimulation,
  stationCount,
  hotspotCount,
  averageAqi,
  peakLocation,
  peakAqi,
  onScrollToMap,
  onScrollToUpload,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-[#FFFFFF] py-12 lg:py-16">
      
      {/* Light subtle translucent animated blobs */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#0891B2]/6 blur-3xl animate-orb-1"></div>
      <div className="pointer-events-none absolute top-12 right-1/4 h-80 w-80 rounded-full bg-[#059669]/6 blur-3xl animate-orb-2"></div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Network Status Kicker */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-[#475569]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
          </span>
          <span className="text-[#059669] font-bold uppercase tracking-wider text-[11px]">
            Monitoring Network: Prototype Online
          </span>
          <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
          <span className="text-[#475569]">CPCB-Inspired Indian Framework</span>
          <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
          <span className="text-[#0891B2] font-mono font-semibold text-[11px]">Tamil Nadu Grid</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
            Breathe Better.{' '}
            <span className="bg-gradient-to-r from-[#0891B2] via-[#0284C7] to-[#059669] bg-clip-text text-transparent">
              Live Smarter.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#475569] font-normal leading-relaxed">
            AI-powered urban air-quality monitoring, hotspot detection, and location-based pollution alerts. 
            Real-time multi-pollutant telemetry, microclimate stagnation trap detection, short-term projections, and custom dataset upload analysis across Tamil Nadu.
          </p>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={onScrollToMap}
              className="flex items-center gap-2 rounded-xl bg-[#0891B2] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0e7490] transition-all focus-visible:outline-[#0891B2]"
            >
              <Compass className="h-4 w-4 text-white" />
              Explore Tamil Nadu Map
            </button>

            <button
              onClick={onScrollToUpload}
              className="flex items-center gap-2 rounded-xl border border-[#0891B2]/40 bg-[#0891B2]/10 px-5 py-3 text-sm font-semibold text-[#0891B2] hover:bg-[#0891B2]/20 transition-all shadow-xs"
            >
              <UploadCloud className="h-4 w-4 text-[#0891B2]" />
              Upload & Analyze Dataset
            </button>

            <button
              onClick={onToggleSimulation}
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all shadow-xs ${
                simulationActive
                  ? 'border-[#D97706]/60 bg-[#D97706]/15 text-[#D97706] hover:bg-[#D97706]/25'
                  : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              {simulationActive ? (
                <>
                  <Pause className="h-4 w-4 fill-[#D97706] text-[#D97706]" />
                  <span>Pause Live Simulation</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-[#0891B2] text-[#0891B2]" />
                  <span>Start Live Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Regional Telemetry Strip */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>Telemetry Nodes</span>
              <Activity className="h-4 w-4 text-[#0891B2]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#0F172A] font-mono">
              {stationCount}
            </div>
            <div className="mt-1 text-[11px] text-[#64748B]">
              Key Urban & Transit Hubs
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>Active Hotspots</span>
              <Flame className={`h-4 w-4 ${hotspotCount > 0 ? 'text-[#D97706]' : 'text-[#64748B]'}`} />
            </div>
            <div className={`mt-1.5 text-2xl font-bold font-mono ${hotspotCount > 0 ? 'text-[#D97706]' : 'text-[#0F172A]'}`}>
              {hotspotCount}
            </div>
            <div className="mt-1 text-[11px] text-[#64748B]">
              AQI &gt; 150 Critical Sectors
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>Regional Mean AQI</span>
              <Wind className="h-4 w-4 text-[#059669]" />
            </div>
            <div className="mt-1.5 text-2xl font-bold text-[#0F172A] font-mono">
              {averageAqi}
            </div>
            <div className="mt-1 text-[11px] text-[#64748B]">
              Tamil Nadu State Average
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#64748B]">
              <span>Peak Pollution Node</span>
              <MapPin className="h-4 w-4 text-[#DC2626]" />
            </div>
            <div className="mt-1.5 text-base font-bold text-[#DC2626] truncate">
              {peakLocation}
            </div>
            <div className="mt-1 text-[11px] text-[#64748B] font-mono">
              Peak AQI: {peakAqi}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
