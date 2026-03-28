<!-- Context: coaching/errors/wroc-rpe-conflict | Priority: high | Version: 1.0 | Updated: 2026-03-28 -->

# Error: WROC and RPE Signals Conflict

**Triggered when**: The Weekly Rate of Change (WROC) and the athlete's reported RPE trend point in opposite directions, making it unclear whether to adjust calories, training volume, or neither.

---

## Decision Hierarchy

Work through these steps in order. Stop at the first rule that applies.

### Step 1 — Check Body Composition Before Acting
- If scale weight is stalled but **BF% is decreasing**: the athlete is recomping (losing fat, gaining muscle).
- This is not a stall. **Take no action.**
- Resume normal tracking and reassess after another 14-day WROC window.

### Step 2 — Rising RPE + Scale Stall
- Indicates accumulated fatigue, not a true plateau.
- **Action**: Reduce training volume by 20–30% (drop sets, not intensity).
- Do NOT cut calories yet — the stall is likely masking weight fluctuation from water retention and glycogen under fatigue.
- Reassess WROC after the volume reduction takes effect (7–10 days).

### Step 3 — Stable RPE + WROC Stall >14 Days
- Genuine caloric plateau confirmed.
- **Action**: Reduce calories by **100–150 kcal/day**, prioritising a reduction in carbohydrates.
- Do not increase training volume at the same time (see Hard Rule below).
- Reassess after the next 14-day WROC window.

### Step 4 — WROC Showing Loss + RPE Sustained ≥9
- The caloric deficit is too aggressive for the training load.
- **Action**: Increase calories by **100–150 kcal/day**, prioritising carbohydrates on training days.
- Do not further increase training volume until RPE normalises to 7–8.

---

## Hard Rule

> **Never cut calories AND increase training volume simultaneously.**

Doing both at once deepens the energy deficit beyond what is recoverable, accelerating muscle loss and risking RED-S (see `nutrient-timing.md` for the Energy Availability floor).

---

## Quick Reference

| WROC | RPE Trend | BF% | Action |
|------|-----------|-----|--------|
| Stall | Stable | Dropping | No action — recomposition in progress |
| Stall | Rising | Any | Reduce volume 20–30% first |
| Stall | Stable | Stable | Cut 100–150 kcal/day |
| Loss | Rising (≥9) | Any | Add 100–150 kcal/day |
| Loss | Stable (7–8) | Any | On track — no action |
