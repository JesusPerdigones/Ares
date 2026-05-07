import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformStore } from '../../state/platform.store';
import { Subscription } from 'rxjs';
import { AresIconComponent } from '../../shared/components/icon/icon.component';

interface LiveEvent {
  id: string;
  time: Date;
  type: string;
  message: string;
  severity: string;
}

@Component({
  selector: 'ares-exercises',
  standalone: true,
  imports: [CommonModule, AresIconComponent],
  template: `
<div class="exercises-view animate-fade-in-up">
  <div class="page-header">
    <div>
      <h1 class="page-title">Live Exercise Simulator</h1>
      <p class="page-subtitle">Real-time cyber range training environment · {{ activeCount() }} exercises running</p>
    </div>
    <div class="live-badge"><span class="status-dot online pulse-live"></span>LIVE SIMULATION</div>
  </div>

  <div class="ex-layout">

    <!-- EXERCISES LIST -->
    <div class="ex-list-col">
      @for (ex of store.exercises(); track ex.id) {
        <div class="ex-card ares-card" [class.ex-card--active]="ex.status === 'running'"
          [class.ex-card--selected]="selectedId() === ex.id"
          (click)="selectedId.set(ex.id)" [id]="'ex-card-' + ex.id">

          <div class="ex-header">
            <div class="ex-status-dot" [class]="'ex-dot--' + ex.status"></div>
            <div class="ex-info">
              <div class="ex-name">{{ ex.title }}</div>
              <div class="ex-meta">{{ ex.type.replace('_',' ') | uppercase }} · {{ ex.difficulty }}</div>
            </div>
            <span class="badge" [class]="exStatusBadge(ex.status)">{{ ex.status }}</span>
          </div>

          <div class="ex-progress-row">
            <div class="ex-bar-bg">
              <div class="ex-bar-fill" [style.width.%]="completedPct(ex.objectives)"
                [class.ex-bar-fill--running]="ex.status === 'running'"></div>
            </div>
            <span class="ex-pct-label">{{ completedPct(ex.objectives) | number:'1.0-0' }}%</span>
          </div>

          <div class="ex-footer-row">
            <span class="ex-devices">
              <ares-icon name="phone-24-regular" [size]="12" /> {{ ex.targetDeviceIds.length }} devices
            </span>
            <span class="ex-score">
              @if (ex.score != null) { {{ ex.score }} / {{ ex.maxScore }} pts }
              @else { — / {{ ex.maxScore }} pts }
            </span>
          </div>
        </div>
      }
    </div>

    <!-- DETAIL + LIVE FEED -->
    <div class="ex-detail-col">

      @if (selectedEx(); as ex) {
        <div class="ares-card ex-detail-card">
          <div class="detail-header">
            <h2 class="detail-title">{{ ex.title }}</h2>
            <span class="badge" [class]="exStatusBadge(ex.status)">{{ ex.status }}</span>
          </div>
          <p class="detail-desc">{{ ex.description }}</p>

          <!-- Objectives -->
          <div class="objectives-section">
            <h4 class="section-label">Objectives</h4>
            @for (obj of ex.objectives; track obj.id) {
              <div class="objective-row">
                <span class="obj-check" [class.done]="obj.completed">
                @if (obj.completed) {
                  <ares-icon name="checkmark-circle-24-filled" [size]="16" style="color:var(--color-success)" />
                } @else {
                  <ares-icon name="circle-24-regular" [size]="16" style="color:var(--text-tertiary)" />
                }
              </span>
                <span class="obj-title" [class.done]="obj.completed">{{ obj.title }}</span>
                <span class="obj-pts">{{ obj.points }}pts</span>
              </div>
            }
          </div>

          <!-- Threat Scenarios -->
          <div class="scenarios-section">
            <h4 class="section-label">Threat Scenarios</h4>
            <div class="scenario-tags">
              @for (s of ex.threatScenarios; track s) {
                <span class="scenario-tag">{{ s.replace('_',' ') }}</span>
              }
            </div>
          </div>

          <!-- Actions -->
          @if (ex.status === 'running') {
            <div class="ex-actions">
              <button class="btn btn--ghost" id="pause-exercise-btn">
                <ares-icon name="pause-circle-24-regular" [size]="16" /> Pause
              </button>
              <button class="btn btn--danger" id="abort-exercise-btn">
                <ares-icon name="dismiss-circle-24-regular" [size]="16" /> Abort
              </button>
            </div>
          }
          @if (ex.status === 'draft' || ex.status === 'paused') {
            <div class="ex-actions">
              <button class="btn btn--primary" id="start-exercise-btn">
                <ares-icon name="play-circle-24-regular" [size]="16" /> Start Exercise
              </button>
            </div>
          }
        </div>
      }

      <!-- LIVE EVENT STREAM -->
      <div class="ares-card live-feed-card">
        <div class="feed-header">
          <h3 class="feed-title">Live Event Stream</h3>
          <div class="live-badge"><span class="status-dot online pulse-live"></span>LIVE</div>
        </div>
        <div class="feed-body" id="live-exercise-feed">
          @for (ev of liveEvents(); track ev.id) {
            <div class="feed-event animate-data-stream" [class]="'feed-event--' + ev.severity">
              <span class="feed-time text-mono">{{ ev.time | date:'HH:mm:ss' }}</span>
              <span class="feed-type">{{ ev.type | uppercase }}</span>
              <span class="feed-msg">{{ ev.message }}</span>
            </div>
          }
          @empty {
            <div style="color:var(--text-tertiary);font-size:13px;text-align:center;padding:24px">
              Waiting for events...
            </div>
          }
        </div>
      </div>

    </div>
  </div>
</div>
  `,
  styles: [`
    .exercises-view { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    .page-title  { font-size: 24px; font-weight: 700; }
    .page-subtitle { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; font-family: var(--font-mono); }
    .live-badge { display: flex; align-items: center; gap: 6px; padding: 5px 12px; background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.2); border-radius: 100px; font-size: 11px; font-weight: 700; color: var(--color-success); }

    .ex-layout { display: grid; grid-template-columns: 340px 1fr; gap: 16px; }
    @media (max-width: 1024px) { .ex-layout { grid-template-columns: 1fr; } }

    .ex-list-col { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: calc(100vh - 200px); }

    .ex-card { padding: 16px; cursor: pointer; display: flex; flex-direction: column; gap: 10px; transition: all var(--transition-base); }
    .ex-card:hover { border-color: var(--border-strong); }
    .ex-card--active { border-color: rgba(16,185,129,.3); }
    .ex-card--selected { border-color: var(--color-primary); box-shadow: var(--shadow-primary); }

    .ex-header { display: flex; align-items: center; gap: 10px; }
    .ex-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .ex-dot--running   { background: #10b981; box-shadow: 0 0 6px #10b981; animation: pulse-glow 2s infinite; }
    .ex-dot--paused    { background: #f59e0b; }
    .ex-dot--completed { background: #3b82f6; }
    .ex-dot--draft     { background: #475569; }
    .ex-dot--failed    { background: #ef4444; }
    .ex-info { flex: 1; min-width: 0; }
    .ex-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ex-meta { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }

    .ex-progress-row { display: flex; align-items: center; gap: 8px; }
    .ex-bar-bg { flex: 1; height: 4px; background: var(--bg-overlay); border-radius: 2px; overflow: hidden; }
    .ex-bar-fill { height: 100%; background: var(--color-primary); border-radius: 2px; transition: width 0.6s; }
    .ex-bar-fill--running { background: linear-gradient(90deg, #00d4ff, #10b981); animation: shimmer 2s infinite; }
    .ex-pct-label { font-size: 11px; color: var(--text-tertiary); font-family: var(--font-mono); }
    .ex-footer-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-tertiary); }
    .ex-score { font-family: var(--font-mono); }

    .ex-detail-col { display: flex; flex-direction: column; gap: 16px; }
    .ex-detail-card { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
    .detail-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .detail-title  { font-size: 18px; font-weight: 700; }
    .detail-desc   { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }

    .section-label { font-size: 10px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
    .objectives-section, .scenarios-section { }
    .objective-row { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--border-subtle); font-size: 13px; }
    .obj-check { width: 20px; text-align: center; color: var(--text-tertiary); }
    .obj-check.done { color: var(--color-success); }
    .obj-title { flex: 1; color: var(--text-secondary); }
    .obj-title.done { text-decoration: line-through; color: var(--text-tertiary); }
    .obj-pts   { font-size: 12px; color: var(--color-primary); font-family: var(--font-mono); font-weight: 600; }

    .scenario-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .scenario-tag  { padding: 3px 10px; background: rgba(124,58,237,.12); border: 1px solid rgba(124,58,237,.25); border-radius: 100px; font-size: 11px; color: #a78bfa; }

    .ex-actions { display: flex; gap: 8px; }

    .live-feed-card { padding: 0; overflow: hidden; flex: 1; }
    .feed-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); }
    .feed-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
    .feed-body  { display: flex; flex-direction: column; gap: 4px; padding: 10px; max-height: 380px; overflow-y: auto; }

    .feed-event { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: var(--radius-md); background: var(--bg-elevated); border-left: 3px solid transparent; font-size: 12px; }
    .feed-event--critical { border-left-color: #ef4444; }
    .feed-event--high, .feed-event--warning { border-left-color: #f59e0b; }
    .feed-event--success  { border-left-color: #10b981; }
    .feed-event--info, .feed-event--medium { border-left-color: #3b82f6; }
    .feed-time { color: var(--text-tertiary); flex-shrink: 0; }
    .feed-type { padding: 1px 6px; background: var(--bg-overlay); border-radius: 3px; font-size: 10px; font-weight: 700; color: var(--text-secondary); flex-shrink: 0; }
    .feed-msg  { color: var(--text-primary); }

    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes pulse-glow { 0%,100% { opacity:1; box-shadow:0 0 4px #10b981; } 50% { opacity:.5; box-shadow:0 0 10px #10b981; } }
  `],
})
export class ExercisesComponent implements OnInit, OnDestroy {
  readonly store = inject(PlatformStore);

  readonly selectedId = signal<string | null>(null);
  private _events: LiveEvent[] = [];
  private _liveEventsSignal = signal<LiveEvent[]>([]);
  readonly liveEvents = this._liveEventsSignal.asReadonly();
  private _sub?: Subscription;

  activeCount() { return this.store.activeExercises().length; }

  selectedEx() {
    const id = this.selectedId();
    return id ? this.store.exercises().find(e => e.id === id) ?? null : null;
  }

  ngOnInit(): void {
    // Auto-select first running exercise
    const running = this.store.exercises().find(e => e.status === 'running');
    if (running) this.selectedId.set(running.id);

    this._sub = this.store.liveEvent$.subscribe(ev => {
      const event: LiveEvent = { id: Math.random().toString(36).slice(2), time: new Date(), ...ev };
      this._events.unshift(event);
      if (this._events.length > 50) this._events.pop();
      this._liveEventsSignal.set([...this._events.slice(0, 20)]);
    });
  }

  ngOnDestroy(): void { this._sub?.unsubscribe(); }

  completedPct(objectives: { completed: boolean }[]): number {
    if (!objectives.length) return 0;
    return (objectives.filter(o => o.completed).length / objectives.length) * 100;
  }

  exStatusBadge(s: string): string {
    const m: Record<string, string> = {
      running: 'badge badge--low', paused: 'badge badge--high',
      completed: 'badge badge--info', draft: 'badge badge--neutral', failed: 'badge badge--critical',
    };
    return m[s] ?? 'badge badge--neutral';
  }
}
