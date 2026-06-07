/**
 * Application entry point. Wires together form, engine, metrics,
 * charts, CSV export, and theme toggle.
 * @module main
 */
import "./style.css";
import { initTheme, toggleTheme } from "./theme";
import { initForm, setFormDisabled } from "./form";
import { startSimulation, abortSimulation } from "./engine";
import { initCharts, clearCharts, renderAllResults } from "./plots";
import { resetMetrics, pushResult } from "./metrics";
import { downloadCsv } from "./csv-export";
import type { ExperimentResult, SimulationParams } from "./types";

/** Accumulated results for the current simulation session. */
const results: ExperimentResult[] = [];
let running = false;

initTheme();
initForm(onSubmit);
initCharts();

document.getElementById("theme-toggle")!.addEventListener("click", toggleTheme);
document.getElementById("abort-btn")!.addEventListener("click", onAbort);
document.getElementById("download-btn")!.addEventListener("click", () => downloadCsv(results));

/**
 * Handles form submission: resets state and starts the simulation.
 * @param params - Validated simulation parameters from the form.
 */
function onSubmit(params: SimulationParams): void {
  results.length = 0;
  running = true;
  setFormDisabled(true);
  clearCharts();
  resetMetrics();
  showProgress(0, 1);
  showChartsSection(false);
  document.getElementById("abort-btn")!.classList.remove("hidden");

  startSimulation(params, {
    onResult(r) {
      results.push(r);
      pushResult(r);
    },
    onProgress(completed, total) {
      showProgress(completed, total);
    },
    onDone() {
      running = false;
      setFormDisabled(false);
      document.getElementById("abort-btn")!.classList.add("hidden");
      showChartsSection(true);
      renderAllResults(results);
    },
  });
}

/** Aborts the current simulation. Renders partial results if any. */
function onAbort(): void {
  if (!running) return;
  abortSimulation();
  running = false;
  setFormDisabled(false);
  document.getElementById("abort-btn")!.classList.add("hidden");
  if (results.length > 0) {
    showChartsSection(true);
    renderAllResults(results);
  }
}

/**
 * Updates the progress bar and text.
 * @param completed - Number of experiments finished.
 * @param total - Total number of experiments.
 */
function showProgress(completed: number, total: number): void {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  document.getElementById("progress-bar")!.style.width = `${pct}%`;
  document.getElementById("progress-text")!.textContent = `${completed} / ${total}`;
}

/**
 * Shows or hides the charts section.
 * @param visible - Whether charts should be visible.
 */
function showChartsSection(visible: boolean): void {
  document.getElementById("charts-section")!.classList.toggle("hidden", !visible);
}
