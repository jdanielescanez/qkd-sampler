/**
 * Web Worker that loads the WASM module and iterates through
 * the Cartesian product of simulation parameters.
 * Posts each result back to the main thread individually.
 * @module sim-worker
 */
import type { SimulationParams, WorkerMessage, ExperimentResult } from "./types";
import init, { run_single, set_global_seed } from "../wasm/qkd_web.js";

let ready = false;

/** Initializes the WASM module (once per worker lifetime). */
async function initWasm() {
  if (ready) return;
  await init();
  ready = true;
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type !== "start") return;

  await initWasm();
  const params: SimulationParams = e.data.params;

  set_global_seed(BigInt(params.seed));

  const total =
    params.protocols.length *
    params.sizes.length *
    params.interception_rates.length *
    params.noise_probabilities.length *
    params.confidences.length *
    params.repetitions;

  let completed = 0;

  for (const protocol of params.protocols) {
    for (const size of params.sizes) {
      for (const ir of params.interception_rates) {
        for (const noise of params.noise_probabilities) {
          for (const conf of params.confidences) {
            for (let rep = 0; rep < params.repetitions; rep++) {
              const data = run_single(protocol, size, ir, noise, conf) as unknown as ExperimentResult;
              data.id = `${data.id}-${rep}`;
              completed++;
              self.postMessage({ type: "result", data });
              self.postMessage({ type: "progress", completed, total });
            }
          }
        }
      }
    }
  }

  self.postMessage({ type: "done" });
};
