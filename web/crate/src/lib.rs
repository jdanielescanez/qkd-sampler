use std::collections::HashMap;

use qkd::protocol::{QKD, QKDResult};
use qkd::{build_b92, build_bb84, build_six_state};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
struct ExperimentResult {
    id: String,
    protocol: String,
    number_of_qubits: usize,
    interception_rate: f64,
    noise: f64,
    confidence: f64,
    time_us: u128,
    is_considered_secure: bool,
    key_length: Option<usize>,
    eve_knowledge: f64,
    measured_qber: f64,
    final_key_qber: Option<f64>,
}

fn build_all_available_protocols() -> HashMap<String, QKD> {
    HashMap::from([
        ("BB84".to_string(), build_bb84()),
        ("SixState".to_string(), build_six_state()),
        ("B92".to_string(), build_b92()),
    ])
}

#[wasm_bindgen]
pub fn run_single(
    protocol: &str,
    size: usize,
    interception_rate: f64,
    noise: f64,
    confidence: f64,
) -> JsValue {
    let protocols = build_all_available_protocols();
    let qkd = protocols
        .get(protocol)
        .unwrap_or_else(|| panic!("Unknown protocol: {}", protocol));

    let result: QKDResult = qkd.run(size, interception_rate, noise, confidence);

    let out = ExperimentResult {
        id: format!("{}_{}_{}_{}_{}", protocol, size, interception_rate, noise, confidence),
        protocol: protocol.to_string(),
        number_of_qubits: size,
        interception_rate,
        noise,
        confidence,
        time_us: result.elapsed_time,
        is_considered_secure: result.is_considered_secure,
        key_length: result.key_length,
        eve_knowledge: result.eve_knowledge,
        measured_qber: result.measured_qber,
        final_key_qber: result.final_key_qber,
    };

    serde_wasm_bindgen::to_value(&out).unwrap()
}

#[wasm_bindgen]
pub fn set_global_seed(seed: u64) {
    qkd::set_global_seed(seed);
}

#[wasm_bindgen]
pub fn available_protocols() -> JsValue {
    let protocols = build_all_available_protocols();
    let names: Vec<String> = protocols.keys().cloned().collect();
    serde_wasm_bindgen::to_value(&names).unwrap()
}
