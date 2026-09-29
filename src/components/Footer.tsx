import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] py-10 text-xs text-[#64748B]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E2E8F0]">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0891B2]/10 text-[#0891B2] border border-[#0891B2]/30">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-[#0F172A] tracking-tight">
                AirSentinel <span className="text-[#0891B2] font-mono text-xs">AI</span>
              </span>
            </div>
            <p className="text-[#475569] max-w-md text-[11px] leading-relaxed">
              Smart Urban Air Quality Monitoring, Microclimate Stagnation Trap Detection, Custom Dataset Analytics, and Location-Based Pollution Alert System for Tamil Nadu.
            </p>
            <div className="text-[11px] text-[#0891B2] font-semibold">
              Tagline: &ldquo;Breathe Better. Live Smarter.&rdquo;
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 text-[11px]">
            <span className="font-semibold text-[#0F172A]">
              Environment & Sustainability Hackathon Prototype
            </span>
            <span className="text-[#64748B]">
              Prototype demonstration using simulated, API-ready, and user-uploaded dataset telemetry
            </span>
            <div className="flex items-center gap-2 text-[#94A3B8] pt-1">
              <span>Map Data: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-[#0891B2] hover:underline">OpenStreetMap</a> contributors</span>
              <span>·</span>
              <span>CPCB-Inspired Indian Framework</span>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#94A3B8]">
          <p>
            &copy; 2026 AirSentinel AI System. Built for academic demonstration & clean air research.
          </p>
          <p className="flex items-center gap-1 text-[#64748B]">
            Engineered for rapid urban intervention in Tamil Nadu municipalities.
          </p>
        </div>

      </div>
    </footer>
  );
};
