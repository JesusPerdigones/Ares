/**
 * TopbarComponent — Application header bar.
 * Displays: breadcrumb, system health bar, notifications, critical threat indicator, user avatar.
 * Reads: PlatformStore (metrics, criticalThreats, unreadNotifications)
 * Single Responsibility: topbar display only.
 */
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AresIconComponent } from '../../shared/components/icon/icon.component';
import { PlatformStore } from '../../state/platform.store';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'ares-topbar',
  standalone: true,
  imports: [CommonModule, AresIconComponent],
  template: `
    <header class="topbar">
      <div class="topbar__left">
        <div class="topbar__breadcrumb">
          <span class="breadcrumb-root">ARES</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ currentRoute() }}</span>
        </div>
      </div>

      <!-- Global Search -->
      <div class="topbar__search">
        <ares-icon name="search-24-regular" [size]="15" class="search-icon" />
        <input class="topbar-search-input" type="search" placeholder="Search devices, threats, exercises..." id="global-search-input" />
      </div>

      <div class="topbar__right">

        <!-- System Health Bar -->
        @if (store.metrics(); as m) {
          <div class="health-indicator" title="System Health Score">
            <div class="health-bar">
              <div class="health-bar__fill"
                [style.width.%]="m.systemHealthScore"
                [style.background]="healthColor()">
              </div>
            </div>
            <span class="health-score" [style.color]="healthColor()">
              {{ m.systemHealthScore | number:'1.0-0' }}%
            </span>
          </div>
        }

        <!-- Notifications Bell -->
        <button class="topbar-btn" id="notifications-btn"
          title="Notifications ({{ store.unreadNotifications() }} unread)"
          [class.topbar-btn--active]="store.unreadNotifications() > 0">
          <ares-icon name="alert-24-regular" [size]="18" />
          @if (store.unreadNotifications() > 0) {
            <span class="notification-badge">{{ store.unreadNotifications() }}</span>
          }
        </button>

        <!-- Critical Threats Indicator -->
        @if (store.criticalThreats().length > 0) {
          <div class="threat-indicator pulse-live" title="{{ store.criticalThreats().length }} critical threats active">
            <span class="status-dot danger"></span>
            <span>{{ store.criticalThreats().length }} Critical</span>
          </div>
        }

        <!-- Operator Avatar -->
        <div class="user-avatar" title="Security Operator" id="user-avatar-btn">
          <ares-icon name="person-24-regular" [size]="16" />
        </div>

      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: var(--topbar-height);
      min-height: var(--topbar-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-default);
      gap: 16px;
    }

    .topbar__left  { display: flex; align-items: center; gap: 16px; }
    .topbar__right { display: flex; align-items: center; gap: 12px; }

    /* Global search */
    .topbar__search {
      flex: 1;
      max-width: 400px;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 10px;
      color: var(--text-tertiary);
      pointer-events: none;
    }

    .topbar-search-input {
      width: 100%;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: var(--font-sans);
      font-size: 13px;
      padding: 6px 12px 6px 32px;
      transition: border-color var(--transition-fast);

      &::placeholder { color: var(--text-tertiary); font-size: 12px; }
      &:focus { outline: none; border-color: var(--border-strong); background: var(--bg-overlay); }
    }

    .topbar__breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .breadcrumb-root    { color: var(--text-tertiary); font-size: 12px; }
    .breadcrumb-sep     { color: var(--text-muted); font-size: 12px; }
    .breadcrumb-current { color: var(--text-primary); font-weight: 600; font-size: 13px; }

    .health-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
    }

    .health-bar {
      width: 64px;
      height: 4px;
      background: var(--bg-overlay);
      border-radius: 2px;
      overflow: hidden;
    }

    .health-bar__fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.6s ease, background 0.6s ease;
    }

    .topbar-btn {
      position: relative;
      background: transparent;
      border: 1px solid var(--border-default);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover { background: var(--bg-overlay); color: var(--text-primary); }
      &.topbar-btn--active { border-color: var(--color-danger); color: var(--color-danger); }
    }

    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--color-danger);
      color: white;
      font-size: 9px;
      font-weight: 700;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .threat-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
      color: var(--color-danger);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      cursor: pointer;
    }
  `],
})
export class TopbarComponent {
  readonly store: PlatformStore = inject(PlatformStore);
  private readonly router = inject(Router);

  /** Reactive breadcrumb — updates on every Angular navigation event */
  private readonly _routeLabel = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const routeMap: Record<string, string> = {
          dashboard: 'Dashboard', devices: 'Device Fleet',
          threats: 'Threat Intel', exercises: 'Live Exercises',
          'ai-defense': 'AI Defender', scenarios: 'Scenarios', settings: 'Settings',
        };
        const segment = this.router.url.split('/').filter(Boolean).pop() ?? 'dashboard';
        return routeMap[segment] ?? 'Dashboard';
      }),
    ),
    { initialValue: 'Dashboard' }
  );

  readonly currentRoute = computed(() => this._routeLabel() ?? 'Dashboard');

  readonly healthColor = computed(() => {
    const score = this.store.metrics()?.systemHealthScore ?? 100;
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  });
}
