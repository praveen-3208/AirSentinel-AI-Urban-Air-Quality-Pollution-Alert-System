import { AirQualityReading } from '../types';

export interface LocationMetadata {
  id: string;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  zoneType: 'Industrial' | 'Commercial' | 'Residential' | 'Coastal' | 'Transit Hub';
  description: string;
}

export const TAMIL_NADU_STATIONS: LocationMetadata[] = [
  {
    id: 'chennai-guindy',
    location: 'Guindy',
    district: 'Chennai',
    latitude: 13.0067,
    longitude: 80.2206,
    zoneType: 'Industrial',
    description: 'Guindy Industrial Estate & Kathipara Junction - Heavy commercial transit corridor.',
  },
  {
    id: 'chennai-tnagar',
    location: 'T. Nagar',
    district: 'Chennai',
    latitude: 13.0418,
    longitude: 80.2341,
    zoneType: 'Commercial',
    description: 'Thyagaraya Nagar - Dense retail core with continuous stop-and-go vehicular traffic.',
  },
  {
    id: 'chennai-annanagar',
    location: 'Anna Nagar',
    district: 'Chennai',
    latitude: 13.0850,
    longitude: 80.2101,
    zoneType: 'Commercial',
    description: 'Anna Nagar Roundtana & 2nd Avenue - Major residential-commercial transit spine.',
  },
  {
    id: 'chennai-central',
    location: 'Chennai Central',
    district: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    zoneType: 'Transit Hub',
    description: 'Puratchi Thalaivar Dr. M.G.R. Central Terminal - Rail & bus intermodal junction.',
  },
  {
    id: 'chennai-tambaram',
    location: 'Tambaram',
    district: 'Chengalpattu',
    latitude: 12.9249,
    longitude: 80.1000,
    zoneType: 'Transit Hub',
    description: 'Tambaram GST Road corridor - Southern gateway with heavy diesel bus circulation.',
  },
  {
    id: 'chennai-marinabeach',
    location: 'Marina Beach',
    district: 'Chennai',
    latitude: 13.0500,
    longitude: 80.2824,
    zoneType: 'Coastal',
    description: 'Kamarajar Salai Promenade - Coastal belt benefiting from maritime sea breeze dispersion.',
  },
  {
    id: 'coimbatore-city',
    location: 'Coimbatore',
    district: 'Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    zoneType: 'Industrial',
    description: 'Gandhipuram & SIDCO Industrial Area - Textile machinery and engineering foundries.',
  },
  {
    id: 'madurai-central',
    location: 'Madurai',
    district: 'Madurai',
    latitude: 9.9252,
    longitude: 78.1198,
    zoneType: 'Commercial',
    description: 'Periyar Bus Stand & Meenakshi Temple vicinity - Dense old-city market lanes.',
  },
  {
    id: 'salem-junction',
    location: 'Salem',
    district: 'Salem',
    latitude: 11.6643,
    longitude: 78.1460,
    zoneType: 'Industrial',
    description: 'Steel Plant & Leigh Bazaar Corridor - Heavy mineral transit and manufacturing belt.',
  },
  {
    id: 'trichy-thillainagar',
    location: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    latitude: 10.7905,
    longitude: 78.7047,
    zoneType: 'Transit Hub',
    description: 'Thillai Nagar & Central Bus Stand - Major crossroads connecting north and south Tamil Nadu.',
  },
  {
    id: 'tirunelveli-town',
    location: 'Tirunelveli',
    district: 'Tirunelveli',
    latitude: 8.7139,
    longitude: 77.7567,
    zoneType: 'Residential',
    description: 'Palayamkottai corridor - Southern plains with brisk Western Ghats gap winds.',
  },
];

// Initial baseline readings (realistic morning / pre-peak conditions)
export const INITIAL_READINGS: AirQualityReading[] = [
  {
    id: 'chennai-guindy',
    location: 'Guindy',
    district: 'Chennai',
    latitude: 13.0067,
    longitude: 80.2206,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 108,
    pm10: 228,
    co: 2.9,
    no2: 134,
    temperature: 30.5,
    humidity: 78,
    windSpeed: 1.4,
    windDirection: 'ENE',
    windAngle: 65,
    source: 'simulated',
  },
  {
    id: 'chennai-tnagar',
    location: 'T. Nagar',
    district: 'Chennai',
    latitude: 13.0418,
    longitude: 80.2341,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 98,
    pm10: 215,
    co: 2.6,
    no2: 122,
    temperature: 31.0,
    humidity: 76,
    windSpeed: 1.8,
    windDirection: 'E',
    windAngle: 90,
    source: 'simulated',
  },
  {
    id: 'chennai-annanagar',
    location: 'Anna Nagar',
    district: 'Chennai',
    latitude: 13.0850,
    longitude: 80.2101,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 92,
    pm10: 198,
    co: 2.3,
    no2: 110,
    temperature: 30.2,
    humidity: 74,
    windSpeed: 2.1,
    windDirection: 'ENE',
    windAngle: 70,
    source: 'simulated',
  },
  {
    id: 'chennai-central',
    location: 'Chennai Central',
    district: 'Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 84,
    pm10: 175,
    co: 2.1,
    no2: 95,
    temperature: 30.8,
    humidity: 75,
    windSpeed: 3.2,
    windDirection: 'E',
    windAngle: 85,
    source: 'simulated',
  },
  {
    id: 'chennai-tambaram',
    location: 'Tambaram',
    district: 'Chengalpattu',
    latitude: 12.9249,
    longitude: 80.1000,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 78,
    pm10: 168,
    co: 1.9,
    no2: 88,
    temperature: 31.2,
    humidity: 71,
    windSpeed: 3.5,
    windDirection: 'SE',
    windAngle: 135,
    source: 'simulated',
  },
  {
    id: 'chennai-marinabeach',
    location: 'Marina Beach',
    district: 'Chennai',
    latitude: 13.0500,
    longitude: 80.2824,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 42,
    pm10: 78,
    co: 0.9,
    no2: 45,
    temperature: 29.5,
    humidity: 82,
    windSpeed: 9.8,
    windDirection: 'E',
    windAngle: 90,
    source: 'simulated',
  },
  {
    id: 'coimbatore-city',
    location: 'Coimbatore',
    district: 'Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 68,
    pm10: 145,
    co: 1.7,
    no2: 74,
    temperature: 27.8,
    humidity: 62,
    windSpeed: 4.8,
    windDirection: 'W',
    windAngle: 270,
    source: 'simulated',
  },
  {
    id: 'madurai-central',
    location: 'Madurai',
    district: 'Madurai',
    latitude: 9.9252,
    longitude: 78.1198,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 62,
    pm10: 132,
    co: 1.5,
    no2: 66,
    temperature: 32.4,
    humidity: 58,
    windSpeed: 3.9,
    windDirection: 'NE',
    windAngle: 45,
    source: 'simulated',
  },
  {
    id: 'salem-junction',
    location: 'Salem',
    district: 'Salem',
    latitude: 11.6643,
    longitude: 78.1460,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 86,
    pm10: 192,
    co: 2.2,
    no2: 98,
    temperature: 30.0,
    humidity: 65,
    windSpeed: 2.8,
    windDirection: 'NNE',
    windAngle: 25,
    source: 'simulated',
  },
  {
    id: 'trichy-thillainagar',
    location: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    latitude: 10.7905,
    longitude: 78.7047,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 58,
    pm10: 120,
    co: 1.4,
    no2: 62,
    temperature: 31.8,
    humidity: 63,
    windSpeed: 4.2,
    windDirection: 'E',
    windAngle: 90,
    source: 'simulated',
  },
  {
    id: 'tirunelveli-town',
    location: 'Tirunelveli',
    district: 'Tirunelveli',
    latitude: 8.7139,
    longitude: 77.7567,
    timestamp: '2026-09-29T08:00:00+05:30',
    pm25: 38,
    pm10: 74,
    co: 0.8,
    no2: 36,
    temperature: 29.2,
    humidity: 69,
    windSpeed: 8.6,
    windDirection: 'SW',
    windAngle: 225,
    source: 'simulated',
  },
];

export interface HistoricalPoint {
  time: string;
  hour: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
}

// Generate realistic 12-hour historical time-series for a given station
export function generateHistoricalReadings(baseReading: AirQualityReading): HistoricalPoint[] {
  const points: HistoricalPoint[] = [];
  const hours = [
    '20:00', '21:00', '22:00', '23:00',
    '00:00', '01:00', '02:00', '03:00',
    '04:00', '05:00', '06:00', '07:00', '08:00'
  ];

  // Base multiplier curve over nighttime into morning rush hour
  const trafficFactors = [0.85, 0.78, 0.72, 0.65, 0.58, 0.52, 0.50, 0.54, 0.62, 0.75, 0.88, 0.96, 1.0];

  hours.forEach((hour, idx) => {
    const factor = trafficFactors[idx];
    const noise = Math.sin(idx * 1.5) * 0.05; // slight natural fluctuation
    const effectiveFactor = factor + noise;

    const pm25 = Math.round(baseReading.pm25 * effectiveFactor);
    const pm10 = Math.round(baseReading.pm10 * effectiveFactor);
    const no2 = Math.round(baseReading.no2 * effectiveFactor);
    const co = Number((baseReading.co * effectiveFactor).toFixed(1));
    const windSpeed = Number((baseReading.windSpeed * (1.3 - effectiveFactor * 0.3)).toFixed(1));
    const humidity = Math.round(baseReading.humidity + (1 - effectiveFactor) * 8);

    // Approximate AQI for historical charting
    const aqi = Math.round(pm25 * 2.2 + (no2 > 100 ? 20 : 0));

    points.push({
      time: hour,
      hour,
      aqi,
      pm25,
      pm10,
      no2,
      co,
      temperature: Math.round(baseReading.temperature - (idx < 7 ? (7 - idx) * 0.4 : 0)),
      humidity,
      windSpeed: Math.max(0.5, windSpeed),
    });
  });

  return points;
}
