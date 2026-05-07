/**
 * ShellComponent — Root layout orchestrator.
 * Composes: SidebarComponent + TopbarComponent + RouterOutlet.
 * Single Responsibility: layout grid + loading gate only.
 * Lines target: < 100 (AGENT.md constraint).
 */
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlatformStore } from '../../state/platform.store';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';

@Component({
  selector: 'ares-shell',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell" [class.shell--collapsed]="store.sidebarCollapsed()">

      <!-- Sidebar: navigation + brand + collapse toggle -->
      <ares-sidebar />

      <!-- Main area: topbar + routed page content -->
      <div class="main-area">
        <ares-topbar />

        <main class="page-content" id="page-content">
          @if (store.isLoading()) {
            <div class="loading-overlay">
              <div class="loading-spinner"></div>
              <p class="loading-text">Initializing ARES Platform...</p>
            </div>
          } @else {
            <router-outlet />
          }
        </main>
      </div>

    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-base);
    }

    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 24px;
    }

    /* ── Loading overlay ─────────────────── */
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 16px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 2px solid var(--border-default);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      color: var(--text-tertiary);
      font-size: 13px;
      font-family: var(--font-mono);
    }
  `],
})
export class ShellComponent {
  /** DECISION: Store injected here only to gate the loading overlay.
   *  All child components inject PlatformStore independently per SOLID D principle. */
  readonly store = inject(PlatformStore);
}
