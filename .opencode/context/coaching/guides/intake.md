<!-- Context: coaching/guides/intake | Priority: high | Version: 1.0 | Updated: 2026-04-03 -->

# Guide: Pre-Appointment Intake

**Purpose**: Collect all required athlete information before running any analysis. The analyst must not start until every field below is confirmed.

---

## Required Fields

Load `profile.json` first. For each field marked ✗ or missing, ask the athlete before proceeding.

| Field | Source | Required |
|---|---|---|
| Current weight (kg) | Today's measures file | Yes |
| Current body fat % | Today's measures file | Yes |
| All 7 skinfold sites (mm) | Today's measures file | Yes |
| Energy levels | Today's measures file | Yes |
| Sleep quality | Today's measures file | Yes |
| Target weight | `profile.json` | Yes |
| Sport goal | `profile.json` | Yes |
| Training schedule (days + timing) | `profile.json` | Yes |
| Food preferences (primary list) | `profile.json` | Yes |
| Fixed meals | `profile.json` | Yes |
| Available equipment | `profile.json` (defaults to standard commercial gym) | Yes |
| Active injuries | Ask athlete at start of appointment | Yes |

## Checklist Before Analyst Runs

```
[ ] measures file for today exists and is complete (all 7 sites + weight + BF%)
[ ] profile.json has food_preferences.primary populated
[ ] profile.json has training_schedule populated
[ ] profile.json has target_weight_kg populated
[ ] analytics/wroc.json exists (create if missing from measures history)
```

## Injuries — Always Ask at Appointment Start

Even if `profile.json` has no injuries listed, always open with:
> "Any current pain, soreness, or injury I should know about before building your plan?"

Update `profile.json → injuries` with the answer. Do not skip this — injury status changes between sessions.

## If Fields Are Missing

Ask the athlete directly in a single consolidated message. Do not ask one field at a time. Example:

> "Before I run the analysis, I need a few things:
> 1. What is your target weight?
> 2. What foods do you prefer? (list your staples)
> 3. What is your weekly training schedule?"

Update `profile.json` with the answers before proceeding.

## After Intake is Complete

Proceed to the analyst. All fields above must be green before the Analyst Report is generated.
