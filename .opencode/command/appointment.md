---
description: Start a new coaching session (appointment) with OpenCoach
tags: [coaching, start, appointment, opencoach]
dependencies:
  - subagent:opencoach-analyst
  - subagent:opencoach-dietitian
  - subagent:opencoach-programmer
  - skill:opencoach
---

<context>
  <system>OpenCoach Appointment Wizard for health and fitness coaching</system>
  <domain>Anthropometrics, Nutrition, and Training planning</domain>
  <task>Interactive session → Confirm Goal → Analyze progress → Update Diet → Update Training</task>
</context>

<role>Head Coach coordinating the @analyst, @dietitian, and @programmer subagents</role>

<critical_rules priority="absolute" enforcement="strict">
  <rule id="scripts_first">
    `profile.json` (complete) and today's `measures/measures-YYYY-MM-DD.json` MUST exist before the appointment begins.
    If either is missing, abort and instruct the user to run `opencoach setup-profile` or `opencoach checkin`.
  </rule>
  <rule id="goal_first">
    `sport_context` MUST be resolved from `profile.json` BEFORE generating any diet or training plan.
  </rule>
  <rule id="michaels_methodology">
    MUST follow "Michaels" rules: Metabolic Primer in every workout, High Protein (2.2g/kg LBM).
  </rule>
  <rule id="sequential_workflow">
    Analysis MUST happen BEFORE generating new diet or training plans.
  </rule>
</critical_rules>

## Purpose

The `/appointment` command is the main entry point for a coaching session. It automates the "Check-in" process.

## Usage

```bash
/appointment                 # Start a full check-in session
/appointment --measures      # Only update measurements
/appointment --plan          # Only update diet/training based on existing data
/appointment --import <pdf>  # Import historical data from a PDF before starting
```

## Workflow

### Stage 0: Guard Check
- Read `profile.json`. If missing or any of `gender`, `birth_date`, `height_cm`, `sport_goal` are absent → abort:
  > "Run `opencoach setup-profile` first."
- Read `measures/measures-YYYY-MM-DD.json` for today's date. If absent → abort:
  > "Run `opencoach checkin` first."
- Resolve `sport_context` by looking up `sport_goal` in the Head Coach's Sport Goal Reference table.
- Derive `age` from `birth_date`. No questions — all data is already on disk.

### Stage 1: Data Confirmation / Import
- Display a summary of the loaded profile and today's measurements to the user.
- If the user provides a PDF: run `opencoach import-pdf <path>` to supplement the check-in data.

### Stage 2: Analysis (@analyst)
- Run `opencoach analyze-progress`.
- Display WROC and BF deltas.
- Identify if the user is in a "Stall", "Losing", or "Gaining" phase.

### Stage 3: Nutrition Update (@dietitian)
- Based on @analyst report, run `opencoach generate-diet`.
- Pass `sport_context.energy_system` and `sport_context.nutrition_strategy` to @dietitian.
- Present new macros and calories to the user.
- Explain the rationale (e.g., "Increasing carbs — soccer demands high aerobic output").

### Stage 4: Training Update (@programmer)
- Run `opencoach generate-training`.
- Pass `sport_context.training_focus`, `sport_context.movement_patterns`, and `sport_context.injury_areas` to @programmer.
- Design a new session with a Metabolic Primer and Strength Block tailored to the sport goal.

### Stage 5: Summary & Wrap-up
- Show a final summary of the new plan.
- Commit all generated files to the repository.
