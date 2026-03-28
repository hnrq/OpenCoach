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

### Data Management
- `save-session <type>`: Validates and saves a new session (measures, diet, or training).
- `get-metric <type> <path> [n]`: Fetches the last N values for a specific metric.
- `analyze-progress`: Calculates deltas and WROC between measurements.

### Planning
- `generate-diet`: Creates a nutrition plan based on current stats.
- `generate-training`: Creates a workout plan based on current phase.

## Architecture

```
.opencode/skill/opencoach/
├── SKILL.md                          # This file
├── router.sh                         # CLI router
├── scripts/
│   ├── coach-save-session.ts         # Session validation and saving
│   ├── coach-analyze-progress.ts     # Data analysis logic
│   └── coach-get-metric.sh           # Fast metric extraction
└── workflows/
    ├── measures.md                   # How to track anthropometrics
    ├── nutrition.md                  # Michaels nutrition principles
    └── training.md                   # Michaels training methodology
```

## Data Schema
Data is stored in the root folders `/measures`, `/diet`, and `/training` as `[type]-YYYY-MM-DD.json`.
Mandatory fields are enforced via TypeScript interfaces in `scripts/coach-save-session.ts`.
