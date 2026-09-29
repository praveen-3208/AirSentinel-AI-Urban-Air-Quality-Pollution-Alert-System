import React from 'react';
import { 
  HeartHandshake, 
  ShieldAlert, 
  Footprints, 
  Home, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  Wind
} from 'lucide-react';
import { ComprehensiveRecommendation } from '../utils/recommendations';
import { AQIResult, WeatherRiskResult } from '../types';

interface RecommendationPanelProps {
  recommendation: ComprehensiveRecommendation;
  aqiResult: AQIResult;
  weatherRisk: WeatherRiskResult;
  locationName: string;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendation,
  aqiResult,
  weatherRisk,
  locationName,
}) => {
  const getOutdoorBadgeColor = (status: string) => {
    switch (status) {
      case 'Safe':
        return 'text-[#059669] bg-[#059669]/10 border-[#059669]/30';
      case 'Caution':
        return 'text-[#D97706] bg-[#D97706]/10 border-[#D97706]/30';
      case 'Restricted':
        return 'text-[#EA580C] bg-[#EA580C]/10 border-[#EA580C]/30';
      default:
        return 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30';
    }
  };

  return (
    <section id="advisory-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 bg-[#FFFFFF]">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
              Targeted Public Health Guidance
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-xs text-[#64748B]">ICMR & CPCB Aligned</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Location-Based Advisory – {locationName}
          </h2>
        </div>
        <p className="text-xs text-[#64748B] max-w-md">
          Actionable protocols tailored to current AQI ({aqiResult.aqi}), dominant pollutant ({aqiResult.dominantPollutant}), and atmospheric dispersion conditions.
        </p>
      </div>

      {/* Main Grid: 4 Action Panels */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Panel 1: Mask & Personal Respiratory Protection */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#0891B2] font-bold text-sm mb-3">
            <ShieldAlert className="h-5 w-5" />
            <span>Respiratory Protection</span>
          </div>

          <div className="mb-3">
            <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${
              recommendation.maskGuidance.recommended
                ? 'border-[#DC2626]/40 bg-[#DC2626]/10 text-[#DC2626]'
                : 'border-[#059669]/40 bg-[#059669]/10 text-[#059669]'
            }`}>
              {recommendation.maskGuidance.recommended ? 'Mask Advised' : 'No Mask Needed'}
            </span>
          </div>

          <div className="text-xs text-[#0F172A] font-semibold mb-1">
            {recommendation.maskGuidance.maskType}
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            {recommendation.maskGuidance.details}
          </p>
        </div>

        {/* Panel 2: Outdoor Sports & Recreation */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#059669] font-bold text-sm mb-3">
            <Footprints className="h-5 w-5" />
            <span>Outdoor Activities & Exercise</span>
          </div>

          <div className="mb-3">
            <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getOutdoorBadgeColor(recommendation.outdoorActivities.status)}`}>
              {recommendation.outdoorActivities.status}
            </span>
          </div>

          <p className="text-xs text-[#475569] leading-relaxed">
            {recommendation.outdoorActivities.description}
          </p>
        </div>

        {/* Panel 3: Sensitive Groups & Children */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#D97706] font-bold text-sm mb-3">
            <HeartHandshake className="h-5 w-5" />
            <span>Vulnerable Demographics</span>
          </div>

          <ul className="space-y-2 text-xs text-[#475569]">
            {recommendation.sensitiveGroups.map((group, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#D97706] font-bold mt-0.5">•</span>
                <span>{group}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel 4: Indoor Air Quality & Ventilation */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#0284C7] font-bold text-sm mb-3">
            <Home className="h-5 w-5" />
            <span>Indoor Air & Ventilation</span>
          </div>

          <ul className="space-y-2 text-xs text-[#475569]">
            {recommendation.indoorCare.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#0284C7] font-bold mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Urban & Municipal Intervention Strip */}
      <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-2">
          <Building2 className="h-4 w-4 text-[#0891B2]" />
          <span>Municipal Urban Mitigation Protocols Active for {locationName}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-[#475569]">
          {recommendation.municipalMitigation.map((action, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-[#FFFFFF] p-2.5 border border-[#E2E8F0] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0891B2] mt-1.5 shrink-0"></span>
              <span className="text-[#0F172A] font-medium">{action}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
