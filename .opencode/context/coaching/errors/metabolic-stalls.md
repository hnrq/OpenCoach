<!-- Context: coaching/errors/metabolic-stalls | Priority: high | Version: 1.0 | Updated: 2026-04-03 -->

# Error: Metabolic Stall

**Triggered when**: WROC has been ≥ −0.3 kg/week (or positive) for a confirmed 14-day window, BF% is not decreasing, and RPE is stable — ruling out recomposition and fatigue as causes.

---

## Decision Tree

### Step 1 — Verify the window is valid
- Confirmed stall requires ≥14 days of data per the Michaels methodology.
- If window is <14 days: **take no action.** Log the stall candidate and reassess at next check-in.

### Step 2 — Rule out recomposition
- If BF% is decreasing while scale weight is flat: athlete is recomping. **Not a stall. Take no action.**

### Step 3 — Rule out fatigue-driven retention
- If RPE trend is rising (≥9): accumulated fatigue is masking true WROC.
- **Action**: Reduce training volume 20–30% first. Reassess after 7–10 days before touching calories.
- See `errors/wroc-rpe-conflict.md` for the full decision matrix.

### Step 4 — Confirmed stall: caloric adjustment
- WROC stalled ≥14 days, BF% stable, RPE stable (7–8): genuine caloric plateau.
- **Action**: Reduce carbs by 20g on training days (≈−80 kcal/day).
- Do NOT cut fats below the Michaels floor (0.8g × BW kg).
- Do NOT increase training volume simultaneously (see Hard Rule).
- Reassess after the next 14-day window.

---

## Hard Rule

> **Never cut calories AND increase training volume simultaneously.**

Doing both deepens the energy deficit beyond what is recoverable and accelerates LBM loss.

---

## Quick Reference

| WROC (14-day) | BF% Trend | RPE | Action |
|---|---|---|---|
| Stall | Dropping | Any | No action — recomposition in progress |
| Stall | Stable | Rising ≥9 | Reduce training volume 20–30% |
| Stall | Stable | Stable 7–8 | Cut training-day carbs by 20g |
| Stall | Stable | Stable, <14-day window | Wait — insufficient data |
