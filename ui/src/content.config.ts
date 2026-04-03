import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Meal schema (shared) ──────────────────────────────────────────────────────
const mealMacros = z.object({
  calories: z.number(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fats_g: z.number(),
}).optional();

const meal = z.object({
  meal: z.string(),
  timing: z.string().optional(),
  foods: z.array(z.string()),
  macros: mealMacros,
});

const dayType = z.object({
  label: z.string().optional(),
  note: z.string().optional(),
  timing_note: z.string().optional(),
  total_targets: z.object({
    calories: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fats_g: z.number(),
  }).optional(),
  meals: z.array(meal).optional(),
});

// ── Diet ──────────────────────────────────────────────────────────────────────
const diet = defineCollection({
  loader: glob({ pattern: '*.json', base: '../diet' }),
  schema: z.object({
    // New schema (day_types)
    day_types: z.record(dayType).optional(),
    weekly_schedule: z.record(z.string()).optional(),
    michaels_floors: z.object({
      protein_floor_g: z.number(),
      fat_floor_g: z.number(),
    }).optional(),
    // Legacy schema (flat daily_targets) — kept for older files
    daily_targets: z.object({
      calories: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fats_g: z.number(),
    }).optional(),
    meal_structure: z.object({
      pre_workout: z.string().optional(),
      post_workout: z.string().optional(),
    }).optional(),
    adjustments: z.string().optional(),
  }),
});

// ── Training ──────────────────────────────────────────────────────────────────
const exercise = z.object({
  name: z.string(),
  working_sets: z.number().optional(),
  reps: z.union([z.string(), z.number()]).optional(),
  rpe: z.number().optional(),
  note: z.string().optional(),
});

const metabolicPrimer = z.object({
  name: z.string(),
  format: z.string().optional(),
  duration_min: z.number().optional(),
  protocol: z.string().optional(),
  instructions: z.string().optional(),
  rpe_target: z.number().optional(),
});

const session = z.object({
  id: z.string(),
  day: z.string(),
  focus: z.string().optional(),
  scheduling_note: z.string().optional(),
  estimated_duration_min: z.number().optional(),
  metabolic_primer: metabolicPrimer.optional(),
  exercises: z.array(exercise).optional(),
  // Friday alternating weeks variant
  alternating_weeks: z.record(z.object({
    label: z.string().optional(),
    metabolic_primer: metabolicPrimer.optional(),
    exercises: z.array(exercise).optional(),
  })).optional(),
});

const training = defineCollection({
  loader: glob({ pattern: '*.json', base: '../training' }),
  schema: z.object({
    // New schema (sessions[])
    sessions: z.array(session).optional(),
    weekly_schedule: z.record(z.string()).optional(),
    progression_rule: z.string().optional(),
    // Legacy schema (circuits[]) — kept for older files
    circuits: z.array(z.object({
      name: z.string(),
      exercises: z.array(z.object({
        name: z.string(),
        sets: z.number(),
        reps: z.union([z.string(), z.number()]),
        rpe: z.number().optional(),
      })),
    })).optional(),
    progression_logic: z.string().optional(),
  }),
});

// ── Measures ──────────────────────────────────────────────────────────────────
const measures = defineCollection({
  loader: glob({ pattern: '*.json', base: '../measures' }),
  schema: z.object({
    core_metrics: z.object({
      weight: z.number(),
      body_fat_pct: z.number(),
    }),
    mandatory_sites: z.record(z.string(), z.coerce.number()).optional(),
    appointment_notes: z.object({
      goal: z.string().optional(),
      coach_summary: z.string().optional(),
      energy_levels: z.string().optional(),
      sleep: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { diet, training, measures };
