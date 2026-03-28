<!-- Context: coaching/tracking-measures | Priority: high | Version: 1.0 | Updated: 2026-03-28 -->

# Guide: Tracking Anthropometrics

**Purpose**: Standardize how measurements are taken and recorded.

---

## Required Sites (The "Michaels" Set)
All measurements must be in millimeters (mm) except weight (kg).
1. **Chest**: Mid-sternum.
2. **Waist**: Narrowest point.
3. **Umbilical**: Level with belly button.
4. **Hip**: Widest point of glutes.
5. **Thigh**: Mid-point between hip and knee.
6. **Bicep**: Flexed, peak.
7. **Forearm**: Widest point.

## Workflow
1. Use `opencoach save-session measures` to validate the JSON.
2. Ensure consistent timing (e.g., fasted morning).
3. Compare against the 7-day rolling average for true WROC.

## Success Criteria
- JSON matches the schema in `schemas/measures.schema.json`.
- All 7 mandatory sites are present.
