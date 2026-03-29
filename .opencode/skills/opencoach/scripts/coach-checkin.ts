import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

/**
 * OpenCoach: coach-checkin.ts
 * Weekly anthropometric check-in.
 * Writes measures/measures-YYYY-MM-DD.json at repo root.
 */

interface MeasuresSession {
  core_metrics: {
    weight: number;
    body_fat_pct: number;
  };
  mandatory_sites: {
    chest: number;
    waist_narrowest: number;
    umbilical: number;
    hip_widest: number;
    thigh_mid: number;
    bicep_flexed: number;
    forearm: number;
  };
  appointment_notes: {
    goal: string;
    energy_levels: string;
    sleep: string;
    coach_summary: string;
  };
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function loadLatestMeasures(): MeasuresSession | null {
  const measuresDir = path.join(process.cwd(), 'measures');
  if (!fs.existsSync(measuresDir)) return null;

  const files = fs.readdirSync(measuresDir)
    .filter(f => f.startsWith('measures-') && f.endsWith('.json'))
    .sort()
    .reverse();

  // Skip today's file (we're overwriting it) — get the previous one
  const prev = files.find(f => f !== `measures-${today()}.json`);
  if (!prev) return null;

  try {
    return JSON.parse(fs.readFileSync(path.join(measuresDir, prev), 'utf8'));
  } catch {
    return null;
  }
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

async function promptNumber(
  rl: readline.Interface,
  label: string,
  unit: string,
  prev?: number,
  min = 0.1,
  max = 9999
): Promise<number> {
  const hint = prev !== undefined ? ` (prev: ${prev})` : '';
  while (true) {
    const raw = await ask(rl, `  ${label}${hint} [${unit}]: `);
    const val = Number(raw);
    if (!isNaN(val) && val >= min && val <= max) return val;
    console.log(`  → Must be a number between ${min} and ${max}.`);
  }
}

async function promptString(
  rl: readline.Interface,
  label: string,
  defaultVal = 'Not specified'
): Promise<string> {
  const answer = await ask(rl, `  ${label} [Enter to skip → "${defaultVal}"]: `);
  return answer !== '' ? answer : defaultVal;
}

async function main() {
  const prev = loadLatestMeasures();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n── OpenCoach Weekly Check-in ────────────────');
  if (prev) {
    const { weight, body_fat_pct } = prev.core_metrics;
    console.log(`  Previous: ${weight} kg · ${body_fat_pct}% BF`);
  }
  console.log('  Previous values shown as (prev: X) for reference.\n');

  try {
    // Core metrics
    const weight = await promptNumber(rl, 'Weight', 'kg', prev?.core_metrics.weight);
    const body_fat_pct = await promptNumber(rl, 'Body fat %', '%', prev?.core_metrics.body_fat_pct, 1, 60);

    console.log('\n  — Tape measurements (cm) —');
    const chest        = await promptNumber(rl, 'Chest',          'cm', prev?.mandatory_sites.chest);
    const waist_narrowest = await promptNumber(rl, 'Waist narrowest', 'cm', prev?.mandatory_sites.waist_narrowest);
    const umbilical    = await promptNumber(rl, 'Umbilical',      'cm', prev?.mandatory_sites.umbilical);
    const hip_widest   = await promptNumber(rl, 'Hip widest',     'cm', prev?.mandatory_sites.hip_widest);
    const thigh_mid    = await promptNumber(rl, 'Thigh mid',      'cm', prev?.mandatory_sites.thigh_mid);
    const bicep_flexed = await promptNumber(rl, 'Bicep flexed',   'cm', prev?.mandatory_sites.bicep_flexed);
    const forearm      = await promptNumber(rl, 'Forearm',        'cm', prev?.mandatory_sites.forearm);

    console.log('\n  — Subjective notes (optional) —');
    const prevGoal = prev?.appointment_notes.goal ?? '';
    const goalHint = prevGoal ? ` [Enter to keep "${prevGoal}"]` : '';
    const goalRaw  = await ask(rl, `  Goal${goalHint}: `);
    const goal     = goalRaw !== '' ? goalRaw : prevGoal;

    const energy_levels = await promptString(rl, 'Energy levels');
    const sleep         = await promptString(rl, 'Sleep');

    const session: MeasuresSession = {
      core_metrics: { weight, body_fat_pct },
      mandatory_sites: { chest, waist_narrowest, umbilical, hip_widest, thigh_mid, bicep_flexed, forearm },
      appointment_notes: { goal, energy_levels, sleep, coach_summary: '' },
    };

    // Save
    const measuresDir = path.join(process.cwd(), 'measures');
    if (!fs.existsSync(measuresDir)) fs.mkdirSync(measuresDir, { recursive: true });

    const fileName = `measures-${today()}.json`;
    const outPath  = path.join(measuresDir, fileName);

    if (fs.existsSync(outPath)) {
      console.log(`\n  ⚠ ${fileName} already exists — overwriting.`);
    }

    fs.writeFileSync(outPath, JSON.stringify(session, null, 2));

    // Summary delta
    if (prev) {
      const dW = (weight - prev.core_metrics.weight).toFixed(1);
      const dBF = (body_fat_pct - prev.core_metrics.body_fat_pct).toFixed(1);
      const sign = (n: string) => parseFloat(n) > 0 ? `+${n}` : n;
      console.log(`\n✓ ${fileName} saved.`);
      console.log(`  Weight: ${weight} kg (${sign(dW)} kg)  ·  BF: ${body_fat_pct}% (${sign(dBF)}%)\n`);
    } else {
      console.log(`\n✓ ${fileName} saved.\n`);
    }
  } finally {
    rl.close();
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
