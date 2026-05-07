import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformStore } from '../../state/platform.store';
import { AndroidDevice, DeviceStatus, RiskLevel } from '../../models/domain';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { AresIconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'ares-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonComponent, AresIconComponent],
  template: `
<div class="devices-view animate-fade-in-up">

  <div class="page-header">
    <div>
      <h1 class="page-title">Device Fleet</h1>
      <p class="page-subtitle">{{ store.devices().length }} virtual Android devices · {{ store.onlineDevices().length }} online</p>
    </div>
    <div class="header-actions">
      <div class="live-badge"><span class="status-dot online pulse-live"></span>LIVE</div>
    </div>
  </div>

  <!-- FILTERS -->
  <div class="ares-card filters-bar">
    <input class="ares-input search-input" type="search"
      placeholder="🔍  Search device ID, model, manufacturer..."
      [(ngModel)]="searchQuery" id="device-search-input" />
    <div class="filter-chips">
      @for (s of statusFilters; track s.value) {
        <button class="filter-chip" [class.active]="selectedStatus() === s.value"
          (click)="setStatusFilter(s.value)" [id]="'filter-' + s.value">
          {{ s.label }}
        </button>
      }
    </div>
    <div class="filter-chips">
      @for (r of riskFilters; track r.value) {
        <button class="filter-chip risk-chip" [class.active]="selectedRisk() === r.value"
          [class]="'risk-chip--' + r.value"
          (click)="setRiskFilter(r.value)" [id]="'risk-' + r.value">
          {{ r.label }}
        </button>
      }
    </div>
    <span class="result-count">{{ filteredDevices().length }} results</span>
  </div>

  <!-- DEVICE GRID + DETAIL PANEL -->
  <div class="device-layout" [class.has-detail]="selectedDevice()">

    @if (store.devices().length === 0) {
      <!-- SKELETON — while devices are loading -->
      <div class="device-grid">
        @for (i of [1,2,3,4,5,6,7,8]; track i) {
          <div class="ares-card" style="padding:16px; display:flex; flex-direction:column; gap:12px">
            <div style="display:flex;align-items:center;gap:10px">
              <ares-skeleton type="circle" width="36px" />
              <div style="flex:1;display:flex;flex-direction:column;gap:6px">
                <ares-skeleton height="12px" width="80px" />
                <ares-skeleton height="14px" width="140px" />
              </div>
              <ares-skeleton height="20px" width="56px" style="border-radius:100px" />
            </div>
            <ares-skeleton type="row" [rows]="4" />
            <ares-skeleton height="8px" />
          </div>
        }
      </div>
    } @else {
      <!-- DEVICE GRID -->
      <div class="device-grid">
        @for (device of pagedDevices(); track device.id) {
        <div class="device-card ares-card"
          [class.device-card--selected]="selectedDevice()?.id === device.id"
          [class]="'device-card--' + device.status"
          (click)="store.selectDevice(device.id)"
          [id]="'device-card-' + device.id">

          <!-- Card Header -->
          <div class="dc-header">
            <ares-icon name="phone-24-regular" [size]="24" style="color:var(--text-tertiary)" />
            <div class="dc-id-block">
              <div class="dc-id text-mono">{{ device.id }}</div>
              <div class="dc-name">{{ device.name }}</div>
            </div>
            <span class="badge" [class]="severityBadge(device.riskLevel)">{{ device.riskLevel }}</span>
          </div>

          <!-- Device Info -->
          <div class="dc-info-grid">
            <div class="dc-info-row">
              <span class="dc-info-label">Model</span>
              <span class="dc-info-val">{{ device.manufacturer }} {{ device.model }}</span>
            </div>
            <div class="dc-info-row">
              <span class="dc-info-label">Android</span>
              <span class="dc-info-val">{{ device.androidVersion }}</span>
            </div>
            <div class="dc-info-row">
              <span class="dc-info-label">Location</span>
              <span class="dc-info-val">{{ device.location.city }}, {{ device.location.country }}</span>
            </div>
            <div class="dc-info-row">
              <span class="dc-info-label">Operator</span>
              <span class="dc-info-val">{{ device.operator }}</span>
            </div>
          </div>

          <!-- Metrics Row -->
          <div class="dc-metrics">
            <div class="dc-metric">
              <ares-icon name="battery-7-24-regular" [size]="14" style="color:var(--text-tertiary)" />
              <div class="dc-mini-bar">
                <div [style.width.%]="device.metrics.batteryPercent"
                  [style.background]="device.metrics.batteryPercent < 20 ? '#ef4444' : '#10b981'"></div>
              </div>
              <span>{{ device.metrics.batteryPercent }}%</span>
            </div>
            <div class="dc-metric">
              <ares-icon name="flash-24-regular" [size]="14" style="color:var(--text-tertiary)" />
              <div class="dc-mini-bar">
                <div [style.width.%]="device.metrics.cpuPercent"
                  [style.background]="device.metrics.cpuPercent > 80 ? '#ef4444' : '#3b82f6'"></div>
              </div>
              <span>{{ device.metrics.cpuPercent }}%</span>
            </div>
            <div class="dc-metric">
              <ares-icon name="globe-24-regular" [size]="14" style="color:var(--text-tertiary)" />
              <span class="dc-latency" [class.latency-high]="device.metrics.networkLatencyMs > 200">
                {{ device.metrics.networkLatencyMs }}ms
              </span>
            </div>
          </div>

          <!-- Status Footer -->
          <div class="dc-footer">
            <div class="dc-status">
              <span class="status-dot" [class]="statusDotClass(device.status)"></span>
              <span>{{ device.status | titlecase }}</span>
            </div>
            <span class="dc-conn badge badge--neutral">{{ device.connectionType | uppercase }}</span>
            @if (device.status === 'compromised') {
              <button class="btn btn--danger btn--sm"
                (click)="$event.stopPropagation(); quarantine(device.id)"
                [id]="'quarantine-' + device.id">
                Quarantine
              </button>
            }
          </div>
        </div>
        }
      </div>
    }

    <!-- DETAIL PANEL -->
    @if (selectedDevice()) {
      <div class="detail-panel ares-card animate-fade-in-up">
        <div class="detail-header">
          <div>
            <h3 class="detail-title">{{ selectedDevice()!.id }}</h3>
            <p class="detail-sub">{{ selectedDevice()!.manufacturer }} {{ selectedDevice()!.model }}</p>
          </div>
          <button class="btn btn--ghost btn--icon" (click)="store.selectDevice(null)" id="close-detail-btn">✕</button>
        </div>

        <div class="detail-section">
          <h4 class="detail-section-title">Device Info</h4>
          @for (row of deviceDetailRows(selectedDevice()!); track row.label) {
            <div class="detail-row">
              <span class="detail-label">{{ row.label }}</span>
              <span class="detail-val text-mono">{{ row.value }}</span>
            </div>
          }
        </div>

        <div class="detail-section">
          <h4 class="detail-section-title">Live Metrics</h4>
          <div class="metric-gauges">
            @for (g of metricsGauges(selectedDevice()!); track g.label) {
              <div class="gauge">
                <div class="gauge-label">{{ g.label }}</div>
                <div class="gauge-bar">
                  <div class="gauge-fill" [style.width.%]="g.value" [style.background]="g.color"></div>
                </div>
                <div class="gauge-val">{{ g.value }}%</div>
              </div>
            }
          </div>
        </div>

        <div class="detail-section">
          <h4 class="detail-section-title">Running Apps ({{ selectedDevice()!.runningApps.length }})</h4>
          <div class="app-list">
            @for (app of selectedDevice()!.runningApps; track app.id) {
              <div class="app-row" [class.app-row--suspicious]="app.suspicious">
                @if (app.suspicious) { <span class="suspicious-icon">⚠️</span> }
                <span class="app-name">{{ app.name }}</span>
                <span class="app-cpu text-mono">{{ app.cpuPercent }}% CPU</span>
                <span class="app-mem text-mono">{{ app.memoryMb }}MB</span>
              </div>
            }
          </div>
        </div>

        <div class="detail-actions">
          <button class="btn btn--ghost" id="device-detail-analyze-btn">
            <ares-icon name="microscope-24-regular" [size]="16" /> AI Analyze
          </button>
          <button class="btn btn--danger" (click)="quarantine(selectedDevice()!.id)" id="device-detail-quarantine-btn">
            <ares-icon name="lock-closed-24-regular" [size]="16" /> Quarantine
          </button>
        </div>
      </div>
    }
  </div>

  <!-- PAGINATION -->
  <div class="pagination">
    <button class="btn btn--ghost btn--sm" [disabled]="currentPage() === 0"
      (click)="prevPage()" id="prev-page-btn">← Prev</button>
    <span class="page-info">Page {{ currentPage() + 1 }} of {{ totalPages() }}</span>
    <button class="btn btn--ghost btn--sm" [disabled]="currentPage() >= totalPages() - 1"
      (click)="nextPage()" id="next-page-btn">Next →</button>
  </div>

</div>
  `,
  styles: [`
    .devices-view { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title  { font-size: 24px; font-weight: 700; }
    .page-subtitle { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; font-family: var(--font-mono); }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .live-badge { display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.2); border-radius: 100px; font-size: 11px; font-weight: 700; color: var(--color-success); }

    .filters-bar { padding: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .search-input { max-width: 320px; }
    .filter-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .filter-chip { padding: 4px 10px; border-radius: 100px; border: 1px solid var(--border-default); background: transparent; color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all var(--transition-fast); }
    .filter-chip.active, .filter-chip:hover { background: var(--bg-overlay); color: var(--text-primary); border-color: var(--border-strong); }
    .risk-chip--critical.active { background: rgba(239,68,68,.15); color: #ef4444; border-color: rgba(239,68,68,.3); }
    .risk-chip--high.active { background: rgba(245,158,11,.15); color: #f59e0b; border-color: rgba(245,158,11,.3); }
    .result-count { margin-left: auto; font-size: 12px; color: var(--text-tertiary); font-family: var(--font-mono); }

    .device-layout { display: grid; grid-template-columns: 1fr; gap: 16px; transition: grid-template-columns var(--transition-slow); }
    .device-layout.has-detail { grid-template-columns: 1fr 360px; }

    .device-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }

    .device-card { padding: 16px; cursor: pointer; transition: all var(--transition-base); display: flex; flex-direction: column; gap: 12px; }
    .device-card:hover { border-color: var(--border-strong); transform: translateY(-1px); }
    .device-card--selected { border-color: var(--color-primary) !important; box-shadow: var(--shadow-primary); }
    .device-card--compromised { border-color: rgba(239,68,68,.4); }
    .device-card--quarantined { border-color: rgba(245,158,11,.3); }

    .dc-header { display: flex; align-items: center; gap: 10px; }
    .dc-icon { font-size: 22px; }
    .dc-id-block { flex: 1; min-width: 0; }
    .dc-id   { font-size: 12px; color: var(--color-primary); }
    .dc-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .dc-info-grid { display: flex; flex-direction: column; gap: 4px; }
    .dc-info-row  { display: flex; gap: 8px; font-size: 12px; }
    .dc-info-label { color: var(--text-tertiary); width: 64px; flex-shrink: 0; }
    .dc-info-val   { color: var(--text-secondary); }

    .dc-metrics { display: flex; gap: 10px; }
    .dc-metric  { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-tertiary); flex: 1; }
    .dc-metric-icon { font-size: 12px; }
    .dc-mini-bar { flex: 1; height: 3px; background: var(--bg-overlay); border-radius: 2px; overflow: hidden; div { height: 100%; border-radius: 2px; } }
    .latency-high { color: var(--color-danger); }

    .dc-footer { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .dc-status { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-secondary); flex: 1; }
    .dc-conn { }

    /* Detail panel */
    .detail-panel { padding: 20px; height: fit-content; max-height: calc(100vh - 180px); overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .detail-title { font-size: 16px; font-weight: 700; color: var(--color-primary); }
    .detail-sub   { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }

    .detail-section { }
    .detail-section-title { font-size: 11px; font-weight: 600; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
    .detail-row   { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid var(--border-subtle); font-size: 12px; }
    .detail-label { color: var(--text-tertiary); }
    .detail-val   { color: var(--text-primary); }

    .metric-gauges { display: flex; flex-direction: column; gap: 10px; }
    .gauge { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .gauge-label { color: var(--text-tertiary); width: 60px; font-size: 11px; }
    .gauge-bar { flex: 1; height: 5px; background: var(--bg-overlay); border-radius: 3px; overflow: hidden; }
    .gauge-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
    .gauge-val { color: var(--text-primary); font-family: var(--font-mono); width: 32px; text-align: right; }

    .app-list { display: flex; flex-direction: column; gap: 6px; }
    .app-row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: var(--radius-sm); background: var(--bg-elevated); font-size: 12px; }
    .app-row--suspicious { background: rgba(239,68,68,.06); border: 1px solid rgba(239,68,68,.2); }
    .app-name { flex: 1; color: var(--text-primary); }
    .app-cpu, .app-mem { color: var(--text-tertiary); }
    .suspicious-icon { font-size: 12px; }

    .detail-actions { display: flex; gap: 8px; }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 8px 0; }
    .page-info { font-size: 13px; color: var(--text-secondary); font-family: var(--font-mono); }
  `],
})
export class DevicesComponent {
  readonly store = inject(PlatformStore);

  readonly PAGE_SIZE = 24;
  searchQuery = '';
  readonly selectedStatus = signal<string>('all');
  readonly selectedRisk = signal<string>('all');
  readonly currentPage = signal(0);

  readonly statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Online', value: 'online' },
    { label: 'Offline', value: 'offline' },
    { label: 'Compromised', value: 'compromised' },
    { label: 'Quarantined', value: 'quarantined' },
    { label: 'Analyzing', value: 'analyzing' },
  ];
  readonly riskFilters = [
    { label: 'All Risk', value: 'all' },
    { label: 'Critical', value: 'critical' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  readonly filteredDevices = computed(() => {
    let devs = this.store.devices();
    const q = this.searchQuery.toLowerCase();
    if (q) devs = devs.filter(d =>
      d.id.toLowerCase().includes(q) || d.model.toLowerCase().includes(q) ||
      d.manufacturer.toLowerCase().includes(q) || d.name.toLowerCase().includes(q));
    if (this.selectedStatus() !== 'all') devs = devs.filter(d => d.status === this.selectedStatus());
    if (this.selectedRisk() !== 'all') devs = devs.filter(d => d.riskLevel === this.selectedRisk());
    return devs;
  });

  readonly totalPages = computed(() => Math.ceil(this.filteredDevices().length / this.PAGE_SIZE));
  readonly pagedDevices = computed(() => {
    const p = this.currentPage();
    return this.filteredDevices().slice(p * this.PAGE_SIZE, (p + 1) * this.PAGE_SIZE);
  });

  readonly selectedDevice = computed(() => this.store.selectedDevice());

  setStatusFilter(v: string) { this.selectedStatus.set(v); this.currentPage.set(0); }
  setRiskFilter(v: string)   { this.selectedRisk.set(v);   this.currentPage.set(0); }
  prevPage() { this.currentPage.update(p => Math.max(0, p - 1)); }
  nextPage() { this.currentPage.update(p => Math.min(this.totalPages() - 1, p + 1)); }
  quarantine(id: string) { this.store.quarantineDevice(id); }

  severityBadge(risk: RiskLevel): string {
    const map: Record<RiskLevel, string> = {
      critical: 'badge badge--critical', high: 'badge badge--high',
      medium: 'badge badge--medium', low: 'badge badge--low', none: 'badge badge--neutral',
    };
    return map[risk];
  }

  statusDotClass(status: DeviceStatus): string {
    const map: Record<DeviceStatus, string> = {
      online: 'online', offline: 'offline', compromised: 'danger',
      quarantined: 'warning', analyzing: 'warning',
    };
    return map[status];
  }

  deviceDetailRows(d: AndroidDevice) {
    return [
      { label: 'Device ID',  value: d.id },
      { label: 'IMEI',       value: d.imei },
      { label: 'IP Address', value: d.ipAddress },
      { label: 'Android',    value: `Android ${d.androidVersion}` },
      { label: 'Operator',   value: d.operator },
      { label: 'Connection', value: d.connectionType.toUpperCase() },
      { label: 'Location',   value: `${d.location.city}, ${d.location.country}` },
      { label: 'Enrolled',   value: d.enrolledAt.toLocaleDateString() },
      { label: 'Last Seen',  value: d.lastSeenAt.toLocaleTimeString() },
    ];
  }

  metricsGauges(d: AndroidDevice) {
    return [
      { label: 'Battery',  value: d.metrics.batteryPercent, color: d.metrics.batteryPercent < 20 ? '#ef4444' : '#10b981' },
      { label: 'CPU',      value: d.metrics.cpuPercent, color: d.metrics.cpuPercent > 80 ? '#ef4444' : '#3b82f6' },
      { label: 'Memory',   value: d.metrics.memoryPercent, color: '#7c3aed' },
      { label: 'Storage',  value: d.metrics.storagePercent, color: '#f59e0b' },
    ];
  }
}
