# Full Coaching Workflow: Professional Metabolic Recomposition

> **Complete end-to-end example** demonstrating the Multi-Stage Orchestration Workflow applied to the **OpenCoach** system and the "Michaels" methodology.

---

## Table of Contents

1. [Coaching Request](#coaching-request)
2. [Stage 1: Metabolic Decomposition](#stage-1-metabolic-decomposition)
3. [Stage 2: Journey Mapping](#stage-2-journey-mapping)
4. [Stage 3: Intervention Prioritization](#stage-3-intervention-prioritization)
5. [Stage 4: Appointment Task Breakdown](#stage-4-enhanced-task-breakdown)
6. [Stage 5: Data Schema Contracts](#stage-5-contract-definition)
7. [Stage 6: Specialist Execution](#stage-6-parallel-execution)
8. [Stage 7: Integrated Plan Validation](#stage-7-integration--validation)
9. [Stage 8: Learning & Progress Capture](#stage-8-release--learning)
10. [Summary](#summary)

---

## Coaching Request

**Goal Name**: 16-Week Athletic Recomposition

**Coaching Objective**: Transform a high-body-fat individual into a lean athlete by optimizing energy balance, increasing protein intake, and implementing high-intensity metabolic conditioning.

**Requirements**:
- Establish a "Metabolic Primer" habit (AMRAP/Tabata)
- Maintain a strict protein floor (2.2g per kg of LBM)
- Track 7 mandatory anthropometric sites weekly
- Adjust caloric intake based on 14-day rolling WROC (Weekly Rate of Change)
- Scale training volume using RPE 8-9 targets

**Success Criteria**:
- WROC between -0.5% and -1.0% of body weight per week
- Increase in Strength Block volume over 4 weeks
- 100% adherence to daily protein targets
- Improvement in Metabolic Primer density (reps per minute)

---

## Stage 1: Metabolic Decomposition

**Agent**: Head Coach (orchestrator) + ContextScout

**Process**:
The Head Coach analyzes the client's current baseline and decomposes the 16-week goal into "Metabolic Bounded Contexts."

### System Analysis Output

**File**: `.tmp/tasks/athletic-recomposition/contexts.json`

```json
{
  "feature": "athletic-recomposition",
  "analyzed_at": "2026-03-28T10:00:00Z",
  "bounded_contexts": [
    {
      "name": "nutrition-strategy",
      "description": "Manages energy balance and macro allocation",
      "aggregates": ["DailyMacros", "MealTiming"],
      "invariants": [
        "Protein must be >= 2.2g/kg LBM",
        "Fats must be >= 0.8g/kg total weight"
      ]
    },
    {
      "name": "training-design",
      "description": "Manages stimulus and recovery cycles",
      "aggregates": ["MetabolicPrimer", "StrengthBlock"],
      "invariants": [
        "Every session starts with a Primer",
        "RPE must stay between 7 and 9"
      ]
    }
  ]
}
```

---

## Stage 2: Journey Mapping

**Agent**: Head Coach + StoryMapper (adapted for Coaching)

**Process**:
Mapping the "User Journey" as a "Metabolic Journey" across 16 weeks.

### Journey Map Output

**File**: `.tmp/planning/athletic-recomposition/map.json`

```json
{
  "phases": [
    {
      "id": "metabolic-primer-phase",
      "weeks": "1-4",
      "goal": "Upregulate metabolism and establish technique",
      "focus": "Movement quality and Primer density"
    },
    {
      "id": "intensification-phase",
      "weeks": "5-12",
      "goal": "Maximize fat loss while retaining LBM",
      "focus": "Aggressive WROC tracking and RPE 9 blocks"
    }
  ]
}
```

---

## Stage 3: Intervention Prioritization

**Agent**: Head Coach + PrioritizationEngine

**Process**:
Scoring different metabolic interventions (e.g., "Intermittent Fasting" vs "Carb Cycling") using RICE/WSJF.

**MVP (Minimum Viable Plan)**:
1. High Protein Floor (High Impact, High Confidence)
2. Daily Metabolic Primer (High Impact, Low Effort)
3. Weekly Progress Photos (Low Effort, High Confidence)

---

## Stage 4: Appointment Task Breakdown

**Agent**: TaskManager + ContextScout

**Process**:
Breaking the weekly appointment into atomic subtasks for the specialists.

### Task Output

**File**: `.tmp/tasks/weekly-checkin-w1/task.json`

```json
{
  "subtasks": [
    { "id": "01", "title": "Analyze last 14 days of weight data", "agent": "opencoach-analyst" },
    { "id": "02", "title": "Adjust carbs based on WROC", "agent": "opencoach-dietitian" },
    { "id": "03", "title": "Update Strength Block exercises", "agent": "opencoach-programmer" }
  ]
}
```

---

## Stage 5: Data Schema Contracts

**Agent**: Head Coach + ContractManager

**Process**:
Defining the "Contracts" (JSON Schemas) that ensure data integrity between specialists.

**Schemas**:
- `schemas/measures.schema.json`: Standardizes the 7 mandatory sites.
- `schemas/diet.schema.json`: Standardizes macro reporting.
- `schemas/training.schema.json`: Standardizes circuit design.

---

## Stage 6: Specialist Execution

**Agent**: Specialist Subagents (Analyst, Dietitian, Programmer)

**Workflow**:
1. **Analyst**: Fetches `.measures/*.json`, calculates WROC, reports "Stall" or "Loss".
2. **Dietitian**: Receives WROC, checks protein floor, generates `diet-YYYY-MM-DD.json`.
3. **Programmer**: Receives fatigue data, selects exercises from `library/exercises.json`, generates `training-YYYY-MM-DD.json`.

---

## Stage 7: Integrated Plan Validation

**Agent**: Head Coach + Validator

**Validation Rules**:
- ✅ Is the primer present?
- ✅ Is protein >= 2.2g/kg LBM?
- ✅ Are all 7 sites tracked?
- ✅ Does the training intensity match the current phase?

---

## Stage 8: Learning & Progress Capture

**Agent**: Head Coach

**Process**:
The Head Coach reviews the results of the 16-week journey, updates the `coaching/lookup/user-baseline.md` with the new metabolic set-point, and commits the final progress report to the repository.

---

## Summary

This workflow ensures that every coaching decision is:
1. **Data-Driven**: Grounded in analyzed anthropometrics.
2. **Methodologically Sound**: Strictly follows Michaels rules.
3. **Structured**: Stored in version-controlled JSON for long-term tracking.
