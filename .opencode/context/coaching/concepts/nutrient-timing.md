<!-- Context: coaching/nutrient-timing | Priority: high | Version: 1.0 | Updated: 2026-03-28 -->

# Concept: Nutrient Timing

**Purpose**: Optimize macro distribution around training windows to maximize performance, recovery, and body composition.

**Source**: Ivy & Schoenfeld (Nutrient Timing: The Future of Sports Nutrition). Supported by ISSN Position Stand on Nutrient Timing (Kerksick et al., 2017).

---

## Core Idea

When you eat matters almost as much as what you eat — particularly for carbohydrates and protein around training. The peri-workout window (before, during, after) has the highest metabolic sensitivity to nutrients.

## The Three Windows

### Pre-Workout (1–2 hours before)
- **Carbs**: 0.5–1g per kg of bodyweight. Prioritize low-GI sources for sustained energy; moderate-GI if <60 min before training.
- **Protein**: 20–40g to initiate MPS (muscle protein synthesis) ahead of the session.
- **Fats**: Minimize — slow gastric emptying, can impair performance.
- **Goal**: Top off glycogen, prime MPS, avoid GI distress.

### Intra-Workout (during sessions >60 min)
- **Carbs**: 30–60g/hour of fast-digesting carbs (e.g., dextrose, banana, sports drink).
- **Protein**: Optional EAA/BCAA supplement if fasted or session >90 min.
- **Goal**: Sustain blood glucose, delay fatigue, reduce muscle catabolism.
- Only relevant for endurance sports (soccer, running, cycling) or very long strength sessions.

### Post-Workout (within 2 hours)
- **Protein**: 30–50g fast-digesting protein (whey or equivalent). Triggers peak MPS response.
- **Carbs**: 0.5–1.5g per kg bodyweight. High-GI acceptable here — replenish glycogen rapidly.
- **Fats**: Keep low to speed absorption.
- **Goal**: Initiate recovery, replenish glycogen, maximize MPS.

## Sport-Specific Timing Adjustments

| Sport           | Pre-Workout Emphasis                     | Intra-Workout          | Post-Workout Emphasis                    |
|-----------------|------------------------------------------|------------------------|------------------------------------------|
| Soccer          | High carb load (match day: 2–3g/kg carbs) | Carbs + electrolytes  | High carb + protein; rapid glycogen repletion |
| Muay Thai       | Moderate carb + protein; weight-class aware | Optional EAA         | Protein-first; moderate carb             |
| Bodybuilding    | Moderate carb + protein                  | Optional intra-carb    | High protein + moderate carb             |
| Powerlifting    | Moderate carb + protein; minimize bulk   | Rarely needed          | Protein-first + moderate carb            |
| Endurance Running | High carb (1–2g/kg); electrolyte focus | Carbs mandatory        | Very high carb + protein                 |
| General Fitness | Balanced pre-meal 1–2h before            | Not needed <60 min     | Standard protein + carb meal             |

## Energy Availability Floor

Regardless of weight loss goals, energy availability (EA) must not drop below **30 kcal per kg of Fat-Free Mass (FFM) per day**. Below this threshold, the body enters Relative Energy Deficiency in Sport (RED-S):
- Hormonal disruption (testosterone, cortisol, thyroid)
- Impaired recovery and immune function
- Bone density loss

```
EA = (Total Caloric Intake − Exercise Energy Expenditure) / FFM in kg
Minimum safe EA: 30 kcal/kg FFM/day
Optimal EA for performance: 45 kcal/kg FFM/day
```

## Application in OpenCoach

- The **dietitian subagent** uses these windows to distribute daily macros — not just totals.
- On training days, shift carbs toward pre- and post-workout meals.
- On rest days, distribute macros evenly; reduce total carbs per `sport_context.nutrition_strategy`.
- The EA floor acts as a hard constraint: the dietitian must never generate a plan that drops EA below 30 kcal/kg FFM.
