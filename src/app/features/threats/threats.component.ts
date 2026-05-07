import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformStore } from '../../state/platform.store';
import { ThreatEvent, ThreatSeverity } from '../../models/domain';
import { AresIconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'ares-threats',
  standalone: true,
  imports: [CommonModule, FormsModule, AresIconComponent],
  template: `
<div class="threats-view animate-fade-in-up">
  <div class="page-header">
    <div>
      <h1 class="page-title">Threat Intelligence</h1>
      <p class="page-subtitle">{{ store.threats().length }} total detections · {{ store.criticalThreats().length }} critical active</p>
    </div>
  </div>

  <!-- STATS ROW -->
  <div class="threat-stats">
    @for (stat of threatStats(); track stat.label) {
      <div class="stat-card ares-card">
        <ares-icon [name]="stat.icon" [size]="40" [style.color]="stat.color" style="opacity:0.85;flex-shrink:0" />
        <div class="stat-card__data">
          <div class="stat-value" [style.color]="stat.color">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    }
  </div>

  <!-- LAYOUT: TABLE + DETAIL -->
  <div class="threat-layout" [class.has-detail]="selectedThreat()">

    <!-- FILTERS + TABLE -->
    <div class="table-section ares-card">
      <div class="table-toolbar">
        <input class="ares-input search-input" type="search" placeholder="Search threats..."
          [(ngModel)]="searchQuery" id="threat-search-input" />
        <div class="sev-filters">
          @for (f of sevFilters; track f.value) {
            <button class="filter-chip" [class.active]="selSeverity() === f.value"
              (click)="selSeverity.set(f.value)" [id]="'sev-filter-' + f.value">
              {{ f.label }}
            </button>
          }
        </div>
        <div class="sev-filters">
          @for (f of statusFilters; track f.value) {
            <button class="filter-chip" [class.active]="selStatus() === f.value"
              (click)="selStatus.set(f.value)" [id]="'status-filter-' + f.value">
              {{ f.label }}
            </button>
          }
        </div>
      </div>

      <table class="ares-table">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Threat</th>
            <th>Category</th>
            <th>Origin</th>
            <th>Affected</th>
            <th>CVSS</th>
            <th>Status</th>
            <th>Detected</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (t of filteredThreats(); track t.id) {
            <tr class="threat-row" [class.threat-row--selected]="selectedThreat()?.id === t.id"
              (click)="store.selectThreat(t.id)">
              <td>
                <div class="sev-indicator" [class]="'sev--' + t.severity">
                  <span class="sev-dot"></span>
                  {{ t.severity | uppercase }}
                </div>
              </td>
              <td>
                <div class="threat-name">{{ t.title }}</div>
                <div class="threat-id text-mono" style="color:var(--text-tertiary);font-size:10px">{{ t.id }}</div>
              </td>
              <td><span class="cat-tag">{{ t.category.replace('_',' ') }}</span></td>
              <td><span class="origin-tag">{{ t.origin }}</span></td>
              <td><span class="affected-count">{{ t.affectedDeviceIds.length }}</span></td>
              <td>
                <span class="cvss-score" [class]="cvssClass(t.cvss ?? 0)">{{ t.cvss?.toFixed(1) ?? 'N/A' }}</span>
              </td>
              <td><span class="badge" [class]="statusBadgeClass(t.status)">{{ t.status.replace('_',' ') }}</span></td>
              <td><span class="text-mono" style="font-size:11px;color:var(--text-tertiary)">{{ t.detectedAt | date:'MM/dd HH:mm' }}</span></td>
              <td>
                <div class="row-actions">
                  <button class="btn btn--ghost btn--sm" (click)="$event.stopPropagation(); mitigate(t.id)"
                    [disabled]="t.status === 'mitigated'" [id]="'mitigate-' + t.id">Mitigate</button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
      @if (!filteredThreats().length) {
        <div class="empty-state" style="padding: 40px;text-align:center;color:var(--text-tertiary)">No threats match current filters</div>
      }
    </div>

    <!-- DETAIL PANEL -->
    @if (selectedThreat(); as t) {
      <div class="threat-detail ares-card animate-fade-in-up">
        <div class="detail-header">
          <div>
            <div class="sev-indicator" [class]="'sev--' + t.severity" style="margin-bottom:8px">
              <span class="sev-dot"></span>{{ t.severity | uppercase }}
            </div>
            <h3 class="detail-title">{{ t.title }}</h3>
            <p class="detail-id text-mono">{{ t.id }}</p>
          </div>
          <button class="btn btn--ghost" (click)="store.selectThreat(null)" id="close-threat-btn">
            <ares-icon name="dismiss-24-regular" [size]="16" />
          </button>
        </div>

        <div class="detail-body">
          <p class="detail-desc">{{ t.description }}</p>
          @for (row of threatDetailRows(t); track row.label) {
            <div class="detail-row">
              <span class="detail-label">{{ row.label }}</span>
              <span class="detail-val">{{ row.value }}</span>
            </div>
          }

          <div class="detail-section-title">MITRE Tactics</div>
          <div class="mitre-tags">
            @for (tactic of t.mitreTactics; track tactic) {
              <span class="mitre-tag">{{ tactic }}</span>
            }
          </div>

          <div class="detail-section-title">Indicators of Compromise</div>
          @for (ind of t.indicators; track ind.value) {
            <div class="ioc-row">
              <span class="ioc-type">{{ ind.type.toUpperCase() }}</span>
              <span class="ioc-val text-mono">{{ ind.value }}</span>
              <span class="ioc-conf">{{ (ind.confidence * 100).toFixed(0) }}%</span>
            </div>
          }

          <div class="detail-section-title">Affected Devices ({{ t.affectedDeviceIds.length }})</div>
          <div class="affected-list">
            @for (id of t.affectedDeviceIds.slice(0, 6); track id) {
              <span class="device-tag text-mono">{{ id }}</span>
            }
            @if (t.affectedDeviceIds.length > 6) {
              <span class="device-tag more">+{{ t.affectedDeviceIds.length - 6 }} more</span>
            }
          </div>
        </div>

        <div class="detail-footer">
          <button class="btn btn--primary" (click)="mitigate(t.id)" id="detail-mitigate-btn">
            <ares-icon name="shield-checkmark-24-regular" [size]="16" /> Mitigate
          </button>
          <button class="btn btn--ghost" id="detail-investigate-btn">
            <ares-icon name="search-24-regular" [size]="16" /> Investigate
          </button>
        </div>
      </div>
    }
  </div>
</div>
  `,
  styles: [`
    .threats-view { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title  { font-size: 24px; font-weight: 700; }
    .page-subtitle { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; font-family: var(--font-mono); }

    .threat-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    @media (max-width: 1200px) { .threat-stats { grid-template-columns: repeat(3, 1fr); } }

    .stat-card {
      padding: 20px;
      display: flex; flex-direction: row; align-items: center; gap: 14px;
    }
    .stat-card__data { display: flex; flex-direction: column; gap: 3px; }
    .stat-value { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; line-height: 1; }
    .stat-label { font-size: 11px; color: var(--text-tertiary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }

    .threat-layout { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .threat-layout.has-detail { grid-template-columns: 1fr 380px; }
    .table-section { overflow: hidden; }

    .table-toolbar { display: flex; align-items: center; gap: 12px; padding: 16px; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; }
    .search-input { max-width: 260px; }
    .sev-filters { display: flex; gap: 6px; }
    .filter-chip { padding: 4px 10px; border-radius: 100px; border: 1px solid var(--border-default); background: transparent; color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all var(--transition-fast); }
    .filter-chip.active { background: var(--bg-overlay); color: var(--text-primary); border-color: var(--border-strong); }

    .threat-row { cursor: pointer; }
    .threat-row--selected td { background: rgba(0,212,255,.04) !important; }
    .threat-name { font-weight: 500; font-size: 13px; }

    .sev-indicator { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; padding: 2px 6px; border-radius: 4px; }
    .sev--critical { background: rgba(239,68,68,.15); color: #ef4444; }
    .sev--high     { background: rgba(245,158,11,.15); color: #f59e0b; }
    .sev--medium   { background: rgba(59,130,246,.15); color: #3b82f6; }
    .sev--low      { background: rgba(16,185,129,.15); color: #10b981; }
    .sev--info     { background: rgba(148,163,184,.1); color: #94a3b8; }
    .sev-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .cat-tag    { font-size: 11px; color: var(--text-tertiary); }
    .origin-tag { font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono); }
    .affected-count { font-size: 13px; font-weight: 600; color: var(--color-primary); }

    .cvss-score { font-size: 13px; font-weight: 700; font-family: var(--font-mono); }
    .cvss-critical { color: #ef4444; }
    .cvss-high    { color: #f59e0b; }
    .cvss-medium  { color: #3b82f6; }
    .cvss-low     { color: #10b981; }

    .row-actions { display: flex; gap: 4px; }

    /* Detail Panel */
    .threat-detail { padding: 20px; display: flex; flex-direction: column; gap: 16px; max-height: calc(100vh - 200px); overflow-y: auto; }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .detail-title  { font-size: 15px; font-weight: 700; }
    .detail-id     { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
    .detail-body   { display: flex; flex-direction: column; gap: 10px; }
    .detail-desc   { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
    .detail-row    { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px solid var(--border-subtle); }
    .detail-label  { color: var(--text-tertiary); }
    .detail-val    { color: var(--text-primary); text-align: right; max-width: 200px; }
    .detail-section-title { font-size: 10px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px; }
    .detail-footer { display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle); }

    .mitre-tags { display: flex; gap: 6px; flex-wrap: wrap; }
    .mitre-tag  { padding: 2px 8px; background: rgba(124,58,237,.15); border: 1px solid rgba(124,58,237,.25); border-radius: 4px; font-size: 11px; color: #a78bfa; font-family: var(--font-mono); }

    .ioc-row  { display: flex; align-items: center; gap: 8px; padding: 5px 8px; background: var(--bg-elevated); border-radius: var(--radius-sm); font-size: 12px; }
    .ioc-type { padding: 1px 6px; background: var(--bg-overlay); border-radius: 3px; font-size: 10px; font-weight: 700; color: var(--text-tertiary); flex-shrink: 0; }
    .ioc-val  { flex: 1; color: var(--text-primary); }
    .ioc-conf { color: var(--color-success); font-weight: 600; }

    .affected-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .device-tag    { padding: 2px 8px; background: rgba(0,212,255,.08); border: 1px solid rgba(0,212,255,.2); border-radius: 4px; font-size: 11px; color: var(--color-primary); }
    .device-tag.more { background: var(--bg-elevated); border-color: var(--border-default); color: var(--text-tertiary); }
  `],
})
export class ThreatsComponent {
  readonly store = inject(PlatformStore);

  searchQuery = '';
  readonly selSeverity = signal('all');
  readonly selStatus   = signal('all');

  readonly sevFilters    = [
    { label: 'All', value: 'all' }, { label: 'Critical', value: 'critical' },
    { label: 'High', value: 'high' }, { label: 'Medium', value: 'medium' }, { label: 'Low', value: 'low' },
  ];
  readonly statusFilters = [
    { label: 'All', value: 'all' }, { label: 'Active', value: 'active' },
    { label: 'Investigating', value: 'investigating' }, { label: 'Mitigated', value: 'mitigated' },
  ];

  readonly filteredThreats = computed(() => {
    let t = this.store.threats();
    const q = this.searchQuery.toLowerCase();
    if (q) t = t.filter(x => x.title.toLowerCase().includes(q) || x.id.toLowerCase().includes(q));
    if (this.selSeverity() !== 'all') t = t.filter(x => x.severity === this.selSeverity());
    if (this.selStatus() !== 'all') t = t.filter(x => x.status === this.selStatus());
    return t.sort((a, b) => {
      const order: Record<ThreatSeverity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return order[a.severity] - order[b.severity];
    });
  });

  readonly selectedThreat = computed(() => this.store.selectedThreat());

  readonly threatStats = computed(() => {
    const t = this.store.threats();
    return [
      { label: 'Total Detected', value: t.length,                                          color: 'var(--text-primary)', icon: 'shield-24-regular' },
      { label: 'Critical',       value: t.filter(x => x.severity === 'critical').length,   color: '#ef4444',             icon: 'shield-error-24-regular' },
      { label: 'Active',         value: t.filter(x => x.status === 'active').length,       color: '#f59e0b',             icon: 'warning-24-regular' },
      { label: 'Mitigated',      value: t.filter(x => x.status === 'mitigated').length,    color: '#10b981',             icon: 'shield-checkmark-24-regular' },
      { label: 'Avg CVSS',       value: (t.reduce((s, x) => s + (x.cvss ?? 0), 0) / t.length).toFixed(1), color: 'var(--color-primary)', icon: 'data-bar-vertical-24-regular' },
    ];
  });

  mitigate(id: string) { this.store.updateThreatStatus(id, 'mitigated'); }

  statusBadgeClass(s: ThreatEvent['status']): string {
    const m: Record<ThreatEvent['status'], string> = {
      active: 'badge badge--critical', mitigated: 'badge badge--low',
      investigating: 'badge badge--medium', contained: 'badge badge--info',
      false_positive: 'badge badge--neutral',
    };
    return m[s] ?? 'badge badge--neutral';
  }

  cvssClass(cvss: number): string {
    if (cvss >= 9) return 'cvss-score cvss-critical';
    if (cvss >= 7) return 'cvss-score cvss-high';
    if (cvss >= 4) return 'cvss-score cvss-medium';
    return 'cvss-score cvss-low';
  }

  threatDetailRows(t: ThreatEvent) {
    return [
      { label: 'Category',     value: t.category.replace(/_/g, ' ') },
      { label: 'Attack Vector', value: t.attackVector.replace(/_/g, ' ') },
      { label: 'Origin',       value: t.origin },
      { label: 'Country',      value: t.originCountry },
      { label: 'CVSS Score',   value: t.cvss?.toFixed(1) ?? 'N/A' },
      { label: 'Detected',     value: t.detectedAt.toLocaleString() },
      { label: 'Updated',      value: t.updatedAt.toLocaleString() },
    ];
  }
}
