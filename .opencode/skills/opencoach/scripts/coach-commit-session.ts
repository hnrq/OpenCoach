import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * OpenCoach: coach-commit-session.ts
 * Stages only the session-related files for a given date.
 * Refuses to stage unrelated changes unless --include-extra is passed.
 *
 * Usage:
 *   commit-session --date YYYY-MM-DD [--dry-run] [--include-extra]
 *   commit-session --help
 */

// ── Help ──────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
Usage: opencoach commit-session --date YYYY-MM-DD [options]

Stages only the allowed session files for the given date and reports
any unrelated tracked-file changes. Does NOT create the commit —
run  git commit -m "..."  after reviewing the staged set.

Allowed files:
  measures/measures-<date>.json
  diet/diet-<date>.json
  training/training-<date>.json
  appointments/appointment-<date>.json  (if it exists)
  analytics/wroc.json
  profile.json

Options:
  --date YYYY-MM-DD   Session date (required)
  --dry-run           Print what would be staged; do not run git add
  --include-extra     Also stage unrelated modified/new files (use with caution)
  --help              Show this help

Examples:
  opencoach commit-session --date 2026-04-05
  opencoach commit-session --date 2026-04-05 --dry-run
  opencoach commit-session --date 2026-04-05 --include-extra
`);
}

// ── Git helpers ───────────────────────────────────────────────────────────────

interface GitStatus {
  staged: string[];      // already staged
  unstaged: string[];    // modified but not staged
  untracked: string[];   // new, untracked
}

function getGitStatus(): GitStatus {
  let raw: string;
  try {
    raw = execSync('git status --porcelain', { encoding: 'utf8', cwd: process.cwd() });
  } catch (err: any) {
    throw new Error(`git status failed: ${err.message}`);
  }

  const staged: string[] = [];
  const unstaged: string[] = [];
  const untracked: string[] = [];

  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const xy = line.slice(0, 2);
    const file = line.slice(3).trim().replace(/^"(.*)"$/, '$1'); // strip quotes git sometimes adds

    const isStaged   = xy[0] !== ' ' && xy[0] !== '?';
    const isUnstaged = xy[1] !== ' ' && xy[1] !== '?';
    const isNew      = xy === '??';

    if (isNew)      untracked.push(file);
    else if (isStaged)   staged.push(file);
    else if (isUnstaged) unstaged.push(file);
    // If both staged and unstaged (partially staged), add to both
    if (isStaged && isUnstaged) unstaged.push(file);
  }

  return { staged, unstaged, untracked };
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
    console.error(`Run  opencoach commit-session --help  for usage.`);
    process.exit(1);
  }
  const date = args[dateIdx + 1];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error('Error: --date must be in YYYY-MM-DD format.');
    process.exit(1);
  }

  const dryRun       = args.includes('--dry-run');
  const includeExtra = args.includes('--include-extra');

  // Build the allowed set (normalised to forward slashes for comparison)
  const root = process.cwd();
  const allowedSet: string[] = [
    `measures/measures-${date}.json`,
    `diet/diet-${date}.json`,
    `training/training-${date}.json`,
    `analytics/wroc.json`,
    `profile.json`,
  ];

  // Include appointment file only if it exists
  const apptPath = `appointments/appointment-${date}.json`;
  if (fs.existsSync(path.join(root, apptPath))) {
    allowedSet.push(apptPath);
  }

  // Normalise paths for comparison (always forward slash, relative to root)
  const normalize = (f: string) => f.replace(/\\/g, '/');

  // Get git status
  let status: GitStatus;
  try {
    status = getGitStatus();
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  // All currently modified files (staged + unstaged, excluding untracked for the guard)
  const allModified = [...new Set([...status.staged, ...status.unstaged])].map(normalize);
  const allUntracked = status.untracked.map(normalize);

  // Which allowed files are touched?
  const toStage: string[] = [];
  for (const allowed of allowedSet) {
    const n = normalize(allowed);
    if (allModified.includes(n) || allUntracked.includes(n)) {
      toStage.push(allowed);
    }
  }

  // Which touched files are NOT in the allowed set?
  const allowedNorm = allowedSet.map(normalize);
  const unrelated: string[] = [...allModified, ...allUntracked].filter(f => !allowedNorm.includes(f));

  // ── Report ──
  console.log(`\nSession date: ${date}\n`);

  if (toStage.length === 0) {
    console.log('Nothing to stage — no allowed session files were modified.');
  } else {
    console.log(`Files to stage (${toStage.length}):`);
    for (const f of toStage) {
      const exists = fs.existsSync(path.join(root, f));
      console.log(`  ✓ ${f}${exists ? '' : '  ⚠ (not found on disk)'}`);
    }
  }

  if (unrelated.length > 0) {
    console.log(`\nUnrelated changes detected (${unrelated.length}):`);
    for (const f of unrelated) {
      console.log(`  ✗ ${f}  (not in allowed set)`);
    }
    if (!includeExtra) {
      console.log('\nThese files will NOT be staged.');
      console.log('Options:');
      console.log('  • Unstage / discard them before committing, OR');
      console.log('  • Use --include-extra to stage them alongside the session files.');
    } else {
      console.log('\n--include-extra: these will also be staged.');
    }
  }

  if (dryRun) {
    console.log('\n[dry-run] No files were staged.');
    return;
  }

  if (toStage.length === 0 && (!includeExtra || unrelated.length === 0)) {
    return;
  }

  // Stage allowed files
  if (toStage.length > 0) {
    try {
      execSync(`git add -- ${toStage.map(f => JSON.stringify(f)).join(' ')}`, {
        cwd: root,
        stdio: 'inherit',
      });
      console.log('\n✓ Staged session files.');
    } catch (err: any) {
      console.error(`\ngit add failed: ${err.message}`);
      process.exit(1);
    }
  }

  // Optionally stage unrelated files
  if (includeExtra && unrelated.length > 0) {
    try {
      execSync(`git add -- ${unrelated.map(f => JSON.stringify(f)).join(' ')}`, {
        cwd: root,
        stdio: 'inherit',
      });
      console.log('✓ Staged extra files (--include-extra).');
    } catch (err: any) {
      console.error(`git add (extra) failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.log('\nNext step:  git commit -m "session: ' + date + '"');
}

main();
