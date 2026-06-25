/**
 * Post-simulation KPI metrics computed per-protocol from filtered results.
 * @module metrics
 */
import type { ExperimentResult } from "./types";
import { PROTOCOL_PRIMARY } from "./protocol-toggle";

let section: HTMLElement;

export function hideMetrics(): void {
  section = document.getElementById("metrics-section")!;
  section.classList.add("hidden");
  section.innerHTML = "";
}

export function showMetrics(): void {
  section = document.getElementById("metrics-section")!;
  section.classList.remove("hidden");
}

export function renderMetrics(results: ExperimentResult[], activeProtocols: string[]): void {
  section = document.getElementById("metrics-section")!;
  section.innerHTML = "";

  for (const protocol of activeProtocols) {
    const data = results.filter((r) => r.protocol === protocol);
    if (data.length === 0) continue;

    const total = data.length;
    const secure = data.filter((r) => r.is_considered_secure);
    const avgMeasuredQber = total ? data.reduce((s, r) => s + r.measured_qber, 0) / total : 0;
    const finalQberResults = secure.filter((r) => r.final_key_qber !== null);
    const avgFinalQber = finalQberResults.length
      ? finalQberResults.reduce((s, r) => s + r.final_key_qber!, 0) / finalQberResults.length
      : null;
    const keyed = secure.filter((r) => r.key_length !== null);
    const avgKeyLen = keyed.length ? keyed.reduce((s, r) => s + r.key_length!, 0) / keyed.length : 0;
    const securePct = total ? ((secure.length / total) * 100).toFixed(1) : "0";
    const avgEfficiency = keyed.length
      ? keyed.reduce((s, r) => s + (r.key_length! / r.number_of_qubits) * 100, 0) / keyed.length
      : 0;
    const avgEve = total ? data.reduce((s, r) => s + r.eve_knowledge, 0) / total : 0;
    const avgEveSecure = secure.length
      ? secure.reduce((s, r) => s + r.eve_knowledge, 0) / secure.length
      : 0;

    const color = PROTOCOL_PRIMARY[protocol] || "#64748b";
    const row = document.createElement("div");
    row.className = "space-y-1";
    row.innerHTML = `
      <div class="text-xs font-semibold uppercase tracking-wide" style="color:${color}">${protocol}</div>
      <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        ${card("Avg Measured QBER", total ? `${(avgMeasuredQber * 100).toFixed(2)}%` : "—")}
        ${card("Avg Final Key QBER", avgFinalQber !== null ? `${(avgFinalQber * 100).toFixed(2)}%` : "—")}
        ${card("Avg Key Length", keyed.length ? `${Math.round(avgKeyLen)} bits` : "—")}
        ${card("Secure / Total", total ? `${secure.length}/${total} = ${securePct}%` : "—")}
        ${card("Key Efficiency", keyed.length ? `${avgEfficiency.toFixed(1)}%` : "—")}
        ${card("Mean Eve's Knowledge", total ? `${(avgEve * 100).toFixed(2)}%` : "—")}
        ${card("Eve's Knowledge (secure)", secure.length ? `${(avgEveSecure * 100).toFixed(2)}%` : "—")}
      </div>`;
    section.appendChild(row);
  }
}

function card(label: string, value: string): string {
  return `<div class="border border-slate-200 dark:border-slate-700 rounded p-3">
    <div class="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-medium">${label}</div>
    <div class="text-sm font-mono font-semibold">${value}</div>
  </div>`;
}
