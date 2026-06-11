/**
 * Application entry point. Wires together form, engine, loader,
 * filters, metrics, charts, CSV export, and theme toggle.
 * @module main
 */
import "./style.css";
import { initTheme, toggleTheme } from "./theme";
import { initForm, setFormDisabled } from "./form";
import { startSimulation, abortSimulation } from "./engine";
import { initCharts, clearCharts, renderCharts } from "./plots";
import { hideMetrics, showMetrics, renderMetrics } from "./metrics";
import { initFilters, hideFilters, showFilters, filterResults } from "./filters";
import { initLoader, showLoader, hideLoader, updateArcs } from "./loader";
import { downloadCsv } from "./csv-export";
import type { ExperimentResult, SimulationParams } from "./types";
import type { FilterSelection } from "./filters";

const results: ExperimentResult[] = [];
let running = false;
let secureCount = 0;
let insecureCount = 0;
let totalExperiments = 0;

initTheme();
initForm(onSubmit);
initCharts();
initLoader();
initFilters(onFilterChange);

document.getElementById("theme-toggle")!.addEventListener("click", toggleTheme);
document.getElementById("abort-btn")!.addEventListener("click", onAbort);
document.getElementById("download-btn")!.addEventListener("click", () => downloadCsv(results));

function onSubmit(params: SimulationParams): void {
  results.length = 0;
  secureCount = 0;
  insecureCount = 0;
  totalExperiments = 0;
  running = true;
  setFormDisabled(true);
  clearCharts();
  hideMetrics();
  hideFilters();
  showLoader();
  document.getElementById("charts-section")!.classList.add("hidden");
  document.getElementById("abort-btn")!.classList.remove("hidden");

  startSimulation(params, {
    onResult(r) {
      results.push(r);
      if (r.is_considered_secure) secureCount++;
      else insecureCount++;
    },
    onProgress(_completed, total) {
      totalExperiments = total;
      updateArcs(secureCount, insecureCount, totalExperiments);
    },
    onDone() {
      running = false;
      setFormDisabled(false);
      document.getElementById("abort-btn")!.classList.add("hidden");
      hideLoader();
      finishSimulation();
    },
  });
}

function onAbort(): void {
  if (!running) return;
  abortSimulation();
  running = false;
  setFormDisabled(false);
  document.getElementById("abort-btn")!.classList.add("hidden");
  hideLoader();
  if (results.length > 0) finishSimulation();
}

function finishSimulation(): void {
  const sel = showFilters(results);
  document.getElementById("charts-section")!.classList.remove("hidden");
  showMetrics();
  // Defer rendering to next frame so containers have correct dimensions
  requestAnimationFrame(() => renderWithSelection(sel));
}

function onFilterChange(sel: FilterSelection): void {
  renderWithSelection(sel);
}

function renderWithSelection(sel: FilterSelection): void {
  const filtered = filterResults(results, sel);
  renderMetrics(filtered);
  renderCharts(filtered);
}
