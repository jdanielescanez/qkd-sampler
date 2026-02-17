# QKD Sampler: Quantum Key Distribution Simulator in Rust

[![Crates.io](https://img.shields.io/crates/v/qkd-sampler.svg)](https://crates.io/crates/qkd-sampler)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A Rust CLI tool for simulating **Quantum Key Distribution (QKD)** protocols, including **BB84**, **Six-State**, and **B92**. This crate provides a flexible and efficient way to simulate quantum key exchange, analyze security metrics, and evaluate the impact of eavesdropping.

---

## Features

- **Multiple QKD Protocols**: Simulate BB84, Six-State, and B92 protocols.
- **Customizable Parameters**: Adjust the number of qubits, interception rate, noise, confidence and repetitions.
- **Security Metrics**: Calculate Quantum Bit Error Rate (QBER), key length, and Eve's knowledge.
- **CSV Output**: Export simulation results for further analysis.

---

## Installation

```bash
cargo install qkd-sampler
```

---

## Execution

Execute the simulator using the following command:

```
qkd-sampler --protocol <protocol> --output <file_name> [OPTIONS]
```

#### Options

| Option                     | Description                                                                                     | Default Value                     |
|----------------------------|-------------------------------------------------------------------------------------------------|-----------------------------------|
| `--protocol`, `-p`         | Name of protocol to simulate (`BB84`, `SixState`, `B92`) [required]                             | -                                 |
| `--size`, `-s`             | Number of qubits to send                                                                         | `1000`                            |
| `--interception-rate`, `-i`| Rate of intercepted qubits by Eve (value between `0.0` and `1.0`)                               | `0.0`                             |
| `--noise-probability`, `-n`      | Probability of error in the quantum channel                                                    | `0.0`                             |
| `--confidence`, `-c`            | Confidence level to successfully detect eavesdropping                                          | `0.9999999999`      |
| `--repetitions`, `-r`      | Number of repetitions by experiment                                                              | `1`                               |
| `--output`, `-o`           | Output CSV file path [required]                                                                 | -                                 |
| `--help`, `-h` | Print help |
| `--version`, `-V` | Print version |

#### Examples

Run the BB84 protocol with default parameters:
```
qkd-sampler --protocol BB84 -o output/little_example.csv
```

The program generates a file similar to the one of the [specified path](./output/little_example.csv):

```csv
id,protocol,number_of_qubits,interception_rate,noise,confidence,time_μs,is_considered_secure,key_length,eve_knowledge,measured_qber,final_key_qber
BB84_1000_0_0_0.9999999999-0,BB84,1000,0,0,0.9999999999,2526,true,245,0,0,0
```
---

Run multiple QKD protocols (BB84, SixState, and B92) with different parameters:
```
qkd-sampler -p BB84,SixState,B92 -s 100,10000 -i 0.001,0.01,0.1 -o output/mid_example.csv
```

The program generates the results similar to the following file (that can be seen in the [specified path](./output/mid_example.csv)):

```csv
id,protocol,number_of_qubits,interception_rate,noise,confidence,time_μs,is_considered_secure,key_length,eve_knowledge,measured_qber,final_key_qber
BB84_100_0.001_0_0.9999999999-0,BB84,100,0.001,0,0.9999999999,543,true,25,0,0,0
BB84_100_0.01_0_0.9999999999-0,BB84,100,0.01,0,0.9999999999,134,true,26,0,0,0
BB84_100_0.1_0_0.9999999999-0,BB84,100,0.1,0,0.9999999999,130,false,None,0,0.041666666666666664,None
BB84_10000_0.001_0_0.9999999999-0,BB84,10000,0.001,0,0.9999999999,20905,false,None,0,0.0007858546168958742,None
BB84_10000_0.01_0_0.9999999999-0,BB84,10000,0.01,0,0.9999999999,14749,false,None,0,0.0012048192771084338,None
BB84_10000_0.1_0_0.9999999999-0,BB84,10000,0.1,0,0.9999999999,14548,false,None,0,0.026835043409629045,None
SixState_100_0.001_0_0.9999999999-0,SixState,100,0.001,0,0.9999999999,134,true,15,0,0,0
SixState_100_0.01_0_0.9999999999-0,SixState,100,0.01,0,0.9999999999,134,true,18,0,0,0.05555555555555555
SixState_100_0.1_0_0.9999999999-0,SixState,100,0.1,0,0.9999999999,132,false,None,0,0.0625,None
SixState_10000_0.001_0_0.9999999999-0,SixState,10000,0.001,0,0.9999999999,17563,true,1636,0,0,0
SixState_10000_0.01_0_0.9999999999-0,SixState,10000,0.01,0,0.9999999999,14613,false,None,0,0.0023432923257176333,None
SixState_10000_0.1_0_0.9999999999-0,SixState,10000,0.1,0,0.9999999999,14838,false,None,0,0.028605482717520857,None
B92_100_0.001_0_0.9999999999-0,B92,100,0.001,0,0.9999999999,153,true,14,0,0,0
B92_100_0.01_0_0.9999999999-0,B92,100,0.01,0,0.9999999999,141,true,10,0,0,0
B92_100_0.1_0_0.9999999999-0,B92,100,0.1,0,0.9999999999,131,false,None,0,0.07692307692307693,None
B92_10000_0.001_0_0.9999999999-0,B92,10000,0.001,0,0.9999999999,130613,false,None,0,0.0015785319652722968,None
B92_10000_0.01_0_0.9999999999-0,B92,10000,0.01,0,0.9999999999,112374,false,None,0,0.0071090047393364926,None
B92_10000_0.1_0_0.9999999999-0,B92,10000,0.1,0,0.9999999999,115288,false,None,0,0.05657492354740061,None
```

Another larger example can be found at [this link](./output/full_example.csv).

---
## License

This project is licensed under the [MIT License](LICENSE).

---
## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/jdanielescanez/qkd-sampler).
