import * as fs from 'fs';
import * as path from 'path';

/**
 * OpenCoach: coach-analyze-progress.ts
 * Calculates WROC from measures history, updates analytics/wroc.json,
 * and outputs adjustment recommendations per the Michaels 14-day rule.
 */

interface WROCEntry {
  date: string;
  weight_kg: number;
  body_fat_pct: number;
  lbm_kg: number;
  fat_mass_kg: number;
}

interface WROCWindow {
  from: string;
  to: string;
  days: number;
  weight_delta_kg: number;
  wroc_kg_week: number;
  phase: string;
  note?: string;
}

interface WROCFile {
  athlete: string;
  target_wroc_kg_week: { min: number; max: number };
  target_weight_kg: { min: number; max: number };
  entries: WROCEntry[];
  wroc_windows: WROCWindow[];
  next_review_date: string;
  adjustment_rules: Record<string, string>;
}

const WROC_PATH = path.join(process.cwd(), 'analytics', 'wroc.json');
const MEASURES_DIR = path.join(process.cwd(), 'measures');

function loadWROC(): WROCFile | null {
  if (!fs.existsSync(WROC_PATH)) return null;
  try { return JSON.parse(fs.readFileSync(WROC_PATH, 'utf8')); }
  catch { return null; }
}

function getDateFromFileName(fileName: string): string {
  const match = fileName.match(/measures-(\d{4}-\d{2}-\d{2})\.json/);
  return match ? match[1] : '';
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function addDays(date: string, n: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function main() {
  if (!fs.existsSync(MEASURES_DIR)) {
    console.error('No measures directory found.');
    process.exit(1);
  }

  const files = fs.readdirSync(MEASURES_DIR)
    .filter(f => f.startsWith('measures-') && f.endsWith('.json'))
    .sort();

  if (files.length < 2) {
    console.log('Need at least two measurements to calculate progress.');
    if (files.length === 1) {
      const d = JSON.parse(fs.readFileSync(path.join(MEASURES_DIR, files[0]), 'utf8'));
      console.log(`Current Weight: ${d.core_metrics.weight}kg`);
    }
    return;
  }

  // ── Load wroc.json ────────────────────────────────────────────────────────
  let wroc = loadWROC();
  const existingDates = new Set(wroc?.entries.map(e => e.date) ?? []);

  // ── Sync any measures files not yet in wroc.json ──────────────────────────
  let updated = false;
  for (const file of files) {
    const date = getDateFromFileName(file);
    if (!date || existingDates.has(date)) continue;
    const raw = JSON.parse(fs.readFileSync(path.join(MEASURES_DIR, file), 'utf8'));
    const w = raw.core_metrics.weight;
    const bf = raw.core_metrics.body_fat_pct;
    const newEntry: WROCEntry = {
      date,
      weight_kg: w,
      body_fat_pct: bf,
      lbm_kg: parseFloat((w * (1 - bf / 100)).toFixed(2)),
      fat_mass_kg: parseFloat((w * (bf / 100)).toFixed(2)),
    };
    if (wroc) {
      wroc.entries.push(newEntry);
      wroc.entries.sort((a, b) => a.date.localeCompare(b.date));
    }
    updated = true;
  }

  if (!wroc) {
    console.error('analytics/wroc.json not found. Run `npm run opencoach -- setup-profile` first.');
    process.exit(1);
  }

  // ── Recompute wroc_windows from entries ───────────────────────────────────
  if (updated) {
    wroc.wroc_windows = [];
    for (let i = 1; i < wroc.entries.length; i++) {
      const prev = wroc.entries[i - 1];
      const curr = wroc.entries[i];
      const days = daysBetween(prev.date, curr.date);
      const delta = parseFloat((curr.weight_kg - prev.weight_kg).toFixed(2));
      const wrocVal = parseFloat(((delta / days) * 7).toFixed(2));
      wroc.wroc_windows.push({
        from: prev.date,
        to: curr.date,
        days,
        weight_delta_kg: delta,
        wroc_kg_week: wrocVal,
        phase: inferPhase(wrocVal, days),
        ...(days < 14 ? { note: 'Below 14-day Michaels threshold. No action.' } : {}),
      });
    }
  }

  // ── Identify the latest valid window (≥14 days) ───────────────────────────
  const latest = wroc.entries[wroc.entries.length - 1];
  const prev = wroc.entries[wroc.entries.length - 2];
  const latestWindow = wroc.wroc_windows[wroc.wroc_windows.length - 1];
  const daysSinceLast = daysBetween(prev.date, latest.date);
  const validWindow = daysSinceLast >= 14;

  // ── Update next_review_date ───────────────────────────────────────────────
  if (!validWindow) {
    wroc.next_review_date = addDays(prev.date, 14);
  } else {
    wroc.next_review_date = addDays(latest.date, 14);
  }

  // ── Persist ───────────────────────────────────────────────────────────────
  const analyticsDir = path.join(process.cwd(), 'analytics');
  if (!fs.existsSync(analyticsDir)) fs.mkdirSync(analyticsDir, { recursive: true });
  fs.writeFileSync(WROC_PATH, JSON.stringify(wroc, null, 2));

  // ── Output ────────────────────────────────────────────────────────────────
  console.log('\n--- Progress Analysis ---');
  console.log(`Latest:    ${latest.date} — ${latest.weight_kg}kg / ${latest.body_fat_pct}% BF / LBM ${latest.lbm_kg}kg`);
  console.log(`Previous:  ${prev.date} — ${prev.weight_kg}kg / ${prev.body_fat_pct}% BF`);
  console.log(`Window:    ${daysSinceLast} days`);
  console.log(`WROC:      ${latestWindow.wroc_kg_week > 0 ? '+' : ''}${latestWindow.wroc_kg_week} kg/week`);
  console.log(`Target:    ${wroc.target_wroc_kg_week.min} to ${wroc.target_wroc_kg_week.max} kg/week`);
  console.log(`Target BW: ${wroc.target_weight_kg.min}–${wroc.target_weight_kg.max} kg`);

  if (!validWindow) {
    console.log(`\nStatus:    WINDOW TOO SHORT (${daysSinceLast}/14 days) — no adjustment yet`);
    console.log(`Next review: ${wroc.next_review_date}`);
  } else {
    const w = latestWindow.wroc_kg_week;
    const min = wroc.target_wroc_kg_week.min;
    const max = wroc.target_wroc_kg_week.max;
    if (w > -0.3) {
      console.log('\nStatus:    STALL — reduce training-day carbs by 20g');
    } else if (w >= min && w <= max) {
      console.log('\nStatus:    ON TRACK — no adjustment needed');
    } else if (w < min) {
      console.log('\nStatus:    LOSING TOO FAST — increase training-day carbs by 20g');
    }
    console.log(`Next review: ${wroc.next_review_date}`);
  }

  console.log('\n--- Full WROC History ---');
  for (const w of wroc.wroc_windows) {
    const flag = w.days < 14 ? ' ⚠ <14d' : '';
    console.log(`  ${w.from} → ${w.to} (${w.days}d): ${w.wroc_kg_week > 0 ? '+' : ''}${w.wroc_kg_week} kg/wk${flag}`);
  }
  console.log('');
}

function inferPhase(wroc: number, days: number): string {
  if (days < 14) return 'window too short';
  if (wroc > 0.1) return 'bulk';
  if (wroc < -0.7) return 'aggressive cut';
  if (wroc < -0.3) return 'cut';
  return 'maintenance / stall';
}

main();
