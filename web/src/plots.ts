/**
 * Chart rendering: two stacked line charts for successful iterations.
 * Multi-protocol overlay with per-protocol eve_knowledge color palettes.
 * @module plots
 */
import Plotly from "plotly.js-dist-min";
import type { ExperimentResult } from "./types";
import { isDark } from "./theme";
import { PROTOCOL_PALETTES, PROTOCOL_PRIMARY } from "./protocol-toggle";

const NUM_BANDS = 5;

let measuredDiv: HTMLElement;
let finalDiv: HTMLElement;
let zeroBarMeasured: HTMLElement;
let zeroBarFinal: HTMLElement;

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

export function clearCharts(): void {
  Plotly.purge(measuredDiv);
  Plotly.purge(finalDiv);
  zeroBarMeasured.innerHTML = "";
  zeroBarFinal.innerHTML = "";
}

export function renderCharts(results: ExperimentResult[], activeProtocols: string[]): void {
  const secure = results.filter((r) => r.is_considered_secure);
  const maxEve = Math.max(...secure.map((r) => r.eve_knowledge), 0) || 1;
  const bands = makeBands(maxEve);

  // Measured QBER
  const measuredZero = secure.filter((r) => r.measured_qber === 0);
  const measuredNonZero = secure.filter((r) => r.measured_qber !== 0);
  renderZeroBars(zeroBarMeasured, measuredZero, bands, activeProtocols, "Measured QBER = 0");
  renderLineChart(measuredDiv, measuredNonZero, bands, activeProtocols, "Measured QBER Distribution (Secure, QBER > 0)", "Measured QBER");

  // Final Key QBER
  const secureFinal = secure.filter((r) => r.final_key_qber !== null);
  const finalZero = secureFinal.filter((r) => r.final_key_qber === 0);
  const finalNonZero = secureFinal.filter((r) => r.final_key_qber !== 0);
  renderZeroBars(zeroBarFinal, finalZero, bands, activeProtocols, "Final Key QBER = 0");
  renderLineChart(finalDiv, finalNonZero, bands, activeProtocols, "Final Key QBER Distribution (Secure, QBER > 0)", "Final Key QBER");
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

function renderZeroBars(container: HTMLElement, data: ExperimentResult[], bands: Band[], activeProtocols: string[], title: string): void {
  container.innerHTML = "";
  if (data.length === 0) return;

  for (const protocol of activeProtocols) {
    const protoData = data.filter((r) => r.protocol === protocol);
    if (protoData.length === 0) continue;
    const palette = PROTOCOL_PALETTES[protocol] || PROTOCOL_PALETTES.BB84;
    const counts = bands.map((b) => filterByBand(protoData, b).length);
    const total = protoData.length;

    const row = document.createElement("div");
    row.className = "mb-1";
    row.innerHTML = `<div class="text-[10px] uppercase font-medium mb-0.5" style="color:${PROTOCOL_PRIMARY[protocol]}">${protocol} — ${title}: ${total}</div>`;
    const bar = document.createElement("div");
    bar.className = "flex h-4 rounded overflow-hidden";
    counts.forEach((count, i) => {
      if (count === 0) return;
      const seg = document.createElement("div");
      seg.style.width = `${(count / total) * 100}%`;
      seg.style.backgroundColor = palette[i];
      seg.title = `${protocol} ${bands[i].label}: ${count}`;
      bar.appendChild(seg);
    });
    row.appendChild(bar);
    container.appendChild(row);
  }
}

function renderLineChart(div: HTMLElement, data: ExperimentResult[], bands: Band[], activeProtocols: string[], title: string, xLabel: string): void {
  const traces: Array<Record<string, unknown>> = [];

  for (const protocol of activeProtocols) {
    const protoData = data.filter((r) => r.protocol === protocol);
    if (protoData.length === 0) continue;
    const palette = PROTOCOL_PALETTES[protocol] || PROTOCOL_PALETTES.BB84;

    for (let i = 0; i < bands.length; i++) {
      const pts = filterByBand(protoData, bands[i])
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
      traces.push({
        x: xVals,
        y: yVals,
        type: "scatter",
        mode: "lines",
        name: `${protocol} ${bands[i].label}`,
        line: { color: palette[i] },
        stackgroup: protocol,
      });
    }
  }

  Plotly.newPlot(div, traces, {
    ...baseLayout(),
    title,
    xaxis: { title: xLabel, gridcolor: gridColor() },
    yaxis: { title: "Count", gridcolor: gridColor() },
    showlegend: false,
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
