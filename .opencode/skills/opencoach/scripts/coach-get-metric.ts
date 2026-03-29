import * as fs from 'fs';
import * as path from 'path';

/**
 * OpenCoach: coach-get-metric.ts
 * Extracts a metric from the N most recent JSON files of a given type.
 *
 * Usage: coach-get-metric <type> <metric_path> [n]
 *   type:        measures | diet | training
 *   metric_path: dot-notation path (e.g. .core_metrics.weight)
 *   n:           number of recent files to read (default: 1)
 */

type DataType = 'measures' | 'diet' | 'training';

function getByPath(obj: unknown, jqPath: string): unknown {
  const parts = jqPath.replace(/^\./, '').split('.');
  return parts.reduce((acc: unknown, key) => {
    if (acc !== null && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function main() {
  const [type, metricPath, nArg] = process.argv.slice(2);

  if (!type || !metricPath) {
    console.error('Usage: coach-get-metric <type> <metric_path> [n]');
    console.error('  type:        measures | diet | training');
    console.error('  metric_path: dot-notation path (e.g. .core_metrics.weight)');
    console.error('  n:           number of recent files (default: 1)');
    process.exit(1);
  }

  if (!['measures', 'diet', 'training'].includes(type)) {
    console.error(`Error: type must be measures, diet, or training. Got: ${type}`);
    process.exit(1);
  }

  const n = nArg ? parseInt(nArg, 10) : 1;
  if (isNaN(n) || n < 1) {
    console.error(`Error: n must be a positive integer. Got: ${nArg}`);
    process.exit(1);
  }

  const dir = path.join(process.cwd(), type);
  if (!fs.existsSync(dir)) {
    console.error(`Error: directory ./${type} not found.`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith(`${type}-`) && f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, n);

  if (files.length === 0) {
    console.log(`No files found for type ${type}.`);
    process.exit(0);
  }

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const value = getByPath(data, metricPath);
      const date = file.replace(`${type}-`, '').replace('.json', '');
      console.log(`${date}: ${value ?? 'null'}`);
    } catch {
      console.error(`Error reading ${file}: malformed JSON`);
    }
  }
}

main();
