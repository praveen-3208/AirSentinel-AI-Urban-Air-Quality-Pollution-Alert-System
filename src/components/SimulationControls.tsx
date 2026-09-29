import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { SimulationState } from '../types';

interface SimulationControlsProps {
  simulationState: SimulationState;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  onAdvanceStep: () => void;
  onChangeSpeed: (multiplier: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  simulationState,
  onToggleSimulation,
  onResetSimulation,
  onAdvanceStep,
  onChangeSpeed,
}) => {
  const phases = [
    { num: 1, label: 'Early Morning Baseline' },
    { num: 2, label: 'Peak Rush-Hour Congestion (Guindy / T. Nagar)' },
    { num: 3, label: 'Microclimate Trap & Alert Escalation' },
    { num: 4, label: 'Bay of Bengal Sea Breeze Inflow' },
    { num: 5, label: 'Pollutant Dispersion & Recovery' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 bg-[#FFFFFF]">
      <div className="rounded-2xl border border-[#CBD5E1] bg-[#FFFFFF] p-5 shadow-sm">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${simulationState.isActive ? 'bg-[#D97706]' : 'bg-[#94A3B8]'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${simulationState.isActive ? 'bg-[#D97706]' : 'bg-[#94A3B8]'}`}></span>
              </span>
              <span className="text-xs font-semibold text-[#D97706] uppercase tracking-wider font-mono">
                Simulated live monitoring for demonstration
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-bold text-[#0F172A]">
                Simulation Sequence:
              </span>
              <span className="text-sm font-semibold text-[#0891B2]">
                {simulationState.phaseName}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Play/Pause */}
            <button
              onClick={onToggleSimulation}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                simulationState.isActive
                  ? 'border border-[#D97706]/60 bg-[#D97706]/15 text-[#D97706] hover:bg-[#D97706]/25'
                  : 'bg-[#0891B2] text-white hover:bg-[#0e7490]'
              }`}
            >
              {simulationState.isActive ? (
                <>
                  <Pause className="h-4 w-4 fill-[#D97706]" />
                  <span>Pause Demo</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Run Live Demo</span>
                </>
              )}
            </button>

            {/* Advance Step */}
            <button
              onClick={onAdvanceStep}
              className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
              title="Manually advance to next traffic/weather phase"
            >
              <FastForward className="h-3.5 w-3.5 text-[#0891B2]" />
              <span>Next Phase</span>
            </button>

            {/* Reset */}
            <button
              onClick={onResetSimulation}
              className="flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
              title="Reset simulation to initial baseline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center rounded-lg bg-[#F8FAFC] p-1 border border-[#E2E8F0]">
              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  className={`rounded px-2.5 py-0.5 text-[11px] font-mono font-semibold transition-colors ${
                    simulationState.speedMultiplier === spd
                      ? 'bg-[#0891B2] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Phase Step Pipeline Indicator */}
        <div className="mt-4 grid grid-cols-5 gap-1.5 border-t border-[#E2E8F0] pt-3">
          {phases.map((ph) => {
            const isCurrent = simulationState.step === ph.num;
            const isCompleted = simulationState.step > ph.num;
            return (
              <div key={ph.num} className="text-center">
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 mb-1.5 ${
                    isCurrent
                      ? 'bg-[#0891B2] shadow-xs'
                      : isCompleted
                      ? 'bg-[#059669]'
                      : 'bg-[#E2E8F0]'
                  }`}
                ></div>
                <div className={`text-[10px] font-medium truncate ${isCurrent ? 'text-[#0891B2] font-bold' : isCompleted ? 'text-[#475569]' : 'text-[#94A3B8]'}`}>
                  Step {ph.num}: {ph.label}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
