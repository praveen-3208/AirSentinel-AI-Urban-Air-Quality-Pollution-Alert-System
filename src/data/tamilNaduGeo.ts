import type { FeatureCollection } from 'geojson';

/**
 * AirSentinel AI - Tamil Nadu Boundary & Key District Polygons (GeoJSON)
 * Geographically referenced simplified boundary features for interactive map overlay
 */
export const TAMIL_NADU_GEOJSON: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        district: 'Chennai',
        name: 'Chennai District',
        headquarters: 'Chennai',
        type: 'Metropolitan Urban Core',
        areaKm2: 426,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.18, 13.18],
            [80.32, 13.15],
            [80.31, 12.96],
            [80.24, 12.95],
            [80.15, 12.99],
            [80.14, 13.12],
            [80.18, 13.18],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        district: 'Chengalpattu',
        name: 'Chengalpattu District',
        headquarters: 'Chengalpattu',
        type: 'Suburban Growth Corridor',
        areaKm2: 2944,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.00, 13.00],
            [80.20, 12.95],
            [80.25, 12.55],
            [79.95, 12.45],
            [79.85, 12.75],
            [80.00, 13.00],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        district: 'Coimbatore',
        name: 'Coimbatore District',
        headquarters: 'Coimbatore',
        type: 'Western Industrial Hub',
        areaKm2: 4723,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [76.80, 11.25],
            [77.20, 11.20],
            [77.15, 10.75],
            [76.85, 10.70],
            [76.75, 11.00],
            [76.80, 11.25],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        district: 'Madurai',
        name: 'Madurai District',
        headquarters: 'Madurai',
        type: 'Southern Commercial & Cultural Hub',
        areaKm2: 3741,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.90, 10.15],
            [78.35, 10.10],
            [78.40, 9.75],
            [77.95, 9.70],
            [77.85, 9.95],
            [77.90, 10.15],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        district: 'Salem',
        name: 'Salem District',
        headquarters: 'Salem',
        type: 'Mineral & Industrial Belt',
        areaKm2: 5245,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.90, 11.95],
            [78.45, 11.90],
            [78.50, 11.45],
            [77.95, 11.40],
            [77.85, 11.70],
            [77.90, 11.95],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        district: 'Tiruchirappalli',
        name: 'Tiruchirappalli District',
        headquarters: 'Tiruchirappalli',
        type: 'Central Junction & Manufacturing',
        areaKm2: 4404,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [78.50, 11.10],
            [78.95, 10.95],
            [78.90, 10.55],
            [78.45, 10.50],
            [78.35, 10.85],
            [78.50, 11.10],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        district: 'Tirunelveli',
        name: 'Tirunelveli District',
        headquarters: 'Tirunelveli',
        type: 'Southern Plain & Wind Corridor',
        areaKm2: 3907,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.50, 8.95],
            [77.95, 8.90],
            [77.90, 8.45],
            [77.55, 8.40],
            [77.45, 8.70],
            [77.50, 8.95],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        district: 'Tamil Nadu State Boundary',
        name: 'Tamil Nadu Outer Envelope',
        headquarters: 'Chennai',
        type: 'State Boundary',
        areaKm2: 130060,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.30, 13.50],
            [79.80, 13.10],
            [78.50, 12.80],
            [77.20, 12.10],
            [76.60, 11.60],
            [76.60, 11.00],
            [77.00, 10.40],
            [77.30, 9.60],
            [77.50, 8.40],
            [77.55, 8.08], // Kanyakumari
            [78.10, 8.80],
            [79.30, 9.30],
            [79.90, 10.30],
            [79.90, 10.80],
            [79.85, 11.80],
            [80.30, 13.50],
          ],
        ],
      },
    },
  ],
};
