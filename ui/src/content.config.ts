import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const diet = defineCollection({
  loader: glob({ pattern: '*.json', base: '../diet' }),
  schema: z.object({
    daily_targets: z.object({
      calories: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fats_g: z.number(),
    }),
    meal_structure: z.object({
      pre_workout: z.string().optional(),
      post_workout: z.string().optional(),
    }).optional(),
    adjustments: z.string().optional(),
  }),
});

const training = defineCollection({
  loader: glob({ pattern: '*.json', base: '../training' }),
  schema: z.object({
    circuits: z.array(z.object({
      name: z.string(),
      exercises: z.array(z.object({
        name: z.string(),
        sets: z.number(),
        reps: z.union([z.string(), z.number()]),
        rpe: z.number().optional(),
      })),
    })),
    progression_logic: z.string().optional(),
  }),
});

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
