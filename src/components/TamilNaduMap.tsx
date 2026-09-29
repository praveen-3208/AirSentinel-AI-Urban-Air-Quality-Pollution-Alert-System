import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Crosshair, 
  RotateCcw, 
  Flame, 
  MapPin, 
  Wind, 
  AlertTriangle,
  Layers,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { AirQualityReading } from '../types';
import { calculateAQI, getCategoryColor } from '../utils/aqiCalculator';
import { calculateWeatherRisk } from '../utils/weatherRisk';
import { TAMIL_NADU_GEOJSON } from '../data/tamilNaduGeo';
import { NormalizedDatasetRecord } from '../utils/datasetParser';
import { MapLegend } from './MapLegend';

interface TamilNaduMapProps {
  stations: AirQualityReading[];
  selectedStationId: string;
  onSelectStation: (id: string) => void;
  reducedMotion: boolean;
  uploadedRecords?: NormalizedDatasetRecord[];
  onSelectUploadedRecord?: (record: NormalizedDatasetRecord) => void;
}

export const TamilNaduMap: React.FC<TamilNaduMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  reducedMotion,
  uploadedRecords = [],
  onSelectUploadedRecord,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const DEFAULT_CENTER: [number, number] = [11.1271, 78.6569];
  const DEFAULT_ZOOM = 7;

  const [filterHotspotsOnly, setFilterHotspotsOnly] = useState<boolean>(false);
  const [dataSourceFilter, setDataSourceFilter] = useState<'both' | 'live' | 'uploaded'>('both');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  // Initialize Leaflet map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 6,
        maxZoom: 16,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Standard OpenStreetMap tile layer (clean white/daylight theme)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add GeoJSON district & state boundaries
      try {
        const geoLayer = L.geoJSON(TAMIL_NADU_GEOJSON as any, {
          style: (feature) => {
            const isState = feature?.properties?.type === 'State Boundary';
            return {
              color: isState ? '#0891B2' : '#0284C7',
              weight: isState ? 1.5 : 1,
              opacity: isState ? 0.7 : 0.4,
              dashArray: isState ? '4, 4' : undefined,
              fillColor: '#0EA5E9',
              fillOpacity: isState ? 0.02 : 0.05,
            };
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.name) {
              layer.bindTooltip(
                `<div class="p-1 font-sans text-xs">
                  <strong class="text-[#0F172A]">${feature.properties.name}</strong>
                  <div class="text-[#64748B] text-[10px]">${feature.properties.type || 'District'}</div>
                </div>`,
                { sticky: true, className: 'geo-tooltip' }
              );

              layer.on({
                mouseover: (e) => {
                  const target = e.target;
                  target.setStyle({
                    fillOpacity: 0.14,
                    weight: 2,
                    color: '#0891B2',
                  });
                },
                mouseout: (e) => {
                  const target = e.target;
                  target.setStyle({
                    color: feature.properties.type === 'State Boundary' ? '#0891B2' : '#0284C7',
                    weight: feature.properties.type === 'State Boundary' ? 1.5 : 1,
                    fillOpacity: feature.properties.type === 'State Boundary' ? 0.02 : 0.05,
                  });
                },
                click: () => {
                  if (feature.properties.headquarters) {
                    const match = stations.find((s) => 
                      s.district.toLowerCase().includes(feature.properties.headquarters.toLowerCase()) ||
                      s.location.toLowerCase().includes(feature.properties.headquarters.toLowerCase())
                    );
                    if (match) {
                      onSelectStation(match.id);
                    }
                  }
                },
              });
            }
          },
        }).addTo(map);

        geoJsonLayerRef.current = geoLayer;
      } catch (err) {
        console.warn('GeoJSON boundary initialization failed', err);
      }

      // Layer groups for markers & circles
      const circlesLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      circlesLayerRef.current = circlesLayer;
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Invalidate size shortly after mount to ensure smooth canvas sizing
      setTimeout(() => {
        map.invalidateSize();
      }, 150);

    } catch (e) {
      console.error('Leaflet initialization error:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers, Hotspot Circles, and Popups when stations, uploaded records or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const circlesLayer = circlesLayerRef.current;

    if (!map || !markersLayer || !circlesLayer) return;

    markersLayer.clearLayers();
    circlesLayer.clearLayers();

    // 1. Gather all candidates based on data source filter
    interface UnifiedMarkerData {
      id: string;
      location: string;
      district: string;
      latitude: number;
      longitude: number;
      pm25: number;
      pm10: number;
      no2: number;
      co: number;
      temperature: number;
      humidity: number;
      windSpeed: number;
      windDirection: string;
      sourceType: 'live' | 'uploaded';
      originalUploadedRecord?: NormalizedDatasetRecord;
    }

    const candidates: UnifiedMarkerData[] = [];

    // Add live/simulated stations
    if (dataSourceFilter === 'both' || dataSourceFilter === 'live') {
      stations.forEach((st) => {
        candidates.push({
          id: st.id,
          location: st.location,
          district: st.district,
          latitude: st.latitude,
          longitude: st.longitude,
          pm25: st.pm25,
          pm10: st.pm10,
          no2: st.no2,
          co: st.co,
          temperature: st.temperature,
          humidity: st.humidity,
          windSpeed: st.windSpeed,
          windDirection: st.windDirection,
          sourceType: 'live',
        });
      });
    }

    // Add uploaded dataset records that have valid coordinates within Tamil Nadu
    if ((dataSourceFilter === 'both' || dataSourceFilter === 'uploaded') && uploadedRecords.length > 0) {
      uploadedRecords.forEach((up) => {
        if (up.latitude !== null && up.longitude !== null && up.isWithinTamilNadu) {
          candidates.push({
            id: up.id,
            location: up.location,
            district: up.district || 'Tamil Nadu Region',
            latitude: up.latitude,
            longitude: up.longitude,
            pm25: up.pm25,
            pm10: up.pm10,
            no2: up.no2,
            co: up.co,
            temperature: up.temperature,
            humidity: up.humidity,
            windSpeed: up.windSpeed,
            windDirection: up.windDirection,
            sourceType: 'uploaded',
            originalUploadedRecord: up,
          });
        }
      });
    }

    // Filter by hotspots if toggled
    const filteredCandidates = filterHotspotsOnly
      ? candidates.filter((c) => {
          const a = calculateAQI(c.pm25, c.pm10, c.co, c.no2);
          return a.aqi > 150;
        })
      : candidates;

    // Render Markers & Circles
    filteredCandidates.forEach((c) => {
      const aqiData = calculateAQI(c.pm25, c.pm10, c.co, c.no2);
      const riskData = calculateWeatherRisk(aqiData.aqi, c.windSpeed, c.humidity, c.location);
      const colors = getCategoryColor(aqiData.category);
      const isSelected = c.id === selectedStationId;
      const isHazard = aqiData.aqi > 200;

      // Hotspot circle
      if (aqiData.aqi > 150) {
        const radiusMeters = aqiData.aqi > 250 ? 9500 : 6500;
        const circleColor = aqiData.aqi > 250 ? '#DC2626' : '#D97706';

        const circle = L.circle([c.latitude, c.longitude], {
          radius: radiusMeters,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '3, 4',
        });
        circle.addTo(circlesLayer);
      }

      // Custom marker icon
      const pulseHtml = (isHazard && !reducedMotion)
        ? `<div class="marker-pulse-ring" style="background-color: ${colors.hex};"></div>`
        : '';

      const selectedClass = isSelected
        ? 'ring-4 ring-[#0891B2] ring-offset-2 ring-offset-white scale-110 z-30'
        : 'hover:scale-110 z-10';

      const sourceBadgeHtml = c.sourceType === 'uploaded'
        ? `<div class="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded bg-[#0891B2] px-1 text-[8px] font-bold text-white uppercase whitespace-nowrap shadow-xs">Uploaded</div>`
        : '';

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200">
          ${pulseHtml}
          ${sourceBadgeHtml}
          <div class="relative flex flex-col items-center">
            <div 
              class="flex items-center justify-center rounded-xl px-2 py-1 shadow-lg border border-white/80 text-white font-mono font-bold text-xs ${selectedClass}"
              style="background-color: ${colors.hex}; min-width: 44px; text-shadow: 0 1px 2px rgba(0,0,0,0.6);"
            >
              <span>${aqiData.aqi}</span>
            </div>
            <div 
              class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px]"
              style="border-t-color: ${colors.hex};"
            ></div>
            <div class="absolute -bottom-4 flex items-center gap-0.5 rounded-full bg-white/95 px-1 py-0.2 border border-[#CBD5E1] text-[9px] text-[#475569] font-mono shadow-xs">
              <span>➤</span>
              <span>${c.windSpeed}k</span>
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'aqi-station-marker',
        html: markerHtml,
        iconSize: [44, 48],
        iconAnchor: [22, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([c.latitude, c.longitude], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      // Popup Content (Crisp Light Theme)
      const popupHtml = `
        <div class="p-4 w-72 text-[#0F172A] font-sans">
          <div class="flex items-start justify-between border-b border-[#E2E8F0] pb-2">
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="font-bold text-[#0F172A] text-sm">${c.location}</h4>
              </div>
              <p class="text-[11px] text-[#64748B]">${c.district}, Tamil Nadu</p>
            </div>
            <div 
              class="rounded-lg px-2 py-0.5 font-mono font-bold text-xs text-white shadow-xs"
              style="background-color: ${colors.hex};"
            >
              AQI ${aqiData.aqi}
            </div>
          </div>

          <div class="my-2 flex items-center justify-between text-xs">
            <span class="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#475569]">
              ${c.sourceType === 'uploaded' ? 'Source: Uploaded Dataset' : 'Source: Live Monitoring'}
            </span>
            <strong class="${colors.text} font-bold">${aqiData.category}</strong>
          </div>

          <div class="grid grid-cols-2 gap-1.5 rounded-lg bg-[#F8FAFC] p-2 text-[11px] border border-[#E2E8F0]">
            <div><span class="text-[#64748B]">PM2.5:</span> <strong class="text-[#0F172A] font-mono">${c.pm25} µg</strong></div>
            <div><span class="text-[#64748B]">PM10:</span> <strong class="text-[#0F172A] font-mono">${c.pm10} µg</strong></div>
            <div><span class="text-[#64748B]">NO2:</span> <strong class="text-[#0F172A] font-mono">${c.no2} µg</strong></div>
            <div><span class="text-[#64748B]">CO:</span> <strong class="text-[#0F172A] font-mono">${c.co} mg</strong></div>
          </div>

          <div class="mt-2.5 flex items-center justify-between text-[11px] text-[#475569]">
            <span>Temp: <strong>${c.temperature}°C</strong></span>
            <span>Humidity: <strong>${c.humidity}%</strong></span>
            <span>Wind: <strong>${c.windSpeed} km/h</strong></span>
          </div>

          <div class="mt-2 text-[11px] text-[#D97706] bg-[#D97706]/10 border border-[#D97706]/20 rounded p-1.5">
            <strong>Estimated Trap Risk:</strong> ${riskData.riskLevel} (${riskData.dispersionFactor} dispersion)
          </div>

          <button
            id="popup-btn-${c.id}"
            class="mt-3 w-full rounded-lg bg-[#0891B2] hover:bg-[#0e7490] py-1.5 text-center text-xs font-semibold text-white transition-colors shadow-xs"
          >
            Select & Focus Dashboard
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'aqi-leaflet-popup',
        maxWidth: 320,
      });

      marker.on('click', () => {
        if (c.sourceType === 'uploaded' && c.originalUploadedRecord && onSelectUploadedRecord) {
          onSelectUploadedRecord(c.originalUploadedRecord);
        } else {
          onSelectStation(c.id);
        }
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${c.id}`);
        if (btn) {
          btn.onclick = () => {
            if (c.sourceType === 'uploaded' && c.originalUploadedRecord && onSelectUploadedRecord) {
              onSelectUploadedRecord(c.originalUploadedRecord);
            } else {
              onSelectStation(c.id);
            }
            map.closePopup();
          };
        }
      });

      marker.addTo(markersLayer);
    });

  }, [stations, uploadedRecords, selectedStationId, filterHotspotsOnly, dataSourceFilter, reducedMotion]);

  // Center on station when selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedStation) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 10, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedStationId]);

  // Reset Tamil Nadu view
  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.2 });
      setStatusMessage('Map view reset to Tamil Nadu statewide.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Browser geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by your browser.');
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    setStatusMessage('Acquiring location coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        let nearestStation = stations[0];
        let minDist = Infinity;

        stations.forEach((st) => {
          const d = Math.hypot(st.latitude - latitude, st.longitude - longitude);
          if (d < minDist) {
            minDist = d;
            nearestStation = st;
          }
        });

        onSelectStation(nearestStation.id);

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([latitude, longitude], 11, { duration: 1.2 });
        }
        setStatusMessage(`Located near ${nearestStation.location} station.`);
        setTimeout(() => setStatusMessage(null), 4000);
      },
      (error) => {
        setStatusMessage('Location permission was not granted or signal timed out.');
        setTimeout(() => setStatusMessage(null), 4000);
      },
      { timeout: 8000 }
    );
  };

  return (
    <section id="map-section" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Map Header and Control Toolbar */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
              Interactive Spatial Grid
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-xs text-[#64748B]">OpenStreetMap Powered</span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-xs text-[#059669] font-medium">
              {stations.length} Live Nodes {uploadedRecords.length > 0 ? `+ ${uploadedRecords.length} Uploaded` : ''}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Tamil Nadu Air Quality & Pollution Hotspot Map
          </h2>
        </div>

        {/* Action button cluster */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Layer Source Toggle if uploaded records exist */}
          {uploadedRecords.length > 0 && (
            <div className="flex items-center rounded-lg bg-[#FFFFFF] p-1 border border-[#CBD5E1] shadow-xs text-xs">
              <button
                onClick={() => setDataSourceFilter('both')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  dataSourceFilter === 'both' ? 'bg-[#0891B2] text-white' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                Show Both
              </button>
              <button
                onClick={() => setDataSourceFilter('live')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  dataSourceFilter === 'live' ? 'bg-[#0891B2] text-white' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                Show Live/Simulated Data
              </button>
              <button
                onClick={() => setDataSourceFilter('uploaded')}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  dataSourceFilter === 'uploaded' ? 'bg-[#0891B2] text-white' : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                Show Uploaded Dataset
              </button>
            </div>
          )}

          {/* Filter Hotspots Only */}
          <button
            onClick={() => setFilterHotspotsOnly(!filterHotspotsOnly)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              filterHotspotsOnly
                ? 'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626] shadow-xs'
                : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#475569] hover:bg-[#F8FAFC]'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-[#D97706]" />
            <span>{filterHotspotsOnly ? 'Showing Hotspots Only' : 'Filter Hotspots (>150)'}</span>
          </button>

          {/* Reset View Button */}
          <button
            onClick={handleResetView}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-xs"
            title="Reset Tamil Nadu View"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#0891B2]" />
            <span className="hidden sm:inline">Reset State View</span>
          </button>

          {/* Locate Me Button */}
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-xs"
            title="Locate nearest monitoring station"
          >
            <Crosshair className="h-3.5 w-3.5 text-[#059669]" />
            <span>Locate Me</span>
          </button>

        </div>
      </div>

      {/* Ephemeral status feedback message */}
      {statusMessage && (
        <div className="mb-3 rounded-lg border border-[#0891B2]/30 bg-[#0891B2]/10 px-3 py-2 text-xs text-[#0891B2]">
          {statusMessage}
        </div>
      )}

      {/* Main Leaflet Map Canvas */}
      <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] shadow-lg">
        
        {/* Native Leaflet Map DOM Element */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-full"
          style={{ minHeight: '560px' }}
        />

        {/* Floating Station Quick Info Badge on the map */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-[500] hidden sm:block">
          <div className="pointer-events-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF]/95 p-3.5 backdrop-blur-md shadow-lg text-xs max-w-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#059669]"></span>
              <strong className="text-[#0F172A] text-sm">{selectedStation.location}</strong>
              <span className="text-[#64748B]">({selectedStation.district})</span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#475569] leading-relaxed">
              Click any colored pin to inspect local pollutant concentrations and short-term trends.
            </p>
          </div>
        </div>

      </div>

      {/* Map Legend Bar */}
      <div className="mt-4">
        <MapLegend />
      </div>

    </section>
  );
};
