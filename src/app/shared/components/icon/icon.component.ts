/**
 * AresIconComponent — Thin wrapper around Iconify Fluent icons.
 * Usage: <ares-icon name="shield-24-regular" [size]="20" />
 * All icons from: https://icon-sets.iconify.design/fluent/
 * DECISION: CDN-based Iconify (iconify.min.js in index.html) for zero-build-config.
 */
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'ares-icon',
  standalone: true,
  template: `<span class="iconify"
    [attr.data-icon]="'fluent:' + name()"
    [style.font-size.px]="size()"
    [style.width.px]="size()"
    [style.height.px]="size()"
    [style.display]="'inline-flex'"
    [style.align-items]="'center'"
    [style.flex-shrink]="'0'">
  </span>`,
})
export class AresIconComponent {
  /** Fluent icon name without the 'fluent:' prefix. E.g. 'shield-24-regular' */
  readonly name = input.required<string>();
  /** Icon size in px. Default: 18 */
  readonly size = input<number>(18);
}
