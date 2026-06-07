/**
 * Chart rendering using Plotly.js.
 * Charts are rendered in a single batch after simulation completes.
 * @module plots
 */
import Plotly from "plotly.js-dist-min";
import type { ExperimentResult } from "./types";
import { isDark } from "./theme";

/** Protocol color mapping for consistent chart styling. */
const COLORS: Record<string, string> = {
  BB84: "#2563eb",
  SixState: "#16a34a",
  B92: "#dc2626",
};

let scatterDiv: HTMLElement;
let histDiv: HTMLElement;
let barDiv: HTMLElement;

/** Initializes chart containers and registers theme change listener. */
export function initCharts(): void {
  scatterDiv = document.getElementById("chart-scatter")!;
  histDiv = document.getElementById("chart-hist")!;
  barDiv = document.getElementById("chart-bar")!;

  window.addEventListener("theme-changed", () => {
    const l = baseLayout();
    Plotly.relayout(scatterDiv, l);
    Plotly.relayout(histDiv, l);
    Plotly.relayout(barDiv, l);
  });
}

/** Purges all chart instances. */
export function clearCharts(): void {
  Plotly.purge(scatterDiv);
  Plotly.purge(histDiv);
  Plotly.purge(barDiv);
}

/**
 * Renders all charts from the complete results array.
 * Called once after simulation finishes (or on abort with partial data).
 * @param results - All collected experiment results.
 */
export function renderAllResults(results: ExperimentResult[]): void {
  // Scatter: QBER vs interception rate, one trace per protocol
  const protocols = [...new Set(results.map((r) => r.protocol))];
  const scatterTraces = protocols.map((proto) => {
    const pts = results.filter((r) => r.protocol === proto);
    return {
      x: pts.map((r) => r.interception_rate),
      y: pts.map((r) => r.measured_qber),
      mode: "markers",
      type: "scatter" as const,
      name: proto,
      marker: { color: COLORS[proto] || "#666", size: 5 },
    };
  });

  Plotly.newPlot(scatterDiv, scatterTraces, {
    ...baseLayout(),
    title: "Measured QBER vs Interception Rate",
    xaxis: { title: "Interception Rate", gridcolor: gridColor() },
    yaxis: { title: "Measured QBER", gridcolor: gridColor() },
  }, { responsive: true });

  // Histogram: QBER distribution
  Plotly.newPlot(histDiv, [{
    x: results.map((r) => r.measured_qber),
    type: "histogram" as const,
    marker: { color: "#2563eb" },
  }], {
    ...baseLayout(),
    title: "QBER Distribution",
    xaxis: { title: "QBER", gridcolor: gridColor() },
    yaxis: { title: "Count", gridcolor: gridColor() },
  }, { responsive: true });

  // Bar: average key length per protocol
  const protoStats: Record<string, { sum: number; count: number }> = {};
  for (const r of results) {
    if (!protoStats[r.protocol]) protoStats[r.protocol] = { sum: 0, count: 0 };
    if (r.key_length !== null) {
      protoStats[r.protocol].sum += r.key_length;
      protoStats[r.protocol].count++;
    }
  }
  const protos = Object.keys(protoStats);
  const avgs = protos.map((p) => protoStats[p].count ? protoStats[p].sum / protoStats[p].count : 0);

  Plotly.newPlot(barDiv, [{
    x: protos,
    y: avgs,
    type: "bar" as const,
    marker: { color: protos.map((p) => COLORS[p] || "#666") },
  }], {
    ...baseLayout(),
    title: "Avg Key Length by Protocol",
    xaxis: { title: "Protocol" },
    yaxis: { title: "Avg Key Length", gridcolor: gridColor() },
  }, { responsive: true });
}

/**
 * Returns the base Plotly layout adapted to the current theme.
 * @returns Layout object with colors matching dark/light mode.
 */
function baseLayout(): Record<string, any> {
  const dark = isDark();
  return {
    paper_bgcolor: dark ? "#1e293b" : "#ffffff",
    plot_bgcolor: dark ? "#0f172a" : "#ffffff",
    font: { color: dark ? "#e2e8f0" : "#1e293b", family: "Inter" },
    margin: { t: 40, r: 20, b: 50, l: 60 },
  };
}

/** Returns the grid line color for the current theme. */
function gridColor(): string {
  return isDark() ? "#334155" : "#e2e8f0";
}
