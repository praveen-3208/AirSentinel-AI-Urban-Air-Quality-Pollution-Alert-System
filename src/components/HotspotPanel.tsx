import React from 'react';
import { Flame, MapPin, AlertTriangle, ArrowRight, ShieldAlert, Navigation } from 'lucide-react';
import { HotspotLocation, HotspotZone } from '../types';

interface HotspotPanelProps {
  hotspots: HotspotLocation[];
  zones: HotspotZone[];
  onSelectStation: (stationId: string) => void;
  selectedStationId: string;
}

export const HotspotPanel: React.FC<HotspotPanelProps> = ({
  hotspots,
  zones,
  onSelectStation,
  selectedStationId,
}) => {
  const getSeverityBadge = (severity: 'Moderate' | 'High' | 'Critical') => {
    switch (severity) {
      case 'Critical':
        return 'border-[#991B1B]/40 bg-[#991B1B]/10 text-[#991B1B]';
      case 'High':
        return 'border-[#DC2626]/40 bg-[#DC2626]/10 text-[#DC2626]';
      default:
        return 'border-[#D97706]/40 bg-[#D97706]/10 text-[#D97706]';
    }
  };

  return (
    <section id="hotspots-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 bg-[#FFFFFF]">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706]">
              Spatial Anomaly Detection
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-xs text-[#64748B]">CPCB Threshold &gt; 150</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            Active Pollution Hotspots & Clustered Zones
            <span className="flex h-5 items-center justify-center rounded-full bg-[#D97706]/15 px-2 text-xs font-bold text-[#D97706] border border-[#D97706]/30">
              {hotspots.length} Active
            </span>
          </h2>
        </div>
        <p className="text-xs text-[#64748B] max-w-md">
          Proximity clustering aggregates contiguous urban nodes experiencing severe particulate or gaseous stagnation.
        </p>
      </div>

      {hotspots.length === 0 ? (
        <div className="rounded-2xl border border-[#059669]/20 bg-[#059669]/5 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#059669]/10 text-[#059669] mb-3">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A]">No Critical Hotspots Detected</h3>
          <p className="mt-1 text-xs text-[#475569] max-w-md mx-auto">
            All monitored Tamil Nadu urban monitoring stations currently record ambient AQI below the 150 hotspot intervention threshold.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2 Cols): Clustered Zones */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#D97706]" />
              <span>Clustered Metropolitan Stagnation Zones</span>
            </h3>

            {zones.map((zone, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm hover:border-[#CBD5E1] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <h4 className="text-base font-bold text-[#0F172A]">{zone.zoneName}</h4>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#64748B]">
                      <span>Affected Locations:</span>
                      <span className="text-[#0F172A] font-semibold">
                        {zone.locations.map(l => l.location).join(', ')}
                      </span>
                    </div>
                  </div>
                  <span className={`self-start sm:self-auto rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getSeverityBadge(zone.severity)}`}>
                    {zone.severity} Severity
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                    <span className="text-[#64748B]">Peak Station AQI:</span>
                    <div className="mt-0.5 text-lg font-extrabold font-mono text-[#DC2626]">
                      {zone.highestAqi}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                    <span className="text-[#64748B]">Zone Mean AQI:</span>
                    <div className="mt-0.5 text-lg font-extrabold font-mono text-[#D97706]">
                      {zone.averageAqi}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#F8FAFC] p-2.5 border border-[#E2E8F0]">
                    <span className="text-[#64748B]">Dominant Gas/Particulate:</span>
                    <div className="mt-0.5 text-lg font-extrabold font-mono text-[#0891B2]">
                      {zone.dominantPollutant}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
                  <p className="italic text-[11px] text-[#475569] line-clamp-1">
                    {zone.estimatedRisk}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Individual Hotspots Ranked List */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#0891B2]" />
              <span>Ranked Station Severity</span>
            </h3>

            <div className="space-y-2.5">
              {hotspots.map((hs, index) => {
                const isSelected = hs.id === selectedStationId;
                return (
                  <button
                    key={hs.id}
                    onClick={() => onSelectStation(hs.id)}
                    className={`w-full text-left rounded-xl border p-3.5 transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#0891B2] bg-[#0891B2]/5 shadow-sm ring-1 ring-[#0891B2]/30'
                        : 'border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1F5F9] font-mono text-xs font-bold text-[#64748B] border border-[#E2E8F0]">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-[#0F172A] text-xs sm:text-sm">
                          {hs.location}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {hs.district} · {hs.dominantPollutant}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-base font-extrabold text-[#DC2626]">
                        {hs.aqi}
                      </div>
                      <div className="text-[10px] text-[#64748B] font-medium">
                        {hs.category}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </section>
  );
};
