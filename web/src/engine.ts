/**
 * Manages the simulation Web Worker lifecycle.
 * Handles starting, receiving messages, and aborting simulations.
 * @module engine
 */
import type { SimulationParams, ExperimentResult, WorkerResponse } from "./types";

/** Callbacks invoked by the engine as results stream in. */
export interface EngineCallbacks {
  /** Called with each completed experiment result. */
  onResult: (result: ExperimentResult) => void;
  /** Called with progress updates (completed/total counts). */
  onProgress: (completed: number, total: number) => void;
  /** Called when all experiments have finished. */
  onDone: () => void;
}

let worker: Worker | null = null;

/**
 * Starts a simulation session in a Web Worker.
 * @param params - Validated simulation parameters.
 * @param callbacks - Handlers for results, progress, and completion.
 */
export function startSimulation(params: SimulationParams, callbacks: EngineCallbacks): void {
  worker = new Worker(new URL("./sim-worker.ts", import.meta.url), { type: "module" });

  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const msg = e.data;
    switch (msg.type) {
      case "result":
        callbacks.onResult(msg.data);
        break;
      case "progress":
        callbacks.onProgress(msg.completed, msg.total);
        break;
      case "done":
        callbacks.onDone();
        worker?.terminate();
        worker = null;
        break;
    }
  };

  worker.postMessage({ type: "start", params });
}

/** Terminates the running simulation worker. Collected results remain intact. */
export function abortSimulation(): void {
  worker?.terminate();
  worker = null;
}
