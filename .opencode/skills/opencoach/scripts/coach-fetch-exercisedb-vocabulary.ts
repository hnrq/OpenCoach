import * as fs from 'fs';
import * as path from 'path';

/**
 * OpenCoach: coach-fetch-exercisedb-vocabulary.ts
 * Fetches the official taxonomy from ExerciseDB and caches it locally.
 * Includes a 30-day TTL check to avoid redundant API calls.
 */

const CACHE_PATH = path.join(process.cwd(), '.opencode', 'context', 'coaching', 'lookup', 'exercisedb-vocabulary.json');
const API_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';
const BASE_URL = `https://${API_HOST}/api/v1`;
const TTL_DAYS = 30;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

async function fetchEndpoint(endpoint: string, apiKey: string) {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': API_HOST,
      'x-rapidapi-key': apiKey,
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
  }

  const json: { success: boolean; data: { name: string }[] } = await response.json();
  return json.data.map((entry) => entry.name);
}

async function main() {
  const force = process.argv.includes('--force');

  // ── Cache & TTL Check ───────────────────────────────────────────────────
  if (fs.existsSync(CACHE_PATH) && !force) {
    const stats = fs.statSync(CACHE_PATH);
    const ageMs = Date.now() - stats.mtimeMs;
    if (ageMs < TTL_MS) {
      console.log(`ExerciseDB vocabulary cache is still valid (Age: ${Math.round(ageMs / 1000 / 60 / 60 / 24)}d). Skipping network fetch.`);
      return;
    }
    console.log('Cache expired. Refreshing...');
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.error('Error: RAPIDAPI_KEY environment variable is not set.');
    process.exit(1);
  }

  console.log('Fetching fresh ExerciseDB vocabulary...');

  try {
    const [bodyParts, equipments, muscles, exerciseTypes] = await Promise.all([
      fetchEndpoint('bodyparts', apiKey),
      fetchEndpoint('equipments', apiKey),
      fetchEndpoint('muscles', apiKey),
      fetchEndpoint('exercisetypes', apiKey)
    ]);

    const vocabulary = {
      updated_at: new Date().toISOString(),
      bodyParts,
      equipments,
      muscles,
      exerciseTypes
    };

    const dir = path.dirname(CACHE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(CACHE_PATH, JSON.stringify(vocabulary, null, 2));
    console.log(`Successfully updated and cached ExerciseDB vocabulary to ${CACHE_PATH}`);

  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    process.exit(1);
  }
}

main();
