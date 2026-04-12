# Baseline (No-Delta) Analysis Plan

## Goal

Enable the appointment flow to proceed when only one measures check-in exists by making `analyze-progress` produce a valid **baseline** analysis outcome (no deltas) instead of aborting. This preserves the sequential rule: **analysis happens before diet/training generation**.

## Locked Decisions

- Goal-based default: for `sport_goal: "Bodybuilding cutting"`, baseline mode should **cut immediately** (conservative).
- Baseline output does **not** need distance-to-target calculations.
- Data sources: `profile.json` + hardcoded defaults (only when missing).

## Desired Behavior

1. `pnpm opencoach analyze-progress` always produces an analysis outcome.
2. If there is only **1** `measures/measures-YYYY-MM-DD.json`:
   - Output indicates **BASELINE** status.
   - Deltas are unavailable:
     - `phase: "baseline"`
     - `wroc_kg_week: null`
     - `bf_delta_pct: null`
   - Recommendation is **goal-driven baseline cut** (no WROC-driven adjustments).
3. Appointment flow can proceed to diet/training generation after the analysis gate, even in baseline mode.

## Defaults (Hardcoded Fallbacks)

Use these only when the value is not available from `profile.json` or existing `analytics/wroc.json`.

- Cutting target WROC: `target_wroc_kg_week = { "min": -0.7, "max": -0.3 }`
- Next review date: `latest_date + 14 days` (Michaels rule)

## Implementation Steps

### 1) Update `coach-analyze-progress.ts`

File: `.opencode/skills/opencoach/scripts/coach-analyze-progress.ts`

Current behavior:
- If fewer than 2 measures files exist, the script prints a message and returns without writing `analytics/wroc.json`.

Change behavior when `files.length === 1`:

1. Load the single measures file and compute:
   - `lbm_kg = weight_kg * (1 - bf_pct/100)`
   - `fat_mass_kg = weight_kg * (bf_pct/100)`
2. Ensure `analytics/wroc.json` exists:
   - If missing, create a minimal valid file using `profile.json` plus the hardcoded defaults above.
3. Write `analytics/wroc.json` with:
   - `entries`: include the one entry (append if not present)
   - `wroc_windows: []`
   - `next_review_date: addDays(latest.date, 14)`
   - Keep `adjustment_rules` as-is
4. Console output should be a normal analysis block:
   - `Status: BASELINE — need ≥2 measurements for WROC/BF deltas`
   - `Plan recommendation: Baseline cut (goal-driven). No carb adjustments until ≥14d window.`

Optional enhancement:
- Add a stable `latest_summary` object to `analytics/wroc.json` to avoid consumers inferring status from windows. If added, update schemas/consumers accordingly.

### 2) Ensure Consumers Tolerate Empty Windows

Update any consumer that assumes `wroc_windows.length > 0`:

- UI validation: `ui/src/content.config.ts` (Zod)
- UI rendering: `ui/src/pages/index.astro`, `ui/src/components/*` (if they render WROC)

Requirement: UI must render with `wroc_windows: []` and show baseline state gracefully.

### 3) Update Appointment Documentation / Head Coach Prompt

- `.opencode/command/appointment.md`: document baseline mode behavior and that analysis may produce baseline output.
- `.opencode/agent/core/opencoach.md`: update the analysis step to allow baseline output and instruct passing `null` deltas and `phase:"baseline"` to subagents.

## Baseline Mode Semantics (Planning)

- Nutrition: conservative baseline cut driven by goal; enforce Michaels floors (protein 2.2g/kg LBM, fat 0.8g/kg BW); do not apply WROC-driven carb adjustments until a valid ≥14-day window exists.
- Training: conservative baseline hypertrophy microcycle; Metabolic Primer every session; apply injury constraints (avoid lumbar loading under fatigue; knee-friendly selection); cap intensity via RPE.

## Verification Checklist

1. With only one measures file and no `analytics/wroc.json`:
   - `pnpm opencoach analyze-progress` creates `analytics/wroc.json` and prints baseline status.
2. With two or more measures files:
   - WROC windows computed as before (no regression).
3. UI:
   - No crashes when `wroc_windows` is empty.
