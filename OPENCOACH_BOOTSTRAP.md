# OpenCoach: Session Export & System Context

This Markdown file is designed to be the "source of truth" for your Gemini CLI or OpenAgentsControl session. It captures every technical decision, schema, and architectural rule we have established so far.

## 1. Project Overview
- **Agent Name:** OpenCoach (Custom OAC Agent)
- **Base Framework:** OpenAgentsControl (OAC) / OpenCoder
- **Reasoning Engine:** Gemini (Paid Tier / Pro / Ultra)
- **Data Strategy:** Local-first, JSON-versioned, strictly typed.
- **Methodology:** "Michaels" Training (Metabolic Primers + Strength/Hypertrophy Blocks).

## 2. Directory & File Schema
The repository must maintain the following structure. All filenames follow the format: `[type]-YYYY-MM-DD.json`.

### `/measures/` (Anthropometrics)
**Mandatory Fields:**
- `core_metrics`: weight, body_fat_pct.
- `mandatory_sites`: chest, waist_narrowest, umbilical, hip_widest, thigh_mid, bicep_flexed, forearm.
- `appointment_notes`: Goal, energy levels, sleep, and coach's summary.

### `/diet/` (Nutrition)
**Mandatory Fields:**
- `daily_targets`: calories, protein_g (2.0g/kg floor), carbs_g, fats_g.
- `meal_structure`: Pre/Post workout notes.
- `adjustments`: Rest day vs. Training day deltas.

### `/training/` (Exercise)
**Mandatory Fields:**
- `circuits`: Metabolic Primer (AMRAP/Tabata) + Strength Block.
- `progression_logic`: RPE-based or percentage-based increases.

## 3. Tooling & Execution Layer
The system uses TypeScript (within OAC) and sh scripts for deterministic data handling.
- **Data Extraction:** Uses jq via shell or fs in TS to isolate metrics.
- **Validation:** Every session save must be validated against its respective JSON schema.
- **Scripts (/bin):**
  - `coach-get-metric`: Fetches values from the $N$ most recent files.
  - `coach-save-session`: Validates and writes JSON to the correct folder.
  - `coach-analyze-progress`: Calculates deltas between the last two measurements.

## 4. Subagent Triad Definition
- **@analyst:** The data specialist. Responsible for calculating Weekly Rate of Change (WROC) and strength-to-weight correlations.
- **@dietitian:** The metabolic specialist. Adjusts calories/macros based on analyst reports and "Michaels" nutrition rules.
- **@programmer:** The routine specialist. Designs the "Michaels" phases and exercise selection from `library/exercises.json`.

## 5. Active Instructions for Gemini CLI
Upon loading this context, the AI must:
1. Initialize ContextScout to index the `/measures`, `/diet`, and `/training` folders.
2. Assume the role of Head Coach, coordinating the subagents.
3. Default to TypeScript for any new tool creation.
4. Reference the "Michaels" methodology for all plan generation.
