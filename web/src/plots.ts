/**
 * Chart rendering: two stacked QBER histograms for successful iterations.
 * Bar color indicates whether eavesdropping was successful (eve_knowledge > 0).
 * @module plots
 */
import Plotly from "plotly.js-dist-min";
import type { ExperimentResult } from "./types";
import { isDark } from "./theme";

let measuredDiv: HTMLElement;
let finalDiv: HTMLElement;

/** Initializes chart containers and registers theme listener. */
export function initCharts(): void {
  measuredDiv = document.getElementById("chart-measured-qber")!;
  finalDiv = document.getElementById("chart-final-qber")!;

  window.addEventListener("theme-changed", () => {
    const l = baseLayout();
    Plotly.relayout(measuredDiv, l);
    Plotly.relayout(finalDiv, l);
  });
}

/** Purges all chart instances. */
export function clearCharts(): void {
  Plotly.purge(measuredDiv);
  Plotly.purge(finalDiv);
}

/**
 * Renders the two QBER histograms from filtered, successful-only results.
 * @param results - Pre-filtered results (should already match variable selection).
 */
export function renderCharts(results: ExperimentResult[]): void {
  const secure = results.filter((r) => r.is_considered_secure);

  const clean = secure.filter((r) => r.eve_knowledge === 0);
  const eaved = secure.filter((r) => r.eve_knowledge > 0);

  // Measured QBER histogram
  Plotly.newPlot(measuredDiv, [
    { x: clean.map((r) => r.measured_qber), type: "histogram" as const, name: "No eavesdropping", marker: { color: "#60a5fa" }, opacity: 0.8 },
    { x: eaved.map((r) => r.measured_qber), type: "histogram" as const, name: "Eve's knowledge > 0", marker: { color: "#1e3a5f" }, opacity: 0.9 },
  ], {
    ...baseLayout(),
    barmode: "stack",
    title: "Measured QBER Distribution (Secure Only)",
    xaxis: { title: "Measured QBER", gridcolor: gridColor() },
    yaxis: { title: "Count", gridcolor: gridColor() },
    legend: { x: 0.7, y: 0.95 },
  }, { responsive: true });

  // Final Key QBER histogram
  const cleanFinal = clean.filter((r) => r.final_key_qber !== null);
  const eavedFinal = eaved.filter((r) => r.final_key_qber !== null);

  Plotly.newPlot(finalDiv, [
    { x: cleanFinal.map((r) => r.final_key_qber!), type: "histogram" as const, name: "No eavesdropping", marker: { color: "#60a5fa" }, opacity: 0.8 },
    { x: eavedFinal.map((r) => r.final_key_qber!), type: "histogram" as const, name: "Eve's knowledge > 0", marker: { color: "#1e3a5f" }, opacity: 0.9 },
  ], {
    ...baseLayout(),
    barmode: "stack",
    title: "Final Key QBER Distribution (Secure Only)",
    xaxis: { title: "Final Key QBER", gridcolor: gridColor() },
    yaxis: { title: "Count", gridcolor: gridColor() },
    legend: { x: 0.7, y: 0.95 },
  }, { responsive: true });
}

function baseLayout(): Record<string, unknown> {
  const dark = isDark();
  return {
    paper_bgcolor: dark ? "#1e293b" : "#ffffff",
    plot_bgcolor: dark ? "#0f172a" : "#ffffff",
    font: { color: dark ? "#e2e8f0" : "#1e293b", family: "Inter" },
    margin: { t: 40, r: 20, b: 50, l: 60 },
  };
}

function gridColor(): string {
  return isDark() ? "#334155" : "#e2e8f0";
}
