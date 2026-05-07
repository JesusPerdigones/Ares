# ARCHITECTURE.md — System Architecture

## Overview

ARES Platform uses a **Clean Architecture** inspired, **DDD-flavored** frontend architecture with Angular 19+ Standalone Components, Signals API, and RxJS.

---

## Layer Structure

```
src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── services/            # App-wide services (auth, theme, notifications)
│   └── guards/              # Route guards
├── shared/                  # Reusable across features
│   ├── components/          # Generic UI components (MetricCard, Badge, etc.)
│   ├── directives/          # Custom directives
│   ├── pipes/               # Custom pipes
│   └── utils/               # Pure functions, helpers
├── features/                # Feature modules (each = bounded context)
│   ├── dashboard/
│   ├── devices/
│   ├── threats/
│   ├── exercises/
│   ├── ai-defense/
│   └── scenarios/
├── layout/                  # Shell, topbar, sidebar
├── models/                  # Domain models (TypeScript interfaces)
│   ├── domain/              # Pure domain models
│   └── dtos/                # API response shapes
├── services/                # Feature-agnostic services
│   ├── mock/                # All mock/fake data services
│   └── realtime/            # Stream/WebSocket abstractions
└── state/                   # Global state stores (Signal-based)
```

---

## Data Flow

```
Mock Service / WebSocket
        ↓
    Store (Signal)
        ↓
  Feature Component
        ↓
  Shared UI Components
```

**Rules**:
- Components READ from stores/signals
- Components DISPATCH actions via service methods
- Services update signals
- No component-to-component direct data sharing (use stores)

---

## State Management Strategy

**Angular Signals** (primary):
- `signal<T>()` for mutable state
- `computed<T>()` for derived state
- `effect()` for side effects
- `toSignal()` for RxJS → Signal bridge

**RxJS** (secondary, for async streams):
- Used for WebSocket streams, HTTP, timers
- Always converted to signals at the service boundary
- Always cleaned up with `takeUntilDestroyed()`

---

## Feature Architecture (per feature)

```
features/dashboard/
├── components/              # Feature-specific presentational components
├── containers/              # Smart containers (connect to stores)
├── services/                # Feature-specific services
└── dashboard.routes.ts      # Lazy-loaded routes
```

---

## Routing Architecture

```
AppRouter
├── /                     → redirect → /dashboard
├── /dashboard            → DashboardComponent (lazy)
├── /devices              → DeviceFleetComponent (lazy)
├── /threats              → ThreatIntelComponent (lazy)
├── /exercises            → ExercisesComponent (lazy)
├── /ai-defense           → AIDefenseComponent (lazy)
├── /scenarios            → ScenariosComponent (lazy)
└── /settings             → SettingsComponent (lazy)
```

All routes wrapped in `ShellLayoutComponent`.

---

## Mock Infrastructure

For the MVP, all data comes from mock services that simulate real backend behavior:

```typescript
// Future swap pattern
// MVP: MockDeviceService → Device[]
// Production: HttpDeviceService → Observable<Device[]>
// Both implement DeviceServiceInterface
```

Using Angular's injection token pattern for swappable implementations.

---

## Future Backend Integration Points

| Current (Mock) | Future (Real) |
|----------------|---------------|
| `MockDeviceService` | REST API + WebSocket |
| `MockThreatService` | Kafka consumer via WS proxy |
| `MockExerciseService` | Docker-Android orchestration API |
| `MockAIService` | LLM/ML inference service |
| Signal intervals | Real WebSocket events |
| Hardcoded assets | S3 / CDN |

---

## Performance Patterns

- **Lazy loading**: All feature routes lazy-loaded
- **OnPush simulation**: Signals naturally trigger change detection only when changed
- **Virtual scrolling**: CDK Virtual Scroll for large device lists
- **TrackBy**: All ngFor loops use trackBy
- **Debounce**: All search inputs debounced (300ms)

---

## Multi-Tenant Readiness

The architecture is prepared for multi-tenancy via:
- `TenantContextService` stub (injectable)
- Route prefix structure supports `/org/:orgId/...`
- All API calls will include tenant headers (HTTP interceptor stub)
- State stores scoped per workspace (design pattern in place)
