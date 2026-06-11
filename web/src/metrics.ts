/**
 * Post-simulation KPI metrics computed from filtered results.
 * Shown only after simulation completes; hidden during execution.
 * @module metrics
 */
import type { ExperimentResult } from "./types";

/** Hides the metrics section. */
export function hideMetrics(): void {
  document.getElementById("metrics-section")!.classList.add("hidden");
}

/** Shows the metrics section. */
export function showMetrics(): void {
  document.getElementById("metrics-section")!.classList.remove("hidden");
}

/**
 * Computes and renders all 6 KPIs from the given (filtered) results.
 * @param results - Experiment results matching current filter selection.
 */
export function renderMetrics(results: ExperimentResult[]): void {
  const total = results.length;
  const secure = results.filter((r) => r.is_considered_secure);

  // Avg QBER (measured + final key)
  const avgMeasuredQber = total ? results.reduce((s, r) => s + r.measured_qber, 0) / total : 0;
  const finalQberResults = results.filter((r) => r.final_key_qber !== null);
  const avgFinalQber = finalQberResults.length
    ? finalQberResults.reduce((s, r) => s + r.final_key_qber!, 0) / finalQberResults.length
    : null;

  // Avg Key Length (secure only)
  const keyed = secure.filter((r) => r.key_length !== null);
  const avgKeyLen = keyed.length ? keyed.reduce((s, r) => s + r.key_length!, 0) / keyed.length : 0;

  // Secure/total
  const securePct = total ? ((secure.length / total) * 100).toFixed(1) : "0";

  // Key Efficiency (secure only, relative to number_of_qubits)
  const avgEfficiency = keyed.length
    ? keyed.reduce((s, r) => s + (r.key_length! / r.number_of_qubits) * 100, 0) / keyed.length
    : 0;

  // Mean Eve's knowledge (all)
  const avgEve = total ? results.reduce((s, r) => s + r.eve_knowledge, 0) / total : 0;

  // Mean Eve's knowledge (secure only)
  const avgEveSecure = secure.length
    ? secure.reduce((s, r) => s + r.eve_knowledge, 0) / secure.length
    : 0;

  // Render
  setText("metric-qber", total
    ? `${(avgMeasuredQber * 100).toFixed(2)}% / ${avgFinalQber !== null ? (avgFinalQber * 100).toFixed(2) + "%" : "—"}`
    : "—");
  setText("metric-keylen", keyed.length ? `${Math.round(avgKeyLen)} bits` : "—");
  setText("metric-secure", total ? `${secure.length}/${total} = ${securePct}%` : "—");
  setText("metric-efficiency", keyed.length ? `${avgEfficiency.toFixed(1)}%` : "—");
  setText("metric-eve", total ? `${(avgEve * 100).toFixed(2)}%` : "—");
  setText("metric-eve-secure", secure.length ? `${(avgEveSecure * 100).toFixed(2)}%` : "—");
}

function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
