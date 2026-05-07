# TASKS.md — Project Task Tracker

> Auto-updated during development. Priority: 🔴 Critical · 🟡 High · 🟢 Medium · ⚪ Low

---

## ✅ Completed Tasks

### Sprint 0 — Foundation
- [x] 🔴 Angular 19 project scaffold with standalone components
- [x] 🔴 TailwindCSS v4 + SCSS integration
- [x] 🔴 Domain model types (`/models/domain/index.ts`)
- [x] 🔴 Mock data factory (100 devices, 60 threats, 20 AI analyses, 25 scenarios)
- [x] 🔴 PlatformStore — Signal-based global state
- [x] 🔴 Real-time simulation (RxJS intervals + Subject streams)
- [x] 🔴 App routing with lazy loading (all 7 routes)
- [x] 🔴 Shell layout — sidebar + topbar + page content

### Sprint 1 — Core Features
- [x] 🔴 Dashboard — KPIs, health, threats, events, exercises, categories
- [x] 🔴 Device Fleet — grid, filters, search, detail panel
- [x] 🔴 Threat Intelligence — sortable table, severity/status filter, IoC detail
- [x] 🔴 Live Exercise Simulator — exercise list, objectives, live event feed
- [x] 🔴 AI Defender Panel — analyses, recommendations, anomalies, correlations
- [x] 🔴 Scenario Builder — template library, config form, attack chain preview
- [x] 🔴 Settings — platform info, integrations, about

### Sprint 2 — Documentation
- [x] 🟡 `/docs/AGENT.md` — AI behavior & quality rules
- [x] 🟡 `/docs/ARCHITECTURE.md` — System design
- [x] 🟡 `/docs/SKILLS.md` — Technical patterns & memory
- [x] 🟡 `/docs/UI-UX-DESIGN.md` — Visual design system
- [x] 🟡 `/docs/DEBUGGING-AGENT.md` — Debugger manual
- [x] 🟡 `/docs/ROADMAP.md` — Product roadmap
- [x] 🟡 `/docs/DECISIONS.md` — Architecture decision records

### Sprint 3 — 2026 UI Overhaul (COMPLETED 2026-05-08)
- [x] 🔴 Fluent UI icon system via Iconify CDN
- [x] 🔴 `AresIconComponent` — unified Fluent icon wrapper
- [x] 🔴 Sidebar: 2026 icon-rail with collapse/expand, section groups, active accent
- [x] 🔴 Topbar: reactive breadcrumb (`Router.events` + `toSignal`), global search
- [x] 🔴 Global design system rewrite — 2026 Calm Intelligence (`#09090b` base, tonal grays)
- [x] 🔴 Protocol badge color palette (TCP/UDP/HTTP/HTTPS/DNS/ICMP/SSH/FTP)
- [x] 🔴 Dashboard: V0-inspired tab switcher (Live Stream / Statistics / Exercises)
- [x] 🔴 Dashboard: Circular SVG gauges for Device Fleet + System Health
- [x] 🔴 Dashboard: Metric strip with 60px Fluent icons + horizontal layout
- [x] 🔴 Dashboard: Protocol distribution, ranked threat list, fleet breakdown
- [x] 🔴 Threat Intelligence: KPI cards with 40px Fluent icons (horizontal layout)
- [x] 🟡 All features: emoji → Fluent icon migration (Dashboard, Devices, Threats, Exercises, AI Defender, Scenarios)

---

## 🔄 In Progress

- [ ] 🔴 Verify all routes load without runtime errors after icon migration
- [ ] 🟡 AI Defender: add 40px KPI icons (same pattern as Threats)
- [ ] 🟡 Devices: add 40px KPI icons
- [ ] 🟡 Exercises: add 40px KPI icons

---

## 📋 Pending — MVP Polish

### P1 — Critical for Demo
- [ ] 🔴 AI Defender: KPI cards → horizontal icon + stat layout (40px icons)
- [ ] 🔴 Device Fleet: KPI cards → horizontal icon + stat layout (40px icons)
- [ ] 🔴 Exercises: KPI cards → horizontal icon + stat layout (40px icons)
- [ ] 🔴 Responsive: tablet layout (sidebar collapse at 1024px)
- [ ] 🟡 Toast notification system (live alerts from `liveEvent$`)
- [ ] 🟡 Empty states for all views (when filtered results = 0)

### P2 — High Value
- [ ] 🟡 Device detail: quarantine action confirmation modal
- [ ] 🟡 Threat table: column sorting (click headers)
- [ ] 🟡 Exercise detail: real-time objective completion animation
- [ ] 🟡 Dashboard: world map SVG for threat origin geo-visualization
- [ ] 🟡 Scenario Builder: form validation messages
- [ ] 🟢 Settings: notification preferences toggle
- [ ] 🟢 Keyboard shortcuts (Cmd+K for global search)
- [ ] 🟢 Notification center slide-in panel (Bell icon click)

### P3 — Next Phase
- [ ] ⚪ Dark/light mode toggle (design token based)
- [ ] ⚪ Print/export button stubs
- [ ] ⚪ Route transition animations (`@angular/animations`)
- [ ] ⚪ Accessibility audit (WCAG 2.1 AA)

---

## 🚫 Out of Scope (MVP)

- Real backend/API
- Authentication (login page)
- Multi-tenant support
- Real WebSocket connection
- Docker-Android integration
- AI model integration (LLM)
- Data persistence (IndexedDB)

---

## Dependency Graph

```
Domain Models (interfaces)
    └── MockDataFactory (100 devices, 60 threats, 20 AI, 25 scenarios)
           └── PlatformStore (Angular Signals)
                  ├── ShellComponent (sidebar + topbar layout)
                  │     ├── SidebarComponent (icon-rail, collapsible)
                  │     └── TopbarComponent (search, breadcrumb, alerts)
                  ├── DashboardComponent (tabbed: stream/stats/exercises)
                  ├── DevicesComponent (grid + detail panel)
                  ├── ThreatsComponent (table + IoC panel)
                  ├── ExercisesComponent (list + live feed)
                  ├── AiDefenseComponent (analyses + recommendations)
                  ├── ScenariosComponent (builder + chain preview)
                  └── SettingsComponent
```
