<!-- Context: coaching/guides/diet-ingredient-constraints | Priority: high | Version: 1.0 | Updated: 2026-04-03 -->

# Guide: Diet Ingredient Constraints

**Purpose**: Enforce athlete food preferences when generating meal plans. No drift allowed.

---

## Rule

Before writing any meal plan, load `.opencode/context/coaching/athlete-notes.md` → **Food Preferences** section. Every meal in every day type must be buildable from the primary list there. Secondary ingredients are only allowed if:
1. The macro target cannot be hit with primary ingredients alone, AND
2. The ingredient is nutritionally equivalent or simpler (e.g., swap chicken for turkey — not salmon or smoked meats without explicit approval)

## Hard Constraints

- **Never introduce an ingredient not in the primary list without flagging it** to the Head Coach for approval.
- **Fixed meals are non-negotiable.** The athlete-notes fixed meals section lists meals that appear on every day type unchanged.
- **Protein sources** must come from the primary list first: eggs, chicken breast, whey isolate.
- **Carb sources** must come from the primary list first: tapioca starch, banana, apple, granola.
- **Fat sources** must come from the primary list first: eggs (yolk), cheese.

## Validation Checklist (run before writing diet file)

```
[ ] Every meal in every day type uses only primary ingredients or approved secondaries
[ ] Fixed meals appear on all day types
[ ] No ingredient appears outside the athlete-notes primary list
[ ] Macros are hit using primary ingredients — no secondary ingredient added just to close a macro gap
```
