<!-- Context: project/architecture | Priority: critical | Version: 1.0 | Updated: 2026-03-28 -->

# OpenCoach Architecture Rules

**Purpose**: Structural rules every agent and future contributor must follow. These override all other conventions when in conflict.

---

## Framework

OpenCoach follows the **OpenAgentsControl (OAC)** pattern: https://github.com/darrenhinde/OpenAgentsControl

All structural decisions — agent organization, context loading, approval gates, and information density — must remain compatible with OAC conventions.

---

## Rule 1: Propose → Approve → Execute

Every plan-generating step requires user approval before the next step executes.

```
Intake Check     → [ALL FIELDS GREEN] → Analyst Report
Analyst Report   → [USER APPROVES] → Diet Plan + Training Plan (parallel)
Diet + Training  → [USER APPROVES] → git commit
```

Never advance a stage without explicit user confirmation. Silence is not approval.

**Intake first:** Load `profile.json` and today's measures file before running the analyst. If any required field is missing, collect all missing fields in a single consolidated question. See `guides/intake.md`.

**Training plans always include full exercise detail** — exercise name, sets, reps, RPE, and coaching note for every exercise in every session. Session name only is never sufficient output.

**Subagent efficiency:** The Head Coach should run a single continuous session delegating inline rather than cold-spawning a new agent per stage. Each cold spawn re-derives context already available in the conversation. Only spawn a subagent when it has distinct file operations or context requirements (Rule 6).

---

## Rule 2: Minimal Viable Information (MVI)

Each agent loads **only the context files it needs** for its specific task. Do not load the full coaching context tree.

| Agent | Load |
|---|---|
| `opencoach-analyst` | None — data processing only |
| `opencoach-dietitian` | `michaels-methodology`, `nutrient-timing`, `metabolic-stalls`, `wroc-rpe-conflict` |
| `opencoach-programmer` | `michaels-methodology`, `rp-volume-landmarks`, `block-periodization`, `sport-switch` |
| Head Coach | Sport Goal Reference table (inline) + delegates to subagents |

Full spec: `.opencode/context/core/context-system.md`

---

## Rule 3: Context Priority Hierarchy

When two files conflict, higher priority wins:

1. `errors/` — active failure state, always overrides
2. `concepts/` — methodology rules
3. `guides/` — procedural workflows
4. `lookup/` — reference data only, never overrides rules

---

## Rule 4: Single Source of Truth for Exercises

All exercise data comes exclusively from the **ExerciseDB API MCP** (`RAPIDAPI_KEY` required). No hardcoded lists, no fallbacks, no prior knowledge substitution.

---

## Rule 5: Context File Format

Every context file must open with the frontmatter comment:
```
<!-- Context: <category/filename> | Priority: <critical|high|medium> | Version: X.X | Updated: YYYY-MM-DD -->
```

And follow the MVI formula:
```
Core Concept (1-3 sentences)
Key Points (3-5 bullets)
Quick Example
Reference (if applicable)
```

---

## Rule 6: Adding New Agents or Subagents

Before creating a new subagent, verify the task cannot be handled by the Head Coach as enriched delegation. A subagent is justified only when it has:
- Its own persistent file operations (reads/writes a specific folder)
- Distinct context requirements from existing subagents
- A clearly bounded responsibility

Do not create subagents for pure interpretation or translation tasks.
