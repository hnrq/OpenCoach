import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * OpenCoach: coach-analyze-progress.ts
 * Calculates deltas and Weekly Rate of Change (WROC) between measurements.
 */

async function main() {
  const measuresDir = path.join(process.cwd(), 'measures');

  if (!fs.existsSync(measuresDir)) {
    console.error('No measures directory found.');
    process.exit(1);
  }

  const files = fs.readdirSync(measuresDir)
    .filter(f => f.startsWith('measures-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length < 2) {
    console.log('Need at least two measurements to calculate progress.');
    // If only one, just show current
    if (files.length === 1) {
        const latest = JSON.parse(fs.readFileSync(path.join(measuresDir, files[0]), 'utf8'));
        console.log(`Current Weight: ${latest.core_metrics.weight}kg`);
    }
    return;
  }

  const latestFile = path.join(measuresDir, files[0]);
  const previousFile = path.join(measuresDir, files[1]);

  const latestData = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
  const previousData = JSON.parse(fs.readFileSync(previousFile, 'utf8'));

  const weightDelta = latestData.core_metrics.weight - previousData.core_metrics.weight;
  const bfDelta = latestData.core_metrics.body_fat_pct - previousData.core_metrics.body_fat_pct;

  // Calculate days between
  const dateLatest = getDateFromFileName(files[0]);
  const datePrevious = getDateFromFileName(files[1]);
  const diffTime = Math.abs(dateLatest.getTime() - datePrevious.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const wroc = (weightDelta / diffDays) * 7;

  console.log('--- Progress Analysis ---');
  console.log(`Latest Date: ${dateLatest.toISOString().split('T')[0]}`);
  console.log(`Previous Date: ${datePrevious.toISOString().split('T')[0]} (${diffDays} days ago)`);
  console.log(`Weight Delta: ${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(2)}kg`);
  console.log(`Body Fat Delta: ${bfDelta > 0 ? '+' : ''}${bfDelta.toFixed(2)}%`);
  console.log(`Weekly Rate of Change (WROC): ${wroc > 0 ? '+' : ''}${wroc.toFixed(2)}kg/week`);
  
  if (Math.abs(wroc) < 0.1) {
    console.log('Status: Maintenance / Stall detected.');
  } else if (wroc < 0) {
    console.log('Status: Losing weight.');
  } else {
    console.log('Status: Gaining weight.');
  }
}

function getDateFromFileName(fileName: string): Date {
  const match = fileName.match(/measures-(\d{4}-\d{2}-\d{2})\.json/);
  if (match) {
    return new Date(match[1]);
  }
  return new Date();
}

main();
