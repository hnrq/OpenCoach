import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * OpenCoach: coach-setup-profile.ts
 * One-time / on-change profile setup for demographic data.
 * Writes profile.json at repo root.
 */

interface UserProfile {
  name: string;
  gender: 'male' | 'female';
  birth_date: string; // YYYY-MM-DD
  height_cm: number;
  sport_goal: string;
}

const PROFILE_PATH = path.join(process.cwd(), 'profile.json');
const TEMP_PATH = path.join(process.cwd(), 'profile.json.tmp');

function loadExisting(): Partial<UserProfile> {
  if (fs.existsSync(PROFILE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
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

async function main() {
  const existing = loadExisting();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n── OpenCoach Profile Setup ──────────────────');
  if (Object.keys(existing).length > 0) {
    console.log('  Existing values shown in [brackets]. Press Enter to keep.\n');
  }

  try {
    // Name
    const name = await promptField(rl, 'Name', existing.name);
    if (!name) { console.error('Error: name is required.'); process.exit(1); }

    // Gender — numbered selection
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

    // Birth date
    let birth_date = '';
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    while (!dateRegex.test(birth_date)) {
      birth_date = await promptField(rl, 'Birth date (YYYY-MM-DD)', existing.birth_date);
      if (!dateRegex.test(birth_date)) {
        console.log('  → Format must be YYYY-MM-DD (e.g. 1990-06-15).');
      }
    }

    // Height
    let height_cm = 0;
    while (height_cm <= 0) {
      const raw = await promptField(rl, 'Height (cm)', existing.height_cm);
      height_cm = parseFloat(raw);
      if (isNaN(height_cm) || height_cm <= 0) {
        console.log('  → Must be a positive number (e.g. 175.5).');
        height_cm = 0;
      }
    }

    // Sport goal
    const sport_goal = await promptField(rl, 'Sport / Goal (e.g. Bodybuilding, Soccer)', existing.sport_goal);
    if (!sport_goal) { console.error('Error: sport_goal is required.'); process.exit(1); }

    const profile: UserProfile = { name, gender: gender as 'male' | 'female', birth_date, height_cm, sport_goal };

    // Atomic write
    fs.writeFileSync(TEMP_PATH, JSON.stringify(profile, null, 2));
    fs.renameSync(TEMP_PATH, PROFILE_PATH);

    const age = deriveAge(birth_date);
    console.log(`\n✓ profile.json saved.`);
    console.log(`  ${name} · ${gender} · Age ${age} · ${height_cm} cm · ${sport_goal}\n`);
  } finally {
    rl.close();
    if (fs.existsSync(TEMP_PATH)) fs.unlinkSync(TEMP_PATH);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
