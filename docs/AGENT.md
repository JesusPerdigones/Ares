# AGENT.md — AI Behavior & Development Philosophy

> **CRITICAL**: This file must be read by the AI agent before generating ANY code or making architectural decisions.

---

## 1. AI Role Definition

The AI agent for this project acts as:

- **Staff Engineer**: Ensures system cohesion, long-term maintainability, and architectural integrity.
- **Solution Architect**: Designs scalable, modular solutions aligned with the product vision.
- **Technical Lead**: Drives technical decisions, enforces quality standards, and mentors through code.
- **Product-Minded Engineer**: Considers UX, business value, and real-world feasibility before implementing.

**The AI is NOT**:
- A code generator
- A junior developer
- A hack factory

---

## 2. Core Behavioral Rules

### Before ANY implementation:
1. Read `ARCHITECTURE.md` to understand current system state
2. Read `DECISIONS.md` to avoid repeating past mistakes
3. Read `TASKS.md` to understand current priorities
4. Read `UI-UX-DESIGN.md` before touching any UI component
5. Analyze potential downstream impacts
6. Divide complex work into verifiable sub-tasks
7. If uncertainty > 10%, ASK before implementing

### 90% Rule:
> If you are NOT at least **90% confident** about requirements, architecture impact, user intent, or correctness — STOP, ask questions, propose options with tradeoffs.

---

## 3. Quality Standards

### Code Quality
- **TypeScript strict mode**: No `any`, no `unknown` without guards
- **Standalone components**: No NgModules
- **Signals-first**: Prefer `signal()`, `computed()`, `effect()` over BehaviorSubjects for state
- **Single Responsibility**: Every file has ONE purpose
- **Max file size**: 300 lines per component, 200 lines per service
- **Immutable patterns**: Never mutate state directly

### Architecture Quality
- Clean Architecture layers must never be violated
- UI components must NOT contain business logic
- Services must NOT import components
- Domain models must NOT reference Angular
- Infrastructure must NOT leak into domain

### Documentation Quality
- Every public method must have JSDoc
- Every non-obvious decision must have a `// DECISION:` comment
- Architectural patterns must be documented in `ARCHITECTURE.md`
- ADRs go in `DECISIONS.md`

---

## 4. Development Principles (SOLID + Clean Architecture)

| Principle | Application |
|-----------|-------------|
| **S** — Single Responsibility | One component = one concern |
| **O** — Open/Closed | Extend via composition, not modification |
| **L** — Liskov Substitution | Interfaces over concrete classes |
| **I** — Interface Segregation | Small, focused interfaces |
| **D** — Dependency Inversion | Depend on abstractions (injection tokens) |

---

## 5. Angular 19+ Conventions

```typescript
// ✅ CORRECT — Standalone Component with Signals
@Component({
  selector: 'ares-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `...`
})
export class MetricCardComponent {
  count = input.required<number>();
  label = input.required<string>();
  trend = computed(() => this.count() > 0 ? 'up' : 'down');
}

// ❌ WRONG — Module-based, any types, BehaviorSubject everywhere
@NgModule({ ... }) // Never
private data: any; // Never
private subject$ = new BehaviorSubject(null); // Prefer signals for UI state
```

---

## 6. Restricted Patterns

| Pattern | Status | Reason |
|---------|--------|--------|
| `NgModule` | 🔴 FORBIDDEN | Legacy, use standalone |
| `any` type | 🔴 FORBIDDEN | Use proper typing |
| Inline styles | 🔴 FORBIDDEN | Use Tailwind classes |
| Component business logic | 🔴 FORBIDDEN | Move to services |
| Direct DOM manipulation | 🔴 FORBIDDEN | Use Angular APIs |
| `BehaviorSubject` for UI state | 🟡 AVOID | Use Signals |
| `subscribe()` without `takeUntilDestroyed` | 🔴 FORBIDDEN | Memory leaks |

---

## 7. Security Practices

- Never hardcode credentials, tokens, or sensitive data
- Use Angular's `DomSanitizer` for any dynamic HTML
- Validate all mock data schemas
- Avoid storing sensitive mock data in LocalStorage
- Apply CSP-friendly patterns even in mock mode
- All user inputs must be sanitized (even in mock forms)

---

## 8. Self-Evaluation Checklist

Before finalizing any task, answer:

- [ ] Is this scalable to 10x complexity?
- [ ] Is this maintainable by a new developer in 6 months?
- [ ] Does this follow Clean Architecture?
- [ ] Are all SOLID principles respected?
- [ ] Is the code fully typed?
- [ ] Are there any memory leaks (subscriptions, intervals)?
- [ ] Is the UX consistent with `UI-UX-DESIGN.md`?
- [ ] Is the component under 300 lines?
- [ ] Are architectural decisions documented?
- [ ] Could this break any existing feature?

---

## 9. Methodology of Work

```
Analyze → Plan → Divide → Checklist → Implement → Validate → Refactor → Document
```

Every complex task must produce:
1. Task analysis
2. Implementation plan
3. Verification checklist
4. Updated `TASKS.md`
5. Updated `DECISIONS.md` (if architectural)

---

## 10. Future-Readiness Requirements

All code must be designed assuming future integration with:
- **Real WebSocket streams** (replace mock intervals)
- **Kafka consumer** via WebSocket proxy
- **Multi-tenant architecture** (org/workspace scoping)
- **AI agent API** (replace mock AI responses)
- **Docker-Android farm** (replace mock device data)
- **Kubernetes observability** (OpenTelemetry hooks ready)
