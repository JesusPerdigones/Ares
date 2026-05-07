# ROADMAP.md — Product & Technical Roadmap

---

## Phase 0 — MVP Pre-Seed ✅ COMPLETED
**Goal**: Demonstrate concept, attract first conversations.

### ✅ Completed
- [x] Angular 19 project setup with standalone components
- [x] TailwindCSS v4 integration + SCSS design system
- [x] Signal-based global state (PlatformStore)
- [x] Shell layout: collapsible icon-rail sidebar + topbar with breadcrumb
- [x] Dashboard: V0-inspired tabbed view (Live Stream / Statistics / Exercises)
  - Circular SVG gauges, metric strip with 60px Fluent icons, protocol badges
  - Ranked threat list, fleet breakdown, protocol distribution
- [x] Device Fleet: 100 mock devices, filters, search, live metrics, detail panel
- [x] Threat Intelligence: table, severity filter, IoC panel, KPI cards with icons
- [x] Live Exercise Simulator: real-time event stream, objectives tracker
- [x] AI Defender Panel: analyses, recommendations, anomalies, correlations
- [x] Scenario Builder: template library, config form, attack chain preview
- [x] Settings page
- [x] Mock real-time simulation (RxJS intervals + BehaviorSubject)
- [x] Full documentation system (/docs)
- [x] **2026 Calm Intelligence design system** (V0/Linear/Vercel-inspired)
  - Fluent UI icons via Iconify CDN (zero-build)
  - `AresIconComponent` — unified icon wrapper
  - `#09090b` near-black base + tonal gray layers
  - Protocol badge color palette
  - Typography-driven hierarchy (no decorative borders)
  - 8px spacing scale with CSS custom properties

---

## Phase 1 — Seed Round Demo (Q3 2026)
**Goal**: Live demo for investors with real data pipeline stub.

### UI Completion (immediate)
- [ ] AI Defender: KPI cards → 40px Fluent icon + horizontal layout
- [ ] Device Fleet: KPI cards → 40px Fluent icon + horizontal layout
- [ ] Exercises: KPI cards → 40px Fluent icon + horizontal layout
- [ ] World map SVG (threat origin geo-visualization on Dashboard)
- [ ] Toast notification system (live alerts)
- [ ] Keyboard shortcut: Cmd+K for global search
- [ ] Notification center slide-in panel

### Backend Integration
- [ ] NestJS/FastAPI backend scaffold
- [ ] Real WebSocket connection (replace mock Subject)
- [ ] REST API for devices, threats, exercises
- [ ] JWT auth flow (login page)
- [ ] HTTP interceptor with auth headers

### Docker-Android Integration
- [ ] Docker-Android farm API client
- [ ] Real device enrollment flow
- [ ] Device screenshot streaming (MJPEG)
- [ ] Appium test runner integration

### AI Integration
- [ ] LLM API integration (OpenAI/Anthropic/local Ollama)
- [ ] Real anomaly detection endpoint
- [ ] AI recommendation engine
- [ ] Replace mock AIAnalysis with real responses

### Persistence
- [ ] IndexedDB via `@angular/common` Storage
- [ ] Platform state survives browser reload
- [ ] Exercise history log

---

## Phase 2 — Beta (Q4 2026)
**Goal**: First paying customers, multi-tenant foundation.

### Multi-Tenancy
- [ ] Organization model (org/workspace/user hierarchy)
- [ ] Tenant-scoped API calls (HTTP interceptor)
- [ ] Role-based access control (RBAC)
- [ ] Separate tenant data isolation

### Observability
- [ ] OpenTelemetry frontend instrumentation
- [ ] Error tracking (Sentry)
- [ ] User analytics (privacy-first, self-hosted)
- [ ] Performance monitoring dashboard

### Event Streaming
- [ ] WebSocket proxy to Kafka consumer
- [ ] Real-time event replay
- [ ] Event sourcing for exercise history
- [ ] Time-travel debugging for exercises

### Platform Features
- [ ] Exercise scheduling and automation
- [ ] Report generation (PDF export)
- [ ] Custom scenario scripting (YAML-based DSL)
- [ ] API key management for integrations
- [ ] Webhook support for external SIEM

---

## Phase 3 — Scale (2027)
**Goal**: Enterprise product, Kubernetes-native.

### Infrastructure
- [ ] Kubernetes deployment manifests (Helm charts)
- [ ] Horizontal scaling for device farm
- [ ] Multi-region support
- [ ] SLA monitoring and alerting

### Enterprise Features
- [ ] SSO (SAML 2.0, OIDC)
- [ ] Audit logs (immutable, append-only)
- [ ] Data residency controls
- [ ] Custom branding (white-label)
- [ ] Advanced BI integration

### AI Evolution
- [ ] Custom threat model fine-tuning
- [ ] Federated learning for privacy
- [ ] Autonomous response automation
- [ ] Threat prediction (time-series ML)

---

## Controlled Technical Debt

| Item | Impact | Resolution Plan |
|------|--------|----------------|
| Tailwind `@import` Sass warning | Zero — non-blocking | Migrate when Sass 3 stable |
| Mock data in store constructor | Medium | Extract to async `DataService` in Phase 1 |
| No route guards | Medium | Add `AuthGuard` in Phase 1 with login page |
| No error boundary | Medium | Add `ErrorBoundaryComponent` in MVP Polish |
| In-memory state (no persistence) | Low | `IndexedDB` in Phase 1 |
| Single `PlatformStore` | Low (monitor) | Split if >300 lines or >8 domain entities |
