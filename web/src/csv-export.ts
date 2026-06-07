/**
 * CSV export utility. Generates and downloads a CSV file
 * with the same columns as the CLI output.
 * @module csv-export
 */
import type { ExperimentResult } from "./types";

const HEADERS = [
  "id", "protocol", "number_of_qubits", "interception_rate", "noise",
  "confidence", "time_us", "is_considered_secure", "key_length",
  "eve_knowledge", "measured_qber", "final_key_qber",
];

/**
 * Triggers a CSV file download containing all experiment results.
 * @param results - Array of experiment results to export.
 */
export function downloadCsv(results: ExperimentResult[]): void {
  const rows = results.map((r) =>
    [r.id, r.protocol, r.number_of_qubits, r.interception_rate, r.noise,
     r.confidence, r.time_us, r.is_considered_secure,
     r.key_length ?? "None", r.eve_knowledge, r.measured_qber,
     r.final_key_qber ?? "None"].join(",")
  );
  const csv = [HEADERS.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "qkd-results.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}
