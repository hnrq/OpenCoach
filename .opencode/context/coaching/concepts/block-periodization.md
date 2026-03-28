<!-- Context: coaching/block-periodization | Priority: high | Version: 1.0 | Updated: 2026-03-28 -->

# Concept: Block Periodization

**Purpose**: Organize training into sequential mesocycle blocks, each with a concentrated focus, to build fitness qualities progressively without interference.

**Source**: Vladimir Issurin. Supported by Bompa & Haff (Periodization: Theory and Methodology of Training).

---

## Core Idea

Rather than training all qualities simultaneously (which causes interference), block periodization concentrates one or two qualities per mesocycle. Each block builds on the previous one.

## The Three Standard Blocks

### 1. Accumulation Block (3–6 weeks)
- **Goal**: Build work capacity and hypertrophy base.
- **Volume**: High (toward MAV/MRV per RP landmarks).
- **Intensity**: Moderate (RPE 6–8, 60–75% 1RM).
- **Focus**: Movement quality, muscle building, aerobic base.

### 2. Intensification Block (3–4 weeks)
- **Goal**: Convert volume base into strength/power.
- **Volume**: Moderate (MEV–MAV).
- **Intensity**: High (RPE 8–9, 75–90% 1RM).
- **Focus**: Strength expression, neuromuscular adaptation.

### 3. Realization Block (1–2 weeks)
- **Goal**: Peak performance — test maxes, compete, or demonstrate sport fitness.
- **Volume**: Low (MV).
- **Intensity**: Very high (RPE 9–10, >90% 1RM) or sport-specific simulation.
- **Focus**: Taper, peak, and express accumulated fitness.

## Deload
Always follow a realization block with a **deload week** (MV, RPE ≤6) before starting the next accumulation block.

## Sport-Specific Block Mapping

| Sport Goal      | Accumulation Focus          | Intensification Focus          | Realization Focus                |
|-----------------|-----------------------------|--------------------------------|----------------------------------|
| Soccer          | Aerobic base + leg volume   | Speed-strength + lactate threshold | Match-simulation conditioning  |
| Muay Thai       | GPP + striking volume       | Power endurance + sparring load | Fight camp / competition peak   |
| Bodybuilding    | Hypertrophy (MAV→MRV)       | Strength + density             | Peak week / stage conditioning  |
| Powerlifting    | Volume on SBD patterns      | Intensity (85–95% 1RM)         | Opener selection + meet peak    |
| General Fitness | Balanced strength + cardio  | Progressive overload           | Deload / fitness test           |

## Low Training Frequency (2x/week)

When `profile.json` indicates ≤2 training sessions per week, the standard block structure still applies but with these mandatory adjustments:

- **MEV becomes the ceiling**, not the floor — 2x/week is insufficient volume to safely push toward MAV/MRV for most muscle groups.
- **Full-body or upper/lower splits only** — no push/pull/legs or isolation-heavy splits. Every session must hit the major movement patterns.
- **Compound movements mandatory** — each session must cover at least one horizontal push, one horizontal/vertical pull, one squat pattern, and one hinge pattern to distribute stimulus across muscle groups efficiently.
- **Extend mesocycle length to 6–8 weeks** — stimulus accumulates more slowly; shorter blocks will not produce enough adaptive signal before deload.
- **Metabolic primer still required** on both sessions regardless of frequency.
- Do not skip the deload — even at low frequency, accumulated fatigue is real.

## Application in OpenCoach

- The **programmer subagent** reads `block_phase` and weekly session count from `profile.json` before designing a session.
- Block phase should be stored in `profile.json` alongside `sport_goal`.
- Mesocycle length and block transitions are tracked via training file dates.
- Combine with **RP Volume Landmarks** (`rp-volume-landmarks.md`) to set weekly set targets per block phase.
- If a sport switch occurs mid-block, follow `errors/sport-switch.md`.
