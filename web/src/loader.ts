/**
 * Circular SVG progress loader displayed during simulation.
 * Shows live secure/total count in the center; disappears on completion.
 * @module loader
 */

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

let container: HTMLElement;
let circle: SVGCircleElement;
let textEl: HTMLElement;

/** Initializes the loader DOM references. */
export function initLoader(): void {
  container = document.getElementById("sim-loader")!;
  circle = container.querySelector(".loader-circle") as unknown as SVGCircleElement;
  textEl = container.querySelector(".loader-text") as HTMLElement;
}

/** Shows the loader and resets it to 0%. */
export function showLoader(): void {
  container.classList.remove("hidden");
  updateProgress(0, 1);
  updateSecure(0, 0);
}

/** Hides the loader. */
export function hideLoader(): void {
  container.classList.add("hidden");
}

/**
 * Updates the circular progress stroke.
 * @param completed - Experiments completed.
 * @param total - Total experiments.
 */
export function updateProgress(completed: number, total: number): void {
  const pct = total > 0 ? completed / total : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  circle.style.strokeDashoffset = String(offset);
}

/**
 * Updates the center text with secure/total count.
 * @param secure - Number of secure iterations so far.
 * @param total - Total iterations completed so far.
 */
export function updateSecure(secure: number, total: number): void {
  textEl.textContent = `${secure} / ${total}`;
}
