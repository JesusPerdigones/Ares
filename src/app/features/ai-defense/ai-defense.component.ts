import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformStore } from '../../state/platform.store';
import { AresIconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'ares-ai-defense',
  standalone: true,
  imports: [CommonModule, AresIconComponent],
  template: `
<div class="ai-view animate-fade-in-up">
  <div class="page-header">
    <div>
      <h1 class="page-title">AI Defender Panel</h1>
      <p class="page-subtitle">ARES-AI v2.4.1 · {{ store.aiAnalyses().length }} analyses · Autonomous defensive intelligence</p>
    </div>
    <div class="ai-status-badge">
      <span class="status-dot online pulse-live"></span>
      <span>AI ONLINE</span>
      <span class="ai-model-tag">ARES-AI-v2.4.1</span>
    </div>
  </div>

  <!-- AI OVERVIEW CARDS -->
  <div class="ai-overview">
    @for (kpi of aiKpis(); track kpi.label) {
      <div class="ai-kpi ares-card">
        <ares-icon [name]="kpi.icon" [size]="24" [style.color]="kpi.color" />
        <div class="ai-kpi-val" [style.color]="kpi.color">{{ kpi.value }}</div>
        <div class="ai-kpi-label">{{ kpi.label }}</div>
      </div>
    }
  </div>

  <div class="ai-main-grid">

    <!-- ANALYSES LIST -->
    <div class="analyses-col">
      <div class="ares-card analyses-card">
        <div class="card-header">
          <h3 class="card-title">Recent Analyses</h3>
          <span class="badge badge--info">{{ store.aiAnalyses().length }} total</span>
        </div>
        <div class="analyses-list">
          @for (a of store.aiAnalyses(); track a.id) {
            <div class="analysis-item">
              <div class="analysis-risk">
                <div class="risk-ring" [style.border-color]="riskColor(a.riskScore)">
                  <span class="risk-num" [style.color]="riskColor(a.riskScore)">{{ a.riskScore }}</span>
                </div>
              </div>
              <div class="analysis-info">
                <div class="analysis-id text-mono">{{ a.id }}</div>
                <div class="analysis-summary">{{ a.summary }}</div>
                <div class="analysis-meta">
                  <span>{{ a.confidence * 100 | number:'1.0-0' }}% confidence</span>
                  <span>·</span>
                  <span>{{ a.anomalies.length }} anomalies</span>
                  <span>·</span>
                  <span>{{ a.processingTimeMs }}ms</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- RECOMMENDATIONS + ANOMALIES -->
    <div class="insights-col">

      <!-- TOP RECOMMENDATIONS -->
      <div class="ares-card insights-card">
        <div class="card-header">
          <h3 class="card-title">AI Recommendations</h3>
          <span class="badge badge--critical">{{ immediateRecs().length }} immediate</span>
        </div>
        <div class="recs-list">
          @for (rec of topRecs(); track rec.id) {
            <div class="rec-item" [class]="'rec-item--' + rec.priority">
              <div class="rec-priority">{{ rec.priority | uppercase }}</div>
              <div class="rec-body">
                <div class="rec-action">{{ rec.action }}</div>
                <div class="rec-rationale">{{ rec.rationale }}</div>
                <div class="rec-footer">
                  <span class="rec-risk-reduction">↓ {{ rec.estimatedRiskReduction }}% risk</span>
                  @if (rec.automated) {
                    <span class="rec-auto-badge">
                      <ares-icon name="bot-24-regular" [size]="11" /> Automated
                    </span>
                  }
                </div>
              </div>
              <button class="btn btn--ghost btn--sm" [id]="'apply-rec-' + rec.id">Apply</button>
            </div>
          }
        </div>
      </div>

      <!-- ANOMALIES -->
      <div class="ares-card insights-card">
        <div class="card-header">
          <h3 class="card-title">Detected Anomalies</h3>
          <span class="badge badge--high">{{ allAnomalies().length }} active</span>
        </div>
        <div class="anomalies-list">
          @for (an of allAnomalies().slice(0, 8); track an.id) {
            <div class="anomaly-item">
              <div class="anomaly-type-tag">{{ an.type.replace('_',' ') | uppercase }}</div>
              <div class="anomaly-body">
                <div class="anomaly-desc">{{ an.description }}</div>
                <div class="anomaly-meta text-mono">
                  <span class="anomaly-score" [style.color]="riskColor(an.score * 100)">
                    Score: {{ (an.score * 100).toFixed(0) }}
                  </span>
                  <span>Device: {{ an.deviceId }}</span>
                  <span>{{ an.detectedAt | date:'HH:mm' }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- CORRELATIONS -->
      @if (allCorrelations().length) {
        <div class="ares-card insights-card">
          <div class="card-header">
            <h3 class="card-title">Threat Correlations</h3>
            <span class="badge badge--medium">{{ allCorrelations().length }} patterns</span>
          </div>
          @for (c of allCorrelations(); track c.pattern) {
            <div class="corr-item">
              <div class="corr-score" [style.color]="riskColor(c.correlationScore * 100)">
                {{ (c.correlationScore * 100).toFixed(0) }}%
              </div>
              <div class="corr-body">
                <div class="corr-pattern">{{ c.pattern }}</div>
                <div class="corr-desc">{{ c.description }}</div>
                <div class="corr-threats text-mono">{{ c.threatIds.join(' · ') }}</div>
              </div>
            </div>
          }
        </div>
      }

    </div>
  </div>
</div>
  `,
  styles: [`
    .ai-view { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title  { font-size: 24px; font-weight: 700; }
    .page-subtitle { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; font-family: var(--font-mono); }
    .ai-status-badge { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(0,212,255,.08); border: 1px solid rgba(0,212,255,.2); border-radius: 100px; font-size: 12px; font-weight: 700; color: var(--color-primary); }
    .ai-model-tag { padding: 1px 8px; background: rgba(0,212,255,.12); border-radius: 4px; font-size: 10px; font-family: var(--font-mono); }

    .ai-overview { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .ai-kpi { padding: 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .ai-kpi-icon { font-size: 24px; }
    .ai-kpi-val  { font-size: 28px; font-weight: 800; line-height: 1; }
    .ai-kpi-label { font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.06em; }

    .ai-main-grid { display: grid; grid-template-columns: 380px 1fr; gap: 16px; }
    @media (max-width: 1280px) { .ai-main-grid { grid-template-columns: 1fr; } }

    .analyses-card { overflow: hidden; }
    .card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--border-subtle); }
    .card-title  { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
    .analyses-list { display: flex; flex-direction: column; max-height: calc(100vh - 300px); overflow-y: auto; }
    .analysis-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); transition: background var(--transition-fast); }
    .analysis-item:hover { background: var(--bg-hover); }
    .analysis-risk { flex-shrink: 0; }
    .risk-ring { width: 44px; height: 44px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; }
    .risk-num  { font-size: 13px; font-weight: 800; font-family: var(--font-mono); }
    .analysis-info { flex: 1; min-width: 0; }
    .analysis-id   { font-size: 11px; color: var(--color-primary); }
    .analysis-summary { font-size: 12px; color: var(--text-secondary); margin: 3px 0; line-height: 1.5; }
    .analysis-meta { display: flex; gap: 8px; font-size: 10px; color: var(--text-tertiary); flex-wrap: wrap; }

    .insights-col { display: flex; flex-direction: column; gap: 16px; }
    .insights-card { overflow: hidden; }

    .recs-list { display: flex; flex-direction: column; }
    .rec-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); }
    .rec-priority { font-size: 9px; font-weight: 800; letter-spacing: 0.1em; padding: 2px 6px; border-radius: 4px; margin-top: 2px; white-space: nowrap; }
    .rec-item--immediate .rec-priority { background: rgba(239,68,68,.15); color: #ef4444; }
    .rec-item--high .rec-priority      { background: rgba(245,158,11,.15); color: #f59e0b; }
    .rec-item--medium .rec-priority    { background: rgba(59,130,246,.15); color: #3b82f6; }
    .rec-item--low .rec-priority       { background: rgba(16,185,129,.15); color: #10b981; }
    .rec-body   { flex: 1; min-width: 0; }
    .rec-action  { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .rec-rationale { font-size: 12px; color: var(--text-tertiary); margin-top: 3px; line-height: 1.4; }
    .rec-footer  { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
    .rec-risk-reduction { font-size: 11px; color: var(--color-success); font-weight: 600; }
    .rec-auto-badge { font-size: 10px; color: var(--color-primary); background: rgba(0,212,255,.08); padding: 1px 6px; border-radius: 4px; }

    .anomalies-list { display: flex; flex-direction: column; }
    .anomaly-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border-subtle); }
    .anomaly-type-tag { font-size: 9px; font-weight: 700; padding: 2px 6px; background: rgba(245,158,11,.12); border: 1px solid rgba(245,158,11,.2); border-radius: 4px; color: #f59e0b; white-space: nowrap; margin-top: 2px; }
    .anomaly-body { flex: 1; }
    .anomaly-desc { font-size: 12px; color: var(--text-secondary); }
    .anomaly-meta { display: flex; gap: 10px; margin-top: 4px; font-size: 10px; color: var(--text-tertiary); }
    .anomaly-score { font-weight: 700; }

    .corr-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); }
    .corr-score { font-size: 20px; font-weight: 800; font-family: var(--font-mono); flex-shrink: 0; }
    .corr-pattern { font-size: 13px; font-weight: 600; }
    .corr-desc { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }
    .corr-threats { font-size: 10px; color: var(--color-primary); margin-top: 4px; }
  `],
})
export class AiDefenseComponent {
  readonly store = inject(PlatformStore);

  riskColor(score: number): string {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#3b82f6';
    return '#10b981';
  }

  readonly aiKpis = computed(() => {
    const analyses = this.store.aiAnalyses();
    const avgRisk = analyses.reduce((s, a) => s + a.riskScore, 0) / (analyses.length || 1);
    const avgConf = analyses.reduce((s, a) => s + a.confidence, 0) / (analyses.length || 1);
    return [
      { icon: 'data-histogram-24-regular', label: 'Analyses Run',    value: analyses.length,                                          color: 'var(--color-primary)' },
      { icon: 'shield-error-24-regular',   label: 'Avg Risk Score',  value: avgRisk.toFixed(0),                                       color: this.riskColor(avgRisk) },
      { icon: 'checkmark-circle-24-regular', label: 'Avg Confidence', value: `${(avgConf * 100).toFixed(0)}%`,                        color: '#10b981' },
      { icon: 'warning-24-regular',        label: 'Anomalies Found', value: analyses.reduce((s, a) => s + a.anomalies.length, 0),     color: '#f59e0b' },
      { icon: 'lightbulb-24-regular',      label: 'Recommendations', value: analyses.reduce((s, a) => s + a.recommendations.length, 0), color: '#7c3aed' },
    ];
  });

  readonly immediateRecs = computed(() =>
    this.store.aiAnalyses().flatMap(a => a.recommendations).filter(r => r.priority === 'immediate'));

  readonly topRecs = computed(() =>
    this.store.aiAnalyses().flatMap(a => a.recommendations)
      .sort((a, b) => {
        const order: Record<string, number> = { immediate: 0, high: 1, medium: 2, low: 3 };
        return order[a.priority] - order[b.priority];
      }).slice(0, 8));

  readonly allAnomalies = computed(() =>
    this.store.aiAnalyses().flatMap(a => a.anomalies)
      .sort((a, b) => b.score - a.score));

  readonly allCorrelations = computed(() =>
    this.store.aiAnalyses().flatMap(a => a.correlations));
}
