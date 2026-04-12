<!-- Context: coaching/exercisedb-optimization | Priority: high | Version: 1.2 | Updated: 2026-04-12 -->

# ExerciseDB Query Strategy (Optimized)

**Purpose**: High-speed, token-efficient exercise retrieval using the `mcp_exercisedb-api_Get_Exercises` endpoint.

---

## The "Batch & Deduct" Workflow

### Step 1: Discover Vocabulary (Automated Cache)

The system uses a local cache with a **30-day TTL** managed by the `fetch-vocabulary` script.

1. **Automated Logic**: The `opencoach-programmer` subagent automatically runs `pnpm opencoach fetch-vocabulary` at the start of every session.
2. **Idempotency**: The script checks the cache age. It only performs network calls if the cache is missing or older than 30 days. Otherwise, it exits instantly.
3. **Load**: The vocabulary is automatically loaded into your context via `cat` in the initial bash block. Do NOT call the `Get All...` MCP tools yourself.

### Step 2: Contextual Mapping

Map the Head Coach's derived context (`sport_context.movement_patterns`, `sport_context.training_focus`) and the athlete's `injuries` to the official ExerciseDB vocabulary.

- *Example*: "Lateral cuts" → `lower legs,upper legs`.
- *Example*: Equipment "Dumbbells" from `athlete-notes.md` → `dumbbell`.

### Step 3: Comma-Separated Batching

Use the `mcp_exercisedb-api_Get_Exercises` tool with multiple values in a single call to save tokens and time.

- **WHY?**: `mcp_exercisedb-api_Get_Exercises` returns the full object with all required fields (`name`, `bodyPart`, `equipment`, `target`) in a single payload.

**Rules for `mcp_exercisedb-api_Get_Exercises`:**

- **Limit**: Always set `limit: 50`.
- **Parameter Batching**: Multiple values (comma-separated) can be provided for `bodyParts`, `equipments`, `targetMuscles`, and `secondaryMuscles`. This fetches exercises matching *any* of the values (OR logic).
  - *Example*: `targetMuscles: "quads,glutes,hamstrings"`
  - *Example*: `bodyParts: "chest,back,shoulders"`

- **Equipment Injection**: Always pass the athlete's available equipment (from `athlete-notes.md`) as a comma-separated list to the `equipments` parameter.
- **Pagination**: If the programmer needs more exercises for a specific query, use `limit`, `after`, and `before` to paginate through the results.

### Step 4: Assertive Internal Selection

The API returns a batch of up to 50 exercises. Do not make additional API calls (like `mcp_exercisedb-api_Get_Exercise_By_Id`) for individual exercises. Instead, use your internal reasoning to select the best 6-8 exercises from this batch that fit the specific session's block phase, metabolic primer needs, and injury constraints.

---

## Token Efficiency & Stability Rules

- **EXCLUSIVELY USE `mcp_exercisedb-api_Get_Exercises`**: This is the only endpoint needed for fetching exercises.
- **NEVER** use `mcp_exercisedb-api_Get_Exercise_By_Id` (redundant) or `mcp_exercisedb-api_Get_Exercises_By_Search` (fuzzy/inefficient).
- **Batch filters**: One call with multiple comma-separated values (e.g., 3 muscles) is much cheaper and faster than individual calls.
- **Zero Hallucination**: Only use strings returned by the List Endpoints for filtering.
- **Parallel Execution**: If multiple API calls are required (like fetching vocabulary lists or paginating), execute them **concurrently in a single turn**.
- **Rate Limit Handling**: If `RATE_LIMIT_EXCEEDED` occurs, implement a 2-second sleep or fallback to internal knowledge.
