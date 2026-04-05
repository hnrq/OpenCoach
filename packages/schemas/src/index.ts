import { z } from "zod";

// ── Primitives ────────────────────────────────────────────────────────────────

export const MealMacros = z.object({
	calories: z.number(),
	protein_g: z.number(),
	carbs_g: z.number(),
	fats_g: z.number(),
});

export const WarmupSet = z.object({
	reps: z.number(),
	load: z.string(),
	note: z.string().optional(),
});

export const SportContext = z.object({
	sport: z.string(),
	mapped_to: z.string().optional(),
	training_focus: z.string().optional(),
	movement_patterns: z.string().optional(),
	// Array in practice (e.g. ["knees","ankles"]), string accepted for legacy
	injury_areas: z.union([z.string(), z.array(z.string())]).optional(),
	energy_system: z.string().optional(),
	nutrition_strategy: z.string().optional(),
	notes: z.string().optional(),
});

// ── Components ────────────────────────────────────────────────────────────────

export const Meal = z.object({
	meal: z.string(),
	timing: z.string().optional(),
	foods: z.array(z.string()),
	macros: MealMacros.optional(),
});

export const Exercise = z.object({
	name: z.string(),
	warmup_sets: z.array(WarmupSet).optional(),
	working_sets: z.number().optional(),
	sets: z.number().optional(),
	reps: z.union([z.string(), z.number()]).optional(),
	rpe: z.union([z.string(), z.number()]).optional(), // e.g. "7–8" or 8
	note: z.string().optional(),
	// ExerciseDB fields — optional since legacy files won't have them
	bodyPart: z.string().optional(),
	equipment: z.string().optional(),
	target: z.string().optional(),
});

export const MetabolicPrimer = z.object({
	name: z.string(),
	format: z.string().optional(),
	duration_min: z.number().optional(),
	protocol: z.string().optional(),
	instructions: z.string().optional(),
	rpe_target: z.number().optional(),
});

export const DayType = z.object({
	label: z.string().optional(),
	note: z.string().optional(),
	timing_note: z.string().optional(),
	days: z.array(z.string()).optional(),
	total_targets: z
		.object({
			calories: z.number(),
			protein_g: z.number(),
			carbs_g: z.number(),
			fats_g: z.number(),
		})
		.optional(),
	macros_g: z
		.object({
			protein: z.number(),
			carbs: z.number(),
			fat: z.number(),
		})
		.optional(),
	meals: z.array(Meal).optional(),
	meal_templates: z.array(z.string()).optional(),
});

export const Session = z.object({
	id: z.string().optional(),
	day: z.string(),
	focus: z.string().optional(),
	scheduling_note: z.string().optional(),
	estimated_duration_min: z.number().optional(),
	metabolic_primer: MetabolicPrimer.optional(),
	exercises: z.array(Exercise).optional(),
	alternating_weeks: z
		.record(
			z.string(),
			z.object({
				label: z.string().optional(),
				metabolic_primer: MetabolicPrimer.optional(),
				exercises: z.array(Exercise).optional(),
			}),
		)
		.optional(),
});

// Legacy circuit schema
export const Circuit = z.object({
	name: z.string(),
	exercises: z.array(
		z.object({
			name: z.string(),
			sets: z.number(),
			reps: z.string(),
			rpe: z.number().optional(),
		}),
	),
});

// ── Top-level document schemas ────────────────────────────────────────────────

export const MeasuresSchema = z.object({
	core_metrics: z.object({
		weight: z.number().positive({ message: "Weight must be > 0" }),
		body_fat_pct: z
			.number()
			.min(1, { message: "Body fat must be ≥ 1%" })
			.max(60, { message: "Body fat must be ≤ 60%" }),
	}),
	mandatory_sites: z.object({
		chest: z.number().positive({ message: "must be > 0" }),
		waist_narrowest: z.number().positive({ message: "must be > 0" }),
		umbilical: z.number().positive({ message: "must be > 0" }),
		hip_widest: z.number().positive({ message: "must be > 0" }),
		thigh_mid: z.number().positive({ message: "must be > 0" }),
		bicep_flexed: z.number().positive({ message: "must be > 0" }),
		forearm: z.number().positive({ message: "must be > 0" }),
	}),
	appointment_notes: z.object({
		goal: z.string(),
		energy_levels: z.string(),
		sleep: z.string(),
		coach_summary: z.string(),
	}),
});

export const DietSchema = z
	.object({
		athlete: z.string().optional(),
		date: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/)
			.optional(),
		methodology: z.string().optional(),
		sport_context: SportContext.optional(),
		targets: z.record(z.string(), z.unknown()).optional(),
		inputs: z.record(z.string(), z.unknown()).optional(),
		macro_rules: z.record(z.string(), z.unknown()).optional(),
		// New schema: carb-cycling day types
		day_types: z.record(z.string(), DayType).optional(),
		// Legacy: flat daily targets
		daily_targets: z
			.object({
				calories: z.number(),
				protein_g: z.number(),
			})
			.optional(),
		weekly_schedule: z.record(z.string(), z.string()).optional(),
		michaels_floors: z.record(z.string(), z.unknown()).optional(),
		adjustments: z.record(z.string(), z.unknown()).optional(),
		rationale: z.array(z.string()).optional(),
	})
	.refine((d) => d.day_types || d.daily_targets, {
		message: "Diet file must have day_types (new schema) or daily_targets (legacy)",
		path: ["day_types"],
	});

export const TrainingSchema = z
	.object({
		athlete: z.string().optional(),
		date: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/)
			.optional(),
		methodology: z.string().optional(),
		sport_context: SportContext.optional(),
		constraints: z.record(z.string(), z.unknown()).optional(),
		progression: z.record(z.string(), z.unknown()).optional(),
		weekly_schedule: z.record(z.string(), z.string()).optional(),
		warmup_template: z.record(z.string(), z.unknown()).optional(),
		// New schema: sessions[]
		sessions: z.array(Session).optional(),
		// Legacy schema: circuits[]
		circuits: z.array(Circuit).optional(),
		progression_rule: z.string().optional(),
		progression_logic: z.string().optional(),
	})
	.refine((t) => (t.sessions && t.sessions.length > 0) || (t.circuits && t.circuits.length > 0), {
		message: "Training file must have sessions[] (new schema) or circuits[] (legacy)",
		path: ["sessions"],
	});

export const AppointmentSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "date must be YYYY-MM-DD" }),
	athlete: z.string(),
	decisions: z.array(
		z.object({
			key: z.string(),
			value: z.unknown(),
		}),
	),
	preferences_delta: z.object({
		food_swaps: z.array(
			z.object({
				remove: z.string(),
				add: z.string(),
			}),
		),
		food_additions: z.array(z.string()),
		food_removals: z.array(z.string()),
		constraints_added: z.array(z.string()),
		constraints_removed: z.array(z.string()),
		schedule_changes: z.array(
			z.object({
				field: z.string(),
				value: z.unknown(),
			}),
		),
	}),
	plan_rationale_deltas: z.array(z.string()),
	notes: z.string(),
});

// ── TypeScript types ──────────────────────────────────────────────────────────

export type MeasuresSession = z.infer<typeof MeasuresSchema>;
export type DietSession = z.infer<typeof DietSchema>;
export type TrainingSession = z.infer<typeof TrainingSchema>;
export type AppointmentArtifact = z.infer<typeof AppointmentSchema>;
export type SessionType = keyof typeof SCHEMAS;

// ── Schema map (CLI lookup by type string) ────────────────────────────────────

export const SCHEMAS = {
	measures: MeasuresSchema,
	diet: DietSchema,
	training: TrainingSchema,
	appointment: AppointmentSchema,
} as const;
