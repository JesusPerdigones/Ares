# ARES Platform — Mobile Cyber Range

<div align="center">

```
    ⬡ ARES
Mobile Cyber Range Platform
```

**AI-powered mobile cyber defense simulation platform**  
Built with Angular 19 · Signals · TailwindCSS v4 · Fluent UI Icons · RxJS

[![Angular](https://img.shields.io/badge/Angular-19.2-DD0031?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Fluent Icons](https://img.shields.io/badge/Fluent_UI-Icons-0078D4?logo=microsoft)](https://icon-sets.iconify.design/fluent/)
[![Status](https://img.shields.io/badge/Status-MVP%20Pre--Seed-22d3ee)](.)

</div>

---

## 🎯 Product Vision

ARES is a **Mobile Cyber Range Platform** — a simulation environment for:

- **Virtualized Android Fleet Management** — Deploy and monitor 100+ virtual Android devices
- **Defensive Cyber Training** — Run red/blue/purple team exercises in isolated environments
- **Mobile Threat Intelligence** — Detect, analyze, and mitigate mobile-specific attack vectors
- **AI-Powered Defense** — Autonomous threat correlation, anomaly detection, and recommendations
- **Scenario Construction** — Build custom attack scenarios from a library of templates

**Target customers**: Defense contractors, MSSPs, enterprise security teams, government agencies, military cyber units.

**Inspiration**: Palantir Gotham · CrowdStrike Falcon · Cyberbit · Elastic Security · Linear · Vercel

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4200)
ng serve

# Build production bundle
ng build --configuration production
```

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── features/              # Lazy-loaded feature modules
│   │   ├── dashboard/         # Operational overview (tabbed: Stream/Stats/Exercises)
│   │   ├── devices/           # Device fleet management
│   │   ├── threats/           # Threat intelligence table + IoC detail
│   │   ├── exercises/         # Live exercise simulator
│   │   ├── ai-defense/        # AI analysis panel
│   │   ├── scenarios/         # Scenario builder
│   │   └── settings/          # Platform settings
│   ├── layout/
│   │   └── shell/             # Shell layout: sidebar rail + topbar
│   │       ├── sidebar.component.ts   # Collapsible icon-rail navigation
│   │       ├── topbar.component.ts    # Global search + breadcrumb + alerts
│   │       └── shell.component.ts     # Layout orchestrator
│   ├── shared/
│   │   └── components/
│   │       ├── icon/          # AresIconComponent (Iconify/Fluent wrapper)
│   │       └── skeleton/      # Loading skeleton component
│   ├── state/
│   │   └── platform.store.ts  # Signal-based global state (PlatformStore)
│   ├── models/
│   │   └── domain/            # TypeScript interfaces for all domain entities
│   ├── services/
│   │   └── mock/              # MockDataFactory (100 devices, 60 threats, ...)
│   └── app.routes.ts          # Lazy-loaded route configuration
├── styles.scss                # Global design tokens + utility classes
└── index.html                 # Iconify CDN integration
```

---

## 🎨 Design System (2026 Calm Intelligence)

Inspired by **Linear** and **Vercel** design language — "whitespace as architecture".

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#09090b` | Page background |
| `--bg-surface` | `#0e0e11` | Sidebar, topbar |
| `--bg-card` | `#111113` | Content panels |
| `--bg-elevated` | `#18181b` | Hover rows, active states |
| `--color-primary` | `#22d3ee` | Cyan — IPs, active accents |
| `--color-secondary` | `#8b5cf6` | Violet — exercises, UDP |
| `--color-danger` | `#ef4444` | Threats, critical alerts |
| `--color-success` | `#10b981` | Mitigated, online, healthy |
| `--color-warning` | `#f59e0b` | High severity, warnings |

### Protocol Badge Palette

| Protocol | Color |
|----------|-------|
| TCP | `#3b82f6` blue |
| UDP | `#8b5cf6` violet |
| HTTP | `#22c55e` green |
| HTTPS | `#10b981` emerald |
| DNS | `#f59e0b` amber |
| ICMP | `#22d3ee` cyan |
| SSH | `#f43f5e` rose |
| FTP | `#eab308` yellow |

### Icon System

All icons use **Fluent UI** via Iconify CDN (`@iconify/web`). Managed through `AresIconComponent`:

```html
<ares-icon name="shield-error-24-regular" [size]="40" style="color:var(--color-danger)" />
```

### Design Principles

1. **Whitespace as architecture** — separation by space, not borders
2. **Typography-driven hierarchy** — weight/size/color over decorative lines
3. **Color only for semantic data** — red=threat, green=ok, cyan=primary
4. **8px spacing scale** — `--sp-1` (4px) through `--sp-16` (64px)
5. **No heavy shadows** — ambient-only shadows: `0 4px 12px rgba(0,0,0,0.5)`

---

## 🧩 Key Components

### Dashboard
Tab-based operational view inspired by V0 Network Traffic Analyzer:
- **Live Stream tab** — Real-time event feed with protocol badges + timestamps
- **Statistics tab** — Circular SVG gauges, health score, protocol distribution, ranked lists
- **Exercises tab** — Active exercise progress tracker

### Sidebar (Icon Rail)
2026-style collapsible navigation:
- **Expanded (220px)**: Icon + label + badge count
- **Collapsed (60px)**: Icon only + tooltip on hover
- Thin left accent line for active route
- Sections: `OPERATIONS` (Devices, Threats, Exercises) · `INTELLIGENCE` (AI Defender, Scenarios)

### Topbar
- Reactive breadcrumb via `Router.events` + `toSignal()`
- Global search input
- System health bar
- Critical threat indicator badge
- Notification bell + user avatar

---

## 🏗️ Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for full system design.

**Core pattern**: Signal-based reactive state + lazy-loaded components + mock-first data layer.

```
PlatformStore (Signals)
    ├── devices():  Device[]      — 100 virtual Android devices
    ├── threats():  ThreatEvent[] — 60 threat detections
    ├── exercises():Exercise[]    — 15 cyber exercises
    ├── aiAnalyses():AIAnalysis[] — 20 AI analyses
    ├── scenarios():Scenario[]    — 25 attack scenarios
    └── liveEvent$: Observable   — Real-time event stream (RxJS)
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| [`docs/README.md`](docs/README.md) | Full product documentation |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design & component map |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Phase 0→3 product roadmap |
| [`docs/TASKS.md`](docs/TASKS.md) | Sprint task tracker |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Architecture Decision Records (ADR) |
| [`docs/UI-UX-DESIGN.md`](docs/UI-UX-DESIGN.md) | Design system & UX patterns |
| [`docs/AGENT.md`](docs/AGENT.md) | AI assistant behavioral rules |
| [`docs/DEBUGGING-AGENT.md`](docs/DEBUGGING-AGENT.md) | Debugging playbook |

---

## ⚠️ Known Issues

| Issue | Impact | Status |
|-------|--------|--------|
| Tailwind `@import` Sass deprecation warning | Zero — non-blocking | Pending Sass 3 stable |
| In-memory state (no persistence on reload) | Low — demo use only | Phase 1 backlog |
| No auth/login page | Medium | Phase 1 |
