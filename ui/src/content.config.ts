import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// ── 1. Smallest Building Blocks (No dependencies) ───────────────────────────

const mealMacros = z
	.object({
		calories: z.number(),
		protein_g: z.number(),
		carbs_g: z.number(),
		fats_g: z.number(),
	})
	.optional();

const warmupSet = z.object({
	reps: z.number(),
	load: z.string(),
	note: z.string().optional(),
});

const sportContext = z.object({
	sport: z.string(),
	mapped_to: z.string().optional(),
	training_focus: z.string().optional(),
	movement_patterns: z.string().optional(),
	injury_areas: z.string().optional(),
	energy_system: z.string().optional(),
	nutrition_strategy: z.string().optional(),
	notes: z.string().optional(),
});

// ── 2. Middle-tier Schemas (Dependent on Step 1) ──────────────────────────────

const meal = z.object({
	meal: z.string(),
	timing: z.string().optional(),
	foods: z.array(z.string()),
	macros: mealMacros,
});

const exercise = z.object({
	name: z.string(),
	warmup_sets: z.array(warmupSet).optional(),
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

// ── 3. High-level Schemas (Dependent on Step 2) ──────────────────────────────

const dayType = z.object({
	label: z.string().optional(),
	note: z.string().optional(),
	timing_note: z.string().optional(),
	total_targets: z
		.object({
			calories: z.number(),
			protein_g: z.number(),
			carbs_g: z.number(),
			fats_g: z.number(),
		})
		.optional(),
	meals: z.array(meal).optional(),
});

const session = z.object({
	id: z.string(),
	day: z.string(),
	focus: z.string().optional(),
	scheduling_note: z.string().optional(),
	estimated_duration_min: z.number().optional(),
	metabolic_primer: metabolicPrimer.optional(),
	exercises: z.array(exercise).optional(),
	alternating_weeks: z
		.record(
			z.string(),
			z.object({
				label: z.string().optional(),
				metabolic_primer: metabolicPrimer.optional(),
				exercises: z.array(exercise).optional(),
			}),
		)
		.optional(),
});

// ── 4. Collection Definitions (Final Step) ──────────────────────────────────

const diet = defineCollection({
	loader: glob({ pattern: "*.json", base: "../diet" }),
	schema: z.object({
		day_types: z.record(z.string(), dayType).optional(),
		weekly_schedule: z.record(z.string(), z.string()).optional(),
		michaels_floors: z.record(z.string(), z.any()).optional(),
		sport_context: sportContext.optional(),
		target_weight_kg: z.string().optional(),
		next_wroc_review: z.string().optional(),
		adjustments: z.record(z.string(), z.any()).optional(),
	}),
});

const training = defineCollection({
	loader: glob({ pattern: "*.json", base: "../training" }),
	schema: z.object({
		athlete: z.string().optional(),
		date: z.string().optional(),
		sport_context: sportContext.optional(),
		methodology: z.string().optional(),
		progression_rule: z.string().optional(),
		weekly_schedule: z.record(z.string(), z.string()).optional(),
		sessions: z.array(session).optional(),
	}),
});

const measures = defineCollection({
	loader: glob({ pattern: "*.json", base: "../measures" }),
	schema: z.object({
		core_metrics: z.object({
			weight: z.number(),
			body_fat_pct: z.number(),
		}),
		mandatory_sites: z.record(z.string(), z.coerce.number()).optional(),
		appointment_notes: z.record(z.string(), z.any()).optional(),
	}),
});

export const collections = { diet, training, measures };
