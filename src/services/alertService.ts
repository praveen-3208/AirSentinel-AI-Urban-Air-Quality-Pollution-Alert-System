import { AirQualityReading, AlertItem } from '../types';
import { calculateAQI } from '../utils/aqiCalculator';

/**
 * AirSentinel AI - Alert Evaluation & Dispatch Service
 */

export function evaluateAlerts(
  currentReadings: AirQualityReading[],
  previousReadingsMap?: Record<string, AirQualityReading>
): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (const reading of currentReadings) {
    const aqiResult = calculateAQI(reading.pm25, reading.pm10, reading.co, reading.no2);
    const prev = previousReadingsMap?.[reading.id];

    // Rule 1: Severe AQI (> 300)
    if (aqiResult.aqi > 300) {
      alerts.push({
        id: `alert-severe-${reading.id}-${Date.now()}`,
        severity: 'critical',
        title: 'Severe Pollution Alert',
        location: `${reading.location}, ${reading.district}`,
        aqi: aqiResult.aqi,
        dominantPollutant: aqiResult.dominantPollutant,
        possibleCause: 'Heavy industrial combustion, regional particulate stagnation, or dense biomass smoke.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAction: 'Severe pollution alert. Avoid outdoor exposure and follow official advisories.',
        isRead: false,
      });
    }
    // Rule 2: Poor AQI (> 200)
    else if (aqiResult.aqi > 200) {
      alerts.push({
        id: `alert-poor-${reading.id}-${Date.now()}`,
        severity: 'danger',
        title: 'Poor Air Quality Warning',
        location: `${reading.location}, ${reading.district}`,
        aqi: aqiResult.aqi,
        dominantPollutant: aqiResult.dominantPollutant,
        possibleCause: 'High density diesel exhaust combined with low atmospheric boundary layer.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAction: 'Poor air quality. Avoid prolonged outdoor activity.',
        isRead: false,
      });
    }

    // Rule 3: High-risk pollution event (PM2.5 > 150 & wind speed < 2 km/h)
    if (reading.pm25 > 150 && reading.windSpeed < 2) {
      alerts.push({
        id: `alert-pm25-trap-${reading.id}-${Date.now()}`,
        severity: 'critical',
        title: 'High-Risk Pollution Stagnation Event',
        location: `${reading.location}, ${reading.district}`,
        aqi: aqiResult.aqi,
        dominantPollutant: 'PM2.5',
        possibleCause: 'Ground-level atmospheric inversion trapping fine microparticulates.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAction: 'High-risk pollution event. PM2.5 is high and wind speed is low.',
        isRead: false,
      });
    }

    // Rule 4: PM10 Dust alert (> 250 µg/m³)
    if (reading.pm10 > 250) {
      alerts.push({
        id: `alert-dust-${reading.id}-${Date.now()}`,
        severity: 'warning',
        title: 'Suspended Dust & Particulate Alert',
        location: `${reading.location}, ${reading.district}`,
        aqi: aqiResult.aqi,
        dominantPollutant: 'PM10',
        possibleCause: 'Heavy civil construction, unpaved road dust resuspension, or dry quarry winds.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAction: 'Dust-pollution alert. Avoid prolonged exposure near construction and heavy traffic.',
        isRead: false,
      });
    }

    // Rule 5: NO2 + CO traffic emission spike
    if (reading.no2 > 100 && reading.co > 2.2) {
      alerts.push({
        id: `alert-traffic-${reading.id}-${Date.now()}`,
        severity: 'warning',
        title: 'Peak Traffic Emission Corridor',
        location: `${reading.location}, ${reading.district}`,
        aqi: aqiResult.aqi,
        dominantPollutant: 'NO2 / CO',
        possibleCause: 'Dense stop-and-go vehicular congestion along major highway arterial.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedAction: 'Possible traffic-emission alert. Close vehicle recirculating air vents.',
        isRead: false,
      });
    }

    // Rule 6: AQI rises by > 20%
    if (prev) {
      const prevAqi = calculateAQI(prev.pm25, prev.pm10, prev.co, prev.no2).aqi;
      const pctChange = ((aqiResult.aqi - prevAqi) / prevAqi) * 100;
      if (pctChange > 20) {
        alerts.push({
          id: `alert-spike-${reading.id}-${Date.now()}`,
          severity: 'danger',
          title: 'Rapid Air Quality Deterioration',
          location: `${reading.location}, ${reading.district}`,
          aqi: aqiResult.aqi,
          dominantPollutant: aqiResult.dominantPollutant,
          possibleCause: `Sudden ${pctChange.toFixed(0)}% AQI escalation due to dropping wind speeds or sudden emission influx.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedAction: 'Rapidly increasing pollution trend. Stay alert for official advisories.',
          isRead: false,
        });
      }
    }
  }

  return alerts;
}

/**
 * Audio chime using browser Web Audio API synthesizer
 */
export function playAlertChime(severity: 'warning' | 'danger' | 'critical' | 'info') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = severity === 'critical' ? 'sawtooth' : severity === 'danger' ? 'square' : 'sine';
    osc.frequency.setValueAtTime(severity === 'critical' ? 880 : 587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio context may be restricted before user gesture
  }
}

/**
 * Dispatch simulation integrations (Telegram, SMS, Webhook)
 */
export function simulateTelegramDispatch(alert: AlertItem) {
  return {
    channel: 'Telegram Bot (@AirSentinelTN_AlertBot)',
    chatId: '@tamilnadu_airwatch',
    message: `🚨 *AirSentinel Alert: ${alert.title}*\n📍 *Location:* ${alert.location}\n📊 *AQI:* ${alert.aqi} (${alert.dominantPollutant})\n⚠️ *Cause:* ${alert.possibleCause}\n🛡️ *Advisory:* ${alert.recommendedAction}`,
    status: 'Simulated Payload Generated (API Ready)',
  };
}

export function simulateSmsDispatch(alert: AlertItem) {
  return {
    gateway: 'Govt Emergency SMS Broadcast Gateway',
    recipientCount: '48,200 Registered Citizens in Geo-Fence',
    messageText: `[AirSentinel ALERT] ${alert.location}: AQI ${alert.aqi} (${alert.dominantPollutant}). ${alert.recommendedAction}`,
    status: 'SMS Broadcast Staged (API Ready)',
  };
}
