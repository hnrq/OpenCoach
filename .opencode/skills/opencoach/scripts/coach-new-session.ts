import * as fs from 'fs';
import * as path from 'path';
import type {
  MeasuresSession,
  DietSession,
  TrainingSession,
  AppointmentArtifact,
} from '../../../../packages/schemas/src/index.ts';

/**
 * OpenCoach: coach-new-session.ts
 * Generates schema-valid JSON skeletons for a new session.
 *
 * Usage:
 *   new-session <type> --date YYYY-MM-DD [--force]
 *   new-session --help
 */

type SessionType = 'measures' | 'diet' | 'training' | 'appointment';
const VALID_TYPES: SessionType[] = ['measures', 'diet', 'training', 'appointment'];

// ── Path resolution ───────────────────────────────────────────────────────────

function resolvePath(type: SessionType, date: string): string {
  const root = process.cwd();
  if (type === 'appointment') {
    return path.join(root, 'appointments', `appointment-${date}.json`);
  }
  return path.join(root, type, `${type}-${date}.json`);
}

// ── Skeleton generators ───────────────────────────────────────────────────────

function measuresSkeleton(_date: string): MeasuresSession {
  return {
    core_metrics: {
      weight: 0,
      body_fat_pct: 0,
    },
    mandatory_sites: {
      chest: 0,
      waist_narrowest: 0,
      umbilical: 0,
      hip_widest: 0,
      thigh_mid: 0,
      bicep_flexed: 0,
      forearm: 0,
    },
    appointment_notes: {
      goal: "",
      energy_levels: "",
      sleep: "",
      coach_summary: "",
    },
  };
}

function dietSkeleton(date: string): DietSession {
  return {
    athlete: "",
    date,
    methodology: "Michaels",
    macro_rules: {
      protein_g_per_kg_lbm: 2.2,
      fat_g_per_kg_bodyweight: 0.8,
      protein_g: 0,
      fat_g: 0,
    },
    day_types: {
      gymOnly:   { days: ["monday", "wednesday", "friday"], macros_g: { protein: 0, carbs: 0, fat: 0 }, meal_templates: [{ title: "Breakfast", timing: "", ingredients: [{ food: "", grams: 0 }] }] },
      legsDay:   { days: ["wednesday"],                     macros_g: { protein: 0, carbs: 0, fat: 0 }, meal_templates: [{ title: "Breakfast", timing: "", ingredients: [{ food: "", grams: 0 }] }] },
      futsalGym: { days: ["tuesday", "thursday"],           macros_g: { protein: 0, carbs: 0, fat: 0 }, meal_templates: [{ title: "Breakfast", timing: "", ingredients: [{ food: "", grams: 0 }] }] },
      restDay:   { days: ["sunday"],                        macros_g: { protein: 0, carbs: 0, fat: 0 }, meal_templates: [{ title: "Breakfast", timing: "", ingredients: [{ food: "", grams: 0 }] }] },
    },
    rationale: [],
  };
}

function trainingSkeleton(date: string): TrainingSession {
  return {
    athlete: "",
    date,
    methodology: "Michaels",
    sport_context: {
      sport: "",
      training_focus: "",
      movement_patterns: "",
      injury_areas: [],
    },
    constraints: {
      no_jumping: false,
      gym_only: true,
    },
    progression: {
      rpe_targets: { main_lifts: "7–8", accessories: "7–8" },
      rule: "If last set is clean and <=RPE7, add 2.5–5% or +1 rep next week. If >=RPE9 or pain, reduce 5–10%.",
    },
    weekly_schedule: {},
    warmup_template: {
      optional: ["Bike or treadmill 5 min easy"],
      mobility: [],
      ramp_sets: "2–4 ramp sets for first lift",
    },
    sessions: [],
  };
}

function appointmentSkeleton(date: string): AppointmentArtifact {
  let athlete = "";
  try {
    const profile = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'profile.json'), 'utf8'));
    athlete = profile.name ?? "";
  } catch {}

  return {
    date,
    athlete,
    decisions: [],
    preferences_delta: {
      food_swaps: [],
      food_additions: [],
      food_removals: [],
      constraints_added: [],
      constraints_removed: [],
      schedule_changes: [],
    },
    plan_rationale_deltas: [],
    notes: "",
  };
}

function buildSkeleton(type: SessionType, date: string): MeasuresSession | DietSession | TrainingSession | AppointmentArtifact {
  switch (type) {
    case 'measures':    return measuresSkeleton(date);
    case 'diet':        return dietSkeleton(date);
    case 'training':    return trainingSkeleton(date);
    case 'appointment': return appointmentSkeleton(date);
  }
}

// ── Help ──────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
Usage: opencoach new-session <type> --date YYYY-MM-DD [--force]

Types:
  measures     Anthropometric check-in skeleton
  diet         Nutritional plan skeleton (day_types: gymOnly/legsDay/futsalGym/restDay)
  training     Training plan skeleton (sessions: [])
  appointment  Appointment artifact skeleton (decisions + preferences_delta)

Options:
  --date YYYY-MM-DD   Target date for the session file (required)
  --force             Overwrite if the file already exists
  --help              Show this help

Output paths:
  measures    → measures/measures-YYYY-MM-DD.json
  diet        → diet/diet-YYYY-MM-DD.json
  training    → training/training-YYYY-MM-DD.json
  appointment → appointments/appointment-YYYY-MM-DD.json

Examples:
  opencoach new-session measures --date 2026-04-05
  opencoach new-session diet --date 2026-04-05
  opencoach new-session appointment --date 2026-04-05 --force

After creating a skeleton, fill in the values, then validate with:
  opencoach save-session <type> --date <date>
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const type = args[0] as SessionType;
  if (!VALID_TYPES.includes(type)) {
    console.error(`Error: invalid type "${type}".`);
    console.error(`Valid types: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }

  const dateIdx = args.indexOf('--date');
  if (dateIdx === -1 || !args[dateIdx + 1]) {
    console.error('Error: --date YYYY-MM-DD is required.');
    console.error(`Run  opencoach new-session --help  for usage.`);
    process.exit(1);
  }
  const date = args[dateIdx + 1];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error('Error: --date must be in YYYY-MM-DD format.');
    process.exit(1);
  }

  const force = args.includes('--force');
  const outPath = resolvePath(type, date);
  const rel = path.relative(process.cwd(), outPath);

  if (fs.existsSync(outPath) && !force) {
    console.error(`Error: ${rel} already exists.`);
    console.error(`Use --force to overwrite.`);
    process.exit(1);
  }

  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const skeleton = buildSkeleton(type, date);
  fs.writeFileSync(outPath, JSON.stringify(skeleton, null, 2));
  console.log(`✓ Created skeleton: ${rel}`);
  console.log(`  Fill in the values, then run:`);
  console.log(`  opencoach save-session ${type} --date ${date}`);
}

main();
