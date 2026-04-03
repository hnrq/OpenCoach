<!-- Context: project/maintenance-map | Priority: dev-only | Version: 1.0 | Updated: 2026-04-03 -->
<!-- !! DEV/MAINTAINER USE ONLY — NEVER load this file in coaching sessions or agent context !! -->
<!-- Not listed in navigation.md. Not in any agent MVI table. Invisible to the coaching flow. -->

# Maintenance Map — Cross-Reference Registry

**Purpose**: Track every cross-file dependency in OpenCoach so that when a file is added, renamed, or restructured, all references can be updated in the same commit. Consult this before any structural change.

---

## How to use

1. Before renaming or deleting a file, search the **Referenced by** column.
2. After adding a new file, add its entry here.
3. After changing a file's schema or key structure, check the **Consumers** column and update them.

---

## Context Files

| File | Referenced by | Notes |
|---|---|---|
| `coaching/concepts/michaels-methodology.md` | `opencoach-dietitian.md`, `opencoach-programmer.md`, `project/architecture.md` (MVI table), `navigation.md` | Core methodology — any rename breaks MVI table |
| `coaching/concepts/rp-volume-landmarks.md` | `opencoach-programmer.md`, `navigation.md` | |
| `coaching/concepts/block-periodization.md` | `opencoach-programmer.md`, `navigation.md` | |
| `coaching/concepts/nutrient-timing.md` | `opencoach-dietitian.md`, `navigation.md`, `errors/wroc-rpe-conflict.md` | Referenced inline by wroc-rpe-conflict |
| `coaching/guides/intake.md` | `project/architecture.md`, `navigation.md`, `opencoach.md` (head coach Step 1) | If renamed, update all 3 |
| `coaching/guides/tracking-measures.md` | `navigation.md` | |
| `coaching/guides/diet-ingredient-constraints.md` | `navigation.md`, `opencoach-dietitian.md` | Added 2026-04-03 |
| `coaching/errors/metabolic-stalls.md` | `navigation.md` | Created 2026-04-03; was a dead reference before |
| `coaching/errors/sport-switch.md` | `navigation.md` | |
| `coaching/errors/wroc-rpe-conflict.md` | `navigation.md`, `errors/metabolic-stalls.md` | metabolic-stalls.md cross-references this |
| `core/context-system.md` | `project/architecture.md` (Rule 2 full spec link) | |
| `core/context-system/standards/mvi.md` | `core/context-system.md` | |
| `core/context-system/operations/harvest.md` | `coaching/navigation.md` (implicitly, post-appointment) | |
| `project/architecture.md` | `opencoach.md` (head coach critical rules), all agents (via OAC pattern) | Structural rules — changes affect all agents |

---

## Data Files & Schemas

| File / Pattern | Schema consumers | Notes |
|---|---|---|
| `profile.json` | `coach-setup-profile.ts` (writes), `opencoach.md` (reads via shell), `appointment.md` (reads), `coach-checkin.ts` (reads), all subagent prompts | Adding a top-level field: update `coach-setup-profile.ts` interface + prompts |
| `measures/measures-YYYY-MM-DD.json` | `coach-save-session.ts` (validates via `MeasuresSession`), `coach-analyze-progress.ts` (reads), `analytics/wroc.json` (derived) | Schema: core_metrics + mandatory_sites + appointment_notes |
| `diet/diet-YYYY-MM-DD.json` | `coach-save-session.ts` (validates via `DietSession`), `opencoach-dietitian.md` (writes) | Schema: day_types + weekly_schedule + michaels_floors. Updated 2026-04-03 — was flat daily_targets |
| `training/training-YYYY-MM-DD.json` | `coach-save-session.ts` (validates via `TrainingSession`), `opencoach-programmer.md` (writes) | Schema: sessions[] with full exercise detail. Updated 2026-04-03 — was circuits[] |
| `analytics/wroc.json` | `coach-analyze-progress.ts` (reads + writes), `opencoach.md` head coach Step 1 | Created 2026-04-03. Must be updated after every measures session |

---

## Scripts

| Script | Reads | Writes | Depends on schema of |
|---|---|---|---|
| `coach-setup-profile.ts` | `profile.json` (existing, optional) | `profile.json` | `UserProfile` interface in script |
| `coach-analyze-progress.ts` | `measures/*.json`, `analytics/wroc.json` | `analytics/wroc.json` | `MeasuresSession`, `wroc.json` shape |
| `coach-save-session.ts` | input JSON file | `measures/`, `diet/`, or `training/` folder | `MeasuresSession`, `DietSession`, `TrainingSession` interfaces |
| `coach-checkin.ts` | `profile.json` | `measures/measures-TODAY.json` | `MeasuresSession` |
| `coach-generate-diet.ts` | `profile.json`, `analytics/wroc.json` | `diet/diet-TODAY.json` | `DietSession` (new day_types schema) |
| `coach-generate-training.ts` | `profile.json` | `training/training-TODAY.json` | `TrainingSession` (new sessions[] schema) |
| `coach-import-pdf.ts` | PDF file | `measures/measures-DATE.json` | `MeasuresSession` |

---

## Agent Definitions

| Agent file | Context it loads (MVI) | Subagents it calls |
|---|---|---|
| `.opencode/agent/core/opencoach.md` | None (delegates only) | analyst, dietitian, programmer |
| `.opencode/agent/subagents/opencoach/opencoach-analyst.md` | None — data processing only | None |
| `.opencode/agent/subagents/opencoach/opencoach-dietitian.md` | michaels-methodology, nutrient-timing, metabolic-stalls, wroc-rpe-conflict, **diet-ingredient-constraints** | None |
| `.opencode/agent/subagents/opencoach/opencoach-programmer.md` | michaels-methodology, rp-volume-landmarks, block-periodization, sport-switch | None |

---

## Known Past Breakages (changelog)

| Date | What broke | Cause | Fix |
|---|---|---|---|
| 2026-04-03 | `errors/metabolic-stalls.md` missing | Referenced in navigation.md but never created | Created the file |
| 2026-04-03 | `coach-save-session.ts` DietSession type stale | diet schema changed to day_types but interface not updated | Updated interface and validator |
| 2026-04-03 | `coach-analyze-progress.ts` ignores wroc.json | wroc.json created but script not updated to read/write it | Updated script |
| 2026-04-03 | Head coach doesn't ask about injuries | intake.md added the rule but opencoach.md not updated | Updated opencoach.md |
| 2026-04-03 | appointment.md skips intake gate | intake.md created but appointment.md workflow not updated | Updated appointment.md |
