/**
 * SkeletonComponent — Reusable loading placeholder.
 * Follows the .skeleton class from the global design system (styles.scss).
 * Usage:
 *   <ares-skeleton height="24px" width="60%" />
 *   <ares-skeleton type="card" />
 *   <ares-skeleton type="row" [rows]="5" />
 */
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonType = 'line' | 'card' | 'kpi' | 'row' | 'circle';

@Component({
  selector: 'ares-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type()) {

      @case ('kpi') {
        <div class="sk-kpi">
          <div class="skeleton sk-kpi__icon"></div>
          <div class="sk-kpi__body">
            <div class="skeleton sk-kpi__value"></div>
            <div class="skeleton sk-kpi__label"></div>
          </div>
        </div>
      }

      @case ('card') {
        <div class="sk-card skeleton" [style.height]="height()"></div>
      }

      @case ('row') {
        <div class="sk-rows">
          @for (r of rowsArray(); track $index) {
            <div class="sk-row">
              <div class="skeleton sk-row__dot"></div>
              <div class="skeleton sk-row__text"></div>
              <div class="skeleton sk-row__badge"></div>
            </div>
          }
        </div>
      }

      @case ('circle') {
        <div class="skeleton sk-circle" [style.width]="width()" [style.height]="width()"></div>
      }

      @default {
        <!-- type === 'line' (default) -->
        <div class="skeleton sk-line"
          [style.width]="width()"
          [style.height]="height()">
        </div>
      }
    }
  `,
  styles: [`
    /* All use the global .skeleton keyframe from styles.scss */
    .sk-line { border-radius: var(--radius-sm); }

    .sk-card {
      width: 100%;
      border-radius: var(--radius-lg);
    }

    .sk-circle { border-radius: 50%; }

    .sk-kpi {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg);
    }

    .sk-kpi__icon  { width: 40px; height: 40px; border-radius: var(--radius-md); flex-shrink: 0; }
    .sk-kpi__body  { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .sk-kpi__value { height: 28px; width: 60%; border-radius: var(--radius-sm); }
    .sk-kpi__label { height: 12px; width: 80%; border-radius: var(--radius-sm); }

    .sk-rows { display: flex; flex-direction: column; gap: 1px; }

    .sk-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .sk-row__dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .sk-row__text  { flex: 1; height: 13px; border-radius: var(--radius-sm); }
    .sk-row__badge { width: 50px; height: 20px; border-radius: 100px; flex-shrink: 0; }
  `],
})
export class SkeletonComponent {
  /** Skeleton display type */
  readonly type   = input<SkeletonType>('line');
  /** Height for 'line' and 'card' types */
  readonly height = input<string>('16px');
  /** Width for 'line' and 'circle' types */
  readonly width  = input<string>('100%');
  /** Number of rows for 'row' type */
  readonly rows   = input<number>(5);

  readonly rowsArray = computed(() => Array.from({ length: this.rows() }));
}
