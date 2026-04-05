---
description: Start a new coaching session (appointment) with OpenCoach
tags: [coaching, start, appointment, opencoach]
dependencies:
  - subagent:opencoach-dietitian
  - subagent:opencoach-programmer
  - skill:opencoach
---

<context>
  <system>OpenCoach Appointment Wizard for health and fitness coaching</system>
  <domain>Anthropometrics, Nutrition, and Training planning</domain>
  <task>Interactive session → Confirm Goal → Analyze progress → Update Diet → Update Training</task>
</context>

<role>Head Coach coordinating the @dietitian and @programmer subagents</role>

<critical_rules priority="absolute" enforcement="strict">
  <rule id="scripts_first">
    Run `ls profile.json 2>/dev/null || npm run opencoach -- setup-profile` and
    `ls measures/measures-$(date +%Y-%m-%d).json 2>/dev/null || npm run opencoach -- checkin`
    before any analysis. Shell `||` handles the conditional — no manual checks needed.
  </rule>
  <rule id="goal_first">
    `sport_context` MUST be resolved from `profile.json` BEFORE generating any diet or training plan.
  </rule>
  <rule id="michaels_methodology">
    MUST follow "Michaels" rules: Metabolic Primer in every workout, High Protein (2.2g/kg LBM).
  </rule>
  <rule id="sequential_workflow">
    Analysis MUST happen BEFORE generating new diet or training plans.
    Dietitian and programmer run in PARALLEL after the analysis gate.
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

### Stage 0: Intake (complete before any analysis)
```bash
ls profile.json 2>/dev/null || npm run opencoach -- setup-profile
cat profile.json

ls measures/measures-$(date +%Y-%m-%d).json 2>/dev/null || npm run opencoach -- checkin

cat analytics/wroc.json 2>/dev/null || echo "wroc.json missing"
```
- Verify all required fields per `guides/intake.md` are present. Collect any missing fields in a single message.
- Ask: **"Any current pain, soreness, or injury I should know about?"** Update `profile.json → injuries`.
- Resolve `sport_context` from `sport_goal` via the Head Coach's Sport Goal Reference table.
- Derive `age` from `birth_date`. No other manual questions at this stage.

### Stage 1: Confirmation / Import
- Display a summary of the loaded profile, today's measurements, and current WROC status.
- If the user provides a PDF: run `npm run opencoach -- import-pdf <path>` to supplement.

### Stage 2: Analysis (inline — no subagent)
```bash
npm run opencoach -- analyze-progress
```
- Present WROC, BF delta, and phase (stall / cut / bulk) in plain language.
- State the adjustment recommendation if applicable.
- **[APPROVAL GATE]** Wait for explicit acknowledgment before proceeding.

### Stage 3: Nutrition + Training Update (parallel)
- Delegate to **@dietitian and @programmer simultaneously** — they are independent.
- @dietitian receives: WROC/BF deltas, `sport_context`, `food_preferences`, `gender`, `age`.
  - Apply `guides/diet-ingredient-constraints.md` — primary ingredient list is a hard constraint.
  - Output: day-type carb cycle with per-day meal breakdown and rationale.
- @programmer receives: `sport_context.training_focus`, `sport_context.movement_patterns`, `sport_context.injury_areas`, `training_schedule`, `gender`, `age`.
  - Output: every session, every exercise, warmup + working sets, RPE, coaching note. Full detail mandatory.
- **[APPROVAL GATE — combined]** Present diet plan and training plan together. If the user requests changes to one, re-run only that subagent.

### Stage 4: Commit
```bash
# Validate all three session files
npm run opencoach -- save-session all --date $(date +%Y-%m-%d)

# Generate appointment skeleton, populate from this conversation (see opencoach.md §Artifact Extraction)
npm run opencoach -- new-session appointment --date $(date +%Y-%m-%d)
npm run opencoach -- save-session appointment --date $(date +%Y-%m-%d)

# Stage only session files
npm run opencoach -- commit-session --date $(date +%Y-%m-%d)
git commit -m "session: $(date +%Y-%m-%d)"

# Apply preference changes to profile.json
npm run opencoach -- update-profile-from-appointment --date $(date +%Y-%m-%d) --apply
```
