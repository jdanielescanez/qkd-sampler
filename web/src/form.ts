/**
 * Parameter form management: protocol checkboxes, tag/chip inputs,
 * validation, and localStorage persistence.
 * @module form
 */
import type { SimulationParams } from "./types";
import { validate } from "./schema";

const PROTOCOLS = ["BB84", "SixState", "B92"];
const STORAGE_KEY = "qkd-params";

interface TagField {
  values: number[];
  container: HTMLElement;
  input: HTMLInputElement;
}

const fields: Record<string, TagField> = {};
let onSubmitCb: ((params: SimulationParams) => void) | null = null;

/**
 * Loads the last-used configuration from localStorage.
 * @returns Parsed params or null if none saved.
 */
function loadSaved(): Partial<SimulationParams> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * Persists current parameters to localStorage.
 * @param params - Validated parameters to save.
 */
function saveParams(params: SimulationParams): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
}

/**
 * Initializes the form: renders protocol checkboxes, tag fields with
 * saved or default values, and binds the submit handler.
 * @param onSubmit - Callback invoked with validated params on form submission.
 */
export function initForm(onSubmit: (params: SimulationParams) => void): void {
  onSubmitCb = onSubmit;
  const saved = loadSaved();

  // Protocol checkboxes
  const protoContainer = document.getElementById("protocols")!;
  PROTOCOLS.forEach((p) => {
    const checked = saved?.protocols ? saved.protocols.includes(p) : p === "BB84";
    const label = document.createElement("label");
    label.className = "flex items-center gap-2 cursor-pointer";
    label.innerHTML = `<input type="checkbox" value="${p}" class="accent-blue-600" ${checked ? "checked" : ""}/><span class="font-mono text-sm">${p}</span>`;
    protoContainer.appendChild(label);
  });

  // Tag fields
  initTagField("sizes", saved?.sizes ?? [1000]);
  initTagField("interception_rates", saved?.interception_rates ?? [0.0]);
  initTagField("noise_probabilities", saved?.noise_probabilities ?? [0.0]);
  initTagField("confidences", saved?.confidences ?? [0.9999999999]);

  // Repetitions
  if (saved?.repetitions) {
    (document.getElementById("repetitions-input") as HTMLInputElement).value = String(saved.repetitions);
  }

  // Submit
  document.getElementById("run-btn")!.addEventListener("click", handleSubmit);
}

/**
 * Enables or disables all form inputs and buttons.
 * @param disabled - Whether to disable the form.
 */
export function setFormDisabled(disabled: boolean): void {
  document.querySelectorAll<HTMLInputElement | HTMLButtonElement>("#params-form input, #params-form button:not(#abort-btn)").forEach((el) => {
    el.disabled = disabled;
  });
}

/**
 * Initializes a tag/chip input field with default values.
 * @param id - DOM id prefix for the field container and input.
 * @param defaults - Initial values to render as tags.
 */
function initTagField(id: string, defaults: number[]): void {
  const container = document.getElementById(`${id}-tags`)!;
  const input = document.getElementById(`${id}-input`) as HTMLInputElement;

  const field: TagField = { values: [...defaults], container, input };
  fields[id] = field;

  defaults.forEach((v) => renderTag(field, v));

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    commitInput(field);
  });
}

/**
 * Renders a removable tag element inside a tag field.
 * @param field - The tag field to add the tag to.
 * @param value - Numeric value displayed in the tag.
 */
function renderTag(field: TagField, value: number): void {
  const tag = document.createElement("span");
  tag.className = "inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs font-mono rounded";
  tag.textContent = String(value);
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "×";
  btn.className = "ml-1 text-gray-500 hover:text-red-600";
  btn.addEventListener("click", () => {
    const idx = field.values.indexOf(value);
    if (idx >= 0) field.values.splice(idx, 1);
    tag.remove();
  });
  tag.appendChild(btn);
  field.container.insertBefore(tag, field.input);
}

/**
 * Parses comma-separated values from a tag field input and commits them as tags.
 * @param field - The tag field to commit pending input for.
 */
function commitInput(field: TagField): void {
  const raw = field.input.value;
  if (!raw.trim()) return;
  for (const token of raw.split(",")) {
    const val = parseFloat(token.trim());
    if (!isNaN(val)) {
      field.values.push(val);
      renderTag(field, val);
    }
  }
  field.input.value = "";
}

/** Flushes any uncommitted text in all tag inputs before validation. */
function flushPendingInputs(): void {
  for (const field of Object.values(fields)) {
    commitInput(field);
  }
}

/** Validates form state and triggers the submit callback if valid. */
function handleSubmit(): void {
  flushPendingInputs();
  const errorEl = document.getElementById("form-error")!;
  errorEl.textContent = "";

  const protocols = Array.from(
    document.querySelectorAll<HTMLInputElement>('#protocols input:checked')
  ).map((el) => el.value);

  const repetitions = parseInt(
    (document.getElementById("repetitions-input") as HTMLInputElement).value || "1"
  );

  const params = {
    protocols,
    sizes: fields["sizes"].values,
    interception_rates: fields["interception_rates"].values,
    noise_probabilities: fields["noise_probabilities"].values,
    confidences: fields["confidences"].values,
    repetitions,
  };

  const result = validate(params);
  if (!result.success) {
    errorEl.textContent = result.issues.map((i) => i.message).join("; ");
    return;
  }

  saveParams(params as SimulationParams);
  onSubmitCb?.(params as SimulationParams);
}
