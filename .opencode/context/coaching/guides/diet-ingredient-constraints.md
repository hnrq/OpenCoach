<!-- Context: coaching/guides/diet-ingredient-constraints | Priority: high | Version: 1.0 | Updated: 2026-04-03 -->

# Guide: Diet Ingredient Constraints

**Purpose**: Enforce athlete food preferences when generating meal plans. No drift allowed.

---

## Rule

Before writing any meal plan, load `profile.json` → `food_preferences.primary`. Every meal in every day type must be buildable from that list. Secondary ingredients are only allowed if:
1. The macro target cannot be hit with primary ingredients alone, AND
2. The ingredient is nutritionally equivalent or simpler (e.g., swap chicken for turkey — not salmon or smoked meats without explicit approval)

## Hard Constraints

- **Never introduce an ingredient not in `primary` without flagging it** to the Head Coach for approval.
- **Fixed meals are non-negotiable.** If `food_preferences.fixed_meals` contains an entry (e.g., Brazilian lunch), that meal appears on every day type unchanged.
- **Protein sources** must come from the primary list first: eggs, chicken breast, whey isolate.
- **Carb sources** must come from the primary list first: tapioca starch, banana, apple, granola.
- **Fat sources** must come from the primary list first: eggs (yolk), cheese.

## Validation Checklist (run before writing diet file)

```
[ ] Every meal in every day type uses only primary ingredients or approved secondaries
[ ] Fixed meals appear on all day types
[ ] No ingredient appears that is not in profile.json food_preferences
[ ] Macros are hit using primary ingredients — no secondary ingredient added just to close a macro gap
```

## Current Athlete Primary List (Henrique Ramos)

eggs · chicken breast · banana · apple · granola · greek yogurt · whey isolate · cheese · tapioca starch · rice · beans (fixed lunch)
