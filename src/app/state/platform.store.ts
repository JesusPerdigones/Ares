/**
 * PlatformStore — Central Signal-based State Store
 * Single source of truth for all platform state.
 * FUTURE: Split into feature-specific stores as platform grows.
 */

import { Injectable, signal, computed, effect } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AndroidDevice, ThreatEvent, CyberExercise, AIAnalysis,
  LiveMetrics, SystemNotification, ScenarioTemplate
} from '../models/domain';
import {
  generateDevices, generateThreats, generateExercises,
  generateAIAnalyses, generateLiveMetrics, generateScenarioTemplates,
  generateNotifications
} from '../services/mock/mock-data.factory';

@Injectable({ providedIn: 'root' })
export class PlatformStore {

  // ── Raw state signals ────────────────────────────────────────────────────

  readonly devices   = signal<AndroidDevice[]>([]);
  readonly threats   = signal<ThreatEvent[]>([]);
  readonly exercises = signal<CyberExercise[]>([]);
  readonly aiAnalyses = signal<AIAnalysis[]>([]);
  readonly metrics   = signal<LiveMetrics | null>(null);
  readonly notifications = signal<SystemNotification[]>([]);
  readonly scenarioTemplates = signal<ScenarioTemplate[]>([]);

  readonly selectedDeviceId  = signal<string | null>(null);
  readonly selectedThreatId  = signal<string | null>(null);
  readonly sidebarCollapsed  = signal<boolean>(false);
  readonly isLoading         = signal<boolean>(true);

  // Live stream event emitter for exercises
  readonly liveEvent$ = new Subject<{ type: string; message: string; severity: string }>();

  // ── Computed / Derived state ─────────────────────────────────────────────

  readonly onlineDevices = computed(() =>
    this.devices().filter(d => d.status === 'online'));

  readonly criticalThreats = computed(() =>
    this.threats().filter(t => t.severity === 'critical' && t.status === 'active'));

  readonly activeExercises = computed(() =>
    this.exercises().filter(e => e.status === 'running'));

  readonly unreadNotifications = computed(() =>
    this.notifications().filter(n => !n.read).length);

  readonly selectedDevice = computed(() =>
    this.devices().find(d => d.id === this.selectedDeviceId()) ?? null);

  readonly selectedThreat = computed(() =>
    this.threats().find(t => t.id === this.selectedThreatId()) ?? null);

  // ── Initialization ────────────────────────────────────────────────────────

  constructor() {
    this._loadInitialData();
    this._startRealTimeSimulation();
  }

  private _loadInitialData(): void {
    const devices = generateDevices(100);
    const threats = generateThreats(devices, 60);
    const exercises = generateExercises(devices);
    const analyses = generateAIAnalyses(20);
    const metrics = generateLiveMetrics(devices, threats);

    this.devices.set(devices);
    this.threats.set(threats);
    this.exercises.set(exercises);
    this.aiAnalyses.set(analyses);
    this.metrics.set(metrics);
    this.notifications.set(generateNotifications());
    this.scenarioTemplates.set(generateScenarioTemplates());

    setTimeout(() => this.isLoading.set(false), 800);
  }

  // ── Real-time simulation ─────────────────────────────────────────────────

  private _startRealTimeSimulation(): void {
    // Metrics pulse every 3s
    interval(3000).pipe(takeUntilDestroyed()).subscribe(() => {
      this._updateMetrics();
    });

    // Device status changes every 8s
    interval(8000).pipe(takeUntilDestroyed()).subscribe(() => {
      this._fluctuateDeviceMetrics();
    });

    // New threat events every 15s
    interval(15000).pipe(takeUntilDestroyed()).subscribe(() => {
      this._injectLiveThreat();
    });

    // Exercise events every 5s
    interval(5000).pipe(takeUntilDestroyed()).subscribe(() => {
      this._emitExerciseEvent();
    });
  }

  private _updateMetrics(): void {
    const current = this.metrics();
    if (!current) return;
    this.metrics.update(m => m ? {
      ...m,
      networkTrafficMbps: Math.max(50, Math.min(1200, m.networkTrafficMbps + (Math.random() - 0.48) * 80)),
      aiAnalysesRunning: Math.max(0, Math.min(15, m.aiAnalysesRunning + Math.floor((Math.random() - 0.5) * 3))),
      systemHealthScore: Math.max(20, Math.min(100, m.systemHealthScore + (Math.random() - 0.4) * 5)),
    } : m);
  }

  private _fluctuateDeviceMetrics(): void {
    this.devices.update(devices =>
      devices.map(d => {
        if (d.status !== 'online') return d;
        return {
          ...d,
          metrics: {
            ...d.metrics,
            cpuPercent: Math.max(1, Math.min(99, d.metrics.cpuPercent + Math.floor((Math.random()-0.5)*15))),
            batteryPercent: Math.max(1, d.metrics.batteryPercent - Math.floor(Math.random()*2)),
            networkLatencyMs: Math.max(5, Math.min(500, d.metrics.networkLatencyMs + Math.floor((Math.random()-0.5)*30))),
          },
          lastSeenAt: new Date(),
        };
      })
    );
  }

  private _injectLiveThreat(): void {
    const devices = this.devices();
    if (!devices.length) return;
    const LIVE_EVENTS = [
      { message: 'New C2 beacon detected on DEV-' + String(Math.floor(Math.random()*100)+1).padStart(4,'0'), severity: 'critical' },
      { message: 'Suspicious network activity flagged by AI', severity: 'high' },
      { message: 'Device attempting privilege escalation', severity: 'high' },
      { message: 'Anomalous data transfer pattern detected', severity: 'medium' },
      { message: 'Known malware hash matched on device', severity: 'critical' },
      { message: 'Lateral movement attempt blocked', severity: 'medium' },
    ];
    const ev = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
    this.liveEvent$.next({ type: 'threat', ...ev });
  }

  private _emitExerciseEvent(): void {
    const EX_EVENTS = [
      { message: 'Attack phase initiated — monitoring response time', severity: 'info' },
      { message: 'Blue team detected intrusion attempt', severity: 'success' },
      { message: 'Objective completed: C2 communication blocked', severity: 'success' },
      { message: 'Device compromised — incident response triggered', severity: 'high' },
      { message: 'Red team pivoting through network', severity: 'warning' },
    ];
    const ev = EX_EVENTS[Math.floor(Math.random() * EX_EVENTS.length)];
    this.liveEvent$.next({ type: 'exercise', ...ev });
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  selectDevice(id: string | null): void {
    this.selectedDeviceId.set(id);
  }

  selectThreat(id: string | null): void {
    this.selectedThreatId.set(id);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  markAllNotificationsRead(): void {
    this.notifications.update(ns => ns.map(n => ({ ...n, read: true })));
  }

  updateThreatStatus(threatId: string, status: ThreatEvent['status']): void {
    this.threats.update(ts =>
      ts.map(t => t.id === threatId ? { ...t, status, updatedAt: new Date() } : t)
    );
  }

  quarantineDevice(deviceId: string): void {
    this.devices.update(ds =>
      ds.map(d => d.id === deviceId ? { ...d, status: 'quarantined', riskLevel: 'high' } : d)
    );
  }
}
