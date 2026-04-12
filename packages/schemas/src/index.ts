/**
 * OpenCoach Zod schemas — single source of truth for validation and TypeScript types.
 *
 * IMPORTANT: After any change to this file, regenerate schema docs for AI agents:
 *   cd packages/schemas && npm run gen:schema-docs
 *
 * This keeps .opencode/context/coaching/schemas/ in sync with the Zod definitions.
 */

import { z } from "zod";

// ── Primitives ────────────────────────────────────────────────────────────────

export const MealMacros = z.object({
	calories: z.number().describe("Total kilocalories for this meal"),
	protein_g: z.number().describe("Grams of protein"),
	carbs_g: z.number().describe("Grams of carbohydrates"),
	fats_g: z.number().describe("Grams of fat"),
});

export const WarmupSet = z.object({
	reps: z.number().describe("Rep count for this warmup set"),
	load: z.string().describe("Load description, e.g. '40kg' or '50% 1RM'"),
	note: z.string().optional().describe("Optional coaching note for this warmup set"),
});

export const SportContext = z.object({
	sport: z.string().describe("Athlete's primary sport, e.g. 'Futsal', 'Muay Thai', 'Bodybuilding'"),
	mapped_to: z.string().optional().describe("Nearest sport from the Sport Goal Reference table if the athlete's sport is unlisted"),
	training_focus: z.string().optional().describe("Primary physical qualities to develop, e.g. 'explosive power + agility'"),
	movement_patterns: z.string().optional().describe("Dominant movements in the sport, e.g. 'lateral cuts, sprinting, kicking'"),
	// Array in practice (e.g. ["knees","ankles"]), string accepted for legacy
	injury_areas: z.union([z.string(), z.array(z.string())]).optional()
		.describe("Body areas to monitor and avoid overloading, e.g. ['knees', 'ankles']"),
	energy_system: z.string().optional().describe("Aerobic/anaerobic profile, e.g. '70% aerobic / 30% anaerobic'"),
	nutrition_strategy: z.string().optional().describe("Sport-specific dietary guidance, e.g. 'carb-dominant; match-day carb loading'"),
	notes: z.string().optional().describe("Additional sport-specific coaching notes"),
});

// ── Components ────────────────────────────────────────────────────────────────

export const Ingredient = z.object({
	food: z.string().describe("Food name — must be from the primary list in athlete-notes.md → Food Preferences"),
	grams: z.number().positive().describe("Quantity in grams"),
});

export const MealTemplate = z.object({
	title: z.string().describe("Meal slot name, e.g. 'Breakfast', 'Pre-workout', 'Post-sport dinner'"),
	timing: z.string().optional().describe("When to eat relative to training, e.g. '60–120 min pre-sport'"),
	ingredients: z.array(Ingredient).describe("Ingredients with gram quantities"),
});

export const Meal = z.object({
	meal: z.string().describe("Meal name, e.g. 'Breakfast', 'Pre-workout', 'Post-workout', 'Dinner'"),
	timing: z.string().optional().describe("When to eat relative to training, e.g. '60 min pre-workout'"),
	foods: z.array(Ingredient).describe("Ingredients with gram quantities — food names from primary list in athlete-notes.md only"),
	macros: MealMacros.optional().describe("Macro breakdown for this meal — omit if using meal_templates instead"),
});

export const Exercise = z.object({
	name: z.string().describe("Exercise name exactly as returned by ExerciseDB API"),
	warmup_sets: z.array(WarmupSet).optional().describe("Progressive warmup sets before working sets"),
	working_sets: z.number().optional().describe("Legacy field — use sets instead"),
	sets: z.number().optional().describe("Number of working sets"),
	reps: z.union([z.string(), z.number()]).optional()
		.describe("Rep target. Use string for ranges ('6-8'), number for fixed (8)"),
	rpe: z.union([z.string(), z.number()]).optional()
		.describe("RPE target. Use string for ranges ('7–8'). Main lifts: 7–8, Accessories: 7–8"),
	note: z.string().optional().describe("Coaching cue for the athlete, e.g. 'Drive knees out at bottom'"),
	// ExerciseDB fields — optional since legacy files won't have them
	bodyPart: z.string().optional().describe("From ExerciseDB: body part category, e.g. 'chest', 'legs'"),
	equipment: z.string().optional().describe("From ExerciseDB: equipment required, e.g. 'barbell', 'dumbbell'"),
	target: z.string().optional().describe("From ExerciseDB: primary target muscle, e.g. 'pectorals', 'quads'"),
});

export const MetabolicPrimer = z.object({
	name: z.string().describe("Circuit name, e.g. 'AMRAP Circuit' or 'Tabata Protocol'"),
	format: z.string().optional().describe("Format type: AMRAP | Tabata | EMOM | Interval"),
	duration_min: z.number().optional().describe("Total primer duration in minutes, typically 6–10"),
	protocol: z.string().optional().describe("Work/rest prescription, e.g. '20s work / 10s rest × 8 rounds'"),
	instructions: z.string().optional().describe("Detailed instructions for the athlete"),
	rpe_target: z.number().optional().describe("Target RPE for the primer, usually 8–9"),
});

export const DayType = z.object({
	label: z.string().optional().describe("Human-readable label for this day type, e.g. 'Gym + Sport Day'"),
	note: z.string().optional().describe("Coaching note about this day type"),
	timing_note: z.string().optional().describe("When meals should be eaten relative to training"),
	days: z.array(z.string()).optional()
		.describe("Weekdays this type applies to, e.g. ['monday', 'wednesday', 'friday']"),
	total_targets: z
		.object({
			calories: z.number().describe("Total kilocalories for this day type"),
			protein_g: z.number().describe("Always = macro_rules.protein_g (LBM kg × 2.2). Constant across all day types."),
			carbs_g: z.number().describe("Variable carb target. Training days: 150–250g typical. Rest days: cut 20–40% from training day."),
			fats_g: z.number().describe("Always ≥ macro_rules.fat_g (bodyweight kg × 0.8). Constant across all day types."),
		})
		.optional(),
	macros_g: z
		.object({
			protein: z.number().describe("Grams of protein. Always = macro_rules.protein_g (LBM kg × 2.2). Constant across all day types."),
			carbs: z.number().describe("Variable carb target. Training days: 150–250g typical. Rest days: cut 20–40% from training day baseline."),
			fat: z.number().describe("Grams of fat. Always ≥ macro_rules.fat_g (bodyweight kg × 0.8). Constant across all day types."),
		})
		.optional(),
	meals: z.array(Meal).optional().describe("Full meal breakdown — populate when specifying per-meal foods and macros"),
	meal_templates: z.array(z.union([
		MealTemplate,
		z.string().describe("Legacy free-text template — migrate to MealTemplate for gram tracking"),
	])).optional()
		.describe("Meal templates with title, timing, and ingredients in grams. New plans: use MealTemplate objects. Legacy: plain strings accepted."),
});

export const Session = z.object({
	id: z.string().optional().describe("Optional identifier for the session"),
	day: z.string().describe("Weekday for this session, e.g. 'monday', 'wednesday'"),
	focus: z.string().optional().describe("Session label, e.g. 'Upper Body Push', 'Legs', 'Full Body'"),
	scheduling_note: z.string().optional().describe("Note about scheduling, e.g. 'Must be 48h after sport'"),
	estimated_duration_min: z.number().optional().describe("Estimated session duration in minutes"),
	metabolic_primer: MetabolicPrimer.optional()
		.describe("REQUIRED by Michaels methodology. Every session must open with a metabolic primer (AMRAP or Tabata)."),
	exercises: z.array(Exercise).optional()
		.describe("Working exercises from ExerciseDB only. Order: compound lifts first, accessories after."),
	alternating_weeks: z
		.record(
			z.string(),
			z.object({
				label: z.string().optional().describe("Week label, e.g. 'Week A' or 'Week B'"),
				metabolic_primer: MetabolicPrimer.optional(),
				exercises: z.array(Exercise).optional(),
			}),
		)
		.optional()
		.describe("Use for A/B week alternating programmes. Keys: 'weekA', 'weekB'"),
});

// Legacy circuit schema
export const Circuit = z.object({
	name: z.string().describe("Circuit name — legacy format, use sessions[] instead"),
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
		weight: z.number().positive({ message: "Weight must be > 0" })
			.describe("Athlete's current weight in kilograms"),
		body_fat_pct: z
			.number()
			.min(1, { message: "Body fat must be ≥ 1%" })
			.max(60, { message: "Body fat must be ≤ 60%" })
			.describe("Body fat percentage (1–60%)"),
	}),
	mandatory_sites: z.object({
		chest: z.number().positive({ message: "must be > 0" }).describe("Circumference measurement in cm"),
		waist_narrowest: z.number().positive({ message: "must be > 0" }).describe("Circumference measurement in cm"),
		umbilical: z.number().positive({ message: "must be > 0" }).describe("Circumference measurement in cm"),
		hip_widest: z.number().positive({ message: "must be > 0" }).describe("Circumference measurement in cm"),
		thigh_mid: z.number().positive({ message: "must be > 0" }).describe("Circumference measurement in cm"),
		bicep_flexed: z.number().positive({ message: "must be > 0" }).describe("Circumference measurement in cm"),
		forearm: z.number().positive({ message: "must be > 0" }).describe("Circumference measurement in cm"),
	}).describe("7-site body circumference measurements, all in centimetres"),
	skin_folds: z.object({
		chest: z.number().positive({ message: "must be > 0" }).describe("Skinfold measurement in mm"),
		abdomen: z.number().positive({ message: "must be > 0" }).describe("Skinfold measurement in mm"),
		thigh: z.number().positive({ message: "must be > 0" }).describe("Skinfold measurement in mm"),
		tricep: z.number().positive({ message: "must be > 0" }).describe("Skinfold measurement in mm"),
		suprailiac: z.number().positive({ message: "must be > 0" }).describe("Skinfold measurement in mm"),
		subscapular: z.number().positive({ message: "must be > 0" }).describe("Skinfold measurement in mm"),
		midaxillary: z.number().positive({ message: "must be > 0" }).describe("Skinfold measurement in mm"),
	}).optional().describe("7-site skinfold measurements, all in millimetres (optional)"),
	appointment_notes: z.object({
		energy_levels: z.string().describe("Subjective energy level report for the week"),
		sleep: z.string().describe("Subjective sleep quality report for the week"),
		coach_summary: z.string().describe("Head coach's summary of the check-in"),
	}),
});

export const DietSchema = z
	.object({
		athlete: z.string().optional().describe("Athlete name — copy from profile.json"),
		date: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/)
			.optional()
			.describe("Session date in YYYY-MM-DD format"),
		methodology: z.string().optional().describe("Always 'Michaels'"),
		sport_context: SportContext.optional().describe("Passed in by Head Coach — do not derive independently"),
		targets: z.record(z.string(), z.unknown()).optional().describe("Legacy field — ignore for new plans"),
		inputs: z.record(z.string(), z.unknown()).optional()
			.describe("Derived context from Head Coach: michaels_floors, sport_context passed as structured data"),
		macro_rules: z.record(z.string(), z.unknown()).optional()
			.describe("Michaels floors: protein_g_per_kg_lbm: 2.2, fat_g_per_kg_bodyweight: 0.8, protein_g: <LBM×2.2>, fat_g: <weight×0.8>"),
		// New schema: carb-cycling day types
		day_types: z.record(z.string(), DayType).optional()
			.describe("Carb-cycling day types (preferred over daily_targets). Common keys: gymOnly, legsDay, sportGym, restDay"),
		// Legacy: flat daily targets
		daily_targets: z
			.object({
				calories: z.number(),
				protein_g: z.number(),
			})
			.optional()
			.describe("Legacy flat targets — only use when migrating old data. New plans must use day_types."),
		weekly_schedule: z.record(z.string(), z.string()).optional()
			.describe("Map of weekday to day type key, e.g. { monday: 'gymOnly', tuesday: 'sportGym', sunday: 'restDay' }"),
		michaels_floors: z.record(z.string(), z.unknown()).optional()
			.describe("Computed macro floors passed in by Head Coach: protein_floor_g (LBM×2.2), fat_floor_g (weight×0.8)"),
		adjustments: z.record(z.string(), z.unknown()).optional()
			.describe("Caloric adjustments with rationale, e.g. { reason: 'WROC below -0.3', carbs_delta_g: +20 }"),
		rationale: z.array(z.string()).optional()
			.describe("One sentence per reason the plan differs from the prior session. E.g. 'Carbs raised 20g — WROC below −0.3 kg/wk indicating under-recovery'"),
	})
	.refine((d) => d.day_types || d.daily_targets, {
		message: "Diet file must have day_types (new schema) or daily_targets (legacy)",
		path: ["day_types"],
	});

export const TrainingSchema = z
	.object({
		athlete: z.string().optional().describe("Athlete name — copy from profile.json"),
		date: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/)
			.optional()
			.describe("Session date in YYYY-MM-DD format"),
		methodology: z.string().optional().describe("Always 'Michaels'"),
		sport_context: SportContext.optional().describe("Passed in by Head Coach — do not derive independently"),
		constraints: z.record(z.string(), z.unknown()).optional()
			.describe("From profile.json: no_jumping, gym_only, etc. Copy verbatim from profile."),
		progression: z.record(z.string(), z.unknown()).optional()
			.describe("RPE-based progression rules: rpe_targets (main_lifts, accessories) and advancement rule string"),
		weekly_schedule: z.record(z.string(), z.string()).optional()
			.describe("Map of weekday to session focus label, e.g. { monday: 'Upper Body Push', wednesday: 'Legs' }"),
		warmup_template: z.record(z.string(), z.unknown()).optional()
			.describe("General warmup structure: optional cardio, mobility drills, ramp sets for first lift"),
		// New schema: sessions[]
		sessions: z.array(Session).optional()
			.describe("Array of training sessions (preferred format). Must include a metabolic_primer in every session."),
		// Legacy schema: circuits[]
		circuits: z.array(Circuit).optional()
			.describe("Legacy circuit format — only use when migrating old data. New plans must use sessions[]."),
		progression_rule: z.string().optional().describe("Legacy field — put progression rules in progression.rule instead"),
		progression_logic: z.string().optional().describe("Legacy field — put progression rules in progression.rule instead"),
	})
	.refine((t) => (t.sessions && t.sessions.length > 0) || (t.circuits && t.circuits.length > 0), {
		message: "Training file must have sessions[] (new schema) or circuits[] (legacy)",
		path: ["sessions"],
	});

export const AppointmentSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "date must be YYYY-MM-DD" })
		.describe("Appointment date in YYYY-MM-DD format"),
	athlete: z.string().describe("Athlete name — copy from profile.json"),
	decisions: z.array(
		z.object({
			key: z.string().describe("Constraint or override key, e.g. 'no_jumping', 'legs_day', 'primer_skipped', 'cardio'"),
			value: z.unknown().describe("Value for the decision, e.g. true, 'saturday', '5-min warm-up only'"),
		}),
	).describe("Each methodology override or constraint raised during the appointment. Leave [] if none."),
	preferences_delta: z.object({
		food_swaps: z.array(
			z.object({
				remove: z.string().describe("Food being replaced"),
				add: z.string().describe("Food replacing it"),
			}),
		).describe("Food substitutions raised during the appointment. Leave [] if none."),
		food_additions: z.array(z.string())
			.describe("New foods added to the athlete's primary list. Leave [] if none."),
		food_removals: z.array(z.string())
			.describe("Foods dropped from the athlete's plan. Leave [] if none."),
		constraints_added: z.array(z.string())
			.describe("New injury or equipment constraints, e.g. 'no overhead pressing'. Leave [] if none."),
		constraints_removed: z.array(z.string())
			.describe("Constraints that no longer apply, e.g. 'knee pain resolved'. Leave [] if none."),
		schedule_changes: z.array(
			z.object({
				field: z.string().describe("Schedule field being changed, e.g. 'rest_days', 'sport_days'"),
				value: z.unknown().describe("New value, e.g. ['sunday'] or 'tuesday'"),
			}),
		).describe("Schedule shifts raised during the appointment. Leave [] if none."),
	}),
	plan_rationale_deltas: z.array(z.string())
		.describe("One sentence per reason the plan changed from the previous session. E.g. 'Legs moved to Saturday for sport recovery window'"),
	notes: z.string()
		.describe("Anything notable that doesn't fit above: subjective feedback, upcoming events, mid-session complaints. Empty string if none."),
});

// ── TypeScript types ──────────────────────────────────────────────────────────

export type MeasuresSession = z.infer<typeof MeasuresSchema>;
export type DietSession = z.infer<typeof DietSchema>;
export type TrainingSession = z.infer<typeof TrainingSchema>;
export type AppointmentArtifact = z.infer<typeof AppointmentSchema>;
export type IngredientItem = z.infer<typeof Ingredient>;
export type MealTemplateItem = z.infer<typeof MealTemplate>;
export type SessionType = keyof typeof SCHEMAS;

// ── Schema map (CLI lookup by type string) ────────────────────────────────────

export const SCHEMAS = {
	measures: MeasuresSchema,
	diet: DietSchema,
	training: TrainingSchema,
	appointment: AppointmentSchema,
} as const;
