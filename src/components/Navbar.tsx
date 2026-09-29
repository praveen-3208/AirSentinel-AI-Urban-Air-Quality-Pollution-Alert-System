import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  BarChart3, 
  Flame, 
  Bell, 
  Activity, 
  Play, 
  Pause, 
  RotateCcw, 
  Menu, 
  X, 
  Volume2, 
  VolumeX,
  Eye,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';
import { AirQualityReading } from '../types';

interface NavbarProps {
  stations: AirQualityReading[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  simulationActive: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  unreadAlertCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  hasUploadedDataset: boolean;
  onScrollToUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  simulationActive,
  onToggleSimulation,
  onResetSimulation,
  unreadAlertCount,
  soundEnabled,
  onToggleSound,
  reducedMotion,
  onToggleReducedMotion,
  hasUploadedDataset,
  onScrollToUpload,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Live Map', href: '#map-section' },
    { label: 'Overview', href: '#summary-section' },
    { label: 'Upload Dataset', href: '#upload-dataset-section', isUpload: true },
    ...(hasUploadedDataset ? [{ label: 'Dataset Analysis', href: '#dataset-results-section', highlight: true }] : []),
    { label: 'Analytics', href: '#analytics-section' },
    { label: 'Hotspots', href: '#hotspots-section' },
    { label: 'Alerts', href: '#alerts-section', count: unreadAlertCount },
    { label: 'Advisory', href: '#advisory-section' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-[#FFFFFF]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0891B2]/15 to-[#059669]/15 border border-[#0891B2]/40 text-[#0891B2] shadow-xs group-hover:border-[#0891B2] transition-colors">
              <ShieldAlert className="h-5 w-5 text-[#0891B2]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className={`inline-flex h-full w-full rounded-full ${simulationActive ? 'bg-[#D97706] animate-ping' : 'bg-[#059669]'}`}></span>
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${simulationActive ? 'bg-[#D97706]' : 'bg-[#059669]'}`}></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-[#0F172A] group-hover:text-[#0891B2] transition-colors">
                  AirSentinel <span className="text-[#0891B2] font-mono text-sm">AI</span>
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] font-medium hidden sm:block">
                Tamil Nadu Urban Air Quality & Alert System
              </p>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-[#475569]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`relative py-1 transition-colors flex items-center gap-1.5 ${
                link.isUpload
                  ? 'text-[#0891B2] font-bold hover:text-[#0e7490]'
                  : link.highlight
                  ? 'text-[#059669] font-bold hover:text-[#047857]'
                  : 'hover:text-[#0891B2]'
              }`}
            >
              {link.isUpload && <UploadCloud className="h-3.5 w-3.5" />}
              {link.label}
              {link.count !== undefined && link.count > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">
                  {link.count}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Station quick-picker */}
          <div className="relative hidden md:block">
            <select
              value={selectedStationId}
              aria-label="Select monitoring station"
              onChange={(e) => onSelectStation(e.target.value)}
              className="h-8 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#0F172A] focus:border-[#0891B2] focus:outline-none focus:ring-1 focus:ring-[#0891B2] transition-colors shadow-2xs"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id} className="text-[#0F172A]">
                  {st.location} ({st.district})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Dataset CTA button */}
          <button
            onClick={onScrollToUpload}
            className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg border border-[#0891B2]/40 bg-[#0891B2]/10 px-2.5 text-xs font-bold text-[#0891B2] hover:bg-[#0891B2]/20 transition-all shadow-2xs"
            title="Upload and Analyze Dataset"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload Dataset</span>
          </button>

          {/* Live Simulation Toggle Button */}
          <button
            onClick={onToggleSimulation}
            className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all shadow-2xs ${
              simulationActive
                ? 'border border-[#D97706]/60 bg-[#D97706]/15 text-[#D97706]'
                : 'border border-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] hover:bg-[#F8FAFC]'
            }`}
            title={simulationActive ? 'Pause Simulation' : 'Start Live Simulation'}
          >
            {simulationActive ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-[#D97706] text-[#D97706]" />
                <span className="hidden sm:inline">Pause Sim</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-[#0891B2] text-[#0891B2]" />
                <span className="hidden sm:inline">Start Sim</span>
              </>
            )}
          </button>

          {/* Reset Demo button */}
          <button
            onClick={onResetSimulation}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-2xs"
            title="Reset Simulation Demo"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors shadow-2xs ${
              soundEnabled
                ? 'border-[#0891B2]/40 bg-[#0891B2]/10 text-[#0891B2]'
                : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#94A3B8] hover:text-[#475569]'
            }`}
            title={soundEnabled ? 'Alert Chime: ON' : 'Alert Chime: OFF'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>

          {/* Reduced Motion Toggle */}
          <button
            onClick={onToggleReducedMotion}
            className={`hidden sm:flex h-8 w-8 items-center justify-center rounded-lg border transition-colors shadow-2xs ${
              reducedMotion
                ? 'border-[#D97706]/40 bg-[#D97706]/10 text-[#D97706]'
                : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#64748B] hover:text-[#0F172A]'
            }`}
            title={reducedMotion ? 'Reduced Motion: Active' : 'Toggle Reduced Motion'}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] lg:hidden hover:bg-[#F8FAFC]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E2E8F0] bg-[#FFFFFF] px-4 pt-3 pb-4 lg:hidden shadow-lg">
          <div className="mb-3">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] block mb-1">
              Select Monitoring Station
            </label>
            <select
              value={selectedStationId}
              onChange={(e) => {
                onSelectStation(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="w-full h-9 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 text-xs text-[#0F172A]"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.location} ({st.district})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#475569]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg bg-[#F8FAFC] p-2.5 hover:bg-[#F1F5F9] text-[#0F172A]"
              >
                <span>{link.label}</span>
                {link.count !== undefined && link.count > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#DC2626] px-1 text-[10px] font-bold text-white">
                    {link.count}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
