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
    Run `ls profile.json 2>/dev/null || npm run opencoach -- setup-profile` and
    `ls measures/measures-$(date +%Y-%m-%d).json 2>/dev/null || npm run opencoach -- checkin`
    before delegating to any subagent. Shell `||` handles the conditional — no manual checks needed.
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

### Stage 2: Analysis (@analyst)
- Run `opencoach analyze-progress`.
- Display WROC and BF deltas.
- Identify if the user is in a "Stall", "Losing", or "Gaining" phase.

### Stage 3: Nutrition Update (@dietitian)
- Delegate to @dietitian with: WROC/BF deltas, `sport_context`, `food_preferences` from `profile.json`.
- Apply `guides/diet-ingredient-constraints.md` — primary ingredient list is a hard constraint.
- Present day-type carb cycle (gym / futsal / legs / rest) to the user with per-day meal breakdown.
- Explain the rationale (e.g., "Increasing carbs on futsal days — aerobic demand").

### Stage 4: Training Update (@programmer)
- Delegate to @programmer with: `sport_context.training_focus`, `sport_context.movement_patterns`, `sport_context.injury_areas`, `training_schedule` from `profile.json`.
- Output full session detail: every session, every exercise, warmup + working sets, RPE, coaching note.
- Never output session names only — full exercise list is mandatory.

### Stage 5: Summary & Wrap-up
- Show a final summary of the new plan.
- Commit all generated files to the repository.
