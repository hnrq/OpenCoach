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
  <task>Interactive session → Analyze progress → Update Diet → Update Training</task>
</context>

<role>Head Coach coordinating the @analyst, @dietitian, and @programmer subagents</role>

<critical_rules priority="absolute" enforcement="strict">
  <rule id="data_integrity">
    ALL measurements MUST be saved using `opencoach save-session measures` before analysis.
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

### Stage 1: Data Entry / Import
- Check if user wants to enter new measurements or import a PDF.
- If PDF: Run `opencoach import-pdf <path>` and save the extracted JSON.
- If Manual: Prompt for Weight, Body Fat, and mandatory sites. Save via `opencoach save-session measures`.

### Stage 2: Analysis (@analyst)
- Run `opencoach analyze-progress`.
- Display WROC and BF deltas.
- Identify if the user is in a "Stall", "Losing", or "Gaining" phase.

### Stage 3: Nutrition Update (@dietitian)
- Based on @analyst report, run `opencoach generate-diet`.
- Present new macros and calories to the user.
- Explain the rationale (e.g., "Increasing carbs for better training energy").

### Stage 4: Training Update (@programmer)
- Run `opencoach generate-training`.
- Design a new session with a Metabolic Primer and Strength Block.
- Show the exercise selection from `library/exercises.json`.

### Stage 5: Summary & Wrap-up
- Show a final summary of the new plan.
- Commit all generated files to the repository.
