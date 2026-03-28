<!-- Context: coaching/rp-volume-landmarks | Priority: high | Version: 1.0 | Updated: 2026-03-28 -->

# Concept: Renaissance Periodization — Volume Landmarks

**Purpose**: Evidence-based per-muscle-group volume management to maximize hypertrophy while preventing overtraining.

**Source**: Dr. Mike Israetel, Renaissance Periodization (RP). Backed by Schoenfeld et al. on volume-hypertrophy dose-response research.

---

## Core Idea

Each muscle group has a personal volume tolerance range. Training volume (sets per week) must stay within that range to drive adaptation without exceeding recovery capacity.

## The Four Landmarks

| Landmark | Abbreviation | Definition |
|---|---|---|
| Minimum Effective Volume | **MEV** | Fewest weekly sets needed to make progress. Below this = maintenance at best. |
| Maximum Adaptive Volume | **MAV** | The sweet spot. Most growth occurs here. |
| Maximum Recoverable Volume | **MRV** | Upper ceiling. Exceeding this leads to overtraining and regression. |
| Maintenance Volume | **MV** | Minimum sets to retain existing muscle (e.g., during deload or injury). |

## General Baseline Ranges (Sets per Week per Muscle Group)

These are starting estimates — individual tolerance varies with training age, sleep, nutrition, and stress.

| Muscle Group   | MV   | MEV   | MAV     | MRV   |
|----------------|------|-------|---------|-------|
| Chest          | 6    | 8     | 12–20   | 22    |
| Back           | 8    | 10    | 14–22   | 25    |
| Quads          | 6    | 8     | 12–18   | 20    |
| Hamstrings     | 4    | 6     | 10–16   | 20    |
| Glutes         | 0    | 4     | 8–16    | 20    |
| Shoulders      | 6    | 8     | 16–22   | 26    |
| Biceps         | 4    | 6     | 14–20   | 26    |
| Triceps        | 4    | 6     | 10–14   | 18    |
| Calves         | 6    | 8     | 12–16   | 20    |
| Abs/Core       | 0    | 4     | 16–20   | 25    |

## Mesocycle Volume Progression

Within a training block, volume should progress from MEV toward MAV/MRV over 4–6 weeks, then reset with a deload:

```
Week 1: MEV (low volume, high freshness)
Week 2–4: MEV → MAV (progressive overload)
Week 5–6: MAV → MRV (peak stimulus)
Week 7: Deload (MV or rest)
```

## Application in OpenCoach

- The **programmer subagent** uses these landmarks to cap weekly sets per muscle group.
- Volume targets are adjusted based on `sport_context`:
  - **Bodybuilding / Hypertrophy** → train toward MAV/MRV.
  - **Sport performance** → stay near MEV–MAV to preserve recovery for sport training.
  - **Powerlifting / Strength** → lower volume, higher intensity; MAV on compound patterns only.
- After a deload week, reset to MEV and begin progressive accumulation again.
