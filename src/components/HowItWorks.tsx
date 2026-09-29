import React from 'react';
import { Database, Cpu, Flame, BellRing, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Data Collection & Ingestion',
      icon: <Database className="h-6 w-6 text-[#0891B2]" />,
      tagline: 'Multi-Source Environmental Telemetry',
      description: 'Ingests real-time PM2.5, PM10, NO2, CO, and meteorological parameters. Automated validation cleanses negative values, ensures coordinate validity, and normalizes units. Supports custom CSV/JSON uploads.',
      features: ['Automated unit normalization', 'CSV/JSON batch upload parsing', 'Sensor & OpenWeather/WAQI ready'],
    },
    {
      step: '02',
      title: 'AQI Analysis & Stagnation Risk',
      icon: <Cpu className="h-6 w-6 text-[#0284C7]" />,
      tagline: 'CPCB Breakpoints & Weather-Trap Engine',
      description: 'Calculates pollutant sub-indices according to Indian ambient air quality criteria, identifies dominant pollutants, and assesses microclimate trap risks when wind speeds drop below 2 km/h.',
      features: ['CPCB-inspired sub-index logic', 'Dominant pollutant isolation', 'Boundary-layer inversion trap detection'],
    },
    {
      step: '03',
      title: 'Hotspot Detection & Trend Analytics',
      icon: <Flame className="h-6 w-6 text-[#D97706]" />,
      tagline: 'Spatial Proximity & DBSCAN Clustering',
      description: 'Isolates locations exceeding the 150 AQI threshold. Contiguous urban zones (such as Chennai core corridors) are clustered into regional hotspots with severity classifications.',
      features: ['Haversine geospatial clustering', '12-hour retrospective trends', 'Rate-of-change delta analytics'],
    },
    {
      step: '04',
      title: '3-Hour Forecast & Alert Dispatch',
      icon: <BellRing className="h-6 w-6 text-[#DC2626]" />,
      tagline: 'Predictive Projections & Multi-Channel Warnings',
      description: 'Projects 3-hour AQI trajectory using atmospheric dispersion heuristics (extensible for XGBoost/Random Forest). Dispatches automated alerts to Telegram, SMS gateways, and local dashboards.',
      features: ['3-hour forward projection curve', 'Severity-tiered emergency rules', 'Personalized mask & health advisories'],
    },
  ];

  return (
    <section id="architecture-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-[#E2E8F0] bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
          System Architecture & Workflow
        </span>
        <h2 className="mt-1 text-3xl font-extrabold text-[#0F172A] tracking-tight sm:text-4xl">
          How AirSentinel AI Protects Urban Communities
        </h2>
        <p className="mt-3 text-sm text-[#475569]">
          From micro-sensor ingestion to batch CSV dataset analytics and automated incident response, here is the complete end-to-end analytical workflow.
        </p>
      </div>

      {/* 4 Architecture Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s) => (
          <div
            key={s.step}
            className="relative rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  {s.icon}
                </div>
                <span className="font-mono text-2xl font-black text-[#CBD5E1]">
                  {s.step}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#0F172A] mb-1">
                {s.title}
              </h3>
              <p className="text-[11px] font-semibold text-[#0891B2] mb-2.5">
                {s.tagline}
              </p>
              <p className="text-xs text-[#475569] leading-relaxed mb-4">
                {s.description}
              </p>
            </div>

            <div className="border-t border-[#E2E8F0] pt-3 space-y-1.5">
              {s.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-[#64748B]">
                  <CheckCircle2 className="h-3 w-3 text-[#059669] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
