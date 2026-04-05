// Entry point for zod2md training schema documentation generation.
// Exports only training-related schemas so the generated doc is scoped for the programmer agent.
export { TrainingSchema, Session, Exercise, MetabolicPrimer, WarmupSet } from "./index.ts";
