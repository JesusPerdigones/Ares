# DEBUGGING-AGENT.md — AI Debugger Manual

> **AI AGENT**: When facing any error, follow this manual BEFORE touching code.

---

## 1. Debugging Methodology (Mandatory Sequence)

```
1. REPRODUCE   → Confirm the exact error message and location
2. ISOLATE     → Narrow to the smallest possible failing unit
3. HYPOTHESIZE → List 2-3 possible root causes
4. VERIFY      → Confirm hypothesis before changing code
5. FIX         → Make minimal, targeted change
6. VALIDATE    → Confirm fix doesn't break other areas
7. DOCUMENT    → Add to DECISIONS.md if architectural
```

---

## 2. Angular Compile Error Checklist

### Template Parser Errors (NG5002)
```
Common causes:
□ Arrow function in template: (click)="fn(v => v)"    ← extract to method
□ Less-than operator:         @if (a < b)              ← use $last or method
□ Greater-than in binding:    [value]="a > b ? x : y" ← use method or computed
□ Unclosed template tags
□ Missing closing braces in @if/@for
```

### Type Errors (TS2xxx)
```
□ TS2345: readonly[] passed to T[]  → Change pick<T>(arr: T[]) to pick<T>(arr: readonly T[])
□ TS2307: Cannot find module        → Check relative path (../../ vs ../)
□ TS2339: Property does not exist   → Check interface definition in models/domain/index.ts
□ TS2304: Cannot find name          → Missing import
□ TS2322: Type not assignable       → Check union type alignment
```

### Common Angular 19 Issues
```
□ "NG0203: inject() must be called from injection context"
  → inject() must be in constructor or field initializer, not ngOnInit

□ "Cannot read properties of null"
  → Signal returns null — use optional chaining: store.metrics()?.value

□ "ExpressionChangedAfterItHasBeenChecked"
  → Avoid setting signals in effect() — use computed() instead

□ "@for requires track expression"
  → Always add: @for (item of items; track item.id) { }

□ "RouterLink requires Router in providers"
  → Add provideRouter() to app.config.ts
```

---

## 3. RxJS Debugging

### Memory Leak Check
```typescript
// ❌ Leak — no cleanup
this.interval$.subscribe(val => this.data.set(val));

// ✅ Auto-cleanup with takeUntilDestroyed
this.interval$.pipe(
  takeUntilDestroyed()
).subscribe(val => this.data.set(val));

// ✅ Manual cleanup
private _sub?: Subscription;
ngOnInit()    { this._sub = this.stream$.subscribe(...); }
ngOnDestroy() { this._sub?.unsubscribe(); }
```

### Common RxJS Errors
```
□ "Subject is closed"                → Subject was completed, recreate it
□ "TypeError: this is not iterable"  → Operator returns wrong type, check map()
□ Observable not emitting            → Check pipe() — missing subscribe() call
□ Multiple subscriptions             → Use share() or shareReplay(1)
```

---

## 4. Signal Debugging

```typescript
// Debug signal value in console
effect(() => {
  console.log('[DEBUG] devices:', this.devices());
  console.log('[DEBUG] metrics:', this.metrics());
});

// Check computed recomputation
readonly debug = computed(() => {
  console.count('[COMPUTED] recalculated');
  return this.items().length;
});

// Verify signal is being updated
// In browser console:
// ng.getComponent(document.querySelector('ares-dashboard')).store.devices()
```

### Signal Anti-patterns
```
❌ Setting signal inside computed()  → causes infinite loop
❌ Calling signal setter in template → breaks unidirectional flow
❌ Mutating objects inside signal    → use spread/immutable update
```

---

## 5. Logging Strategy

### Development Logging Levels
```typescript
// TRACE: Verbose development debugging
console.debug('[STORE:devices]', data);

// INFO: Important state transitions
console.info('[EXERCISE:start]', exerciseId);

// WARN: Non-critical issues
console.warn('[MOCK] Using fake data for:', endpoint);

// ERROR: Always log with context
console.error('[THREAT:mitigate] Failed:', { threatId, error });
```

### Future: OpenTelemetry Integration
```typescript
// Stub pattern ready for OTel spans
// Replace console.info with:
// trace.getTracer('ares').startSpan('operation').end();
```

---

## 6. Performance Debugging

### Change Detection Check
```bash
# Enable Angular DevTools in browser
# Look for components updating too frequently
# Red = frequent updates (may indicate missing trackBy or OnPush)
```

### Bundle Size Analysis
```bash
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/ares-platform/browser/stats.json
```

### Signal Performance
```
□ Is computed() used for derived state? (avoids recalculation)
□ Are @for loops using track? (avoids DOM recreation)
□ Are large lists using CDK Virtual Scroll?
□ Are HTTP requests deduplicated with shareReplay(1)?
```

---

## 7. Environment-specific Issues

### Windows PowerShell
```powershell
# ❌ && doesn't work in PowerShell
npm install && npm start

# ✅ Use semicolon
npm install; npm start

# ✅ Or separate commands
```

### Port Conflicts
```bash
# Angular prompts to use different port automatically
# Or kill process:
netstat -ano | findstr :4200
taskkill /PID <pid> /F
```

### Path Issues (Windows)
```
□ Use forward slashes in import paths
□ Check for spaces in paths (use quotes)
□ Encoding issues with special chars in paths (e.g., "Jesús")
```

---

## 8. Debugging Checklist Before Asking for Help

```
□ Have I read the full error message (not just the first line)?
□ Have I checked the file + line number mentioned?
□ Have I verified the import paths are correct?
□ Have I checked SKILLS.md for the correct pattern?
□ Have I confirmed the TypeScript types match?
□ Have I checked for circular dependencies?
□ Have I confirmed the component is in the imports[] array?
□ Have I checked that signals are read with () in templates?
```
