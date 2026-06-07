declare module "plotly.js-dist-min" {
  const Plotly: any;
  export default Plotly;
}

declare module "../wasm/qkd_web.js" {
  export default function init(): Promise<void>;
  export function run_single(
    protocol: string,
    size: number,
    interception_rate: number,
    noise: number,
    confidence: number
  ): unknown;
  export function available_protocols(): string[];
}
