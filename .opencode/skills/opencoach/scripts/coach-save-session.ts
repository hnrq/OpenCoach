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

// New schema: day_types + weekly_schedule + michaels_floors
// Legacy schema (flat daily_targets) is also accepted for backwards compatibility
interface DietSession {
  day_types?: Record<string, { total_targets?: { calories: number; protein_g: number } }>;
  // legacy flat schema
  daily_targets?: { calories: number; protein_g: number };
  weekly_schedule?: Record<string, string>;
  michaels_floors?: { protein_floor_g: number; fat_floor_g: number };
}

// New schema: sessions[] with full exercise detail per session
// Legacy schema (circuits[]) is also accepted for backwards compatibility
interface TrainingSession {
  sessions?: Array<{
    id: string;
    day: string;
    exercises: Array<{ name: string }>;
  }>;
  // legacy schema
  circuits?: Array<{
    name: string;
    exercises: Array<{ name: string; sets: number; reps: string; rpe?: number }>;
  }>;
  progression_rule?: string;
  progression_logic?: string;
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
    const hasNewSchema = d.day_types && typeof d.day_types === 'object' && Object.keys(d.day_types).length > 0;
    const hasLegacySchema = d.daily_targets?.calories && d.daily_targets?.protein_g;
    if (!hasNewSchema && !hasLegacySchema) {
      throw new Error('Diet file must have either day_types (new schema) or daily_targets (legacy schema)');
    }
  } else if (type === 'training') {
    const t = data as TrainingSession;
    const hasNewSchema = t.sessions && t.sessions.length > 0;
    const hasLegacySchema = t.circuits && t.circuits.length > 0;
    if (!hasNewSchema && !hasLegacySchema) {
      throw new Error('Training file must have either sessions[] (new schema) or circuits[] (legacy schema)');
    }
  }
}

main();
