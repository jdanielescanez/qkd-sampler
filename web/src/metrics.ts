/**
 * Running-average metrics displayed during simulation.
 * Updates DOM elements with live KPIs as results arrive.
 * @module metrics
 */
import type { ExperimentResult } from "./types";

let count = 0;
let sumQber = 0;
let sumKeyLen = 0;
let secureCount = 0;
let keyCount = 0;

/** Resets all accumulators and clears displayed values. */
export function resetMetrics(): void {
  count = sumQber = sumKeyLen = secureCount = keyCount = 0;
  update();
}

/**
 * Incorporates a new experiment result into the running averages.
 * @param r - The experiment result to include.
 */
export function pushResult(r: ExperimentResult): void {
  count++;
  sumQber += r.measured_qber;
  if (r.is_considered_secure) secureCount++;
  if (r.key_length !== null) {
    sumKeyLen += r.key_length;
    keyCount++;
  }
  update();
}

/** Writes computed metrics to the DOM. */
function update(): void {
  setText("metric-qber", count ? (sumQber / count * 100).toFixed(2) + "%" : "—");
  setText("metric-keylen", keyCount ? Math.round(sumKeyLen / keyCount).toString() + " bits" : "—");
  setText("metric-secure", `${secureCount}/${count}`);
  setText("metric-efficiency", keyCount ? ((sumKeyLen / keyCount / 1000) * 100).toFixed(1) + "%" : "—");
}

/**
 * Sets the text content of a DOM element by ID.
 * @param id - Element ID.
 * @param text - Text to display.
 */
function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
