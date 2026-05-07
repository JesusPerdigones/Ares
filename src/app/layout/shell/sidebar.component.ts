/**
 * SidebarComponent — 2026 minimal icon-rail navigation.
 * Design principles:
 *  - Collapsed (64px): icon-only rail with tooltips
 *  - Expanded (220px): icon + label, smooth transition
 *  - No decorative borders. Only active accent and hover state.
 *  - Fluent icons via AresIconComponent (Iconify CDN)
 */
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlatformStore } from '../../state/platform.store';
import { AresIconComponent } from '../../shared/components/icon/icon.component';

interface NavItem {
  path: string;
  label: string;
  /** Fluent icon name (without 'fluent:' prefix) */
  iconName: string;
  badge?: () => number | null;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

@Component({
  selector: 'ares-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, AresIconComponent],
  template: `
    <aside class="sidebar" [class.sidebar--collapsed]="store.sidebarCollapsed()">

      <!-- ── BRAND ──────────────────────────────── -->
      <div class="sidebar__brand">
        <div class="brand-mark">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#00d4ff" stroke-width="1.5"/>
            <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="#00d4ff18" stroke="#00d4ff" stroke-width="1"/>
            <circle cx="14" cy="14" r="2.5" fill="#00d4ff"/>
          </svg>
        </div>
        @if (!store.sidebarCollapsed()) {
          <div class="brand-text" >
            <span class="brand-name">ARES</span>
            <span class="brand-sub">Cyber Range · MVP</span>
          </div>
        }
      </div>

      <!-- ── NAVIGATION ─────────────────────────── -->
      <nav class="sidebar__nav" role="navigation" aria-label="Main navigation">

        @for (group of navGroups; track group.label) {

          <!-- Section label (only expanded mode) -->
          @if (group.label && !store.sidebarCollapsed()) {
            <div class="nav-section-label">{{ group.label }}</div>
          }

          @for (item of group.items; track item.path) {
            <a [routerLink]="item.path"
               routerLinkActive="nav-item--active"
               [routerLinkActiveOptions]="{ exact: item.path === 'dashboard' }"
               class="nav-item"
               [attr.title]="store.sidebarCollapsed() ? item.label : null"
               [attr.aria-label]="item.label"
               [id]="'nav-' + item.path">

              <!-- Icon — always visible -->
              <span class="nav-item__icon">
                <ares-icon [name]="item.iconName" [size]="18" />
              </span>

              <!-- Label — hidden when collapsed -->
              @if (!store.sidebarCollapsed()) {
                <span class="nav-item__label">{{ item.label }}</span>
              }

              <!-- Badge pill (expanded) -->
              @if (!store.sidebarCollapsed() && item.badge && item.badge()! > 0) {
                <span class="nav-badge">{{ item.badge() }}</span>
              }

              <!-- Badge dot (collapsed) -->
              @if (store.sidebarCollapsed() && item.badge && item.badge()! > 0) {
                <span class="nav-badge-dot"></span>
              }

            </a>
          }

          <!-- Group divider -->
          <div class="nav-divider"></div>
        }

      </nav>

      <!-- ── FOOTER ──────────────────────────────── -->
      <div class="sidebar__footer">
        <!-- System status dot -->
        <div class="system-status" [title]="'System operational'">
          <span class="status-dot online pulse-live"></span>
          @if (!store.sidebarCollapsed()) {
            <span class="status-label">Operational</span>
          }
        </div>

        <!-- Collapse / expand toggle -->
        <button class="collapse-btn"
          (click)="store.toggleSidebar()"
          [title]="store.sidebarCollapsed() ? 'Expand' : 'Collapse'"
          id="sidebar-toggle-btn">
          @if (store.sidebarCollapsed()) {
            <ares-icon name="panel-left-expand-24-regular" [size]="16" />
          } @else {
            <ares-icon name="panel-left-contract-24-regular" [size]="16" />
          }
        </button>
      </div>

    </aside>
  `,
  styles: [`
    /* ─── Shell layout variables ───────────────────── */
    :host {
      display: contents; /* transparent wrapper */
    }

    .sidebar {
      width: var(--sidebar-width);
      min-width: var(--sidebar-width);
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      transition: width 240ms cubic-bezier(.4,0,.2,1),
                  min-width 240ms cubic-bezier(.4,0,.2,1);
      overflow: hidden;
      z-index: var(--z-elevated);
    }

    .sidebar--collapsed {
      width: var(--sidebar-collapsed-width);
      min-width: var(--sidebar-collapsed-width);
    }

    /* ─── Brand ────────────────────────────────────── */
    .sidebar__brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 18px 16px 16px;
      min-height: 60px; /* matches topbar height */
      border-bottom: 1px solid var(--border-subtle);
      overflow: hidden;
    }

    .brand-mark {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .brand-name {
      font-size: 14px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: 0.1em;
      line-height: 1;
    }

    .brand-sub {
      font-size: 9px;
      color: var(--text-tertiary);
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 3px;
      white-space: nowrap;
    }

    /* ─── Navigation ───────────────────────────────── */
    .sidebar__nav {
      flex: 1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 1px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    .nav-section-label {
      font-size: 9px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 10px 10px 4px;
      white-space: nowrap;
    }

    .nav-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: 6px 10px;
    }

    /* ─── Nav item ──────────────────────────────────── */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 8px;
      color: var(--text-tertiary);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: background 120ms ease, color 120ms ease;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      cursor: pointer;
      letter-spacing: -0.01em;

      &:hover {
        background: rgba(255,255,255,0.04);
        color: var(--text-secondary);
      }
    }

    /* Active state — thin left accent line */
    .nav-item--active {
      color: var(--text-primary) !important;
      background: rgba(255,255,255,0.06) !important;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 20%;
        bottom: 20%;
        width: 2px;
        background: var(--color-primary);
        border-radius: 0 2px 2px 0;
      }

      .nav-item__icon { color: var(--color-primary); }
    }

    .nav-item__icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 120ms ease;
    }

    .nav-item__label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ─── Badges ────────────────────────────────────── */
    .nav-badge {
      flex-shrink: 0;
      background: var(--color-danger);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 100px;
      min-width: 18px;
      text-align: center;
      line-height: 1.6;
    }

    .nav-badge-dot {
      position: absolute;
      top: 7px;
      right: 7px;
      width: 6px;
      height: 6px;
      background: var(--color-danger);
      border-radius: 50%;
      border: 1.5px solid var(--bg-surface);
    }

    /* ─── Footer ────────────────────────────────────── */
    .sidebar__footer {
      padding: 10px 8px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-height: 48px;
    }

    .system-status {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;
      flex: 1;
    }

    .status-label {
      font-size: 11px;
      color: var(--color-success);
      font-weight: 500;
      white-space: nowrap;
    }

    .collapse-btn {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: var(--text-tertiary);
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease;

      &:hover {
        background: rgba(255,255,255,0.06);
        color: var(--text-primary);
      }
    }
  `],
})
export class SidebarComponent {
  readonly store = inject(PlatformStore);

  /** Navigation grouped by section — Fluent icon names */
  readonly navGroups: NavGroup[] = [
    {
      items: [
        {
          path: 'dashboard',
          label: 'Dashboard',
          iconName: 'grid-24-regular',
        },
      ],
    },
    {
      label: 'Operations',
      items: [
        {
          path: 'devices',
          label: 'Device Fleet',
          iconName: 'phone-laptop-24-regular',
          badge: () => this.store.devices().filter(d => d.status === 'compromised').length || null,
        },
        {
          path: 'threats',
          label: 'Threat Intel',
          iconName: 'shield-error-24-regular',
          badge: () => this.store.criticalThreats().length || null,
        },
        {
          path: 'exercises',
          label: 'Live Exercises',
          iconName: 'play-circle-24-regular',
          badge: () => this.store.activeExercises().length || null,
        },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        {
          path: 'ai-defense',
          label: 'AI Defender',
          iconName: 'bot-24-regular',
        },
        {
          path: 'scenarios',
          label: 'Scenarios',
          iconName: 'branch-24-regular',
        },
      ],
    },
    {
      items: [
        {
          path: 'settings',
          label: 'Settings',
          iconName: 'settings-24-regular',
        },
      ],
    },
  ];
}
