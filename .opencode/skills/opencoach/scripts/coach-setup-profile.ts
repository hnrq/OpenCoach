import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * OpenCoach: coach-setup-profile.ts
 * One-time / on-change profile setup.
 * Writes profile.json at repo root.
 */

interface TrainingSchedule {
  sport_days: string[];
  sport_timing: string;
  gym_days: string[];
  gym_timing_on_sport_days: string;
  rest_days: string[];
}

interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  birth_date: string;
  height_cm: number;
  sport_goal: string;
  target_weight_kg: { min: number; max: number };
  training_schedule: TrainingSchedule;
  injuries: string[];
}

const PROFILE_PATH = path.join(process.cwd(), 'profile.json');
const TEMP_PATH = path.join(process.cwd(), 'profile.json.tmp');
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function loadExisting(): Partial<UserProfile> {
  if (fs.existsSync(PROFILE_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
      // Migrate legacy futsal_* field names to sport_*
      if (raw.training_schedule) {
        const ts = raw.training_schedule;
        if (ts.futsal_days !== undefined && ts.sport_days === undefined) ts.sport_days = ts.futsal_days;
        if (ts.futsal_timing !== undefined && ts.sport_timing === undefined) ts.sport_timing = ts.futsal_timing;
        if (ts.gym_timing_on_futsal_days !== undefined && ts.gym_timing_on_sport_days === undefined)
          ts.gym_timing_on_sport_days = ts.gym_timing_on_futsal_days;
      }
      return raw;
    } catch {
      console.warn('Warning: existing profile.json is malformed — starting fresh.');
    }
  }
  return {};
}

function deriveAge(birthDate: string): number {
  const [year, month, day] = birthDate.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) age--;
  return age;
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function promptField(
  rl: readline.Interface,
  label: string,
  defaultVal?: string | number
): Promise<string> {
  const hint = defaultVal !== undefined ? ` [${defaultVal}]` : '';
  const answer = await ask(rl, `  ${label}${hint}: `);
  return answer !== '' ? answer : (defaultVal !== undefined ? String(defaultVal) : '');
}

/** Prompt for a comma-separated list. Returns array of trimmed non-empty strings. */
async function promptList(
  rl: readline.Interface,
  label: string,
  example: string,
  existing?: string[]
): Promise<string[]> {
  const hint = existing?.length ? ` [${existing.join(', ')}]` : ` (e.g. ${example})`;
  const answer = await ask(rl, `  ${label}${hint}: `);
  if (answer === '' && existing?.length) return existing;
  return answer.split(',').map(s => s.trim()).filter(Boolean);
}

/** Prompt for day selection from DAYS. Returns selected day names. Allows empty selection. */
async function promptDays(
  rl: readline.Interface,
  label: string,
  existing?: string[],
  optional = false
): Promise<string[]> {
  const currentLabel = existing?.length ? ` [current: ${existing.join(', ')}]` : optional ? ' [none]' : '';
  console.log(`\n  ${label}${currentLabel}:`);
  DAYS.forEach((d, i) => console.log(`    ${i + 1}. ${d}`));
  const noneHint = optional ? ', or 0 for none' : '';
  while (true) {
    const raw = await ask(rl, `  Enter numbers (e.g. 1,3,5)${noneHint}${existing !== undefined ? ' or Enter to keep' : ''}: `);
    if (raw === '' && existing !== undefined) return existing ?? [];
    if (raw === '0' && optional) return [];
    const indices = raw.split(',').map(s => parseInt(s.trim(), 10));
    if (indices.every(i => i >= 1 && i <= 7)) return indices.map(i => DAYS[i - 1]);
    console.log(`  → Use numbers 1–7 separated by commas${noneHint}.`);
  }
}

async function main() {
  const existing = loadExisting();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n── OpenCoach Profile Setup ──────────────────');
  if (Object.keys(existing).length > 0) {
    console.log('  Existing values shown in [brackets]. Press Enter to keep.\n');
  }

  try {
    // ── Demographics ─────────────────────────────
    console.log('\n  [ Demographics ]');

    const name = await promptField(rl, 'Name', existing.name);
    if (!name) { console.error('Error: name is required.'); process.exit(1); }

    const GENDERS = ['male', 'female'] as const;
    const currentGenderIdx = existing.gender ? GENDERS.indexOf(existing.gender) + 1 : undefined;
    console.log(`  Gender${currentGenderIdx ? ` [current: ${existing.gender}]` : ''}:`);
    GENDERS.forEach((g, i) => console.log(`    ${i + 1}. ${g.charAt(0).toUpperCase() + g.slice(1)}`));
    let gender: typeof GENDERS[number] | '' = '';
    while (!gender) {
      const raw = await ask(rl, `  Choice [1/2]${currentGenderIdx ? ` (Enter = ${currentGenderIdx})` : ''}: `);
      const idx = raw === '' && currentGenderIdx ? currentGenderIdx : parseInt(raw, 10);
      if (idx >= 1 && idx <= GENDERS.length) gender = GENDERS[idx - 1];
      else console.log('  → Enter 1 or 2.');
    }

    let birth_date = '';
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    while (!dateRegex.test(birth_date)) {
      birth_date = await promptField(rl, 'Birth date (YYYY-MM-DD)', existing.birth_date);
      if (!dateRegex.test(birth_date)) console.log('  → Format must be YYYY-MM-DD.');
    }

    let height_cm = 0;
    while (height_cm <= 0) {
      const raw = await promptField(rl, 'Height (cm)', existing.height_cm);
      height_cm = parseFloat(raw);
      if (isNaN(height_cm) || height_cm <= 0) { console.log('  → Must be a positive number.'); height_cm = 0; }
    }

    const sport_goal = await promptField(rl, 'Sport / Goal (e.g. Running, Bodybuilding, General Fitness)', existing.sport_goal);
    if (!sport_goal) { console.error('Error: sport_goal is required.'); process.exit(1); }

    // ── Target Weight ─────────────────────────────
    console.log('\n  [ Target Weight ]');

    let tw_min = 0;
    while (tw_min <= 0) {
      const raw = await promptField(rl, 'Target weight — minimum (kg)', existing.target_weight_kg?.min);
      tw_min = parseFloat(raw);
      if (isNaN(tw_min) || tw_min <= 0) { console.log('  → Must be a positive number.'); tw_min = 0; }
    }
    let tw_max = 0;
    while (tw_max < tw_min) {
      const raw = await promptField(rl, 'Target weight — maximum (kg)', existing.target_weight_kg?.max);
      tw_max = parseFloat(raw);
      if (isNaN(tw_max) || tw_max < tw_min) { console.log(`  → Must be >= minimum (${tw_min}).`); tw_max = 0; }
    }

    // ── Training Schedule ─────────────────────────
    console.log('\n  [ Training Schedule ]');

    const gym_days = await promptDays(rl, 'Gym days', existing.training_schedule?.gym_days);
    const sport_days = await promptDays(rl, 'Sport / cardio days (0 for none)', existing.training_schedule?.sport_days, true);

    const allTrainingDays = [...new Set([...gym_days, ...sport_days])];
    const rest_days = DAYS.filter(d => !allTrainingDays.includes(d));
    console.log(`  → Rest days (auto-derived): ${rest_days.length ? rest_days.join(', ') : 'none'}`);

    let sport_timing = 'evening';
    let gym_timing_on_sport_days = 'morning';

    if (sport_days.length > 0) {
      const sport_timing_raw = await promptField(
        rl, 'Sport / cardio timing (morning / evening)', existing.training_schedule?.sport_timing ?? 'evening'
      );
      sport_timing = sport_timing_raw || 'evening';

      gym_timing_on_sport_days = await promptField(
        rl,
        'On sport days, when do you gym? (morning / evening)',
        existing.training_schedule?.gym_timing_on_sport_days ?? 'morning'
      ) || 'morning';
    }

    // Equipment and food preferences live in .opencode/context/coaching/athlete-notes.md — not collected here.
    const injuries: string[] = existing.injuries ?? [];

    // ── Build & save ──────────────────────────────
    const profile: UserProfile = {
      name,
      gender: gender as 'male' | 'female',
      birth_date,
      height_cm,
      sport_goal,
      target_weight_kg: { min: tw_min, max: tw_max },
      training_schedule: {
        sport_days,
        sport_timing,
        gym_days,
        gym_timing_on_sport_days,
        rest_days,
      },
      injuries,
    };

    fs.writeFileSync(TEMP_PATH, JSON.stringify(profile, null, 2));
    fs.renameSync(TEMP_PATH, PROFILE_PATH);

    const age = deriveAge(birth_date);
    console.log(`\n✓ profile.json saved.`);
    console.log(`  ${name} · ${gender} · Age ${age} · ${height_cm} cm · ${sport_goal}`);
    console.log(`  Target: ${tw_min}–${tw_max} kg`);
    console.log(`  Gym days: ${gym_days.join(', ') || 'none'}`);
    if (sport_days.length > 0) {
      console.log(`  Sport / cardio days: ${sport_days.join(', ')} (${sport_timing})`);
    } else {
      console.log(`  Sport / cardio days: none`);
    }
    console.log(`  Equipment + food preferences: see athlete-notes.md`);
    console.log(`  Injuries: asked by coach during appointment`);
    console.log();
  } finally {
    rl.close();
    if (fs.existsSync(TEMP_PATH)) fs.unlinkSync(TEMP_PATH);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
