/**
 * Chart rendering: two stacked QBER histograms for successful iterations.
 * Bar color encodes eve_knowledge intensity in 5 bands (0 to max in dataset).
 * @module plots
 */
import Plotly from "plotly.js-dist-min";
import type { ExperimentResult } from "./types";
import { isDark } from "./theme";

const NUM_BANDS = 5;
/** Color scale from lightest (no knowledge) to darkest (max knowledge). */
const BAND_COLORS = ["#bfdbfe", "#60a5fa", "#2563eb", "#1e40af", "#1e3a5f"];

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
 * Each result is bucketed into a color band based on its eve_knowledge value.
 * @param results - Pre-filtered results (should already match variable selection).
 */
export function renderCharts(results: ExperimentResult[]): void {
  const secure = results.filter((r) => r.is_considered_secure);
  const maxEve = Math.max(...secure.map((r) => r.eve_knowledge), 0) || 1;
  const bandSize = maxEve / NUM_BANDS;

  const bands = Array.from({ length: NUM_BANDS }, (_, i) => {
    const lo = i * bandSize;
    const hi = (i + 1) * bandSize;
    const label = i === 0 && maxEve === 0
      ? "eve = 0"
      : `eve ∈ [${lo.toFixed(3)}, ${hi.toFixed(3)}${i === NUM_BANDS - 1 ? "]" : ")"}`;
    return { lo, hi, label, last: i === NUM_BANDS - 1 };
  });

  // Measured QBER
  const measuredTraces = bands.map((b, i) => {
    const pts = secure.filter((r) => {
      if (b.last) return r.eve_knowledge >= b.lo && r.eve_knowledge <= b.hi;
      return r.eve_knowledge >= b.lo && r.eve_knowledge < b.hi;
    });
    return {
      x: pts.map((r) => r.measured_qber),
      type: "histogram" as const,
      name: b.label,
      marker: { color: BAND_COLORS[i] },
    };
  });

  Plotly.newPlot(measuredDiv, measuredTraces, {
    ...baseLayout(),
    barmode: "stack",
    title: "Measured QBER Distribution (Secure Only)",
    xaxis: { title: "Measured QBER", gridcolor: gridColor() },
    yaxis: { title: "Count", gridcolor: gridColor() },
    legend: { x: 0.7, y: 0.95 },
  }, { responsive: true });

  // Final Key QBER
  const secureFinal = secure.filter((r) => r.final_key_qber !== null);
  const finalTraces = bands.map((b, i) => {
    const pts = secureFinal.filter((r) => {
      if (b.last) return r.eve_knowledge >= b.lo && r.eve_knowledge <= b.hi;
      return r.eve_knowledge >= b.lo && r.eve_knowledge < b.hi;
    });
    return {
      x: pts.map((r) => r.final_key_qber!),
      type: "histogram" as const,
      name: b.label,
      marker: { color: BAND_COLORS[i] },
      showlegend: false,
    };
  });

  Plotly.newPlot(finalDiv, finalTraces, {
    ...baseLayout(),
    barmode: "stack",
    title: "Final Key QBER Distribution (Secure Only)",
    xaxis: { title: "Final Key QBER", gridcolor: gridColor() },
    yaxis: { title: "Count", gridcolor: gridColor() },
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
