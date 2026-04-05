import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { AppointmentSchema, DietSchema, MeasuresSchema, TrainingSchema } from "@opencoach/schemas";

const measures = defineCollection({
	loader: glob({ pattern: "*.json", base: "../measures" }),
	schema: MeasuresSchema,
});

const diet = defineCollection({
	loader: glob({ pattern: "*.json", base: "../diet" }),
	schema: DietSchema,
});

const training = defineCollection({
	loader: glob({ pattern: "*.json", base: "../training" }),
	schema: TrainingSchema,
});

const appointments = defineCollection({
	loader: glob({ pattern: "*.json", base: "../appointments" }),
	schema: AppointmentSchema,
});

export const collections = { measures, diet, training, appointments };
