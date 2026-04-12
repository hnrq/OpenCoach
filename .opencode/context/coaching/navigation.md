# Coaching Navigation

**Purpose**: Methodology, Workflows, and Data Reference for OpenCoach.

---

## Structure

```
coaching/
├── navigation.md
├── concepts/
│   ├── michaels-methodology.md      # Core Principles
│   ├── rp-volume-landmarks.md       # Per-muscle volume management (MEV/MAV/MRV)
│   ├── block-periodization.md       # Mesocycle structure (Accumulation → Intensification → Realization)
│   └── nutrient-timing.md           # Peri-workout nutrition + Energy Availability floor
├── guides/
│   └── tracking-measures.md         # Anthropometrics Workflow
├── lookup/
│   └── exercise-library.md          # Movement patterns
└── errors/
    ├── metabolic-stalls.md          # Troubleshooting weight plateaus
    ├── sport-switch.md              # Sport goal change mid-mesocycle
    └── wroc-rpe-conflict.md         # Conflicting weight and effort signals
```

---

## Quick Routes

| Task | Path |
|------|------|
| **Start any appointment** | `guides/intake.md` — run this first, always |
| **Apply Michaels Rule** | `concepts/michaels-methodology.md` |
| **Set weekly volume per muscle** | `concepts/rp-volume-landmarks.md` |
| **Structure a mesocycle** | `concepts/block-periodization.md` |
| **Distribute macros around training** | `concepts/nutrient-timing.md` |
| **New Check-in** | `guides/tracking-measures.md` |
| **ExerciseDB Query Strategy** | `lookup/exercisedb-optimization.md` |
| **Athlete history & observations** | `athlete-notes.md` — dated free-text; append after each appointment |
| **Build a meal plan** | `guides/diet-ingredient-constraints.md` — enforce before writing |
| **WROC analysis** | `analytics/wroc.json` — always load this, update after each session |
| **Fix weight stall** | `errors/metabolic-stalls.md` |
| **User changed sport mid-block** | `errors/sport-switch.md` |
| **WROC and RPE disagree** | `errors/wroc-rpe-conflict.md` |

---

## Context Priority

When two context files give conflicting guidance, higher priority wins:

| Priority | Folder | Reason |
|---|---|---|
| 1 (highest) | `errors/` | Triggered by a specific failure state — always overrides defaults |
| 2 | `concepts/` | Methodology rules — override workflow defaults |
| 3 | `guides/` | Step-by-step procedures |
| 4 (lowest) | `lookup/` | Reference data only — never overrides rules |

---

## By Type

**Methodology** → Core concepts of the Michaels system + complementary academic frameworks (RP, Block Periodization, Nutrient Timing).
**Workflows** → Step-by-step guides for appointments.
**Reference** → Quick lookups for macros and movements.
