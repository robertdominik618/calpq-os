#!/usr/bin/env bash
# Exactly 42 structural-validator tests, not the 40 product acceptance scenarios.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bash "$root/scripts/global_architecture_check.sh" --self-test
