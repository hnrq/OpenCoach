---
name: opencoach
description: Health and fitness coaching system using the "Michaels" methodology
version: 1.0.0
author: opencode
type: skill
category: coaching
tags:
  - fitness
  - nutrition
  - health
  - tracking
---

# OpenCoach Skill

> **Purpose**: Manage anthropometrics, nutrition, and training plans using "Michaels" methodology.

## What I Do

Coordinate the OpenCoach lifecycle:
- **Analyze**: Track metrics (weight, body fat) and calculate Weekly Rate of Change (WROC).
- **Diet**: Generate and adjust nutritional plans based on metabolic data.
- **Training**: Design workout phases (Metabolic Primers + Strength Blocks).

## Commands

### Session Persistence
- `save-session <type> --date YYYY-MM-DD`: Validate and save a session in-place (auto-resolves path).
- `save-session <type> <file_path>`: Validate a source file, write to `<type>/<type>-<today>.json`.
- `save-session all --date YYYY-MM-DD`: Validate measures + diet + training in one command.
- `new-session <type> --date YYYY-MM-DD`: Generate a schema-valid JSON skeleton for the given date.
- `commit-session --date YYYY-MM-DD`: Stage only allowed session files; refuse unrelated changes.
- `update-profile-from-appointment --date YYYY-MM-DD`: Preview/apply preference changes to profile.json.

Valid types for `save-session` and `new-session`: `measures | diet | training | appointment | all`

### Data & Analysis
- `get-metric <type> <path> [n]`: Fetches the last N values for a specific metric.
- `analyze-progress`: Calculates deltas and WROC between measurements.
- `checkin`: Interactive weekly anthropometric check-in.

### Setup
- `setup-profile`: Initialize or update profile.json.
- `import-pdf <path>`: Import historical data from a PDF.

## Appointment Workflow (summary)

Subagents own content generation. Head coach owns validation and commit.

```bash
# Subagents (dietitian + programmer):
pnpm opencoach new-session diet --date $(date +%Y-%m-%d)      # generate skeleton
pnpm opencoach new-session training --date $(date +%Y-%m-%d)  # generate skeleton
# → write the full plan JSON into those files

# Head Coach (commitment step):
pnpm opencoach save-session all --date $(date +%Y-%m-%d)      # single validation gate
pnpm opencoach new-session appointment --date $(date +%Y-%m-%d)
# → fill in decisions/preferences_delta/rationale
pnpm opencoach save-session appointment --date $(date +%Y-%m-%d)
pnpm opencoach commit-session --date $(date +%Y-%m-%d)
git commit -m "session: $(date +%Y-%m-%d)"
pnpm opencoach update-profile-from-appointment --date $(date +%Y-%m-%d) --apply
```

## Architecture

```
.opencode/skill/opencoach/
├── SKILL.md                                  # This file
├── router.sh                                 # CLI router
├── scripts/
│   ├── coach-save-session.ts                 # Validate + save (--date, all, appointment)
│   ├── coach-new-session.ts                  # Generate schema-valid skeletons
│   ├── coach-commit-session.ts               # Stage only allowed session files
│   ├── coach-update-profile.ts               # Apply appointment deltas to profile.json
│   ├── coach-analyze-progress.ts             # WROC data analysis
│   ├── coach-get-metric.ts                   # Fast metric extraction
│   ├── coach-checkin.ts                      # Interactive check-in
│   ├── coach-setup-profile.ts                # Profile initialization
│   └── coach-import-pdf.ts                   # PDF import
└── workflows/
    ├── measures.md                           # How to track anthropometrics
    ├── nutrition.md                          # Michaels nutrition principles
    └── training.md                           # Michaels training methodology
```

## Data Schema
Data is stored in root folders as `[type]-YYYY-MM-DD.json`:
- `/measures/measures-YYYY-MM-DD.json` — anthropometric check-in
- `/diet/diet-YYYY-MM-DD.json` — nutritional plan
- `/training/training-YYYY-MM-DD.json` — training plan
- `/appointments/appointment-YYYY-MM-DD.json` — appointment artifact (decisions + preference deltas)

Zod schemas live in `packages/schemas/src/index.ts` and are used by `save-session` for validation and by the UI content collections.

## Schema Maintenance

After editing `packages/schemas/src/index.ts`, **always regenerate the schema docs** that agents use as field references:

```bash
cd packages/schemas && npm run gen:schema-docs
```

This updates `.opencode/context/coaching/schemas/diet-schema.md` (loaded by dietitian), `training-schema.md` (loaded by programmer), and `appointment-schema.md` (loaded by head coach). Commit the generated files alongside the schema change.
