#!/usr/bin/env bash
set -euo pipefail

calpq_reset_governance_fixture() {
  local workdir="$1"
  local tmpdir
  tmpdir="$(mktemp -d)"

  [[ -f "$workdir/foundation/manifest.json" ]] || { rm -rf "$tmpdir"; return 1; }
  [[ -f "$workdir/foundation/m00-release-decision.json" ]] || { rm -rf "$tmpdir"; return 1; }
  [[ -f "$workdir/foundation/m00-release-preflight.json" ]] || { rm -rf "$tmpdir"; return 1; }
  [[ -f "$workdir/foundation/feature-development-gate.json" ]] || { rm -rf "$tmpdir"; return 1; }
  [[ -f "$workdir/docs/planning/fv00-admission-decision.json" ]] || { rm -rf "$tmpdir"; return 1; }
  [[ -f "$workdir/docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md" ]] || { rm -rf "$tmpdir"; return 1; }

  jq '
    .m00_release_status = "BLOCKED"
    | .feature_development = "FROZEN"
    | .quality_gates.repository_governance = "REQUIRED"
    | .quality_gates.m00_release_decision = "PENDING"
    | .quality_gates.feature_development_gate = "LOCKED"
    | .last_updated = "2026-09-14"
  ' "$workdir/foundation/manifest.json" > "$tmpdir/manifest.json"

  jq '
    .status = "PENDING"
    | .current_state.m00_release_status = "BLOCKED"
    | .current_state.feature_development = "FROZEN"
    | .current_state.internal_readiness = "PASS"
    | .current_state.repository_governance = "BLOCKED"
    | .remaining_blockers = ["M00-BLK-001"]
    | .approved_transition = null
    | del(.approved_by, .approved_at)
    | .last_updated = "2026-09-13"
  ' "$workdir/foundation/m00-release-decision.json" > "$tmpdir/m00-release-decision.json"

  jq '
    .status = "WAITING_FOR_G6"
    | .required_gate_state.g1_g5 = "PASS"
    | .required_gate_state.g6_repository_governance = "PASS"
    | .required_gate_state.g7_explicit_release_decision = "PENDING"
    | .current_project_state.m00_release_status = "BLOCKED"
    | .current_project_state.feature_development = "FROZEN"
    | .current_project_state.release_decision = "PENDING"
    | .current_project_state.remaining_blocker = "M00-BLK-001"
    | .approved_transition = null
    | .last_updated = "2026-09-13"
  ' "$workdir/foundation/m00-release-preflight.json" > "$tmpdir/m00-release-preflight.json"

  jq '
    .state = "LOCKED"
    | .opened_revision = null
    | .opened_by_transition = null
    | .approved_by = null
    | .approved_at = null
    | .next_gate = null
    | .last_updated = "2026-09-14"
  ' "$workdir/foundation/feature-development-gate.json" > "$tmpdir/feature-development-gate.json"

  jq '
    .state = "BLOCKED_PENDING_PREREQUISITES"
    | .blocking_reviews = []
    | .admitted_revision = null
    | .admitted_by_transition = null
    | .approved_by = null
    | .approved_at = null
    | .authorized_execution_entry = null
    | .last_updated = "2026-09-14"
  ' "$workdir/docs/planning/fv00-admission-decision.json" > "$tmpdir/fv00-admission-decision.json"

  awk '/^## Formal admission evidence$/ {exit} {print}' "$workdir/docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md" \
    | sed \
      -e 's|^Status: `FORMALLY ADMITTED / IMPLEMENTATION MAY BEGIN UNDER M02 BATCH PLAN`$|Status: `PLANNING COMPLETE / READY_FOR_FORMAL_ADMISSION_AFTER_M00`|' \
      -e 's|^`ADMITTED_FOR_IMPLEMENTATION`$|`BLOCKED_PENDING_PREREQUISITES`|' \
    > "$tmpdir/FV00_VERTICAL_ADMISSION_RECORD.md"

  mv "$tmpdir/manifest.json" "$workdir/foundation/manifest.json"
  mv "$tmpdir/m00-release-decision.json" "$workdir/foundation/m00-release-decision.json"
  mv "$tmpdir/m00-release-preflight.json" "$workdir/foundation/m00-release-preflight.json"
  mv "$tmpdir/feature-development-gate.json" "$workdir/foundation/feature-development-gate.json"
  mv "$tmpdir/fv00-admission-decision.json" "$workdir/docs/planning/fv00-admission-decision.json"
  mv "$tmpdir/FV00_VERTICAL_ADMISSION_RECORD.md" "$workdir/docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md"
  rmdir "$tmpdir"

  # Governance self-tests reset a copy of the current repository to a historical
  # PRE_M00/FROZEN state. Once real implementation exists, that copied source must
  # not leak into the historical fixture or the fixture would represent an
  # impossible state (FROZEN governance plus post-admission product source).
  # Keep only the bootstrap README/package manifests that existed during M00.
  local root file
  for root in "$workdir/packages" "$workdir/apps" "$workdir/workers"; do
    [[ -d "$root" ]] || continue
    while IFS= read -r -d '' file; do
      case "$(basename "$file")" in
        README.md|package.json) ;;
        *) rm -f "$file" ;;
      esac
    done < <(find "$root" -type f -print0)
    find "$root" -depth -type d -empty -delete
  done
}
