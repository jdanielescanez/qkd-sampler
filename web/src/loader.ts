/**
 * Circular SVG progress loader with stacked green (secure) and red (insecure) arcs.
 * Together they fill proportionally to total progress.
 * @module loader
 */

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

let container: HTMLElement;
let greenCircle: SVGCircleElement;
let redCircle: SVGCircleElement;
let textEl: HTMLElement;

/** Initializes the loader DOM references. */
export function initLoader(): void {
  container = document.getElementById("sim-loader")!;
  greenCircle = container.querySelector(".loader-green") as unknown as SVGCircleElement;
  redCircle = container.querySelector(".loader-red") as unknown as SVGCircleElement;
  textEl = container.querySelector(".loader-text") as HTMLElement;
}

/** Shows the loader and resets it to 0%. */
export function showLoader(): void {
  container.classList.remove("hidden");
  updateArcs(0, 0, 1);
}

/** Hides the loader. */
export function hideLoader(): void {
  container.classList.add("hidden");
}

/**
 * Updates both arcs based on secure/insecure counts relative to total experiments.
 * @param secure - Number of secure iterations completed.
 * @param insecure - Number of insecure iterations completed.
 * @param total - Total experiments to run.
 */
export function updateArcs(secure: number, insecure: number, total: number): void {
  const greenPct = total > 0 ? secure / total : 0;
  const redPct = total > 0 ? insecure / total : 0;

  // Green arc: starts at top (rotation -90°)
  greenCircle.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - greenPct));

  // Red arc: starts where green ends
  const redOffset = CIRCUMFERENCE * (1 - redPct);
  redCircle.style.strokeDashoffset = String(redOffset);
  // Rotate red arc to start after green
  const greenAngle = greenPct * 360;
  redCircle.setAttribute("transform", `rotate(${-90 + greenAngle} 100 100)`);

  // Center text
  textEl.textContent = `${secure} / ${secure + insecure}`;
}
