import * as fs from 'fs';
import * as path from 'path';

/**
 * OpenCoach: coach-save-session.ts
 * Validates and saves JSON data for measures, diet, or training.
 */

interface CoreMetrics {
  weight: number;
  body_fat_pct: number;
}

interface MandatorySites {
  chest: number;
  waist_narrowest: number;
  umbilical: number;
  hip_widest: number;
  thigh_mid: number;
  bicep_flexed: number;
  forearm: number;
}

interface MeasuresSession {
  core_metrics: CoreMetrics;
  mandatory_sites: MandatorySites;
  appointment_notes: {
    goal: string;
    energy_levels: string;
    sleep: string;
    coach_summary: string;
  };
}

interface DietSession {
  daily_targets: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
  };
  meal_structure: {
    pre_workout?: string;
    post_workout?: string;
  };
  adjustments: string;
}

interface TrainingSession {
  circuits: Array<{
    name: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      rpe?: number;
    }>;
  }>;
  progression_logic: string;
}

type SessionType = 'measures' | 'diet' | 'training';

async function main() {
  const args = process.argv.slice(2);
  const type = args[0] as SessionType;
  const dataPath = args[1];

  if (!type || !dataPath) {
    console.error('Usage: coach-save-session <type> <json_file_path>');
    process.exit(1);
  }

  if (!['measures', 'diet', 'training'].includes(type)) {
    console.error(`Invalid type: ${type}. Must be measures, diet, or training.`);
    process.exit(1);
  }

  try {
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    // Basic Validation (Surgical check)
    validate(type, data);

    // Save to the correct folder
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${type}-${date}.json`;
    const targetDir = path.join(process.cwd(), type);
    const targetPath = path.join(targetDir, fileName);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
    console.log(`Successfully saved ${type} to ${targetPath}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function validate(type: SessionType, data: any) {
  if (type === 'measures') {
    const m = data as MeasuresSession;
    if (!m.core_metrics?.weight || !m.core_metrics?.body_fat_pct) throw new Error('Missing core_metrics (weight or body_fat_pct)');
    if (m.core_metrics.weight <= 0) throw new Error('Weight must be positive');
    
    const sites = ['chest', 'waist_narrowest', 'umbilical', 'hip_widest', 'thigh_mid', 'bicep_flexed', 'forearm'];
    for (const site of sites) {
      if (typeof (m.mandatory_sites as any)?.[site] !== 'number') {
        throw new Error(`Missing or invalid mandatory site: ${site}`);
      }
    }
  } else if (type === 'diet') {
    const d = data as DietSession;
    if (!d.daily_targets?.calories || !d.daily_targets?.protein_g) throw new Error('Missing daily_targets (calories or protein)');
    // Michaels rule: 2.0g/kg floor (roughly, logic should be handled by head coach, but we check presence)
  } else if (type === 'training') {
    const t = data as TrainingSession;
    if (!t.circuits || t.circuits.length === 0) throw new Error('Training session must have at least one circuit');
  }
}

main();
