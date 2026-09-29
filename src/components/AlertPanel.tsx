import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCheck, 
  ShieldAlert, 
  Send, 
  MessageSquare, 
  Smartphone, 
  Copy, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { AlertItem } from '../types';
import { simulateTelegramDispatch, simulateSmsDispatch } from '../services/alertService';

interface AlertPanelProps {
  alerts: AlertItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  unreadCount: number;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  unreadCount,
}) => {
  const [dispatchModalAlert, setDispatchModalAlert] = useState<AlertItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const requestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Browser does not support notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationStatus('Browser push notifications enabled.');
      new Notification('AirSentinel AI Alert System', {
        body: 'Real-time Tamil Nadu pollution warning pipeline connected.',
      });
    } else {
      setNotificationStatus('Notification permission was declined.');
    }
    setTimeout(() => setNotificationStatus(null), 4000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-[#991B1B]/40 bg-[#991B1B]/10 text-[#991B1B]';
      case 'danger':
        return 'border-[#DC2626]/40 bg-[#DC2626]/10 text-[#DC2626]';
      case 'warning':
        return 'border-[#D97706]/40 bg-[#D97706]/10 text-[#D97706]';
      default:
        return 'border-[#0891B2]/40 bg-[#0891B2]/10 text-[#0891B2]';
    }
  };

  return (
    <section id="alerts-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 bg-[#F8FAFC]">
      
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#DC2626]">
              Automated Incident Feed
            </span>
            <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
            <span className="text-xs text-[#64748B]">Multi-Channel Broadcast Ready</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            Real-Time Pollution Alerts & Advisories
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-[#DC2626] px-2 text-xs font-bold text-white shadow-2xs">
                {unreadCount} Unread
              </span>
            )}
          </h2>
        </div>

        {/* Action button cluster */}
        <div className="flex items-center gap-2">
          <button
            onClick={requestBrowserPermission}
            className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-[#F1F5F9] transition-colors shadow-2xs"
          >
            <Bell className="h-3.5 w-3.5 text-[#0891B2]" />
            <span>Enable Push</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-[#F1F5F9] transition-colors shadow-2xs"
            >
              <CheckCheck className="h-3.5 w-3.5 text-[#059669]" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {notificationStatus && (
        <div className="mb-4 rounded-lg border border-[#0891B2]/30 bg-[#0891B2]/10 p-2.5 text-xs text-[#0891B2]">
          {notificationStatus}
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#059669]/10 text-[#059669] mb-3 border border-[#059669]/20">
            <CheckCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">No Active Critical Incidents</h3>
          <p className="mt-1 text-xs text-[#64748B] max-w-sm mx-auto">
            All regional monitoring thresholds are within baseline limits. Stagnation alert rules are actively scanning sensor telemetry.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border p-4 transition-all shadow-sm ${
                alert.isRead
                  ? 'border-[#E2E8F0] bg-[#FFFFFF]/70 opacity-75'
                  : 'border-[#CBD5E1] bg-[#FFFFFF] shadow-md border-l-4'
              }`}
              style={{ borderLeftColor: alert.severity === 'critical' ? '#991B1B' : alert.severity === 'danger' ? '#DC2626' : alert.severity === 'warning' ? '#D97706' : '#0891B2' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                
                {/* Alert info */}
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSeverityStyle(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <h4 className="text-sm font-bold text-[#0F172A]">
                      {alert.title} – {alert.location}
                    </h4>
                    <span className="text-xs text-[#64748B] font-mono">
                      {alert.timestamp}
                    </span>
                  </div>

                  <div className="text-xs text-[#475569]">
                    <strong className="text-[#0F172A]">Trigger:</strong> AQI {alert.aqi} · Dominant: {alert.dominantPollutant}
                  </div>

                  <div className="text-xs text-[#475569]">
                    <strong className="text-[#0F172A]">Cause:</strong> {alert.possibleCause}
                  </div>

                  <div className="rounded-lg bg-[#F8FAFC] p-2.5 text-xs text-[#0F172A] border border-[#E2E8F0]">
                    <strong className="text-[#0891B2]">Advisory:</strong> {alert.recommendedAction}
                  </div>
                </div>

                {/* Buttons: Mark as Read & Dispatch Preview */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <button
                    onClick={() => setDispatchModalAlert(alert)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#0891B2]/40 bg-[#0891B2]/10 px-2.5 py-1.5 text-xs font-semibold text-[#0891B2] hover:bg-[#0891B2]/20 transition-colors shadow-2xs"
                    title="Inspect Telegram & SMS dispatch payloads"
                  >
                    <Send className="h-3.5 w-3.5 text-[#0891B2]" />
                    <span>Dispatch Payload</span>
                  </button>

                  {!alert.isRead && (
                    <button
                      onClick={() => onMarkAsRead(alert.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <Check className="h-3.5 w-3.5 text-[#059669]" />
                      <span>Mark Read</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dispatch Simulation Modal */}
      {dispatchModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-[#CBD5E1] bg-[#FFFFFF] p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
                  Emergency Dispatch Architecture
                </span>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  Multi-Channel Broadcast Payloads
                </h3>
              </div>
              <button
                onClick={() => setDispatchModalAlert(null)}
                className="rounded-lg border border-[#CBD5E1] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#475569] hover:bg-[#F8FAFC]"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              
              {/* Telegram Bot Payload */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-[#0284C7]">
                    <MessageSquare className="h-4 w-4" />
                    <span>Telegram Bot Webhook Payload</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(simulateTelegramDispatch(dispatchModalAlert).message, 'tg')}
                    className="flex items-center gap-1 rounded bg-[#FFFFFF] border border-[#CBD5E1] px-2 py-0.5 text-[11px] text-[#475569] hover:bg-[#F1F5F9]"
                  >
                    {copiedKey === 'tg' ? <Check className="h-3 w-3 text-[#059669]" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'tg' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto rounded bg-[#FFFFFF] border border-[#E2E8F0] p-2.5 font-mono text-[11px] text-[#0F172A] whitespace-pre-wrap">
                  {simulateTelegramDispatch(dispatchModalAlert).message}
                </pre>
                <div className="mt-2 text-[10px] text-[#64748B]">
                  Channel: @tamilnadu_airwatch · Status: API Ready
                </div>
              </div>

              {/* SMS Gateway Payload */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-[#059669]">
                    <Smartphone className="h-4 w-4" />
                    <span>Emergency SMS Broadcast Format</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(simulateSmsDispatch(dispatchModalAlert).messageText, 'sms')}
                    className="flex items-center gap-1 rounded bg-[#FFFFFF] border border-[#CBD5E1] px-2 py-0.5 text-[11px] text-[#475569] hover:bg-[#F1F5F9]"
                  >
                    {copiedKey === 'sms' ? <Check className="h-3 w-3 text-[#059669]" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'sms' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="rounded bg-[#FFFFFF] border border-[#E2E8F0] p-2.5 font-mono text-[11px] text-[#0F172A]">
                  {simulateSmsDispatch(dispatchModalAlert).messageText}
                </div>
                <div className="mt-2 text-[10px] text-[#64748B]">
                  Target: 48,200 Registered Citizens in Geo-Fence · Carrier SMS Gateway
                </div>
              </div>

            </div>

            <div className="mt-5 border-t border-[#E2E8F0] pt-3 text-right">
              <button
                onClick={() => setDispatchModalAlert(null)}
                className="rounded-lg bg-[#0891B2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0e7490] transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
