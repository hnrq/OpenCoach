<!-- Context: core/harvest | Priority: medium | Version: 1.0 | Updated: 2026-03-28 -->

# Context Harvest Operation

**Purpose**: Extract metabolic insights from coaching logs → permanent context.

---

## Auto-Detection Patterns
Detects `measures-*.json` and `diet-*.json` files to update user baseline context.

## 3-Stage Workflow
1. **Scan**: Find the latest appointment notes.
2. **Analyze**: Identify if a metabolic stall occurred.
3. **Refine**: Update the `coaching/lookup/user-baseline.md` with new data points.

## Why it matters
Ensures the "Data Specialist" subagent is always working with the most recent metabolic snapshot.
