#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Building WASM..."
cd web/crate
wasm-pack build --target web --out-dir ../wasm --release
cd ../..

echo "==> Installing frontend dependencies..."
cd web
pnpm install

echo "==> Building frontend..."
pnpm run build

echo "==> Done. Output: web/dist/"
