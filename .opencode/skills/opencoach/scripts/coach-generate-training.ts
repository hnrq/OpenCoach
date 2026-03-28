import * as fs from 'fs';
import * as path from 'path';

/**
 * OpenCoach: coach-generate-training.ts
 * Generates a training session based on the "Michaels" methodology.
 */

async function main() {
  const libraryPath = path.join(process.cwd(), 'library', 'exercises.json');
  if (!fs.existsSync(libraryPath)) {
    console.error('No exercises library found.');
    process.exit(1);
  }

  const library = JSON.parse(fs.readFileSync(libraryPath, 'utf8')).exercises;

  // Michaels Methodology: Metabolic Primer + Strength Block
  const primers = library.filter((e: any) => e.type === 'Metabolic');
  const strength = library.filter((e: any) => e.type === 'Strength');

  // Random selection for this example
  const primer = primers[Math.floor(Math.random() * primers.length)];
  const strengthEx = strength.sort(() => 0.5 - Math.random()).slice(0, 3);

  const session = {
    circuits: [
      {
        name: "Metabolic Primer (Warmup/Amrap)",
        exercises: [
          { name: primer.name, sets: 2, reps: "60s", rpe: 7 }
        ]
      },
      {
        name: "Main Strength Block",
        exercises: strengthEx.map((e: any) => ({
          name: e.name,
          sets: 3,
          reps: "8-10",
          rpe: 8
        }))
      }
    ],
    progression_logic: "Increase weight when all sets reach 10 reps at RPE 8."
  };

  const date = new Date().toISOString().split('T')[0];
  const targetPath = path.join(process.cwd(), 'training', `training-${date}.json`);
  
  if (!fs.existsSync(path.join(process.cwd(), 'training'))) {
    fs.mkdirSync(path.join(process.cwd(), 'training'));
  }

  fs.writeFileSync(targetPath, JSON.stringify(session, null, 2));
  console.log(`Generated new training plan: ${targetPath}`);
}

main();
