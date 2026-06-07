/**
 * Valibot schema for validating simulation parameters before execution.
 * @module schema
 */
import * as v from "valibot";

const rate = v.pipe(v.number(), v.minValue(0), v.maxValue(1));
const positiveInt = v.pipe(v.number(), v.integer(), v.minValue(1));

/** Schema that validates a complete set of simulation parameters. */
export const SimulationParamsSchema = v.object({
  protocols: v.pipe(v.array(v.string()), v.minLength(1, "Select at least one protocol")),
  sizes: v.pipe(v.array(positiveInt), v.minLength(1, "Add at least one size")),
  interception_rates: v.pipe(v.array(rate), v.minLength(1, "Add at least one rate")),
  noise_probabilities: v.pipe(v.array(rate), v.minLength(1, "Add at least one noise value")),
  confidences: v.pipe(v.array(rate), v.minLength(1, "Add at least one confidence")),
  repetitions: positiveInt,
});

/**
 * Validates simulation parameters against the schema.
 * @param data - Raw form data to validate.
 * @returns A Valibot SafeParseResult with typed output or issues.
 */
export function validate(data: unknown) {
  return v.safeParse(SimulationParamsSchema, data);
}
