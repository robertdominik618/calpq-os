#!/usr/bin/env bash
# Exactly 24 structural architecture tests; not the 48 future product scenarios.
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bash "$root/scripts/context_architecture_check.sh" --self-test
