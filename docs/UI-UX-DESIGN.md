# UI-UX-DESIGN.md — Design System & UX Patterns

> Last updated: 2026-05-08 · Design Language: **2026 Calm Intelligence**

---

## Design Philosophy

Inspired by **Linear**, **Vercel**, and the **V0 Network Traffic Analyzer** template.

> *"Less is more. Whitespace as architecture. Color only for data."*

### Core Principles

1. **Whitespace as architecture** — Groups of information separated by space, not borders
2. **Typography-driven hierarchy** — Font weight/size/color replace decorative lines and boxes
3. **Color only for semantic data** — Red=threat, green=ok, cyan=active, amber=warning
4. **8px spacing scale** — All spacing in multiples of 4/8px
5. **No heavy shadows** — Ambient-only: `0 4px 12px rgba(0,0,0,0.5)` max
6. **Dark mode as baseline** — Thoughtfully designed dark environment, not just inverted colors

---

## Color System

### Background Layers (tonal, NOT pure black)

```scss
--bg-base:    #09090b;   // Page background (Zinc-950)
--bg-surface: #0e0e11;   // Sidebar, topbar
--bg-card:    #111113;   // Content panels
--bg-elevated:#18181b;   // Hover rows, active states
--bg-overlay: #27272a;   // Inputs, chips, badges
```

### Semantic Colors

```scss
--color-primary:   #22d3ee;  // Cyan — IPs, active accents, primary actions
--color-secondary: #8b5cf6;  // Violet — exercises, UDP protocol
--color-danger:    #ef4444;  // Red — threats, critical alerts
--color-warning:   #f59e0b;  // Amber — high severity, warnings
--color-success:   #10b981;  // Emerald — mitigated, online, healthy
--color-info:      #3b82f6;  // Blue — TCP, informational
```

### Protocol Badge Palette (V0-inspired)

```scss
--proto-tcp:   #3b82f6;  // Blue
--proto-udp:   #8b5cf6;  // Violet
--proto-http:  #22c55e;  // Green
--proto-https: #10b981;  // Emerald
--proto-dns:   #f59e0b;  // Amber
--proto-icmp:  #22d3ee;  // Cyan
--proto-ssh:   #f43f5e;  // Rose
--proto-ftp:   #eab308;  // Yellow
```

### Text Hierarchy

```scss
--text-primary:   #fafafa;  // Main content (near-white, not harsh)
--text-secondary: #a1a1aa;  // Labels, subtitles
--text-tertiary:  #52525b;  // Captions, placeholder text
--text-muted:     #3f3f46;  // Disabled, decorative separators
--text-accent:    #22d3ee;  // IP addresses, links, active values
```

### Borders (ultra-subtle)

```scss
--border-subtle:  rgba(255,255,255,0.05);  // Panel grid hairlines
--border-default: rgba(255,255,255,0.08);  // Card borders
--border-strong:  rgba(255,255,255,0.13);  // Active, focused
--border-primary: rgba(34,211,238,0.25);   // Accent border
```

---

## Typography

**Font**: Inter (variable, opsz 14–32) + JetBrains Mono for data

```scss
font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';  // OpenType features
```

### Scale

| Class | Size | Weight | Tracking | Usage |
|-------|------|--------|---------|-------|
| `.text-display` | 48px | 700 | -0.03em | Hero numbers |
| `.text-headline` | 28px | 700 | -0.02em | Page headers |
| `.text-title` | 18px | 600 | -0.01em | Section titles |
| `.text-body` | 13px | 400 | normal | Body content |
| `.text-caption` | 11px | 500 | +0.06em | Labels, uppercase |
| `.text-mono` | 12px | 400 | -0.01em | IPs, timestamps, IDs |

---

## Spacing Scale

Strict 8px base grid:

```scss
--sp-1:  4px;   --sp-2:  8px;   --sp-3: 12px;
--sp-4: 16px;   --sp-5: 20px;   --sp-6: 24px;
--sp-8: 32px;   --sp-10: 40px;  --sp-12: 48px;  --sp-16: 64px;
```

---

## Component Patterns

### KPI / Metric Strip

Horizontal layout: **icon (60px) → value (28px bold) → label (11px tertiary)**

```html
<div class="strip-stat">
  <ares-icon name="shield-error-24-regular" [size]="60" style="color:var(--color-danger)" />
  <div class="strip-stat__data">
    <div class="strip-stat__val">{{ count }}</div>
    <div class="strip-stat__lbl">Active Threats</div>
  </div>
</div>
```

### Protocol Badge

Color-coded pill by protocol type:

```html
<span class="proto-badge proto-badge--https">HTTPS</span>
<span class="proto-badge proto-badge--critical">THREAT</span>
```

### Panel / Card

Flat card (no shadow, 1px subtle border):

```html
<div class="panel">
  <div class="panel__hd">
    <span class="panel__title">Section Title</span>
    <a class="panel__link">View all</a>
  </div>
  <!-- content rows -->
</div>
```

### Tab Bar (V0-style)

```html
<div class="tab-bar">
  <button class="tab tab--active">Live Stream</button>
  <button class="tab">Statistics</button>
  <button class="tab">Exercises</button>
</div>
```

### Metric Row (Linear-style)

```html
<div class="mrow">
  <span class="mrow__label">Device Online</span>
  <div class="mrow__bar"><div class="mrow__fill" style="width:55%;background:#10b981"></div></div>
  <span class="mrow__val">55</span>
</div>
```

### Circular SVG Gauge

```html
<svg class="gauge__svg" viewBox="0 0 80 80">
  <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-default)" stroke-width="4"/>
  <circle cx="40" cy="40" r="32" fill="none" stroke="#22d3ee" stroke-width="4"
    stroke-dasharray="201" stroke-dashoffset="100"
    stroke-linecap="round" transform="rotate(-90 40 40)"/>
  <text x="40" y="36" text-anchor="middle" class="gauge__pct">55%</text>
  <text x="40" y="50" text-anchor="middle" class="gauge__sub">online</text>
</svg>
```

---

## Icon System

**Source**: Microsoft Fluent UI via [Iconify](https://icon-sets.iconify.design/fluent/)  
**Integration**: CDN script in `index.html` — zero build impact

### Usage

```html
<ares-icon name="shield-error-24-regular" [size]="40" style="color:var(--color-danger)" />
```

### Icon Map

| Feature area | Icon name | Size |
|-------------|-----------|------|
| Dashboard | `grid-24-regular` | 20 |
| Device Fleet | `phone-laptop-24-regular` | 20/40 |
| Threat Intel | `shield-error-24-regular` | 20/40/60 |
| Live Exercises | `play-circle-24-regular` | 20/60 |
| AI Defender | `bot-24-regular` | 20/60 |
| Scenarios | `branch-24-regular` | 20 |
| Settings | `settings-24-regular` | 20 |
| Mitigated | `shield-checkmark-24-regular` | 40 |
| Network | `wifi-1-24-regular` | 60 |
| Health | `shield-24-regular` | 40 |
| CVSS Score | `data-bar-vertical-24-regular` | 40 |
| Warning | `warning-24-regular` | 40 |
| Search | `search-24-regular` | 16 |
| Notifications | `alert-24-regular` | 20 |
| Collapse | `panel-left-contract-24-regular` | 18 |
| Expand | `panel-left-expand-24-regular` | 18 |

---

## Sidebar Navigation Rail

### Expanded (220px)

```
[ARES logo]  ARES
             Cyber Range · MVP
──────────────────────────────
             OPERATIONS
[icon]  Device Fleet     [9]
[icon]  Threat Intel     [9]
[icon]  Live Exercises   [3]
──────────────────────────────
             INTELLIGENCE
[icon]  AI Defender
[icon]  Scenarios
──────────────────────────────
[icon]  Settings
──────────────────────────────
● Operational        [⬅]
```

### Collapsed (60px)

```
[⬡]
────
[icon]  ← tooltip "Device Fleet" on hover
[icon]
[icon]
────
[icon]
[icon]
────
[icon]
────
●  [➡]
```

Active item: `3px` left accent line in `--color-primary`

---

## Responsive Behavior

| Breakpoint | Sidebar | Layout |
|-----------|---------|--------|
| > 1280px | Expanded (220px) | Full grid |
| 1024–1280px | Expanded | Reduced columns |
| < 1024px | Auto-collapse (60px) | Single column |
| < 768px | Hidden (overlay) | Mobile stack |
