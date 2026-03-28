import * as fs from 'fs';
import * as path from 'path';

/**
 * OpenCoach: coach-generate-diet.ts
 * Generates a nutrition plan based on the latest measurements.
 */

async function main() {
  const measuresDir = path.join(process.cwd(), 'measures');
  const files = fs.readdirSync(measuresDir)
    .filter(f => f.startsWith('measures-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error('No measurements found. Cannot generate diet.');
    process.exit(1);
  }

  const latestData = JSON.parse(fs.readFileSync(path.join(measuresDir, files[0]), 'utf8'));
  const weight = latestData.core_metrics.weight;
  const bf = latestData.core_metrics.body_fat_pct;
  const lbm = weight * (1 - (bf / 100));

  // Michaels Methodology Calculations
  // 1. Protein: 2.2g per kg of LBM (floor)
  const protein_g = Math.round(lbm * 2.2);
  
  // 2. Calories: Let's assume a baseline for a "Slow Cut" 
  // (In a real scenario, this would be based on TDEE, but we'll use a standard formula)
  // ~30 kcal per kg of weight for maintenance, -500 for cut.
  const maintenance = weight * 30;
  const target_calories = Math.round(maintenance - 500);

  // 3. Fats: 0.8g per kg of total weight
  const fats_g = Math.round(weight * 0.8);

  // 4. Carbs: Remainder
  const protein_kcal = protein_g * 4;
  const fats_kcal = fats_g * 9;
  const carbs_kcal = target_calories - (protein_kcal + fats_kcal);
  const carbs_g = Math.round(carbs_kcal / 4);

  const dietPlan = {
    daily_targets: {
      calories: target_calories,
      protein_g: protein_g,
      carbs_g: carbs_g,
      fats_g: fats_g
    },
    meal_structure: {
      pre_workout: "High carb, moderate protein (e.g., Oats + Whey)",
      post_workout: "High protein, fast carbs (e.g., Rice + Chicken)"
    },
    adjustments: `Based on ${weight}kg at ${bf}% BF. Target WROC: -0.5kg to -0.7kg/week. Rest days: Reduce carbs by 50g and fats by 10g.`
  };

  const date = new Date().toISOString().split('T')[0];
  const targetPath = path.join(process.cwd(), 'diet', `diet-${date}.json`);
  
  if (!fs.existsSync(path.join(process.cwd(), 'diet'))) {
    fs.mkdirSync(path.join(process.cwd(), 'diet'));
  }

  fs.writeFileSync(targetPath, JSON.stringify(dietPlan, null, 2));
  console.log(`Generated new diet plan: ${targetPath}`);
  console.log(`Targets: ${target_calories}kcal | P: ${protein_g}g | C: ${carbs_g}g | F: ${fats_g}g`);
}

main();
