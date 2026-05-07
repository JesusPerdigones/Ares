# DECISIONS.md — Architecture Decision Records (ADR)

> Format: ADR-NNN | Status | Decision | Context | Consequences

---

## ADR-001: Angular 19 Standalone Components (No NgModules)

**Status**: ✅ Accepted  
**Date**: 2026-05-07

**Decision**: Use exclusively standalone components. No NgModules.

**Context**: Angular 19 makes standalone the default and preferred approach. NgModules add boilerplate without benefit for a new project.

**Consequences**:
- (+) Less boilerplate, explicit imports per component
- (+) Tree-shakeable by default
- (+) Lazy loading at component level
- (-) Developers must import dependencies explicitly (but this is good practice)

---

## ADR-002: Angular Signals as Primary State Mechanism

**Status**: ✅ Accepted  
**Date**: 2026-05-07

**Decision**: Use Angular Signals (`signal()`, `computed()`, `effect()`) for all UI state. Use RxJS only for async streams, timers, and WebSocket.

**Context**: The project required reactive state without the complexity of NgRx. Signals are Angular-native, require no extra dependencies, and integrate perfectly with templates.

**Consequences**:
- (+) Zero extra dependencies for state management
- (+) Automatic change detection optimization
- (+) Simple mental model (no actions/reducers/selectors)
- (+) Templates auto-update when signals change
- (-) Less tooling than NgRx DevTools (acceptable for MVP)
- (-) Cannot time-travel debug (planned for future with NgRx if needed)

---

## ADR-003: Single PlatformStore vs Feature Stores

**Status**: ✅ Accepted (with review point)  
**Date**: 2026-05-07

**Decision**: Use a single `PlatformStore` for MVP. Review when platform exceeds 10+ features.

**Context**: At MVP scale, splitting into feature stores adds complexity without benefit. The single store handles 5 domain entities cleanly.

**Consequences**:
- (+) Simpler dependency injection, one inject() per component
- (+) All data accessible from any component
- (-) May become large (monitor: target < 300 lines)
- **Review trigger**: When store exceeds 300 lines or 8+ domain entities

---

## ADR-004: Tailwind CSS v4 (CSS-First, No Config File)

**Status**: ✅ Accepted  
**Date**: 2026-05-07

**Decision**: Use Tailwind v4 which requires no `tailwind.config.js`. Use CSS custom properties for design tokens.

**Context**: User explicitly requested Tailwind. v4 was installed as the latest version. It uses a CSS-first approach incompatible with v3 config files.

**Consequences**:
- (+) No config file maintenance
- (+) CSS custom properties give full design token control
- (+) Utility classes available globally
- (-) @import deprecation warning from Dart Sass (non-blocking)
- (-) Some v3 community plugins not compatible

**Workaround for @import warning**: Warning is non-blocking. Moving `@import "tailwindcss"` to top of file would break SCSS cascade — accepted as known limitation until Sass 3 stable.

---

## ADR-005: Mock-First Architecture with Swappable Implementations

**Status**: ✅ Accepted  
**Date**: 2026-05-07

**Decision**: Build MVP fully with mock data. Design all services to be swappable via Angular injection token pattern.

**Context**: No backend exists yet. We need a working demo without blocking on backend development.

**Consequences**:
- (+) Full frontend development without backend dependency
- (+) Realistic demo with 100 devices, 60 threats, 20 AI analyses
- (+) Real-time simulation via RxJS gives "live platform" feel
- (-) No data persistence (acceptable for MVP)
- **Migration path**: Replace `MockXService` with `HttpXService` implementing same interface

---

## ADR-006: No NgRx for MVP

**Status**: ✅ Accepted  
**Date**: 2026-05-07

**Decision**: Skip NgRx. Use Angular Signals + services.

**Context**: NgRx adds ~40KB bundle, requires boilerplate, and is overkill for MVP scale. Signals achieve same reactivity with zero overhead.

**Migration path if needed**: Introduce NgRx Component Store feature-by-feature when team > 3 developers or features > 15.

---

## ADR-007: Arrow Functions Forbidden in Angular Templates

**Status**: ✅ Accepted (discovered via bug)  
**Date**: 2026-05-07

**Problem found**: `(click)="signal.update(v => !v)"` causes NG5002 parser error.

**Decision**: All logic in templates must be method calls. Arrow functions must be in class methods.

**Pattern**:
```typescript
// In template: (click)="toggleValue()"
// In class:
toggleValue(): void {
  this.mySignal.update(v => !v);
}
```

**Also**: `<` operator in `@if` blocks must be extracted to methods or use `$last`.

---

## ADR-008: Readonly Arrays in Generic Helper Functions

**Status**: ✅ Accepted (discovered via bug)  
**Date**: 2026-05-07

**Problem found**: `const pick = <T>(arr: T[])` fails with `as const` arrays (TypeScript strict mode).

**Decision**: All array utility functions must accept `readonly T[]`:
```typescript
const pick = <T>(arr: readonly T[]): T => arr[...];
```

**Context**: TypeScript strict mode treats `as const` arrays as `readonly`. The `pick()` helper in the mock factory was changed from `T[]` to `readonly T[]`.

---

## ADR-009: Lazy Loading for ALL Feature Routes

**Status**: ✅ Accepted  
**Date**: 2026-05-07

**Decision**: Every feature route uses `loadComponent()`. No eagerly loaded feature components.

**Consequence**: Initial bundle ~128KB (excellent). Each feature loads only when navigated to.

---

## ADR-010: Fluent UI Icons via Iconify CDN (no build step)

**Status**: ✅ Accepted  
**Date**: 2026-05-08

**Decision**: Use Microsoft Fluent UI icon set delivered via Iconify CDN script in `index.html`. Wrap in `AresIconComponent`.

**Context**: The platform needed a cohesive, professional icon system to replace emoji-based iconography. Fluent UI was chosen for its enterprise aesthetic (Palantir/Microsoft tooling alignment).

**Consequences**:
- (+) Zero build configuration — CDN delivery
- (+) 2000+ icons available without importing individual SVGs
- (+) Single `AresIconComponent` abstraction — easy to swap icon set later
- (+) `[name]` and `[size]` inputs allow dynamic icon binding
- (-) Requires internet connection in dev (acceptable — CDN cached)
- (-) Not tree-shaken (icons loaded on demand by Iconify runtime)

**Pattern**:
```html
<ares-icon name="shield-error-24-regular" [size]="40" style="color:var(--color-danger)" />
```

---

## ADR-011: 2026 Calm Intelligence Design System

**Status**: ✅ Accepted  
**Date**: 2026-05-08

**Decision**: Replace the original "cyber glow" aesthetic (colored borders, backdrop-filter cards, heavy shadows) with a "Calm Intelligence" system inspired by Linear, Vercel, and the V0 Network Traffic Analyzer template.

**Context**: Research into 2026 UI/UX trends identified "whitespace as architecture", "typography-driven hierarchy", and "color only for semantic data" as the dominant patterns in enterprise data tools. The original design felt dated and cluttered.

**Key changes**:
- Background: `#0c0c0e` → `#09090b` (V0/Zinc-950)
- Borders: removed decorative borders, kept only structural `rgba(255,255,255,0.05-0.08)`
- Cards: no backdrop-filter (GPU cost), flat `var(--bg-card)` backgrounds
- Bars: 6px → 2px height (data speaks, not decoration)
- KPI layout: stacked cards → horizontal icon (60px) + value + label strip
- Dashboard: single-view → tabbed (Live Stream / Statistics / Exercises)
- Color: `#00d4ff` primary → `#22d3ee` (warmer cyan, closer to Tailwind cyan-400)

**Consequences**:
- (+) Dramatically reduced visual noise — easier data scanning
- (+) Better performance (no backdrop-filter blur on every card)
- (+) Cohesive semantic color system (protocol badges, severity indicators)
- (+) Scalable design tokens (trivial to update entire palette via CSS vars)
- (-) Requires updating each feature component styles (done for Dashboard, Threats; pending Devices, Exercises, AI Defender)
- **Review**: Apply same horizontal icon + stat pattern to all remaining KPI sections
