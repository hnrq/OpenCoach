import * as fs from 'fs';
import * as path from 'path';

/**
 * OpenCoach: coach-update-profile.ts
 * Applies preference changes from an appointment artifact to profile.json.
 * Shows a diff preview before writing.
 *
 * Usage:
 *   update-profile-from-appointment --date YYYY-MM-DD [--apply]
 *   update-profile-from-appointment --help
 */

// ── Help ──────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
Usage: opencoach update-profile-from-appointment --date YYYY-MM-DD [--apply]

Reads appointments/appointment-<date>.json, computes what would change in
profile.json, and prints a diff. Writes the changes only when --apply is given.

Options:
  --date YYYY-MM-DD   Appointment date (required)
  --apply             Actually write changes to profile.json
  --help              Show this help

Supported preferences_delta fields:
  constraints_added   Append strings to profile.constraints[]
  constraints_removed Remove strings from profile.constraints[]
  schedule_changes    Set training_schedule.<field> = <value>

Note: food_swaps, food_additions, food_removals are captured in the appointment artifact
but applied manually by the Head Coach to .opencode/context/coaching/athlete-notes.md.

Examples:
  opencoach update-profile-from-appointment --date 2026-04-05
  opencoach update-profile-from-appointment --date 2026-04-05 --apply
`);
}

// ── Deep clone ────────────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ── Diff reporter ─────────────────────────────────────────────────────────────

interface DiffLine {
  path: string;
  before: any;
  after: any;
}

function diffObjects(before: any, after: any, prefix = ''): DiffLine[] {
  const lines: DiffLine[] = [];

  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  for (const key of keys) {
    const p = prefix ? `${prefix}.${key}` : key;
    const b = before?.[key];
    const a = after?.[key];
    if (JSON.stringify(b) === JSON.stringify(a)) continue;

    if (Array.isArray(b) || Array.isArray(a)) {
      lines.push({ path: p, before: b, after: a });
    } else if (typeof b === 'object' && b !== null && typeof a === 'object' && a !== null) {
      lines.push(...diffObjects(b, a, p));
    } else {
      lines.push({ path: p, before: b, after: a });
    }
  }

  return lines;
}

function printDiff(diffs: DiffLine[]) {
  if (diffs.length === 0) {
    console.log('  (no changes)');
    return;
  }
  for (const d of diffs) {
    console.log(`  ${d.path}:`);
    if (Array.isArray(d.before) && Array.isArray(d.after)) {
      const removed = (d.before as string[]).filter(x => !(d.after as string[]).includes(x));
      const added   = (d.after  as string[]).filter(x => !(d.before as string[]).includes(x));
      for (const r of removed) console.log(`    - "${r}"`);
      for (const a of added)   console.log(`    + "${a}"`);
    } else {
      if (d.before !== undefined) console.log(`    - ${JSON.stringify(d.before)}`);
      if (d.after  !== undefined) console.log(`    + ${JSON.stringify(d.after)}`);
    }
  }
}

// ── Apply delta ───────────────────────────────────────────────────────────────

function applyDelta(profile: any, delta: any): any {
  const p = deepClone(profile);

  // food_swaps / food_additions / food_removals are NOT applied here.
  // Food preferences live in .opencode/context/coaching/athlete-notes.md.
  // The Head Coach updates that file manually during the commitment step.

  // constraints_added
  if (Array.isArray(delta.constraints_added) && delta.constraints_added.length > 0) {
    p.constraints ??= [];
    for (const c of delta.constraints_added) {
      if (!p.constraints.includes(c)) p.constraints.push(c);
    }
  }

  // constraints_removed
  if (Array.isArray(delta.constraints_removed) && Array.isArray(p.constraints)) {
    p.constraints = p.constraints.filter((c: string) => !delta.constraints_removed.includes(c));
  }

  // schedule_changes
  if (Array.isArray(delta.schedule_changes)) {
    p.training_schedule ??= {};
    for (const change of delta.schedule_changes) {
      p.training_schedule[change.field] = change.value;
    }
  }

  return p;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const dateIdx = args.indexOf('--date');
  if (dateIdx === -1 || !args[dateIdx + 1]) {
    console.error('Error: --date YYYY-MM-DD is required.');
    console.error(`Run  opencoach update-profile-from-appointment --help  for usage.`);
    process.exit(1);
  }
  const date = args[dateIdx + 1];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error('Error: --date must be in YYYY-MM-DD format.');
    process.exit(1);
  }

  const applyChanges = args.includes('--apply');
  const root = process.cwd();

  // Load appointment
  const apptPath = path.join(root, 'appointments', `appointment-${date}.json`);
  if (!fs.existsSync(apptPath)) {
    console.error(`Error: appointment file not found: ${path.relative(root, apptPath)}`);
    console.error(`Hint: create it with  opencoach new-session appointment --date ${date}`);
    process.exit(1);
  }

  let appointment: any;
  try {
    appointment = JSON.parse(fs.readFileSync(apptPath, 'utf8'));
  } catch (err: any) {
    console.error(`Error: could not parse appointment file — ${err.message}`);
    process.exit(1);
  }

  // Load profile
  const profilePath = path.join(root, 'profile.json');
  if (!fs.existsSync(profilePath)) {
    console.error(`Error: profile.json not found at ${profilePath}`);
    process.exit(1);
  }
  let profile: any;
  try {
    profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
  } catch (err: any) {
    console.error(`Error: could not parse profile.json — ${err.message}`);
    process.exit(1);
  }

  const delta = appointment.preferences_delta ?? {};
  const proposed = applyDelta(profile, delta);

  // Print diff
  const diffs = diffObjects(profile, proposed);
  console.log(`\nprofile.json diff from appointment ${date}:`);
  printDiff(diffs);

  if (diffs.length === 0) {
    console.log('\nNo profile changes in this appointment.');
    return;
  }

  if (!applyChanges) {
    console.log('\nRun with --apply to write these changes to profile.json.');
    return;
  }

  fs.writeFileSync(profilePath, JSON.stringify(proposed, null, 2));
  console.log('\n✓ profile.json updated.');
}

main();
