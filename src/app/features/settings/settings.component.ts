import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ares-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="settings-view animate-fade-in-up">
  <div class="page-header">
    <h1 class="page-title">Settings</h1>
    <p class="page-subtitle">Platform configuration and integrations</p>
  </div>

  <div class="settings-grid">

    <div class="ares-card settings-card">
      <h3 class="settings-section-title">🔧 Platform</h3>
      <div class="settings-list">
        @for (s of platformSettings; track s.label) {
          <div class="setting-row">
            <div>
              <div class="setting-label">{{ s.label }}</div>
              <div class="setting-desc">{{ s.desc }}</div>
            </div>
            <div class="setting-value" [style.color]="s.color">{{ s.value }}</div>
          </div>
        }
      </div>
    </div>

    <div class="ares-card settings-card">
      <h3 class="settings-section-title">🔗 Integrations</h3>
      <div class="settings-list">
        @for (i of integrations; track i.name) {
          <div class="setting-row">
            <div>
              <div class="setting-label">{{ i.name }}</div>
              <div class="setting-desc">{{ i.desc }}</div>
            </div>
            <span class="badge" [class]="i.status === 'Mock' ? 'badge badge--neutral' : i.status === 'Ready' ? 'badge badge--low' : 'badge badge--medium'">
              {{ i.status }}
            </span>
          </div>
        }
      </div>
    </div>

    <div class="ares-card settings-card">
      <h3 class="settings-section-title">📋 About ARES</h3>
      <div class="about-content">
        <div class="about-logo">
          <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#00d4ff" stroke-width="1.5"/>
            <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="#00d4ff22" stroke="#00d4ff" stroke-width="1"/>
            <circle cx="14" cy="14" r="3" fill="#00d4ff"/>
          </svg>
          <div>
            <div class="about-name">ARES Platform</div>
            <div class="about-version text-mono">MVP v0.1.0 · Angular 19</div>
          </div>
        </div>
        <p class="about-desc">
          Mobile Cyber Range Platform — Simulate, train, and defend against mobile threats using
          virtualized Android environments and AI-powered threat intelligence.
        </p>
        <div class="tech-stack">
          @for (t of techStack; track t) {
            <span class="tech-tag">{{ t }}</span>
          }
        </div>
      </div>
    </div>

  </div>
</div>
  `,
  styles: [`
    .settings-view { display: flex; flex-direction: column; gap: 20px; }
    .page-header { }
    .page-title    { font-size: 24px; font-weight: 700; }
    .page-subtitle { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; }

    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; }
    .settings-card { padding: 20px; }
    .settings-section-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px; }
    .settings-list { display: flex; flex-direction: column; gap: 0; }
    .setting-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--border-subtle); }
    .setting-row:last-child { border-bottom: none; }
    .setting-label { font-size: 13px; font-weight: 500; color: var(--text-primary); }
    .setting-desc  { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }
    .setting-value { font-size: 13px; font-family: var(--font-mono); font-weight: 600; flex-shrink: 0; }

    .about-content { display: flex; flex-direction: column; gap: 16px; }
    .about-logo    { display: flex; align-items: center; gap: 14px; }
    .about-name    { font-size: 18px; font-weight: 800; color: var(--color-primary); }
    .about-version { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
    .about-desc    { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
    .tech-stack    { display: flex; flex-wrap: wrap; gap: 6px; }
    .tech-tag      { padding: 3px 10px; background: rgba(0,212,255,.08); border: 1px solid rgba(0,212,255,.2); border-radius: 100px; font-size: 11px; color: var(--color-primary); }
  `],
})
export class SettingsComponent {
  readonly platformSettings = [
    { label: 'Environment',     desc: 'Current deployment mode', value: 'MVP / Mock', color: 'var(--color-primary)' },
    { label: 'Angular Version', desc: 'Frontend framework',       value: '19.2.x', color: 'var(--color-success)' },
    { label: 'AI Model',        desc: 'Defensive AI version',     value: 'ARES-AI-v2.4.1', color: '#7c3aed' },
    { label: 'Real-time',       desc: 'Event stream mode',        value: 'Mock WebSocket', color: 'var(--color-warning)' },
    { label: 'Devices',         desc: 'Virtual Android farm',     value: '100 simulated', color: 'var(--text-primary)' },
    { label: 'Data Mode',       desc: 'Backend connection',       value: 'Offline / Mock', color: 'var(--text-tertiary)' },
  ];

  readonly integrations = [
    { name: 'Docker-Android',  desc: 'Virtual device farm orchestration', status: 'Planned' },
    { name: 'Appium',          desc: 'Mobile test automation framework',   status: 'Planned' },
    { name: 'WebSocket API',   desc: 'Real-time event streaming',          status: 'Mock' },
    { name: 'Kafka',           desc: 'High-throughput event bus',          status: 'Planned' },
    { name: 'OpenTelemetry',   desc: 'Observability and tracing',          status: 'Ready' },
    { name: 'AI Agent API',    desc: 'LLM-powered threat analysis',        status: 'Planned' },
  ];

  readonly techStack = [
    'Angular 19', 'TypeScript', 'Signals API', 'RxJS', 'TailwindCSS v4',
    'Angular CDK', 'Standalone Components', 'Clean Architecture', 'DDD',
  ];
}
