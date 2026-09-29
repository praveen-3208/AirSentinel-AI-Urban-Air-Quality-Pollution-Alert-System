import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SimulationControls } from './components/SimulationControls';
import { SummaryCards } from './components/SummaryCards';
import { TamilNaduMap } from './components/TamilNaduMap';
import { ParameterCards } from './components/ParameterCards';
import { AQIChart } from './components/AQIChart';
import { ForecastChart } from './components/ForecastChart';
import { HotspotPanel } from './components/HotspotPanel';
import { AlertPanel } from './components/AlertPanel';
import { RecommendationPanel } from './components/RecommendationPanel';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { DatasetUploadSection } from './components/DatasetUploadSection';
import { DatasetAnalysisResults } from './components/DatasetAnalysisResults';

import { 
  AirQualityReading, 
  SimulationState, 
  AlertItem 
} from './types';
import { INITIAL_READINGS, generateHistoricalReadings } from './data/mockAirQualityData';
import { calculateAQI } from './utils/aqiCalculator';
import { calculateWeatherRisk } from './utils/weatherRisk';
import { detectHotspots } from './utils/hotspotDetection';
import { analyzeTrend } from './utils/trendAnalysis';
import { generateShortTermForecast } from './utils/forecastEngine';
import { generateComprehensiveRecommendation } from './utils/recommendations';
import { evaluateAlerts, playAlertChime } from './services/alertService';
import { DatasetParseResult, NormalizedDatasetRecord } from './utils/datasetParser';

export default function App() {
  // State for stations telemetry
  const [stations, setStations] = useState<AirQualityReading[]>(INITIAL_READINGS);
  const [previousReadingsMap, setPreviousReadingsMap] = useState<Record<string, AirQualityReading>>({});
  const [selectedStationId, setSelectedStationId] = useState<string>('chennai-guindy');

  // State for uploaded dataset
  const [uploadedDataset, setUploadedDataset] = useState<DatasetParseResult | null>(null);

  // Simulation controls state
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isActive: false,
    step: 1,
    phaseName: 'Step 1: Early Morning Baseline',
    speedMultiplier: 1,
    lastUpdated: new Date().toLocaleTimeString(),
  });

  // Sound and accessibility states
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Alerts state
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    return evaluateAlerts(INITIAL_READINGS);
  });

  // Check system prefers-reduced-motion on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }
  }, []);

  // Currently selected station reading
  const selectedStation = useMemo(() => {
    return stations.find((s) => s.id === selectedStationId) || stations[0];
  }, [stations, selectedStationId]);

  // Previous reading for the selected station
  const previousSelectedStation = useMemo(() => {
    return previousReadingsMap[selectedStationId];
  }, [previousReadingsMap, selectedStationId]);

  // AQI calculations for selected station
  const aqiResult = useMemo(() => {
    return calculateAQI(
      selectedStation.pm25,
      selectedStation.pm10,
      selectedStation.co,
      selectedStation.no2
    );
  }, [selectedStation]);

  const previousAqi = useMemo(() => {
    if (!previousSelectedStation) return aqiResult.aqi * 0.95;
    return calculateAQI(
      previousSelectedStation.pm25,
      previousSelectedStation.pm10,
      previousSelectedStation.co,
      previousSelectedStation.no2
    ).aqi;
  }, [previousSelectedStation, aqiResult]);

  // Weather Risk calculation
  const weatherRisk = useMemo(() => {
    return calculateWeatherRisk(
      aqiResult.aqi,
      selectedStation.windSpeed,
      selectedStation.humidity,
      selectedStation.location
    );
  }, [aqiResult, selectedStation]);

  // Trend analysis calculation
  const trend = useMemo(() => {
    return analyzeTrend(aqiResult.aqi, previousAqi);
  }, [aqiResult.aqi, previousAqi]);

  // Hotspots detection & clustering across all stations
  const { individualHotspots, hotspotZones } = useMemo(() => {
    return detectHotspots(stations);
  }, [stations]);

  // 3-hour short-term forecast
  const forecast = useMemo(() => {
    return generateShortTermForecast({
      currentAqi: aqiResult.aqi,
      previousAqi,
      windSpeed: selectedStation.windSpeed,
      humidity: selectedStation.humidity,
      temperature: selectedStation.temperature,
    });
  }, [aqiResult.aqi, previousAqi, selectedStation]);

  // Health and activity recommendations
  const recommendation = useMemo(() => {
    return generateComprehensiveRecommendation(
      aqiResult.aqi,
      aqiResult.category,
      aqiResult.dominantPollutant,
      weatherRisk.riskLevel
    );
  }, [aqiResult, weatherRisk]);

  // 12-hour historical time-series data for chart
  const historicalData = useMemo(() => {
    return generateHistoricalReadings(selectedStation);
  }, [selectedStation]);

  // Regional metrics for hero section
  const regionalMetrics = useMemo(() => {
    const totalAqi = stations.reduce((acc, st) => {
      return acc + calculateAQI(st.pm25, st.pm10, st.co, st.no2).aqi;
    }, 0);
    const avg = Math.round(totalAqi / stations.length);

    let peakSt = stations[0];
    let peakAqi = 0;
    stations.forEach((st) => {
      const a = calculateAQI(st.pm25, st.pm10, st.co, st.no2).aqi;
      if (a > peakAqi) {
        peakAqi = a;
        peakSt = st;
      }
    });

    return {
      averageAqi: avg,
      peakLocation: peakSt.location,
      peakAqi,
    };
  }, [stations]);

  // Unread alert count
  const unreadAlertCount = useMemo(() => {
    return alerts.filter((a) => !a.isRead).length;
  }, [alerts]);

  // Mark single alert as read
  const handleMarkAsRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  }, []);

  // Mark all alerts as read
  const handleMarkAllAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  }, []);

  // Toggle live simulation
  const handleToggleSimulation = useCallback(() => {
    setSimulationState((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  }, []);

  // Reset simulation to baseline
  const handleResetSimulation = useCallback(() => {
    setStations(INITIAL_READINGS);
    setPreviousReadingsMap({});
    setSimulationState({
      isActive: false,
      step: 1,
      phaseName: 'Step 1: Early Morning Baseline',
      speedMultiplier: 1,
      lastUpdated: new Date().toLocaleTimeString(),
    });
    setAlerts(evaluateAlerts(INITIAL_READINGS));
  }, []);

  // Simulation step advancing logic
  const advanceSimulationStep = useCallback(() => {
    setSimulationState((prev) => {
      const nextStep = prev.step >= 5 ? 1 : prev.step + 1;
      let phaseName = '';

      const prevMap: Record<string, AirQualityReading> = {};
      stations.forEach((s) => {
        prevMap[s.id] = { ...s };
      });
      setPreviousReadingsMap(prevMap);

      setStations((currentStations) => {
        return currentStations.map((st) => {
          const isChennaiMetro = ['chennai-guindy', 'chennai-tnagar', 'chennai-annanagar'].includes(st.id);
          const isCoastal = st.id === 'chennai-marinabeach';

          let pm25Delta = 0;
          let pm10Delta = 0;
          let no2Delta = 0;
          let coDelta = 0;
          let windSpeed = st.windSpeed;
          let humidity = st.humidity;

          if (nextStep === 1) {
            phaseName = 'Step 1: Early Morning Baseline';
            const base = INITIAL_READINGS.find((b) => b.id === st.id) || st;
            return { ...base, timestamp: new Date().toISOString() };
          } else if (nextStep === 2) {
            phaseName = 'Step 2: Morning Traffic Congestion Surge';
            if (isChennaiMetro) {
              pm25Delta = +45;
              pm10Delta = +75;
              no2Delta = +48;
              coDelta = +1.1;
              windSpeed = 1.1;
              humidity = 79;
            } else {
              pm25Delta = +10;
              pm10Delta = +20;
              no2Delta = +8;
              coDelta = +0.2;
            }
          } else if (nextStep === 3) {
            phaseName = 'Step 3: Stagnation Trap & Hazardous Hotspots';
            if (isChennaiMetro) {
              pm25Delta = +78;
              pm10Delta = +125;
              no2Delta = +65;
              coDelta = +1.8;
              windSpeed = 0.8;
              humidity = 84;
            } else {
              pm25Delta = +18;
              pm10Delta = +30;
              no2Delta = +15;
              coDelta = +0.4;
            }
          } else if (nextStep === 4) {
            phaseName = 'Step 4: Sea Breeze Inflow (Bay of Bengal)';
            windSpeed = isCoastal ? 18.5 : 12.0;
            humidity = 70;
            pm25Delta = -30;
            pm10Delta = -55;
            no2Delta = -35;
            coDelta = -0.8;
          } else if (nextStep === 5) {
            phaseName = 'Step 5: Atmospheric Clearance & Recovery';
            windSpeed = 8.5;
            pm25Delta = -60;
            pm10Delta = -95;
            no2Delta = -50;
            coDelta = -1.2;
          }

          const newPm25 = Math.max(15, Math.round(st.pm25 + pm25Delta));
          const newPm10 = Math.max(30, Math.round(st.pm10 + pm10Delta));
          const newNo2 = Math.max(20, Math.round(st.no2 + no2Delta));
          const newCo = Math.max(0.5, Number((st.co + coDelta).toFixed(2)));

          return {
            ...st,
            pm25: newPm25,
            pm10: newPm10,
            no2: newNo2,
            co: newCo,
            windSpeed: Number(windSpeed.toFixed(1)),
            humidity,
            timestamp: new Date().toISOString(),
          };
        });
      });

      return {
        ...prev,
        step: nextStep,
        phaseName,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    });
  }, [stations]);

  // Re-evaluate alerts whenever stations change
  useEffect(() => {
    const newAlerts = evaluateAlerts(stations, previousReadingsMap);
    if (newAlerts.length > 0) {
      setAlerts((prev) => {
        const existingIds = new Set(prev.map((a) => `${a.location}-${a.title}`));
        const filteredNew = newAlerts.filter((na) => !existingIds.has(`${na.location}-${na.title}`));
        
        if (filteredNew.length > 0 && soundEnabled) {
          const highestSeverity = filteredNew.some(f => f.severity === 'critical') ? 'critical' : 'warning';
          playAlertChime(highestSeverity);
        }

        return [...filteredNew, ...prev].slice(0, 15);
      });
    }
  }, [stations, previousReadingsMap, soundEnabled]);

  // Live simulation ticker effect
  useEffect(() => {
    if (!simulationState.isActive) return;

    const intervalMs = Math.max(1000, Math.round(3500 / simulationState.speedMultiplier));
    const timer = setInterval(() => {
      advanceSimulationStep();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simulationState.isActive, simulationState.speedMultiplier, advanceSimulationStep]);

  // Smooth scroll helpers
  const handleScrollToMap = () => {
    const mapEl = document.getElementById('map-section');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToUpload = () => {
    const uploadEl = document.getElementById('upload-dataset-section');
    if (uploadEl) {
      uploadEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dataset upload handling
  const handleDatasetParsed = (result: DatasetParseResult) => {
    setUploadedDataset(result);

    // Scroll to results section smoothly
    setTimeout(() => {
      const resultsEl = document.getElementById('dataset-results-section');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleClearDataset = () => {
    setUploadedDataset(null);
  };

  // If user selects an uploaded location from the map or table, focus dashboard on it
  const handleSelectUploadedRecord = (rec: NormalizedDatasetRecord) => {
    const converted: AirQualityReading = {
      id: rec.id,
      location: rec.location,
      district: rec.district || 'Uploaded Dataset Sector',
      latitude: rec.latitude ?? 11.1271,
      longitude: rec.longitude ?? 78.6569,
      timestamp: rec.timestamp,
      pm25: rec.pm25,
      pm10: rec.pm10,
      co: rec.co,
      no2: rec.no2,
      temperature: rec.temperature,
      humidity: rec.humidity,
      windSpeed: rec.windSpeed,
      windDirection: rec.windDirection,
      source: 'simulated',
    };

    setStations((prev) => {
      if (!prev.some((s) => s.id === rec.id)) {
        return [converted, ...prev];
      }
      return prev;
    });

    setSelectedStationId(rec.id);

    // Scroll up to summary
    const summaryEl = document.getElementById('summary-section');
    if (summaryEl) {
      summaryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen bg-[#FFFFFF] text-[#0F172A] bg-cyber-grid ${reducedMotion ? 'reduced-motion-active' : ''}`}>
      
      {/* Navigation Header */}
      <Navbar
        stations={stations}
        selectedStationId={selectedStationId}
        onSelectStation={setSelectedStationId}
        simulationActive={simulationState.isActive}
        onToggleSimulation={handleToggleSimulation}
        onResetSimulation={handleResetSimulation}
        unreadAlertCount={unreadAlertCount}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        hasUploadedDataset={uploadedDataset !== null && uploadedDataset.records.length > 0}
        onScrollToUpload={handleScrollToUpload}
      />

      <main>
        {/* Hero Section */}
        <HeroSection
          simulationActive={simulationState.isActive}
          onToggleSimulation={handleToggleSimulation}
          stationCount={stations.length}
          hotspotCount={individualHotspots.length}
          averageAqi={regionalMetrics.averageAqi}
          peakLocation={regionalMetrics.peakLocation}
          peakAqi={regionalMetrics.peakAqi}
          onScrollToMap={handleScrollToMap}
          onScrollToUpload={handleScrollToUpload}
        />

        {/* Priority 1, 2, 3: Interactive Tamil Nadu Leaflet Map */}
        <TamilNaduMap
          stations={stations}
          selectedStationId={selectedStationId}
          onSelectStation={setSelectedStationId}
          reducedMotion={reducedMotion}
          uploadedRecords={uploadedDataset?.records || []}
          onSelectUploadedRecord={handleSelectUploadedRecord}
        />

        {/* Priority 4 & 5: High-Level Overview Summary Cards for Selected Location */}
        <SummaryCards
          reading={selectedStation}
          aqiResult={aqiResult}
          weatherRisk={weatherRisk}
          trend={trend}
          hotspotCount={individualHotspots.length}
        />

        {/* Detailed Sensor Parameter Cards */}
        <ParameterCards
          reading={selectedStation}
          aqiResult={aqiResult}
        />

        {/* Dataset Ingestion & Validation Section */}
        <DatasetUploadSection
          onDatasetParsed={handleDatasetParsed}
          onClearDataset={handleClearDataset}
          isDatasetActive={uploadedDataset !== null}
          parseResult={uploadedDataset}
        />

        {/* Dataset Analysis Results Section (Visible when dataset is analyzed) */}
        {uploadedDataset && uploadedDataset.records.length > 0 && (
          <DatasetAnalysisResults
            records={uploadedDataset.records}
            onClearDataset={handleClearDataset}
            onReturnToLiveDashboard={handleScrollToMap}
          />
        )}

        {/* Priority 9: Live Simulation Control Strip */}
        <SimulationControls
          simulationState={simulationState}
          onToggleSimulation={handleToggleSimulation}
          onResetSimulation={handleResetSimulation}
          onAdvanceStep={advanceSimulationStep}
          onChangeSpeed={(spd) => setSimulationState((p) => ({ ...p, speedMultiplier: spd }))}
        />

        {/* Analytics Section: 12-Hour Trend & 3-Hour Forecast */}
        <section id="analytics-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 bg-[#FFFFFF]">
          <div className="mb-6 border-b border-[#E2E8F0] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
              Diagnostic & Predictive Intelligence
            </span>
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Air Quality Dynamics & Short-Term Projections
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AQIChart
              data={historicalData}
              trend={trend}
              locationName={selectedStation.location}
            />

            <ForecastChart
              forecast={forecast}
              locationName={selectedStation.location}
            />
          </div>
        </section>

        {/* Spatial Hotspots & Clustered Stagnation Zones */}
        <HotspotPanel
          hotspots={individualHotspots}
          zones={hotspotZones}
          onSelectStation={setSelectedStationId}
          selectedStationId={selectedStationId}
        />

        {/* Real-time Pollution Alerts & Dispatch Gateway */}
        <AlertPanel
          alerts={alerts}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          unreadCount={unreadAlertCount}
        />

        {/* Comprehensive Health & Activity Recommendations */}
        <RecommendationPanel
          recommendation={recommendation}
          aqiResult={aqiResult}
          weatherRisk={weatherRisk}
          locationName={selectedStation.location}
        />

        {/* System Architecture & How It Works */}
        <HowItWorks />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
