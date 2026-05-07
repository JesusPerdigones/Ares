import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlatformStore } from '../../state/platform.store';
import { Subscription } from 'rxjs';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { AresIconComponent } from '../../shared/components/icon/icon.component';

interface LiveFeedEvent {
  id: string; time: Date; type: string; message: string; severity: string;
}

@Component({
  selector: 'ares-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, RouterLink, SkeletonComponent, AresIconComponent],
  template: `
@if (!store.metrics()) {
  <div class="db"><ares-skeleton height="400px" /></div>
} @else {
<div class="db animate-fade-in-up">

  <!-- HEAD -->
  <div class="db__head">
    <div>
      <h1 class="db__title">Operational Overview</h1>
      <p class="db__sub font-mono">{{ nowStr() }} · Mobile Cyber Range</p>
    </div>
    <div class="live-badge"><span class="status-dot online pulse-live"></span>LIVE</div>
  </div>

  <!-- METRIC STRIP (V0-style circular gauges + stat blocks) -->
  @if (store.metrics(); as m) {
  <div class="metric-strip">
    <!-- Circular gauges -->
    <div class="gauge-group">
      <div class="gauge">
        <svg class="gauge__svg" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-default)" stroke-width="4"/>
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-primary)" stroke-width="4"
            stroke-dasharray="201"
            [attr.stroke-dashoffset]="201 - (m.onlineDevices / m.totalDevices) * 201"
            stroke-linecap="round" transform="rotate(-90 40 40)"/>
          <text x="40" y="36" text-anchor="middle" class="gauge__pct">{{ ((m.onlineDevices / m.totalDevices)*100)|number:'1.0-0' }}%</text>
          <text x="40" y="50" text-anchor="middle" class="gauge__sub">{{ m.onlineDevices }} online</text>
        </svg>
        <div class="gauge__label">Device Fleet</div>
      </div>
      <div class="gauge">
        <svg class="gauge__svg" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-default)" stroke-width="4"/>
          <circle cx="40" cy="40" r="32" fill="none" [attr.stroke]="healthColor(m.systemHealthScore)" stroke-width="4"
            stroke-dasharray="201"
            [attr.stroke-dashoffset]="201 - (m.systemHealthScore / 100) * 201"
            stroke-linecap="round" transform="rotate(-90 40 40)"/>
          <text x="40" y="36" text-anchor="middle" class="gauge__pct">{{ m.systemHealthScore|number:'1.0-0' }}%</text>
          <text x="40" y="50" text-anchor="middle" class="gauge__sub">health</text>
        </svg>
        <div class="gauge__label">System Health</div>
      </div>
    </div>

    <div class="strip-sep"></div>

    <!-- Threat stat -->
    <div class="strip-stat">
      <ares-icon name="shield-error-24-regular" [size]="60" style="color:var(--color-danger);opacity:0.8" />
      <div class="strip-stat__data">
        <div class="strip-stat__val" style="color:var(--color-danger)">{{ m.activeThreats }}</div>
        <div class="strip-stat__lbl">Active Threats</div>
        <div class="proto-badge" style="background:rgba(239,68,68,0.12);color:#f87171;border-color:rgba(239,68,68,0.2)">{{ m.criticalAlerts }} critical</div>
      </div>
    </div>

    <div class="strip-sep"></div>

    <div class="strip-stat">
      <ares-icon name="shield-checkmark-24-regular" [size]="60" style="color:var(--color-success);opacity:0.8" />
      <div class="strip-stat__data">
        <div class="strip-stat__val" style="color:var(--color-success)">{{ m.mitigatedThreats }}</div>
        <div class="strip-stat__lbl">Mitigated</div>
      </div>
    </div>

    <div class="strip-sep"></div>

    <div class="strip-stat">
      <ares-icon name="play-circle-24-regular" [size]="60" style="color:var(--color-secondary);opacity:0.8" />
      <div class="strip-stat__data">
        <div class="strip-stat__val" style="color:var(--color-secondary)">{{ m.activeExercises }}</div>
        <div class="strip-stat__lbl">Live Exercises</div>
      </div>
    </div>

    <div class="strip-sep"></div>

    <div class="strip-stat">
      <ares-icon name="wifi-1-24-regular" [size]="60" style="color:var(--text-tertiary);opacity:0.8" />
      <div class="strip-stat__data">
        <div class="strip-stat__val">{{ m.networkTrafficMbps|number:'1.0-0' }}<span class="strip-stat__unit"> Mbps</span></div>
        <div class="strip-stat__lbl">Network</div>
      </div>
    </div>

    <div class="strip-sep"></div>

    <div class="strip-stat">
      <ares-icon name="bot-24-regular" [size]="60" style="color:var(--color-primary);opacity:0.8" />
      <div class="strip-stat__data">
        <div class="strip-stat__val" style="color:var(--color-primary)">{{ m.aiAnalysesRunning }}</div>
        <div class="strip-stat__lbl">AI Analyses</div>
      </div>
    </div>

  </div>
  }

  <!-- TABS (V0-style tab switcher) -->
  <div class="tab-bar">
    @for (t of tabs; track t.id) {
      <button class="tab" [class.tab--active]="activeTab() === t.id"
        (click)="activeTab.set(t.id)" [id]="'tab-' + t.id">
        {{ t.label }}
      </button>
    }
  </div>

  <!-- TAB: LIVE STREAM -->
  @if (activeTab() === 'stream') {
  <div class="panel animate-fade-in-up">
    <div class="panel__hd">
      <span class="panel__title">Live Event Stream</span>
      <div class="live-badge"><span class="status-dot online pulse-live"></span>LIVE</div>
    </div>
    <div class="stream-feed" id="event-feed">
      @for (ev of feedEvents(); track ev.id) {
        <div class="stream-row animate-data-stream" [class]="'stream-row--' + ev.severity">
          <span class="stream-row__time text-mono">{{ ev.time | date:'HH:mm:ss.SSS' }}</span>
          <span class="proto-badge" [class]="'proto-badge--' + ev.type.toLowerCase()">{{ ev.type }}</span>
          <span class="stream-row__msg">{{ ev.message }}</span>
          <span class="stream-row__bytes">{{ ev.severity }}</span>
        </div>
      }
      @empty { <div class="empty-msg">Waiting for events...</div> }
    </div>
  </div>
  }

  <!-- TAB: STATISTICS -->
  @if (activeTab() === 'statistics') {
  <div class="stats-grid animate-fade-in-up">

    <!-- Health score card -->
    <div class="panel stats-panel">
      <div class="panel__hd">
        <span class="panel__title" style="display:flex;align-items:center;gap:8px">
          <ares-icon name="shield-24-regular" [size]="14" /> Network Health Score
        </span>
      </div>
      @if (store.metrics(); as m) {
        <div class="health-score" [style.color]="healthColor(m.systemHealthScore)">
          {{ m.systemHealthScore | number:'1.0-0' }}
        </div>
        <div class="health-label">{{ m.systemHealthScore >= 80 ? 'Excellent' : m.systemHealthScore >= 60 ? 'Fair' : 'Critical' }}</div>
        <div class="mrow" style="margin-top:16px">
          <div class="mrow__bar">
            <div class="mrow__fill" [style.width.%]="m.systemHealthScore" [style.background]="healthColor(m.systemHealthScore)"></div>
          </div>
        </div>
      }
    </div>

    <!-- Protocol distribution -->
    <div class="panel stats-panel stats-panel--wide">
      <div class="panel__hd"><span class="panel__title">Protocol Distribution</span></div>
      @for (p of protocolDist(); track p.name) {
        <div class="pdist-row">
          <span class="proto-badge" [class]="'proto-badge--' + p.name.toLowerCase()" style="width:56px;justify-content:center">{{ p.name }}</span>
          <div class="mrow__bar" style="flex:1">
            <div class="mrow__fill" [style.width.%]="p.pct" [style.background]="protoColor(p.name)"></div>
          </div>
          <span class="pdist-count">{{ p.count }} <span style="color:var(--text-tertiary)">({{ p.pct|number:'1.1-1' }}%)</span></span>
        </div>
      }
    </div>

    <!-- Fleet breakdown -->
    <div class="panel stats-panel">
      <div class="panel__hd">
        <span class="panel__title" style="display:flex;align-items:center;gap:8px">
          <ares-icon name="phone-laptop-24-regular" [size]="14" /> Fleet Breakdown
        </span>
        <a routerLink="/devices" class="panel__link">Fleet</a>
      </div>
      @for (s of deviceStatusBreakdown(); track s.status) {
        <div class="mrow">
          <span class="mrow__label" style="display:flex;align-items:center;gap:6px">
            <span class="status-dot" [class]="s.dotClass"></span>{{ s.status | titlecase }}
          </span>
          <div class="mrow__bar">
            <div class="mrow__fill" [style.width.%]="s.pct" [style.background]="s.color"></div>
          </div>
          <span class="mrow__val">{{ s.count }}</span>
        </div>
      }
    </div>

    <!-- Top threats ranked -->
    <div class="panel stats-panel">
      <div class="panel__hd">
        <span class="panel__title" style="display:flex;align-items:center;gap:8px">
          <ares-icon name="shield-error-24-regular" [size]="14" /> Top Threat Sources
        </span>
        <a routerLink="/threats" class="panel__link">All</a>
      </div>
      @for (t of store.criticalThreats().slice(0,5); track t.id; let i = $index) {
        <div class="rank-row">
          <span class="rank-num">{{ i+1 }}</span>
          <div class="rank-body">
            <span class="rank-ip">{{ t.title }}</span>
            <span class="rank-meta">{{ t.origin }}</span>
          </div>
          <span class="badge badge--critical">CRIT</span>
        </div>
      }
    </div>

    <!-- Threat categories -->
    <div class="panel stats-panel stats-panel--wide">
      <div class="panel__hd"><span class="panel__title">Threat Categories</span></div>
      @for (cat of threatCategoryBreakdown(); track cat.category) {
        <div class="pdist-row">
          <span class="mrow__label" style="width:140px;text-transform:capitalize">{{ cat.category }}</span>
          <div class="mrow__bar" style="flex:1">
            <div class="mrow__fill" style="background:linear-gradient(90deg,var(--color-primary),var(--color-secondary))"
              [style.width.%]="cat.pct"></div>
          </div>
          <span class="pdist-count">{{ cat.count }}</span>
        </div>
      }
    </div>

  </div>
  }

  <!-- TAB: EXERCISES -->
  @if (activeTab() === 'exercises') {
  <div class="panel animate-fade-in-up">
    <div class="panel__hd">
      <span class="panel__title">Active Exercises</span>
      <a routerLink="/exercises" class="panel__link">View all</a>
    </div>
    @for (ex of store.activeExercises(); track ex.id) {
      <div class="conn-row">
        <span class="proto-badge proto-badge--https">{{ formatType(ex.type) }}</span>
        <div class="conn-body">
          <div class="conn-name">{{ ex.title }}</div>
          <div class="conn-meta">{{ ex.difficulty }} · {{ ex.targetDeviceIds.length }} devices</div>
        </div>
        <div class="conn-progress">
          <div class="mrow__bar" style="width:80px">
            <div class="mrow__fill" style="background:var(--color-primary)" [style.width.%]="completedPct(ex.objectives)"></div>
          </div>
          <span style="font-size:11px;color:var(--text-tertiary);font-family:var(--font-mono)">{{ completedPct(ex.objectives)|number:'1.0-0' }}%</span>
        </div>
      </div>
    }
    @empty { <div class="empty-msg">No running exercises</div> }
  </div>
  }

</div>
}
  `,
  styles: [`
    .db { display:flex; flex-direction:column; gap:24px; }

    .db__head { display:flex; align-items:flex-start; justify-content:space-between; }
    .db__title { font-size:20px; font-weight:700; letter-spacing:-0.02em; }
    .db__sub { font-size:11px; color:var(--text-tertiary); margin-top:3px; }

    /* Metric strip */
    .metric-strip {
      display:flex; align-items:center;
      background:var(--bg-card);
      border:1px solid var(--border-default);
      border-radius:10px; overflow:hidden;
    }
    .strip-sep { width:1px; background:var(--border-subtle); align-self:stretch; flex-shrink:0; }
    .strip-stat {
      flex:1; padding:20px 24px;
      display:flex; flex-direction:row; align-items:center; gap:14px;
      min-width:0;
    }
    .strip-stat__data { display:flex; flex-direction:column; gap:3px; min-width:0; }
    .strip-stat__val { font-size:26px; font-weight:700; letter-spacing:-0.03em; line-height:1; }
    .strip-stat__lbl { font-size:11px; color:var(--text-tertiary); }
    .strip-stat__unit { font-size:13px; color:var(--text-tertiary); font-weight:400; }

    /* Gauges */
    .gauge-group { display:flex; gap:8px; padding:16px 20px; }
    .gauge { display:flex; flex-direction:column; align-items:center; gap:6px; }
    .gauge__svg { width:80px; height:80px; }
    .gauge__pct { font-size:14px; font-weight:700; fill:var(--text-primary); font-family:var(--font-sans); }
    .gauge__sub { font-size:8px; fill:var(--text-tertiary); font-family:var(--font-sans); }
    .gauge__label { font-size:10px; color:var(--text-tertiary); font-weight:500; }

    /* Tab bar (V0-style) */
    .tab-bar {
      display:flex; background:var(--bg-card);
      border:1px solid var(--border-default);
      border-radius:8px; padding:4px; gap:2px;
      width:fit-content;
    }
    .tab {
      padding:6px 16px; border-radius:6px; border:none;
      background:transparent; color:var(--text-secondary);
      font-size:13px; font-weight:500; cursor:pointer;
      transition:all 120ms ease;
      &:hover { color:var(--text-primary); }
    }
    .tab--active {
      background:var(--bg-elevated) !important;
      color:var(--text-primary) !important;
    }

    /* Panel */
    .panel { background:var(--bg-card); border:1px solid var(--border-default); border-radius:10px; padding:24px; }
    .panel__hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .panel__title { font-size:11px; font-weight:600; color:var(--text-tertiary); text-transform:uppercase; letter-spacing:0.08em; }
    .panel__link { font-size:12px; color:var(--text-secondary); text-decoration:none; &:hover { color:var(--text-primary); } }

    /* Protocol badges (V0 color palette) */
    .proto-badge {
      display:inline-flex; align-items:center;
      padding:2px 7px; border-radius:4px;
      font-size:10px; font-weight:700; letter-spacing:0.04em;
      border:1px solid transparent; flex-shrink:0;
    }
    .proto-badge--tcp,   .proto-badge--threat   { background:rgba(59,130,246,0.15); color:#60a5fa; border-color:rgba(59,130,246,0.25); }
    .proto-badge--udp                            { background:rgba(139,92,246,0.15); color:#a78bfa; border-color:rgba(139,92,246,0.25); }
    .proto-badge--http,  .proto-badge--exercise  { background:rgba(34,197,94,0.12);  color:#4ade80; border-color:rgba(34,197,94,0.2); }
    .proto-badge--https, .proto-badge--red_team,
    .proto-badge--purple_team                    { background:rgba(16,185,129,0.12); color:#34d399; border-color:rgba(16,185,129,0.2); }
    .proto-badge--dns,   .proto-badge--warning   { background:rgba(245,158,11,0.12); color:#fbbf24; border-color:rgba(245,158,11,0.2); }
    .proto-badge--icmp,  .proto-badge--info      { background:rgba(34,211,238,0.1);  color:#22d3ee; border-color:rgba(34,211,238,0.2); }
    .proto-badge--ssh,   .proto-badge--critical  { background:rgba(244,63,94,0.12);  color:#fb7185; border-color:rgba(244,63,94,0.2); }
    .proto-badge--ftp                            { background:rgba(234,179,8,0.12);  color:#facc15; border-color:rgba(234,179,8,0.2); }

    /* Stream feed */
    .stream-feed { display:flex; flex-direction:column; gap:1px; max-height:420px; overflow-y:auto; }
    .stream-row {
      display:flex; align-items:center; gap:12px;
      padding:8px 10px; border-radius:6px;
      font-size:12px; border-left:2px solid transparent;
      &:hover { background:var(--bg-elevated); }
    }
    .stream-row--critical { border-left-color:var(--color-danger); }
    .stream-row--high, .stream-row--warning { border-left-color:var(--color-warning); }
    .stream-row--medium  { border-left-color:var(--color-info); }
    .stream-row--success { border-left-color:var(--color-success); }
    .stream-row__time  { color:var(--text-tertiary); flex-shrink:0; font-size:11px; }
    .stream-row__msg   { flex:1; color:var(--text-primary); }
    .stream-row__bytes { color:var(--text-tertiary); font-size:11px; font-family:var(--font-mono); flex-shrink:0; }

    /* Stats grid */
    .stats-grid { display:grid; grid-template-columns:1fr 2fr; gap:12px; }
    @media (max-width:1280px) { .stats-grid { grid-template-columns:1fr; } }
    .stats-panel { }
    .stats-panel--wide { grid-column:span 1; }

    .health-score { font-size:48px; font-weight:800; letter-spacing:-0.04em; line-height:1; }
    .health-label { font-size:13px; color:var(--text-secondary); margin-top:4px; }

    .pdist-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border-subtle); &:last-child { border:none; } }
    .pdist-count { font-size:12px; color:var(--text-primary); font-family:var(--font-mono); width:80px; text-align:right; flex-shrink:0; }

    /* Meter rows */
    .mrow { display:flex; align-items:center; gap:12px; padding:9px 0; border-bottom:1px solid var(--border-subtle); font-size:12px; &:last-child { border:none; } }
    .mrow__label { color:var(--text-secondary); width:100px; flex-shrink:0; }
    .mrow__bar { flex:1; height:2px; background:var(--border-subtle); border-radius:1px; overflow:hidden; }
    .mrow__fill { height:100%; border-radius:1px; transition:width 0.6s; }
    .mrow__val { color:var(--text-primary); font-family:var(--font-mono); font-size:11px; width:28px; text-align:right; }

    /* Rank rows */
    .rank-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--border-subtle); &:last-child { border:none; } }
    .rank-num { font-size:11px; color:var(--text-tertiary); font-family:var(--font-mono); width:16px; flex-shrink:0; }
    .rank-body { flex:1; min-width:0; }
    .rank-ip { font-size:13px; font-weight:500; color:var(--color-primary); font-family:var(--font-mono); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .rank-meta { font-size:11px; color:var(--text-tertiary); }

    /* Connection rows */
    .conn-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--border-subtle); &:last-child { border:none; } }
    .conn-body { flex:1; min-width:0; }
    .conn-name { font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .conn-meta { font-size:11px; color:var(--text-tertiary); margin-top:1px; }
    .conn-progress { display:flex; align-items:center; gap:8px; flex-shrink:0; }

    .empty-msg { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-tertiary); padding:12px 0; }
  `],
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly store = inject(PlatformStore);

  private _events: LiveFeedEvent[] = [];
  private _feedSignal = signal<LiveFeedEvent[]>([]);
  readonly feedEvents = this._feedSignal.asReadonly();
  private _sub?: Subscription;

  readonly activeTab = signal<'stream' | 'statistics' | 'exercises'>('stream');

  readonly tabs = [
    { id: 'stream', label: 'Live Stream' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'exercises', label: 'Exercises' },
  ] as const;

  ngOnInit(): void {
    this._sub = this.store.liveEvent$.subscribe(ev => {
      const event: LiveFeedEvent = { id: Math.random().toString(36).slice(2), time: new Date(), ...ev };
      this._events.unshift(event);
      if (this._events.length > 40) this._events.pop();
      this._feedSignal.set(this._events.slice(0, 25));
    });
  }

  ngOnDestroy(): void { this._sub?.unsubscribe(); }

  nowStr(): string { return new Date().toISOString().slice(11, 19) + ' UTC'; }

  healthColor(score: number): string {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  }

  formatType(type: string): string { return type.replace(/_/g, ' ').toUpperCase(); }

  completedPct(objectives: { completed: boolean }[]): number {
    if (!objectives.length) return 0;
    return (objectives.filter(o => o.completed).length / objectives.length) * 100;
  }

  protoColor(name: string): string {
    const map: Record<string, string> = {
      TCP: '#3b82f6', UDP: '#8b5cf6', HTTP: '#22c55e',
      HTTPS: '#10b981', DNS: '#f59e0b', ICMP: '#22d3ee',
      SSH: '#f43f5e', FTP: '#eab308',
    };
    return map[name.toUpperCase()] ?? '#52525b';
  }

  readonly protocolDist = computed(() => {
    const threats = this.store.threats();
    const cats = ['malware', 'ransomware', 'spyware', 'exploit', 'c2_communication', 'data_exfiltration', 'zero_day'];
    const total = threats.length || 1;
    return cats.map(c => ({
      name: c.replace(/_/g, ' ').toUpperCase().slice(0, 6),
      count: threats.filter(t => t.category === c).length,
      pct: (threats.filter(t => t.category === c).length / total) * 100,
    })).filter(p => p.count > 0).sort((a, b) => b.count - a.count).slice(0, 6);
  });

  readonly deviceStatusBreakdown = computed(() => {
    const devices = this.store.devices();
    const total = devices.length || 1;
    return [
      { status: 'online', color: '#10b981', dotClass: 'online', count: devices.filter(d => d.status === 'online').length },
      { status: 'offline', color: '#52525b', dotClass: 'offline', count: devices.filter(d => d.status === 'offline').length },
      { status: 'compromised', color: '#ef4444', dotClass: 'danger', count: devices.filter(d => d.status === 'compromised').length },
      { status: 'quarantined', color: '#f59e0b', dotClass: 'warning', count: devices.filter(d => d.status === 'quarantined').length },
      { status: 'analyzing', color: '#3b82f6', dotClass: 'warning', count: devices.filter(d => d.status === 'analyzing').length },
    ].map(g => ({ ...g, pct: (g.count / total) * 100 }));
  });

  readonly threatCategoryBreakdown = computed(() => {
    const threats = this.store.threats();
    const total = threats.length || 1;
    const cats = [...new Set(threats.map(t => t.category))];
    return cats.map(cat => ({
      category: cat.replace(/_/g, ' '),
      count: threats.filter(t => t.category === cat).length,
      pct: (threats.filter(t => t.category === cat).length / total) * 100,
    })).sort((a, b) => b.count - a.count).slice(0, 7);
  });
}
