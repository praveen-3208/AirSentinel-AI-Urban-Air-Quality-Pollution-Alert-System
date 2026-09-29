import Papa from 'papaparse';
import { calculateAQI, getCategoryFromAqi } from './aqiCalculator';
import { calculateWeatherRisk } from './weatherRisk';
import { AQICategory, RiskLevel } from '../types';

export interface NormalizedDatasetRecord {
  id: string;
  timestamp: string;
  location: string;
  district?: string;
  latitude: number | null;
  longitude: number | null;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  aqi: number;
  category: AQICategory;
  dominantPollutant: 'PM2.5' | 'PM10' | 'CO' | 'NO2';
  weatherRisk: RiskLevel;
  isHotspot: boolean;
  isValid: boolean;
  isWithinTamilNadu: boolean;
  validationNotes: string[];
}

export interface DataQualitySummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  missingValuesCount: number;
  duplicateRowsCount: number;
  correctedValuesCount: number;
  excludedRowsCount: number;
  detectedColumns: string[];
  missingColumns: string[];
}

export interface DatasetParseResult {
  records: NormalizedDatasetRecord[];
  excludedRecords: NormalizedDatasetRecord[];
  summary: DataQualitySummary;
  hasCoordinates: boolean;
  recordsOutsideTN: number;
}

// Tamil Nadu bounding box approximate: Lat 8.0 to 13.6, Lng 76.2 to 80.4
function isPointInTamilNadu(lat: number | null, lng: number | null): boolean {
  if (lat === null || lng === null) return false;
  return lat >= 8.0 && lat <= 13.6 && lng >= 76.2 && lng <= 80.5;
}

// Canonical column mapping dictionary
const COLUMN_ALIASES: Record<string, string[]> = {
  timestamp: ['timestamp', 'date', 'time', 'datetime', 'recorded_at', 'reading_time'],
  location: ['location', 'city', 'station', 'site', 'place', 'station_name', 'name', 'area'],
  latitude: ['latitude', 'lat', 'y'],
  longitude: ['longitude', 'lon', 'lng', 'long', 'x'],
  pm25: ['pm25', 'pm2_5', 'pm2.5', 'pm_25', 'particulate_matter_2_5'],
  pm10: ['pm10', 'pm_10', 'particulate_matter_10'],
  co: ['co', 'co_mg', 'carbon_monoxide'],
  no2: ['no2', 'nitrogen_dioxide'],
  temperature: ['temperature', 'temp', 't', 'ambient_temp'],
  humidity: ['humidity', 'rh', 'hum', 'relative_humidity'],
  windSpeed: ['wind_speed', 'windspeed', 'ws', 'wind', 'wind_velocity'],
  windDirection: ['wind_direction', 'winddirection', 'wd', 'dir', 'wind_dir'],
};

function matchColumn(headerName: string): string | null {
  const cleanHeader = headerName.trim().toLowerCase().replace(/[\s\-_.]/g, '');
  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[\s\-_.]/g, '');
      if (cleanHeader === cleanAlias) {
        return canonical;
      }
    }
  }
  return null;
}

export function parseDatasetFile(fileContent: string, isJson: boolean = false): Promise<DatasetParseResult> {
  return new Promise((resolve, reject) => {
    try {
      if (isJson) {
        const jsonData = JSON.parse(fileContent);
        const rows = Array.isArray(jsonData) ? jsonData : [jsonData];
        resolve(processRawRows(rows));
      } else {
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(processRawRows(results.data));
          },
          error: (err: unknown) => {
            reject(new Error(`CSV parsing error: ${String(err)}`));
          },
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}

function processRawRows(rawRows: any[]): DatasetParseResult {
  if (!rawRows || rawRows.length === 0) {
    return {
      records: [],
      excludedRecords: [],
      summary: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        missingValuesCount: 0,
        duplicateRowsCount: 0,
        correctedValuesCount: 0,
        excludedRowsCount: 0,
        detectedColumns: [],
        missingColumns: Object.keys(COLUMN_ALIASES),
      },
      hasCoordinates: false,
      recordsOutsideTN: 0,
    };
  }

  // Detect column mapping from first row
  const firstRow = rawRows[0] || {};
  const headerKeys = Object.keys(firstRow);
  const columnMap: Record<string, string> = {}; // canonical -> raw header
  const detectedColumns: string[] = [];

  headerKeys.forEach((hk) => {
    const canonical = matchColumn(hk);
    if (canonical) {
      columnMap[canonical] = hk;
      if (!detectedColumns.includes(canonical)) {
        detectedColumns.push(canonical);
      }
    }
  });

  const allCanonicals = Object.keys(COLUMN_ALIASES);
  const missingColumns = allCanonicals.filter((c) => !detectedColumns.includes(c));

  let missingValuesCount = 0;
  let correctedValuesCount = 0;
  let duplicateRowsCount = 0;
  let recordsOutsideTN = 0;

  const validRecords: NormalizedDatasetRecord[] = [];
  const excludedRecords: NormalizedDatasetRecord[] = [];
  const seenRowSignatures = new Set<string>();

  rawRows.forEach((row, index) => {
    const notes: string[] = [];
    let isRowValid = true;

    // Helper to get raw value
    const getVal = (col: string) => {
      const rawHeader = columnMap[col];
      return rawHeader !== undefined ? row[rawHeader] : undefined;
    };

    // 1. Timestamp
    const rawTimestamp = getVal('timestamp');
    let timestamp = new Date().toISOString();
    if (rawTimestamp && String(rawTimestamp).trim() !== '') {
      const parsedDate = new Date(String(rawTimestamp));
      if (!isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.toISOString();
      } else {
        notes.push('Invalid timestamp format; current time assigned');
        correctedValuesCount++;
      }
    } else {
      missingValuesCount++;
      notes.push('Missing timestamp');
    }

    // 2. Location
    const rawLocation = getVal('location');
    let location = `Station-${index + 1}`;
    if (rawLocation && String(rawLocation).trim() !== '') {
      location = String(rawLocation).trim();
    } else {
      missingValuesCount++;
      notes.push('Missing station name; auto-assigned');
      correctedValuesCount++;
    }

    // 3. Latitude & Longitude
    const rawLat = parseFloat(getVal('latitude'));
    const rawLng = parseFloat(getVal('longitude'));
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (!isNaN(rawLat) && !isNaN(rawLng)) {
      if (rawLat >= -90 && rawLat <= 90 && rawLng >= -180 && rawLng <= 180) {
        latitude = Number(rawLat.toFixed(4));
        longitude = Number(rawLng.toFixed(4));
      } else {
        notes.push('Out of range coordinates; excluded from spatial map');
        correctedValuesCount++;
      }
    } else {
      notes.push('No geographic coordinates provided');
    }

    const isWithinTamilNadu = isPointInTamilNadu(latitude, longitude);
    if (latitude !== null && longitude !== null && !isWithinTamilNadu) {
      recordsOutsideTN++;
    }

    // 4. Pollutants
    const parseNumber = (val: any, defaultVal: number, colName: string, maxLimit = 1000): number => {
      if (val === undefined || val === null || String(val).trim() === '') {
        missingValuesCount++;
        notes.push(`Missing ${colName}`);
        return defaultVal;
      }
      const num = parseFloat(String(val));
      if (isNaN(num)) {
        notes.push(`Non-numeric ${colName} (${val})`);
        correctedValuesCount++;
        return defaultVal;
      }
      if (num < 0) {
        notes.push(`Negative ${colName} clamped to 0`);
        correctedValuesCount++;
        return 0;
      }
      if (num > maxLimit) {
        notes.push(`Extreme ${colName} (${num})`);
      }
      return num;
    };

    const pm25 = parseNumber(getVal('pm25'), 40, 'PM2.5');
    const pm10 = parseNumber(getVal('pm10'), 80, 'PM10');
    const co = parseNumber(getVal('co'), 1.0, 'CO', 100);
    const no2 = parseNumber(getVal('no2'), 45, 'NO2');

    // If all essential pollutants were missing, row is invalid
    if (getVal('pm25') === undefined && getVal('pm10') === undefined && getVal('no2') === undefined) {
      isRowValid = false;
      notes.push('Fatal: All essential pollutant columns missing');
    }

    // 5. Environmental parameters
    const rawTemp = parseFloat(getVal('temperature'));
    let temperature = 30.0;
    if (!isNaN(rawTemp)) {
      if (rawTemp >= -20 && rawTemp <= 60) {
        temperature = Number(rawTemp.toFixed(1));
      } else {
        notes.push(`Temperature outlier (${rawTemp}°C) normalized`);
        correctedValuesCount++;
      }
    } else {
      missingValuesCount++;
    }

    const rawHum = parseFloat(getVal('humidity'));
    let humidity = 65;
    if (!isNaN(rawHum)) {
      humidity = Math.min(100, Math.max(5, Math.round(rawHum)));
    } else {
      missingValuesCount++;
    }

    const rawWs = parseFloat(getVal('windSpeed'));
    let windSpeed = 3.5;
    if (!isNaN(rawWs)) {
      windSpeed = Math.max(0, Number(rawWs.toFixed(1)));
    } else {
      missingValuesCount++;
    }

    const rawWd = getVal('windDirection');
    const windDirection = rawWd && typeof rawWd === 'string' ? rawWd.trim().toUpperCase() : 'ENE';

    // Duplicate check
    const signature = `${location}-${timestamp}-${pm25}-${pm10}`;
    if (seenRowSignatures.has(signature)) {
      duplicateRowsCount++;
      notes.push('Duplicate record identified');
    }
    seenRowSignatures.add(signature);

    // Calculate AQI and Weather Risk
    const aqiResult = calculateAQI(pm25, pm10, co, no2);
    const riskResult = calculateWeatherRisk(aqiResult.aqi, windSpeed, humidity, location);
    const isHotspot = aqiResult.aqi > 150;

    const record: NormalizedDatasetRecord = {
      id: `uploaded-${index + 1}`,
      timestamp,
      location,
      latitude,
      longitude,
      pm25: Number(pm25.toFixed(1)),
      pm10: Number(pm10.toFixed(1)),
      co: Number(co.toFixed(2)),
      no2: Number(no2.toFixed(1)),
      temperature,
      humidity,
      windSpeed,
      windDirection,
      aqi: aqiResult.aqi,
      category: aqiResult.category,
      dominantPollutant: aqiResult.dominantPollutant,
      weatherRisk: riskResult.riskLevel,
      isHotspot,
      isValid: isRowValid,
      isWithinTamilNadu,
      validationNotes: notes,
    };

    if (isRowValid) {
      validRecords.push(record);
    } else {
      excludedRecords.push(record);
    }
  });

  const hasCoordinates = validRecords.some((r) => r.latitude !== null && r.longitude !== null);

  return {
    records: validRecords,
    excludedRecords,
    summary: {
      totalRows: rawRows.length,
      validRows: validRecords.length,
      invalidRows: excludedRecords.length,
      missingValuesCount,
      duplicateRowsCount,
      correctedValuesCount,
      excludedRowsCount: excludedRecords.length,
      detectedColumns,
      missingColumns,
    },
    hasCoordinates,
    recordsOutsideTN,
  };
}

/**
 * Built-in Sample Tamil Nadu Air Quality Dataset (CSV) for Instant Demonstration
 */
export const SAMPLE_TAMIL_NADU_CSV = `timestamp,location,latitude,longitude,pm25,pm10,no2,co,temperature,humidity,wind_speed,wind_direction
2026-09-29T06:00:00+05:30,Guindy Industrial,13.0067,80.2206,142,260,118,2.7,28.5,82,1.2,NE
2026-09-29T07:00:00+05:30,Guindy Industrial,13.0067,80.2206,168,295,145,3.2,29.2,80,0.9,ENE
2026-09-29T08:00:00+05:30,Guindy Industrial,13.0067,80.2206,185,320,162,3.8,30.4,76,1.1,E
2026-09-29T06:00:00+05:30,T. Nagar Retail Core,13.0418,80.2341,120,230,95,2.1,28.8,78,1.6,ENE
2026-09-29T07:00:00+05:30,T. Nagar Retail Core,13.0418,80.2341,155,275,130,2.9,29.8,75,1.4,E
2026-09-29T08:00:00+05:30,T. Nagar Retail Core,13.0418,80.2341,172,305,148,3.4,31.0,72,1.8,E
2026-09-29T06:00:00+05:30,Marina Coastal Promenade,13.0500,80.2824,35,68,38,0.8,28.0,85,12.4,E
2026-09-29T07:00:00+05:30,Marina Coastal Promenade,13.0500,80.2824,42,75,44,0.9,28.6,83,14.2,E
2026-09-29T08:00:00+05:30,Marina Coastal Promenade,13.0500,80.2824,38,72,40,0.8,29.4,80,15.0,ESE
2026-09-29T06:00:00+05:30,Coimbatore SIDCO Hub,11.0168,76.9558,82,165,72,1.6,26.5,68,3.8,W
2026-09-29T07:00:00+05:30,Coimbatore SIDCO Hub,11.0168,76.9558,98,185,84,1.9,27.4,65,4.2,W
2026-09-29T08:00:00+05:30,Coimbatore SIDCO Hub,11.0168,76.9558,110,210,92,2.2,28.6,60,4.6,WSW
2026-09-29T06:00:00+05:30,Salem Steel Junction,11.6643,78.1460,95,205,88,2.0,27.8,70,2.5,NNE
2026-09-29T07:00:00+05:30,Salem Steel Junction,11.6643,78.1460,115,245,102,2.4,28.9,67,2.2,NNE
2026-09-29T08:00:00+05:30,Salem Steel Junction,11.6643,78.1460,138,280,120,2.8,30.2,63,2.0,NE
2026-09-29T06:00:00+05:30,Madurai Periyar Terminal,9.9252,78.1198,75,150,65,1.4,29.5,62,3.4,NE
2026-09-29T07:00:00+05:30,Madurai Periyar Terminal,9.9252,78.1198,88,175,76,1.7,30.8,59,3.6,NE
2026-09-29T08:00:00+05:30,Madurai Periyar Terminal,9.9252,78.1198,96,190,82,1.9,32.2,55,3.9,ENE
2026-09-29T06:00:00+05:30,Trichy Junction Road,10.7905,78.7047,68,140,58,1.3,28.8,66,4.0,E
2026-09-29T07:00:00+05:30,Trichy Junction Road,10.7905,78.7047,82,165,70,1.5,30.0,63,4.4,E
2026-09-29T08:00:00+05:30,Trichy Junction Road,10.7905,78.7047,94,185,78,1.8,31.4,60,4.8,ESE
2026-09-29T06:00:00+05:30,Tirunelveli Town,8.7139,77.7567,42,85,38,0.9,27.5,72,8.2,SW
2026-09-29T07:00:00+05:30,Tirunelveli Town,8.7139,77.7567,48,92,42,1.0,28.4,70,8.8,SW
2026-09-29T08:00:00+05:30,Tirunelveli Town,8.7139,77.7567,52,98,46,1.1,29.6,67,9.4,WSW`;
