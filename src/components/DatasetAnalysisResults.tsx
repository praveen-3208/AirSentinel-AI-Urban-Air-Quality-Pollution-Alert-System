import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { 
  Download, 
  RotateCcw, 
  ArrowUpRight, 
  FileDown, 
  Filter, 
  Flame, 
  AlertTriangle, 
  Activity, 
  Compass, 
  BrainCircuit, 
  ArrowUpDown,
  Search,
  CheckCircle2,
  Calendar,
  CloudRain
} from 'lucide-react';
import { NormalizedDatasetRecord } from '../utils/datasetParser';
import { DatasetAnalysisReport, analyzeDataset } from '../utils/datasetAnalyzer';
import { getCategoryColor } from '../utils/aqiCalculator';

interface DatasetAnalysisResultsProps {
  records: NormalizedDatasetRecord[];
  onClearDataset: () => void;
  onReturnToLiveDashboard: () => void;
}

export const DatasetAnalysisResults: React.FC<DatasetAnalysisResultsProps> = ({
  records,
  onClearDataset,
  onReturnToLiveDashboard,
}) => {
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterHotspotsOnly, setFilterHotspotsOnly] = useState<boolean>(false);
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [filterPollutant, setFilterPollutant] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof NormalizedDatasetRecord>('aqi');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  // Generate comprehensive analytical report
  const report: DatasetAnalysisReport | null = useMemo(() => {
    return analyzeDataset(records);
  }, [records]);

  // Unique filter lists
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.location))).sort();
  }, [records]);

  const uniquePollutants = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.dominantPollutant))).sort();
  }, [records]);

  // Filtered & Sorted records for the data table
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterLocation !== 'all' && r.location !== filterLocation) return false;
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterHotspotsOnly && !r.isHotspot) return false;
      if (filterRiskLevel !== 'all' && r.weatherRisk !== filterRiskLevel) return false;
      if (filterPollutant !== 'all' && r.dominantPollutant !== filterPollutant) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          r.location.toLowerCase().includes(query) ||
          r.dominantPollutant.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query)
        );
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [records, filterLocation, filterCategory, filterHotspotsOnly, filterRiskLevel, filterPollutant, searchQuery, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);

  const handleSort = (field: keyof NormalizedDatasetRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Export Cleaned CSV
  const handleExportCSV = () => {
    const headers = [
      'ID', 'Timestamp', 'Location', 'Latitude', 'Longitude', 
      'AQI', 'Category', 'DominantPollutant', 'PM2.5', 'PM10', 
      'CO', 'NO2', 'Temperature', 'Humidity', 'WindSpeed', 'WindDirection', 'WeatherRisk', 'IsHotspot'
    ];
    const csvRows = [headers.join(',')];

    records.forEach((r) => {
      const row = [
        r.id,
        r.timestamp,
        `"${r.location}"`,
        r.latitude ?? '',
        r.longitude ?? '',
        r.aqi,
        `"${r.category}"`,
        r.dominantPollutant,
        r.pm25,
        r.pm10,
        r.co,
        r.no2,
        r.temperature,
        r.humidity,
        r.windSpeed,
        r.windDirection,
        r.weatherRisk,
        r.isHotspot ? 'YES' : 'NO'
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `airsentinel_cleaned_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Analysis Report
  const handleExportJSON = () => {
    if (!report) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(report, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `airsentinel_analysis_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!report) return null;

  return (
    <section id="dataset-results-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-[#E2E8F0] bg-[#F8FAFC]">
      
      {/* Title & Action Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
              Statistical Engine
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-xs text-[#64748B]">{report.overall.timeRange}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Dataset Analysis Results
          </h2>
        </div>

        {/* Global CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] transition-all shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-[#0891B2]" />
            <span>Export Cleaned Data (CSV)</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9] transition-all shadow-xs"
          >
            <FileDown className="h-3.5 w-3.5 text-[#059669]" />
            <span>Export Analysis Report (JSON)</span>
          </button>

          <button
            onClick={onReturnToLiveDashboard}
            className="flex items-center gap-1.5 rounded-lg bg-[#0891B2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0e7490] transition-all shadow-sm"
          >
            <Compass className="h-3.5 w-3.5 text-white" />
            <span>Return to Live Dashboard</span>
          </button>
        </div>
      </div>

      {/* Dynamic Narrative Interpretation Panel */}
      <div className="mb-6 rounded-2xl border border-[#0891B2]/30 bg-[#FFFFFF] p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0891B2] mb-2">
          <BrainCircuit className="h-4 w-4" />
          <span>Automated Natural Language Interpretation</span>
        </div>
        <p className="text-sm text-[#0F172A] leading-relaxed font-medium">
          &ldquo;{report.narrativeInterpretation}&rdquo;
        </p>

        {/* Quick Highlights Bar */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 border-t border-[#E2E8F0] pt-3 text-xs">
          <div>
            <span className="text-[11px] text-[#64748B]">Peak Sector:</span>
            <div className="font-bold text-[#DC2626] truncate">{report.overall.highestPollutionLocation}</div>
          </div>
          <div>
            <span className="text-[11px] text-[#64748B]">Cleanest Node:</span>
            <div className="font-bold text-[#059669] truncate">{report.overall.cleanestLocation}</div>
          </div>
          <div>
            <span className="text-[11px] text-[#64748B]">Leading Pollutant:</span>
            <div className="font-bold text-[#D97706] font-mono">
              {Object.entries(report.dominantPollutantsCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]}
            </div>
          </div>
          <div>
            <span className="text-[11px] text-[#64748B]">Mean Ambient AQI:</span>
            <div className="font-bold text-[#0F172A] font-mono">{report.overall.averageAqi} pts</div>
          </div>
          <div>
            <span className="text-[11px] text-[#64748B]">Active Hotspots:</span>
            <div className="font-bold text-[#EA580C] font-mono">{report.overall.hotspotCount} zones</div>
          </div>
          <div>
            <span className="text-[11px] text-[#64748B]">Stagnation Trap:</span>
            <div className="font-bold text-[#DC2626] font-mono">{report.overall.highRiskRecordsCount} records</div>
          </div>
        </div>
      </div>

      {/* 6 Key Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm">
          <span className="text-xs text-[#64748B]">Records Analyzed</span>
          <div className="mt-1 text-2xl font-bold font-mono text-[#0F172A]">{report.overall.totalRecords}</div>
          <span className="text-[11px] text-[#64748B]">{report.overall.locationsCount} Unique Locations</span>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm">
          <span className="text-xs text-[#64748B]">Mean State AQI</span>
          <div className="mt-1 text-2xl font-bold font-mono text-[#0891B2]">{report.overall.averageAqi}</div>
          <span className="text-[11px] text-[#64748B]">Min: {report.overall.minAqi} · Max: {report.overall.maxAqi}</span>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm border-t-4 border-t-[#DC2626]">
          <span className="text-xs text-[#64748B]">Highest Recorded AQI</span>
          <div className="mt-1 text-2xl font-bold font-mono text-[#DC2626]">{report.overall.maxAqi}</div>
          <span className="text-[11px] text-[#DC2626] font-medium truncate block">{report.overall.highestPollutionLocation}</span>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm">
          <span className="text-xs text-[#64748B]">Particulate Averages</span>
          <div className="mt-1 text-lg font-bold font-mono text-[#0F172A]">
            {report.overall.averagePm25} <span className="text-xs font-normal text-[#64748B]">PM2.5</span>
          </div>
          <span className="text-[11px] text-[#64748B]">{report.overall.averagePm10} µg/m³ PM10</span>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm border-t-4 border-t-[#EA580C]">
          <span className="text-xs text-[#64748B]">Hotspot Locations</span>
          <div className="mt-1 text-2xl font-bold font-mono text-[#EA580C]">{report.overall.hotspotCount}</div>
          <span className="text-[11px] text-[#64748B]">AQI &gt; 150 Critical Nodes</span>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-sm border-t-4 border-t-[#D97706]">
          <span className="text-xs text-[#64748B]">Weather-Trap Events</span>
          <div className="mt-1 text-2xl font-bold font-mono text-[#D97706]">{report.overall.highRiskRecordsCount}</div>
          <span className="text-[11px] text-[#64748B]">Sub-2 km/h Stagnation</span>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Chart 1: AQI Category Distribution Bar Chart */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2E8F0]">
            <div>
              <span className="text-xs font-semibold text-[#0891B2] uppercase">CPCB Breakdown</span>
              <h3 className="text-base font-bold text-[#0F172A]">AQI Category Distribution</h3>
            </div>
            <span className="text-xs text-[#64748B] font-mono">Total {records.length}</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [`${val} records (${item.payload.percentage}%)`, 'Count']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', color: '#0F172A' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {report.categoryDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Temporal AQI Trend Line Chart */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2E8F0]">
            <div>
              <span className="text-xs font-semibold text-[#0891B2] uppercase">Chronological Progression</span>
              <h3 className="text-base font-bold text-[#0F172A]">Dataset AQI Trend Over Time</h3>
            </div>
            <span className="text-xs font-bold text-[#059669]">Trajectory: {report.overallTrendDirection}</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.trendPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="timeLabel" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', color: '#0F172A' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="avgAqi" name="Average AQI" stroke="#0891B2" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="avgPm25" name="Mean PM2.5" stroke="#D97706" strokeWidth={1.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Location-wise AQI Comparison Bar Chart */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2E8F0]">
            <div>
              <span className="text-xs font-semibold text-[#0891B2] uppercase">Spatial Variance</span>
              <h3 className="text-base font-bold text-[#0F172A]">Location-Wise Peak vs Average AQI</h3>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.locationStats.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="location" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', color: '#0F172A' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="highestAqi" name="Peak AQI" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="averageAqi" name="Average AQI" fill="#0891B2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Weather-Trap Risk & Forecast Preview */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E2E8F0]">
              <div>
                <span className="text-xs font-semibold text-[#0891B2] uppercase">Inference & Forecast</span>
                <h3 className="text-base font-bold text-[#0F172A]">Weather-Trap & Short-Term Horizon</h3>
              </div>
            </div>

            {/* Risk Breakdown Bars */}
            <div className="space-y-3 mb-4 text-xs">
              <div>
                <div className="flex justify-between text-[#475569] mb-1">
                  <span>High Inversion Stagnation Risk (AQI &gt; 150 & wind &lt; 2km/h):</span>
                  <strong className="text-[#DC2626] font-mono">{report.overall.highRiskRecordsCount} records</strong>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F1F5F9]">
                  <div
                    className="h-full rounded-full bg-[#DC2626]"
                    style={{ width: `${Math.round((report.overall.highRiskRecordsCount / report.overall.totalRecords) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#475569] mb-1">
                  <span>Moderate Accumulation Risk (AQI &gt; 100 & wind &lt; 5km/h):</span>
                  <strong className="text-[#D97706] font-mono">{report.overall.moderateRiskRecordsCount} records</strong>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F1F5F9]">
                  <div
                    className="h-full rounded-full bg-[#D97706]"
                    style={{ width: `${Math.round((report.overall.moderateRiskRecordsCount / report.overall.totalRecords) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#475569] mb-1">
                  <span>Favorable Active Dispersion Risk:</span>
                  <strong className="text-[#059669] font-mono">{report.overall.lowRiskRecordsCount} records</strong>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F1F5F9]">
                  <div
                    className="h-full rounded-full bg-[#059669]"
                    style={{ width: `${Math.round((report.overall.lowRiskRecordsCount / report.overall.totalRecords) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Hour Forecast Box */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs">
            <div className="font-semibold text-[#0F172A] mb-1 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-[#0891B2]" />
              <span>3-Hour Predictive Projection:</span>
            </div>
            {report.forecastPoints ? (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {report.forecastPoints.map((pt) => (
                  <div key={pt.hour} className="rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] p-2 text-center shadow-xs">
                    <span className="text-[10px] text-[#64748B] block">{pt.hour}</span>
                    <strong className="text-base font-mono font-bold text-[#0891B2]">{pt.aqi}</strong>
                    <span className="text-[9px] text-[#64748B] block">AQI Est.</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#64748B] italic text-[11px]">
                {report.forecastNotice}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Sortable & Filterable Data Table */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-sm">
        
        {/* Table Header and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">
              Comprehensive Dataset Records ({filteredRecords.length})
            </h3>
            <p className="text-xs text-[#64748B]">
              Inspect, sort, and filter individual records with normalized pollutants and calculated CPCB index.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search location, pollutant..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] pl-9 pr-3 py-1.5 text-xs text-[#0F172A] focus:border-[#0891B2] focus:outline-none focus:ring-1 focus:ring-[#0891B2]"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-4 text-xs">
          
          {/* Location Filter */}
          <div>
            <label className="text-[11px] font-medium text-[#64748B] block mb-1">Location</label>
            <select
              value={filterLocation}
              onChange={(e) => { setFilterLocation(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#0F172A]"
            >
              <option value="all">All Locations ({uniqueLocations.length})</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[11px] font-medium text-[#64748B] block mb-1">AQI Category</label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#0F172A]"
            >
              <option value="all">All Categories</option>
              <option value="Good">Good (0–50)</option>
              <option value="Satisfactory">Satisfactory (51–100)</option>
              <option value="Moderately Polluted">Moderately Polluted (101–200)</option>
              <option value="Poor">Poor (201–300)</option>
              <option value="Very Poor">Very Poor (301–400)</option>
              <option value="Severe">Severe (401–500)</option>
            </select>
          </div>

          {/* Dominant Pollutant */}
          <div>
            <label className="text-[11px] font-medium text-[#64748B] block mb-1">Dominant Pollutant</label>
            <select
              value={filterPollutant}
              onChange={(e) => { setFilterPollutant(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#0F172A]"
            >
              <option value="all">All Pollutants</option>
              {uniquePollutants.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Weather Risk */}
          <div>
            <label className="text-[11px] font-medium text-[#64748B] block mb-1">Weather-Trap Risk</label>
            <select
              value={filterRiskLevel}
              onChange={(e) => { setFilterRiskLevel(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-2.5 py-1.5 text-xs text-[#0F172A]"
            >
              <option value="all">All Risk Levels</option>
              <option value="High">High Stagnation Risk</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Hotspots Only Checkbox */}
          <div className="flex items-end">
            <button
              onClick={() => { setFilterHotspotsOnly(!filterHotspotsOnly); setPage(1); }}
              className={`w-full flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterHotspotsOnly
                  ? 'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626]'
                  : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#475569] hover:bg-[#F8FAFC]'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>{filterHotspotsOnly ? 'Hotspots Only' : 'Filter Hotspots'}</span>
            </button>
          </div>

        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] text-[#475569] font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th onClick={() => handleSort('timestamp')} className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A]">
                  <div className="flex items-center gap-1">
                    <span>Timestamp</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('location')} className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A]">
                  <div className="flex items-center gap-1">
                    <span>Location</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('aqi')} className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A]">
                  <div className="flex items-center gap-1">
                    <span>AQI</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Dominant</th>
                <th onClick={() => handleSort('pm25')} className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A]">
                  <div className="flex items-center gap-1">
                    <span>PM2.5</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('pm10')} className="py-2.5 px-3 cursor-pointer hover:text-[#0F172A]">
                  <div className="flex items-center gap-1">
                    <span>PM10</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">NO2</th>
                <th className="py-2.5 px-3">CO</th>
                <th className="py-2.5 px-3">Temp</th>
                <th className="py-2.5 px-3">Humidity</th>
                <th className="py-2.5 px-3">Wind</th>
                <th className="py-2.5 px-3">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-[#64748B]">
                    No records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const colors = getCategoryColor(r.category);
                  return (
                    <tr key={r.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-2 px-3 font-mono text-[11px] text-[#64748B] whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-3 font-bold text-[#0F172A] whitespace-nowrap">
                        {r.location}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-sm whitespace-nowrap" style={{ color: colors.hex }}>
                        {r.aqi}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${colors.text} ${colors.bg}`}>
                          {r.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-xs font-semibold text-[#0891B2]">
                        {r.dominantPollutant}
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-[#0F172A]">{r.pm25}</td>
                      <td className="py-2 px-3 font-mono text-xs text-[#0F172A]">{r.pm10}</td>
                      <td className="py-2 px-3 font-mono text-xs text-[#0F172A]">{r.no2}</td>
                      <td className="py-2 px-3 font-mono text-xs text-[#0F172A]">{r.co}</td>
                      <td className="py-2 px-3 font-mono text-xs text-[#64748B]">{r.temperature}°C</td>
                      <td className="py-2 px-3 font-mono text-xs text-[#64748B]">{r.humidity}%</td>
                      <td className="py-2 px-3 font-mono text-xs text-[#64748B]">{r.windSpeed}k {r.windDirection}</td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          r.weatherRisk === 'High' ? 'bg-[#DC2626]/10 text-[#DC2626]' :
                          r.weatherRisk === 'Moderate' ? 'bg-[#D97706]/10 text-[#D97706]' :
                          'bg-[#059669]/10 text-[#059669]'
                        }`}>
                          {r.weatherRisk}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3 text-xs text-[#64748B]">
            <div>
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#0F172A] disabled:opacity-40 hover:bg-[#F8FAFC]"
              >
                Previous
              </button>
              <span className="font-mono text-xs font-semibold px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#0F172A] disabled:opacity-40 hover:bg-[#F8FAFC]"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

    </section>
  );
};
