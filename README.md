# OpenCoach

**A personal AI coaching system for fitness and nutrition, built on [OpenCode](https://opencode.ai).**

OpenCoach automates your check-in appointments: it analyzes your body composition progress, generates a sport-specific diet plan, and designs a training session — all from structured JSON data stored in this repository.

---

## How It Works

Every coaching session follows the **Propose → Approve → Execute** pattern:

```
/appointment
    ↓
1. Goal Confirmation     → reads/writes profile.json
    ↓
2. Data Collection       → measures saved to /measures
    ↓
3. Analysis              → WROC + BF% deltas         [APPROVAL GATE]
    ↓
4. Nutrition Plan        → diet file generated        [APPROVAL GATE]
    ↓
5. Training Plan         → training file generated    [APPROVAL GATE]
    ↓
6. Commit                → all files committed to git
```

---

## Methodology

OpenCoach is built around the **"Michaels" methodology**:

- **Metabolic Primer** — every training session opens with an AMRAP or Tabata circuit
- **High Protein** — 2.2g per kg of Lean Body Mass
- **RPE-based Progression** — intensity managed via Rate of Perceived Exertion
- **WROC Tracking** — Weekly Rate of Change drives caloric adjustments

Complementary frameworks layered on top:
- **RP Volume Landmarks** (MEV / MAV / MRV) — weekly set caps per muscle group
- **Block Periodization** — Accumulation → Intensification → Realization mesocycles
- **Nutrient Timing** — peri-workout macro distribution + Energy Availability floor (30 kcal/kg FFM)

---

## Sport-Specific Goals

OpenCoach adapts training and nutrition to your athletic goal. Supported profiles:

| Sport / Goal | Training Focus | Nutrition Strategy |
|---|---|---|
| Soccer | Explosive power + agility | Carb-dominant; match-day loading |
| Muay Thai | Power endurance + core | Moderate carb cycling; weight-class aware |
| Boxing / MMA | Explosive conditioning | Moderate carb; weight-class aware |
| Bodybuilding | Hypertrophy splits | Strict carb cycling around training |
| Powerlifting | Max strength; CNS adaptation | High calorie; strength-phase periodization |
| Basketball | Plyometrics + speed | Carb-focused; recovery nutrition |
| Endurance Running | Aerobic base + VO2max | High carb; low fat on long run days |
| CrossFit | GPP; mixed modal | Balanced macros; performance-first |
| Tennis | Agility + rotational power | Carb cycling; match-day loading |
| Cycling | Aerobic threshold + leg strength | High carb; fat adaptation optional |
| General Fitness | Balanced strength + cardio | Balanced macros |

---

## Agents

| Agent | Role |
|---|---|
| **Head Coach** (`opencoach.md`) | Orchestrates the full appointment workflow |
| **Analyst** | Calculates WROC and BF% deltas from `/measures` data |
| **Dietitian** | Generates diet plans in `/diet` using Michaels + sport context |
| **Programmer** | Designs training sessions in `/training` via ExerciseDB API |

---

## Data Structure

```
/
├── measures/          # Body measurement JSON files (measures-YYYY-MM-DD.json)
├── diet/              # Diet plan JSON files (diet-YYYY-MM-DD.json)
├── training/          # Training session JSON files (training-YYYY-MM-DD.json)
├── profile.json       # User sport goal and current block phase
├── .opencode/
│   ├── agent/
│   │   ├── core/opencoach.md           # Head Coach
│   │   └── subagents/opencoach/        # Analyst, Dietitian, Programmer
│   ├── command/appointment.md          # /appointment command
│   └── context/coaching/               # Methodology reference files
└── ui/                                 # Astro viewer (GitHub Pages)
```

---

## Setup

### Requirements

- [OpenCode CLI](https://opencode.ai/docs)
- `RAPIDAPI_KEY` — required for ExerciseDB exercise lookup ([RapidAPI](https://rapidapi.com/hub))

```bash
export RAPIDAPI_KEY=your_key_here
```

The Programmer subagent will refuse to generate training sessions without this key set.

### Start a Session

```bash
opencode
> /appointment
```

---

## UI

A read-only viewer for your data is available at **[hnrq.github.io/OpenCoach](https://hnrq.github.io/OpenCoach)**.

Built with Astro 6 + TuiCSS (retro Turbo Vision style). Displays diet plans, training sessions, and body measurements. Deployed automatically on every push to `main`.

See [`ui/README.md`](ui/README.md) for local development instructions.

---

## Architecture

OpenCoach follows [OpenAgentsControl (OAC)](https://github.com/darrenhinde/OpenAgentsControl) conventions:

- **Propose → Approve → Execute** at every stage gate
- **MVI (Minimal Viable Information)** — each subagent loads only the context files it needs
- **Context priority**: `errors/` > `concepts/` > `guides/` > `lookup/`
- **Single exercise data source**: ExerciseDB API MCP only — no fallbacks

Full architectural rules: [`.opencode/context/project/architecture.md`](.opencode/context/project/architecture.md)
