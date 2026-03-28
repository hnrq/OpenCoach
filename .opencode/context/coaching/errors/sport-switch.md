<!-- Context: coaching/errors/sport-switch | Priority: high | Version: 1.0 | Updated: 2026-03-28 -->

# Error: Sport Goal Change Mid-Mesocycle

**Triggered when**: The user changes their `sport_goal` during an active training block.

---

## Decision Tree

Determine the current block phase from `profile.json`, then follow the matching rule:

### 1. Accumulation — Week 1 or 2
- Restart accumulation immediately with the new sport profile.
- Update `sport_goal`, `sport_context`, and reset `block_phase` to `accumulation` in `profile.json`.
- No deload needed — training stress is still low.

### 2. Accumulation — Week 3+
- Complete the current week as written.
- Run a **1-week transition deload** (MV loads, RPE ≤6, full-body).
- Then restart accumulation with the new sport profile.
- Update `profile.json` after the deload.

### 3. Intensification Block
- Complete only the current week — do not extend the block.
- Run a **1-week transition deload**.
- Restart accumulation with the new sport profile.
- Update `profile.json` after the deload.

### 4. Realization Block
- Complete the full realization block (it is already short: 1–2 weeks).
- The natural post-realization deload serves as the transition.
- Restart accumulation with the new sport profile.
- Update `profile.json` after the deload.

---

## Nutrition

Pivot `sport_context.energy_system` and `sport_context.nutrition_strategy` **immediately**, regardless of block phase.

Macro targets adjust faster than training structure — there is no reason to delay the nutritional shift.

---

## `profile.json` Updates Required

```json
{
  "sport_goal": "<new sport>",
  "sport_context": { ... },
  "block_phase": "accumulation",
  "block_week": 1
}
```

Always reset `block_week` to `1` when restarting accumulation after a sport switch.

---

## Key Rule

Never carry over the previous sport's block phase into the new sport's programming. A soccer accumulation block is not interchangeable with a powerlifting accumulation block. Always restart clean.
