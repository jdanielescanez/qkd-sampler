/**
 * Variable selection filters shown below the header after simulation ends.
 * Allows users to pick a specific parameter configuration to filter metrics and plots.
 * @module filters
 */
import type { ExperimentResult } from "./types";

/** Current filter selection state. */
export interface FilterSelection {
  size: number;
  interception_rate: number;
  noise: number;
  confidence: number;
}

let container: HTMLElement;
let onChange: ((sel: FilterSelection) => void) | null = null;

/**
 * Initializes the filters module with its DOM container.
 * @param onChangeCallback - Called whenever a filter selection changes.
 */
export function initFilters(onChangeCallback: (sel: FilterSelection) => void): void {
  container = document.getElementById("filters-section")!;
  onChange = onChangeCallback;
}

/** Hides the filter selects. */
export function hideFilters(): void {
  container.classList.add("hidden");
}

/**
 * Populates filter selects from results and shows them.
 * Selects the first value of each variable by default.
 * @param results - All experiment results.
 * @returns The default filter selection.
 */
export function showFilters(results: ExperimentResult[]): FilterSelection {
  container.innerHTML = "";
  container.classList.remove("hidden");

  const sizes = distinct(results.map((r) => r.number_of_qubits));
  const rates = distinct(results.map((r) => r.interception_rate));
  const noises = distinct(results.map((r) => r.noise));
  const confs = distinct(results.map((r) => r.confidence));

  container.appendChild(makeSelect("Key Size", "filter-size", sizes));
  container.appendChild(makeSelect("Interception Rate", "filter-rate", rates));
  container.appendChild(makeSelect("Noise", "filter-noise", noises));
  container.appendChild(makeSelect("Confidence", "filter-conf", confs));

  container.addEventListener("change", emitChange);

  return { size: sizes[0], interception_rate: rates[0], noise: noises[0], confidence: confs[0] };
}

/** Reads current selection from the DOM selects. */
export function getSelection(): FilterSelection {
  return {
    size: parseFloat((document.getElementById("filter-size") as HTMLSelectElement).value),
    interception_rate: parseFloat((document.getElementById("filter-rate") as HTMLSelectElement).value),
    noise: parseFloat((document.getElementById("filter-noise") as HTMLSelectElement).value),
    confidence: parseFloat((document.getElementById("filter-conf") as HTMLSelectElement).value),
  };
}

/**
 * Filters results based on the given selection.
 * @param results - Full results array.
 * @param sel - Active filter selection.
 * @returns Filtered results matching all selected variable values.
 */
export function filterResults(results: ExperimentResult[], sel: FilterSelection): ExperimentResult[] {
  return results.filter((r) =>
    r.number_of_qubits === sel.size &&
    r.interception_rate === sel.interception_rate &&
    r.noise === sel.noise &&
    r.confidence === sel.confidence
  );
}

function emitChange(): void {
  onChange?.(getSelection());
}

function makeSelect(label: string, id: string, values: number[]): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "flex flex-col gap-1";
  wrapper.innerHTML = `<label class="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-medium">${label}</label>`;
  const select = document.createElement("select");
  select.id = id;
  select.className = "text-xs font-mono bg-transparent border border-slate-300 dark:border-slate-600 rounded px-2 py-1";
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = String(v);
    opt.textContent = String(v);
    select.appendChild(opt);
  }
  wrapper.appendChild(select);
  return wrapper;
}

function distinct(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}
