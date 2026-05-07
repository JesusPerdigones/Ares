# SKILLS.md — Technical Memory & Patterns

> **AI AGENT**: Read this file before implementing anything. It contains the canonical patterns for this project.

---

## 1. Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Angular | 19.2.x | Standalone components only |
| Language | TypeScript | ~5.7 | Strict mode enforced |
| State | Angular Signals | Native | Primary state mechanism |
| Async | RxJS | ~7.8 | Streams, timers, WebSocket |
| Styling | TailwindCSS | 4.x | CSS-first, no config file |
| CSS Extension | SCSS | via Angular | Global styles + component styles |
| UI Library | Angular CDK | 19.x | Virtual scroll, overlay |
| UI Library | Angular Material | 19.x | Only when genuinely needed |
| Routing | Angular Router | 19.x | Lazy loading, input binding |
| HTTP | Angular HttpClient | 19.x | With interceptors |

---

## 2. Angular 19+ Conventions

### Standalone Components (MANDATORY)
```typescript
@Component({
  selector: 'ares-my-component',
  standalone: true,                    // always
  imports: [CommonModule, RouterLink], // explicit imports
  template: `...`,                     // inline for small components
  // templateUrl: './my.component.html' // for complex templates
  changeDetection: ChangeDetectionStrategy.OnPush, // when not using signals
})
export class MyComponent { }
```

### Signals API (PRIMARY state mechanism)
```typescript
// ✅ Writable signal
readonly count = signal<number>(0);

// ✅ Computed (auto-memoized derived state)
readonly doubled = computed(() => this.count() * 2);

// ✅ Effect (side effects — use sparingly)
constructor() {
  effect(() => {
    console.log('Count changed:', this.count());
  });
}

// ✅ Signal mutation
this.count.set(5);
this.count.update(n => n + 1);

// ✅ Input signals (Angular 17+)
readonly title = input.required<string>();
readonly size = input<'sm' | 'md' | 'lg'>('md');
```

### RxJS → Signal Bridge
```typescript
// ✅ Convert Observable to Signal
readonly data = toSignal(this.service.getData(), { initialValue: [] });

// ✅ Always clean up subscriptions
private sub = this.stream$.pipe(
  takeUntilDestroyed()  // preferred over ngOnDestroy
).subscribe(val => this.signal.set(val));
```

### Lifecycle + Subscriptions Pattern
```typescript
// ✅ Use takeUntilDestroyed for auto-cleanup
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interval(1000).pipe(
  takeUntilDestroyed()
).subscribe(() => this.tick());

// ✅ Manual cleanup when needed (OnInit + OnDestroy)
export class MyComponent implements OnInit, OnDestroy {
  private _sub?: Subscription;
  ngOnInit()    { this._sub = this.stream$.subscribe(...); }
  ngOnDestroy() { this._sub?.unsubscribe(); }
}
```

---

## 3. Angular Template Restrictions

> These patterns cause compile errors — NEVER use them in templates:

```html
<!-- ❌ Arrow functions in templates -->
(click)="signal.update(v => !v)"

<!-- ✅ Extract to class method -->
(click)="toggleValue()"

<!-- ❌ Less-than operator in templates -->
@if ($index < array.length - 1)

<!-- ✅ Use $last built-in or extract to method -->
@for (item of items; track item; let last = $last) {
  @if (!last) { ... }
}

<!-- ❌ Complex expressions in templates -->
{{ items.filter(i => i.active).length }}

<!-- ✅ Use computed() -->
readonly activeCount = computed(() => this.items().filter(i => i.active).length);
```

---

## 4. Tailwind v4 Usage

Tailwind v4 is CSS-first — no `tailwind.config.js` needed:

```scss
/* styles.scss — import once at root */
@import "tailwindcss";

/* Custom design tokens (complement Tailwind) */
:root {
  --color-primary: #00d4ff;
}
```

**Pattern**: Use Tailwind utility classes for layout/spacing, use CSS custom properties for design tokens, use SCSS for complex component styles.

---

## 5. Store Pattern (Signal-based)

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureStore {
  // 1. Private writable state
  private readonly _items = signal<Item[]>([]);

  // 2. Public readonly view
  readonly items = this._items.asReadonly();

  // 3. Derived state
  readonly activeItems = computed(() => this._items().filter(i => i.active));

  // 4. Actions (explicit methods)
  addItem(item: Item): void {
    this._items.update(items => [...items, item]);
  }

  removeItem(id: string): void {
    this._items.update(items => items.filter(i => i.id !== id));
  }
}
```

---

## 6. Service Architecture Patterns

### Swappable Implementation Pattern (for future backend)
```typescript
// Interface (domain layer)
export interface DeviceServiceInterface {
  getDevices(): Observable<AndroidDevice[]>;
  getDevice(id: string): Observable<AndroidDevice>;
}

// Injection token
export const DEVICE_SERVICE = new InjectionToken<DeviceServiceInterface>('DeviceService');

// MVP: Mock implementation
@Injectable()
export class MockDeviceService implements DeviceServiceInterface { ... }

// Future: Real implementation
@Injectable()
export class HttpDeviceService implements DeviceServiceInterface { ... }

// Provider (swap here to go production):
{ provide: DEVICE_SERVICE, useClass: MockDeviceService }
```

---

## 7. Performance Patterns

```typescript
// ✅ TrackBy in @for (ALWAYS)
@for (device of devices(); track device.id) { ... }

// ✅ OnPush Change Detection (with Signals, this is automatic)
changeDetection: ChangeDetectionStrategy.OnPush

// ✅ Lazy loading (ALL feature routes)
loadComponent: () => import('./feature/feature.component').then(m => m.FeatureComponent)

// ✅ Virtual scroll for large lists (Angular CDK)
<cdk-virtual-scroll-viewport itemSize="64" style="height: 500px">
  <div *cdkVirtualFor="let item of items">{{ item.name }}</div>
</cdk-virtual-scroll-viewport>

// ✅ Debounce search inputs
searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  takeUntilDestroyed()
).subscribe(term => this.search(term));
```

---

## 8. Security Frontend Patterns

```typescript
// ✅ Use DomSanitizer for dynamic HTML
constructor(private sanitizer: DomSanitizer) {}
safeHtml = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.rawHtml()));

// ✅ Never use innerHTML directly
// ❌ element.innerHTML = userInput;

// ✅ Type all API responses
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ✅ HTTP Interceptor for auth headers (future)
// ❌ Never hardcode API keys or tokens
```

---

## 9. File & Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Component files | `kebab-case.component.ts` | `device-card.component.ts` |
| Service files | `kebab-case.service.ts` | `platform.store.ts` |
| Model files | `kebab-case.model.ts` | `device.model.ts` |
| Selectors | `ares-` prefix | `ares-metric-card` |
| Signal names | camelCase, no $ | `deviceList`, `isLoading` |
| Observable names | camelCase + $ | `devices$`, `events$` |
| Constants | SCREAMING_SNAKE | `DEVICE_SERVICE` |
| Types/Interfaces | PascalCase | `AndroidDevice`, `ThreatEvent` |

---

## 10. Reactive Patterns

```typescript
// ✅ Combine multiple signals
readonly summary = computed(() => ({
  total: this.devices().length,
  online: this.devices().filter(d => d.status === 'online').length,
  threats: this.threats().filter(t => t.status === 'active').length,
}));

// ✅ Mock WebSocket stream pattern
private readonly _stream$ = interval(5000).pipe(
  map(() => this._generateEvent()),
  share(),
  takeUntilDestroyed()
);

// ✅ Convert stream to signal
readonly latestEvent = toSignal(this._stream$, { initialValue: null });
```
