import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformStore } from '../../state/platform.store';
import { ThreatCategory } from '../../models/domain';
import { Subscription } from 'rxjs';
import { AresIconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'ares-scenarios',
  standalone: true,
  imports: [CommonModule, FormsModule, AresIconComponent],
  template: `
<div class="scenarios-view animate-fade-in-up">
  <div class="page-header">
    <h1 class="page-title">Scenario Builder</h1>
    <p class="page-subtitle">Design and launch custom cyber range scenarios</p>
  </div>

  <div class="builder-layout">

    <!-- TEMPLATE LIBRARY -->
    <div class="templates-col">
      <div class="ares-card templates-card">
        <div class="card-header">
          <h3 class="section-title">Scenario Templates</h3>
          <span class="badge badge--info">{{ store.scenarioTemplates().length }} available</span>
        </div>
        <div class="templates-list">
          @for (t of store.scenarioTemplates(); track t.id) {
            <div class="template-card"
              [class.template-card--selected]="selectedTemplateId() === t.id"
              (click)="selectTemplate(t.id)"
              [id]="'template-' + t.id">
              <div class="tmpl-header">
                <ares-icon [name]="categoryIcon(t.category)" [size]="20" style="color:var(--color-primary);opacity:0.8" />
                <div class="tmpl-info">
                  <div class="tmpl-name">{{ t.name }}</div>
                  <div class="tmpl-id text-mono">{{ t.id }}</div>
                </div>
                <span class="badge" [class]="diffBadge(t.difficulty)">{{ t.difficulty }}</span>
              </div>
              <p class="tmpl-desc">{{ t.description }}</p>
              <div class="tmpl-meta">
                <span><ares-icon name="timer-24-regular" [size]="12" /> {{ t.estimatedDuration }}min</span>
                <span><ares-icon name="phone-24-regular" [size]="12" /> {{ t.requiredDeviceCount }} devices</span>
                <span><ares-icon name="target-arrow-24-regular" [size]="12" /> {{ t.threatSequence.length }} phases</span>
              </div>
              <div class="tmpl-tags">
                @for (tag of t.tags; track tag) {
                  <span class="tmpl-tag">{{ tag }}</span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- BUILDER FORM -->
    <div class="builder-col">
      <div class="ares-card builder-card">
        <div class="card-header">
          <h3 class="section-title">Configure Scenario</h3>
        </div>
        <div class="builder-body">

          <div class="field-group">
            <label class="field-label">Scenario Name</label>
            <input class="ares-input" [(ngModel)]="scenarioName"
              placeholder="Enter scenario name..." id="scenario-name-input" />
          </div>

          <div class="field-group">
            <label class="field-label">Template</label>
            <div class="selected-template-display ares-card">
              @if (selectedTemplate()) {
                <span class="tmpl-name">{{ selectedTemplate()!.name }}</span>
                <span class="badge badge--neutral">{{ selectedTemplate()!.difficulty }}</span>
              } @else {
                <span style="color:var(--text-tertiary)">Select a template from the left panel</span>
              }
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Target Devices ({{ selectedDeviceIds().length }} selected)</label>
            <div class="device-picker">
              @for (d of store.onlineDevices().slice(0, 20); track d.id) {
                <button class="device-chip"
                  [class.device-chip--selected]="isDeviceSelected(d.id)"
                  (click)="toggleDevice(d.id)"
                  [id]="'pick-device-' + d.id">
                  <span class="status-dot online"></span>
                  {{ d.id }}
                </button>
              }
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Threat Scenarios</label>
            <div class="threat-picker">
              @for (cat of allCategories; track cat) {
                <button class="threat-chip"
                  [class.threat-chip--selected]="isThreatSelected(cat)"
                  (click)="toggleThreat(cat)"
                  [id]="'pick-threat-' + cat">
                  {{ formatCat(cat) }}
                </button>
              }
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Duration: {{ duration() }} minutes</label>
            <input type="range" min="15" max="240" step="15"
              [value]="duration()"
              (input)="setDuration($any($event.target).value)"
              class="range-input" id="duration-slider" />
            <div class="range-labels">
              <span>15min</span><span>1h</span><span>2h</span><span>4h</span>
            </div>
          </div>

          <div class="field-group toggle-row">
            <div>
              <label class="field-label">Auto-Mitigate</label>
              <p style="font-size:12px;color:var(--text-tertiary)">AI automatically applies mitigations</p>
            </div>
            <button class="toggle-btn" [class.active]="autoMitigate()"
              (click)="toggleAutoMitigate()" id="auto-mitigate-toggle">
              {{ autoMitigate() ? 'ON' : 'OFF' }}
            </button>
          </div>

          <button class="btn btn--primary launch-btn"
            [disabled]="!canLaunch()"
            (click)="launchScenario()" id="launch-scenario-btn">
            <ares-icon name="rocket-24-regular" [size]="16" /> Launch Scenario
          </button>

          @if (launched()) {
            <div class="launch-success animate-fade-in-up">
              <ares-icon name="checkmark-circle-24-filled" [size]="20" style="color:var(--color-success)" />
              <div>
                <div style="font-weight:600">Scenario launched successfully!</div>
                <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">Routing to exercises view...</div>
              </div>
            </div>
          }

        </div>
      </div>

      <!-- ATTACK CHAIN PREVIEW -->
      @if (selectedTemplate()) {
        <div class="ares-card preview-card animate-fade-in-up">
          <div class="card-header">
            <h3 class="section-title">Attack Chain Preview</h3>
          </div>
          <div class="attack-chain">
            @for (phase of selectedTemplate()!.threatSequence; track phase; let idx = $index; let last = $last) {
              <div class="chain-step">
                <div class="chain-step-num">{{ idx + 1 }}</div>
                <div class="chain-step-info">
                  <div class="chain-step-name">{{ formatCat(phase) }}</div>
                  <ares-icon [name]="categoryIcon(phase)" [size]="14" style="color:var(--text-tertiary)" />
                </div>
                @if (!last) {
                  <div class="chain-arrow">→</div>
                }
              </div>
            }
          </div>
        </div>
      }

    </div>
  </div>
</div>
  `,
  styles: [`
    .scenarios-view { display: flex; flex-direction: column; gap: 20px; }
    .page-header { }
    .page-title { font-size: 24px; font-weight: 700; }
    .page-subtitle { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; font-family: var(--font-mono); }

    .builder-layout { display: grid; grid-template-columns: 380px 1fr; gap: 16px; }
    @media (max-width: 1280px) { .builder-layout { grid-template-columns: 1fr; } }

    .templates-card { overflow: hidden; }
    .card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--border-subtle); }
    .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
    .templates-list { display: flex; flex-direction: column; max-height: calc(100vh - 200px); overflow-y: auto; }

    .template-card { padding: 16px; border-bottom: 1px solid var(--border-subtle); cursor: pointer; transition: all var(--transition-fast); display: flex; flex-direction: column; gap: 8px; }
    .template-card:hover { background: var(--bg-hover); }
    .template-card--selected { background: rgba(0,212,255,.04); border-left: 3px solid var(--color-primary); }
    .tmpl-header { display: flex; align-items: center; gap: 10px; }
    .tmpl-cat-icon { font-size: 20px; flex-shrink: 0; }
    .tmpl-info { flex: 1; min-width: 0; }
    .tmpl-name { font-size: 13px; font-weight: 600; }
    .tmpl-id   { font-size: 10px; color: var(--text-tertiary); }
    .tmpl-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .tmpl-meta { display: flex; gap: 12px; font-size: 11px; color: var(--text-tertiary); }
    .tmpl-tags { display: flex; gap: 5px; flex-wrap: wrap; }
    .tmpl-tag  { padding: 1px 7px; background: var(--bg-overlay); border-radius: 100px; font-size: 10px; color: var(--text-tertiary); border: 1px solid var(--border-subtle); }

    .builder-col { display: flex; flex-direction: column; gap: 16px; }
    .builder-card { overflow: hidden; }
    .builder-body { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

    .field-group { display: flex; flex-direction: column; gap: 8px; }
    .field-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
    .selected-template-display { padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; }

    .device-picker { display: flex; flex-wrap: wrap; gap: 6px; max-height: 120px; overflow-y: auto; }
    .device-chip { display: flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 100px; border: 1px solid var(--border-default); background: var(--bg-elevated); color: var(--text-secondary); font-size: 11px; font-family: var(--font-mono); cursor: pointer; transition: all var(--transition-fast); }
    .device-chip--selected { background: rgba(0,212,255,.12); border-color: rgba(0,212,255,.35); color: var(--color-primary); }

    .threat-picker { display: flex; flex-wrap: wrap; gap: 6px; }
    .threat-chip { padding: 4px 12px; border-radius: 100px; border: 1px solid var(--border-default); background: var(--bg-elevated); color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all var(--transition-fast); text-transform: capitalize; }
    .threat-chip--selected { background: rgba(124,58,237,.15); border-color: rgba(124,58,237,.35); color: #a78bfa; }

    .range-input { width: 100%; accent-color: var(--color-primary); cursor: pointer; }
    .range-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-tertiary); }

    .toggle-row { flex-direction: row !important; align-items: center; justify-content: space-between; }
    .toggle-btn { padding: 6px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-default); background: var(--bg-elevated); color: var(--text-secondary); font-size: 13px; font-weight: 700; cursor: pointer; transition: all var(--transition-fast); }
    .toggle-btn.active { background: rgba(16,185,129,.15); border-color: rgba(16,185,129,.3); color: var(--color-success); }

    .launch-btn { width: 100%; padding: 12px; font-size: 14px; border-radius: var(--radius-lg); }
    .launch-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .launch-success { display: flex; align-items: center; gap: 12px; padding: 14px; background: rgba(16,185,129,.1); border: 1px solid rgba(16,185,129,.25); border-radius: var(--radius-md); font-size: 14px; color: var(--color-success); }

    .preview-card { overflow: hidden; }
    .attack-chain { display: flex; align-items: center; padding: 20px; gap: 6px; flex-wrap: wrap; }
    .chain-step   { display: flex; align-items: center; gap: 6px; }
    .chain-step-num  { width: 24px; height: 24px; border-radius: 50%; background: rgba(0,212,255,.15); border: 1px solid rgba(0,212,255,.3); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--color-primary); }
    .chain-step-info { display: flex; flex-direction: column; }
    .chain-step-name { font-size: 12px; font-weight: 600; }
    .chain-step-cat  { font-size: 10px; color: var(--text-tertiary); }
    .chain-arrow     { color: var(--text-muted); font-size: 16px; margin: 0 4px; }
  `],
})
export class ScenariosComponent {
  readonly store = inject(PlatformStore);

  readonly selectedTemplateId = signal<string | null>(null);
  readonly selectedDeviceIds  = signal<string[]>([]);
  readonly selectedThreats    = signal<ThreatCategory[]>([]);
  readonly duration            = signal(60);
  readonly autoMitigate        = signal(false);
  readonly launched            = signal(false);
  scenarioName = '';

  readonly allCategories: ThreatCategory[] = [
    'malware', 'ransomware', 'spyware', 'exploit', 'c2_communication',
    'data_exfiltration', 'privilege_escalation', 'lateral_movement', 'persistence', 'zero_day',
  ];

  readonly selectedTemplate = computed(() =>
    this.store.scenarioTemplates().find(t => t.id === this.selectedTemplateId()) ?? null);

  readonly canLaunch = computed(() =>
    this.scenarioName.trim().length > 0
    && this.selectedTemplateId() !== null
    && this.selectedDeviceIds().length > 0);

  selectTemplate(id: string): void {
    this.selectedTemplateId.set(id);
    const t = this.store.scenarioTemplates().find(x => x.id === id);
    if (t) {
      this.duration.set(t.estimatedDuration);
      this.selectedThreats.set([...t.threatSequence]);
      const devices = this.store.onlineDevices().slice(0, t.requiredDeviceCount);
      this.selectedDeviceIds.set(devices.map(d => d.id));
    }
  }

  toggleDevice(id: string): void {
    this.selectedDeviceIds.update(ids =>
      ids.includes(id) ? ids.filter(d => d !== id) : [...ids, id]);
  }

  toggleThreat(cat: ThreatCategory): void {
    this.selectedThreats.update(ts =>
      ts.includes(cat) ? ts.filter(t => t !== cat) : [...ts, cat]);
  }

  toggleAutoMitigate(): void {
    this.autoMitigate.update(v => !v);
  }

  setDuration(val: string): void {
    this.duration.set(Number(val));
  }

  launchScenario(): void {
    if (!this.canLaunch()) return;
    this.launched.set(true);
    setTimeout(() => this.launched.set(false), 4000);
  }

  isDeviceSelected(id: string): boolean {
    return this.selectedDeviceIds().includes(id);
  }

  isThreatSelected(cat: ThreatCategory): boolean {
    return this.selectedThreats().includes(cat);
  }

  formatCat(cat: string): string {
    return cat.replace(/_/g, ' ');
  }

  /** Returns Fluent icon name for a given ThreatCategory */
  categoryIcon(cat: string): string {
    const map: Record<string, string> = {
      malware:               'bug-24-regular',
      ransomware:            'lock-closed-24-regular',
      spyware:               'eye-24-regular',
      exploit:               'flash-24-regular',
      c2_communication:      'broadcast-24-regular',
      data_exfiltration:     'arrow-upload-24-regular',
      privilege_escalation:  'arrow-trending-up-24-regular',
      lateral_movement:      'arrow-swap-24-regular',
      persistence:           'link-24-regular',
      zero_day:              'warning-24-regular',
    };
    return map[cat] ?? 'shield-error-24-regular';
  }

  diffBadge(d: string): string {
    const map: Record<string, string> = {
      beginner: 'badge badge--low', intermediate: 'badge badge--medium',
      advanced: 'badge badge--high', expert: 'badge badge--critical',
    };
    return map[d] ?? 'badge badge--neutral';
  }
}
