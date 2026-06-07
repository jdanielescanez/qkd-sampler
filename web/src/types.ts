/** Parameters for a simulation session, mirroring the CLI arguments. */
export interface SimulationParams {
  /** Selected QKD protocols to simulate. */
  protocols: string[];
  /** Number of qubits (sifted key sizes) to test. */
  sizes: number[];
  /** Eve's interception rates (0.0–1.0). */
  interception_rates: number[];
  /** Quantum channel noise probabilities (0.0–1.0). */
  noise_probabilities: number[];
  /** Confidence levels for eavesdropping detection (0.0–1.0). */
  confidences: number[];
  /** Number of Monte Carlo repetitions per parameter combination. */
  repetitions: number;
}

/** Result of a single QKD experiment, returned by the WASM module. */
export interface ExperimentResult {
  /** Unique identifier for this experiment run. */
  id: string;
  /** Protocol name (BB84, SixState, B92). */
  protocol: string;
  /** Number of qubits used. */
  number_of_qubits: number;
  /** Eve's interception rate. */
  interception_rate: number;
  /** Channel noise probability. */
  noise: number;
  /** Confidence level used. */
  confidence: number;
  /** Execution time in microseconds. */
  time_us: number;
  /** Whether the protocol considered the channel secure. */
  is_considered_secure: boolean;
  /** Final key length in bits, null if protocol aborted. */
  key_length: number | null;
  /** Fraction of key known by Eve. */
  eve_knowledge: number;
  /** Measured Quantum Bit Error Rate. */
  measured_qber: number;
  /** QBER of the final key, null if protocol aborted. */
  final_key_qber: number | null;
}

/** Messages sent from the main thread to the simulation worker. */
export type WorkerMessage =
  | { type: "start"; params: SimulationParams }
  | { type: "abort" };

/** Messages sent from the simulation worker to the main thread. */
export type WorkerResponse =
  | { type: "result"; data: ExperimentResult }
  | { type: "progress"; completed: number; total: number }
  | { type: "done" };
