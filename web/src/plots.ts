/**
 * Chart rendering: two stacked line charts for successful iterations.
 * QBER=0 iterations extracted into a stacked horizontal bar above each plot.
 * Bar color encodes eve_knowledge intensity in 5 bands (0 to max in dataset).
 * @module plots
 */
import Plotly from "plotly.js-dist-min";
import type { ExperimentResult } from "./types";
import { isDark } from "./theme";

const NUM_BANDS = 5;
const BAND_COLORS = ["#bfdbfe", "#60a5fa", "#2563eb", "#1e40af", "#1e3a5f"];

let measuredDiv: HTMLElement;
let finalDiv: HTMLElement;
let zeroBarMeasured: HTMLElement;
let zeroBarFinal: HTMLElement;

/** Initializes chart containers and registers theme listener. */
export function initCharts(): void {
  measuredDiv = document.getElementById("chart-measured-qber")!;
  finalDiv = document.getElementById("chart-final-qber")!;
  zeroBarMeasured = document.getElementById("zero-bar-measured")!;
  zeroBarFinal = document.getElementById("zero-bar-final")!;

  window.addEventListener("theme-changed", () => {
    const l = baseLayout();
    Plotly.relayout(measuredDiv, l);
    Plotly.relayout(finalDiv, l);
  });
}

/** Purges all chart instances and clears zero bars. */
export function clearCharts(): void {
  Plotly.purge(measuredDiv);
  Plotly.purge(finalDiv);
  zeroBarMeasured.innerHTML = "";
  zeroBarFinal.innerHTML = "";
}

/**
 * Renders charts from filtered results (successful only).
 * @param results - Pre-filtered results matching variable selection.
 */
export function renderCharts(results: ExperimentResult[]): void {
  const secure = results.filter((r) => r.is_considered_secure);
  const maxEve = Math.max(...secure.map((r) => r.eve_knowledge), 0) || 1;
  const bands = makeBands(maxEve);

  // Measured QBER
  const measuredZero = secure.filter((r) => r.measured_qber === 0);
  const measuredNonZero = secure.filter((r) => r.measured_qber !== 0);
  renderZeroBar(zeroBarMeasured, measuredZero, bands, "Measured QBER = 0");
  renderLineChart(measuredDiv, measuredNonZero, bands, "Measured QBER Distribution (Secure, QBER > 0)", "Measured QBER", true);

  // Final Key QBER
  const secureFinal = secure.filter((r) => r.final_key_qber !== null);
  const finalZero = secureFinal.filter((r) => r.final_key_qber === 0);
  const finalNonZero = secureFinal.filter((r) => r.final_key_qber !== 0);
  renderZeroBar(zeroBarFinal, finalZero, bands, "Final Key QBER = 0");
  renderLineChart(finalDiv, finalNonZero, bands, "Final Key QBER Distribution (Secure, QBER > 0)", "Final Key QBER", false);
}

interface Band { lo: number; hi: number; label: string; last: boolean; }

function makeBands(maxEve: number): Band[] {
  const bandSize = maxEve / NUM_BANDS;
  return Array.from({ length: NUM_BANDS }, (_, i) => {
    const lo = i * bandSize;
    const hi = (i + 1) * bandSize;
    const label = i === 0 && maxEve === 0
      ? "eve = 0"
      : `eve ∈ [${lo.toFixed(3)}, ${hi.toFixed(3)}${i === NUM_BANDS - 1 ? "]" : ")"}`;
    return { lo, hi, label, last: i === NUM_BANDS - 1 };
  });
}

function filterByBand(data: ExperimentResult[], band: Band): ExperimentResult[] {
  return data.filter((r) => {
    if (band.last) return r.eve_knowledge >= band.lo && r.eve_knowledge <= band.hi;
    return r.eve_knowledge >= band.lo && r.eve_knowledge < band.hi;
  });
}

function renderZeroBar(container: HTMLElement, data: ExperimentResult[], bands: Band[], title: string): void {
  container.innerHTML = "";
  if (data.length === 0) return;

  const counts = bands.map((b) => filterByBand(data, b).length);
  const total = data.length;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<div class="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-medium mb-1">${title}: ${total}</div>`;
  const bar = document.createElement("div");
  bar.className = "flex h-5 rounded overflow-hidden";
  counts.forEach((count, i) => {
    if (count === 0) return;
    const seg = document.createElement("div");
    seg.style.width = `${(count / total) * 100}%`;
    seg.style.backgroundColor = BAND_COLORS[i];
    seg.title = `${bands[i].label}: ${count}`;
    bar.appendChild(seg);
  });
  wrapper.appendChild(bar);
  container.appendChild(wrapper);
}

function renderLineChart(div: HTMLElement, data: ExperimentResult[], bands: Band[], title: string, xLabel: string, showLegend: boolean): void {
  const traces = bands.map((b, i) => {
    const pts = filterByBand(data, b)
      .map((r) => xLabel.includes("Final") ? r.final_key_qber! : r.measured_qber)
      .sort((a, b) => a - b);
    const xVals: number[] = [];
    const yVals: number[] = [];
    for (const v of pts) {
      if (xVals.length > 0 && xVals[xVals.length - 1] === v) {
        yVals[yVals.length - 1]++;
      } else {
        xVals.push(v);
        yVals.push(1);
      }
    }
    return {
      x: xVals,
      y: yVals,
      type: "scatter" as const,
      mode: "lines" as const,
      name: b.label,
      line: { color: BAND_COLORS[i] },
      showlegend: showLegend,
      stackgroup: "one",
    };
  });

  Plotly.newPlot(div, traces, {
    ...baseLayout(),
    title,
    xaxis: { title: xLabel, gridcolor: gridColor() },
    yaxis: { title: "Count", gridcolor: gridColor() },
    legend: showLegend ? { x: 0.65, y: 0.95 } : undefined,
    margin: { t: 40, r: 0, b: 50, l: 40 },
  }, { responsive: true });
}

function baseLayout(): Record<string, unknown> {
  const dark = isDark();
  return {
    paper_bgcolor: dark ? "#1e293b" : "#ffffff",
    plot_bgcolor: dark ? "#0f172a" : "#ffffff",
    font: { color: dark ? "#e2e8f0" : "#1e293b", family: "Inter" },
  };
}

function gridColor(): string {
  return isDark() ? "#334155" : "#e2e8f0";
}
