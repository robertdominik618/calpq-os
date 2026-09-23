#!/usr/bin/env bash
# Architecture + bounded successor-compatibility integrity gate for CALPQ-CONTEXT-0001.
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 - "$@" <<'CTX_ARCH_PY'
from __future__ import annotations
import argparse
import copy
import json
from pathlib import Path
import re
import subprocess
import unittest
from urllib.parse import urlparse, unquote

BASE = "3882c146634869a817509f4bc8441738185ce257"
ARCH_FIRST = "8deaf342e17b0a9244b4dc9c1dca3c8ef5d6bcae"
ARCH_EVIDENCE_HEAD = "9fce445e93a3e8d4d9e105a0e3765adfcf63faa9"

BASELINE = "docs/architecture/CALPQ_CONTEXT_0001_SPATIOTEMPORAL_COMPLIANCE.md"
ADR = "docs/adr/ADR-0007-contextual-spatiotemporal-compliance.md"
RUNTIME = "docs/contracts/CONTEXTUAL_JURISDICTION_RUNTIME.md"
TRIGGERS = "docs/contracts/SPATIOTEMPORAL_TRIGGER_MODEL.md"
DELTA = "docs/contracts/CONTEXTUAL_RULE_DELTA_BRIEFING.md"
SOURCES = "docs/contracts/DYNAMIC_OPERATIONAL_SOURCE_MODEL.md"
PRIVACY = "docs/security/CONTEXTUAL_LOCATION_PRIVACY_SAFETY.md"
TRACE = "docs/planning/CALPQ_CONTEXT_0001_TRACEABILITY.md"
SCOPE = "docs/planning/context_scope.json"
AUTH = "docs/planning/context-successor-compatibility.json"
M07_GUARD = "scripts/ci/m07-admission.mjs"

CANONICAL = (
    "docs/foundation/ARCHITECTURE.md",
    "docs/foundation/BOOK.md",
    "docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md",
)
NEW_DOCS = (BASELINE, ADR, RUNTIME, TRIGGERS, DELTA, SOURCES, PRIVACY, TRACE, SCOPE)
ARCH_FILES = (*NEW_DOCS, *CANONICAL)
TOOLS = (
    "scripts/context_architecture_check.sh",
    "tests/context_architecture_test.sh",
    ".github/workflows/context-architecture.yml",
)
ARCH_ADDED = (
    ".github/workflows/context-architecture.yml",
    ADR, BASELINE, RUNTIME, DELTA, SOURCES, TRIGGERS, TRACE, SCOPE, PRIVACY,
    "scripts/context_architecture_check.sh",
    "tests/context_architecture_test.sh",
)
ARCH_MODIFIED = CANONICAL
COMPAT_ADDED = (AUTH,)
COMPAT_MODIFIED = (M07_GUARD,)
ADDED = (*ARCH_ADDED, *COMPAT_ADDED)
MODIFIED = (*ARCH_MODIFIED, *COMPAT_MODIFIED)
ALLOWED = frozenset((*ADDED, *MODIFIED))

APPROVAL_TEXT = "SCHVALUJI OMEZENÉ ROZŠÍŘENÍ GOVERNANCE SCOPE PRO CALPQ-CONTEXT-0001 (kontextový engine jurisdikce, polohy a času) O BOUNDED SUCCESSOR-COMPATIBILITY OPRAVU HISTORICKÝCH M05/M06/M07 GUARDŮ DLE ISSUE #170, VÝHRADNĚ PRO PŘIJETÍ PŘESNĚ VYMEZENÝCH ARCHITEKTONICKÝCH CEST PR #169, BEZ ROZŠÍŘENÍ HISTORICKÉHO PRODUKTOVÉHO SCOPE, BEZ ZMĚNY HISTORICKÝCH DŮKAZŮ, BEZ AUTORIZACE RUNTIME IMPLEMENTACE, GPS/BACKGROUND LOCATION, PRODUKČNÍCH RULE-PACKŮ, LIVE NOTIFIKACÍ, PROVIDERŮ, DEPLOYMENTU NEBO RELEASE, S POVINNÝM FAIL-CLOSED OVĚŘENÍM A NEGATIVNÍMI TESTY, ŽE VŠECHNY OSTATNÍ NEPOVOLENÉ CESTY ZŮSTÁVAJÍ ODMÍTÁNY."

class Invalid(ValueError):
    pass

def require(value, message):
    if not value:
        raise Invalid(message)

def strict_object(pairs):
    out = {}
    for key, value in pairs:
        require(key not in out, "duplicate JSON key: " + key)
        out[key] = value
    return out

def parse(raw):
    result = json.loads(raw, object_pairs_hook=strict_object)
    require(isinstance(result, dict), "JSON root must be an object")
    return result

def validate_scope(data):
    require(data.get("schema_version") == 1, "scope schema")
    require(data.get("id") == "CALPQ-CONTEXT-0001-SCOPE", "scope id")
    require(data.get("status") == "OWNER_REQUESTED_TARGET_ARCHITECTURE", "scope status")
    require(data.get("owner_issue") == 168, "owner issue")
    require(data.get("runtime_authorized") is False, "runtime must remain unauthorized")
    require(data.get("production_location_collection_authorized") is False, "location collection must remain unauthorized")
    require(data.get("authoritative_rules_published") == 0, "no authoritative rules may be published by architecture intake")
    require(data.get("base_branch") == "planning/program-execution-m09-m12", "base branch")
    require(data.get("base_commit") == BASE, "base commit")

    deps = data.get("dependencies")
    require(isinstance(deps, dict), "dependencies")
    require(deps.get("global_pr") == 138, "GLOBAL dependency")
    require(deps.get("expats_pr") == 135, "EXPATS dependency")
    require(deps.get("m07_s01_pr") == 165, "M07 S01 dependency")
    require(deps.get("ai_economy_architecture_pr") == 167, "AI economy ADR collision record")
    require(
        deps.get("global_dependency_state") == "OPEN_UNMERGED_REQUIRED_BEFORE_CONTEXT_GLOBAL_RUNTIME_ADMISSION",
        "GLOBAL dependency must remain explicitly unmerged",
    )

    progress = data.get("v1_progress")
    require(progress == {
        "completed_units": 70,
        "total_units": 130,
        "percentage": 53.85,
        "expanded_scope_percentage": None,
    }, "progress semantics")

    domains = data.get("domain_families")
    triggers = data.get("trigger_families")
    scenarios = data.get("product_acceptance_scenarios")
    require(domains == [f"CTX-D{i:02d}" for i in range(1, 21)], "20 domain families")
    require(triggers == [f"CTX-T{i:02d}" for i in range(1, 19)], "18 trigger families")
    require(isinstance(scenarios, list) and len(scenarios) == 48, "48 product scenarios")
    require(
        [x.get("id") for x in scenarios] == [f"CTX-AC-{i:03d}" for i in range(1, 49)],
        "scenario identities",
    )
    require(all(x.get("status") == "SPECIFIED_NOT_EXECUTED" for x in scenarios), "product scenarios must remain unexecuted")
    require(data.get("architecture_files") == list(ARCH_FILES), "architecture file registry")
    return {"domains": len(domains), "triggers": len(triggers), "scenarios": len(scenarios)}

def expected_authorization():
    return {
        "schema_version": 1,
        "decision_id": "CALPQ-CONTEXT-SC-0001",
        "state": "AUTHORIZED_BOUNDED_SUCCESSOR_COMPATIBILITY",
        "owner_issue": 170,
        "context_issue": 168,
        "context_pr": 169,
        "approved_by": "robertdominik618",
        "approved_at": None,
        "approval_time_precision": "NOT_INDEPENDENTLY_CAPTURED",
        "approval_text": APPROVAL_TEXT,
        "context_base": BASE,
        "architecture_evidence_head": ARCH_EVIDENCE_HEAD,
        "architecture_guard_run": 35892780163,
        "architecture_guard_job": 107289106989,
        "authorized_architecture_added_paths": list(ARCH_ADDED),
        "authorized_architecture_modified_paths": list(ARCH_MODIFIED),
        "authorized_compatibility_added_paths": list(COMPAT_ADDED),
        "authorized_compatibility_modified_paths": list(COMPAT_MODIFIED),
        "historical_product_scope_expanded": False,
        "historical_evidence_mutation_authorized": False,
        "runtime_implementation_authorized": False,
        "gps_background_location_authorized": False,
        "production_rule_packs_authorized": False,
        "live_notifications_authorized": False,
        "providers_authorized": False,
        "deployment_authorized": False,
        "release_authorized": False,
        "negative_tests_required": True,
        "fail_closed_required": True,
    }

def validate_authorization(data):
    require(data == expected_authorization(), "successor authorization drift or expansion")
    return True

def validate_docs(root: Path):
    docs = {}
    for path in ARCH_FILES:
        p = root / path
        require(p.is_file() and not p.is_symlink(), "missing/symlink doc " + path)
        if p.suffix == ".json":
            docs[path] = p.read_text("utf-8")
            continue
        text = p.read_text("utf-8")
        require(len(text) > 200, "unexpectedly small doc " + path)
        docs[path] = text
        for target in re.findall(r"\[[^\]]*\]\(([^)\s]+)\)", text):
            if urlparse(target).scheme or target.startswith("#"):
                continue
            dest = (p.parent / unquote(target.split("#", 1)[0])).resolve()
            require(dest.is_relative_to(root), "unsafe local link " + path + ": " + target)
            require(dest.is_file(), "broken local link " + path + ": " + target)

    baseline = docs[BASELINE]
    require(
        re.findall(r"^\| (CTX-D\d{2}) \|", baseline, re.M) == [f"CTX-D{i:02d}" for i in range(1, 21)],
        "baseline domain registry",
    )
    require(
        re.findall(r"^\| (CTX-T\d{2}) \|", baseline, re.M) == [f"CTX-T{i:02d}" for i in range(1, 19)],
        "baseline trigger registry",
    )
    trace = docs[TRACE]
    require(
        re.findall(r"^\| (CTX-AC-\d{3}) \|", trace, re.M) == [f"CTX-AC-{i:03d}" for i in range(1, 49)],
        "trace scenario registry",
    )
    require("SPECIFIED_NOT_EXECUTED" in trace, "scenario execution boundary")
    require("runtime not implemented" in docs[RUNTIME].lower(), "runtime non-implementation boundary")
    require("NO LOCATION COLLECTION AUTHORIZED" in docs[PRIVACY], "location privacy boundary")
    require("GPS" in baseline and "legal authority" in baseline, "GPS authority boundary")
    require("#138" in baseline and "open/unmerged" in baseline, "GLOBAL dependency boundary")
    for path in CANONICAL:
        require(("CALPQ_CONTEXT_0001" in docs[path]) or ("CALPQ-CONTEXT-0001" in docs[path]), "canonical Context link " + path)
    return len(docs)

def git(root: Path, *args):
    return subprocess.check_output(["git", "-C", str(root), *args], stderr=subprocess.STDOUT)

def diff_entries(root: Path, base: str, head: str):
    raw = git(root, "diff", "--name-status", "--no-renames", base, head).decode().splitlines()
    entries = []
    for line in raw:
        parts = line.split("\t")
        require(len(parts) == 2, "unsupported diff entry: " + line)
        entries.append((parts[0], parts[1]))
    return entries

def validate_change_set(entries, originals, current):
    require(len(entries) == 17, "exact 17-file architecture + successor-compatibility scope")
    require({path for _, path in entries} == ALLOWED, "changed-file allowlist")
    for status, path in entries:
        expected = "M" if path in MODIFIED else "A"
        require(status == expected, "unexpected change kind " + path)
    for path in CANONICAL:
        require(current[path].startswith(originals[path]), "canonical file must be append-only: " + path)
        require(len(current[path]) > len(originals[path]), "canonical append missing: " + path)

def validate_history(root: Path, base: str):
    require(base == BASE, "unexpected base")
    head = git(root, "rev-parse", "HEAD").decode().strip()
    git(root, "merge-base", "--is-ancestor", base, head)
    git(root, "merge-base", "--is-ancestor", ARCH_FIRST, head)
    git(root, "merge-base", "--is-ancestor", ARCH_EVIDENCE_HEAD, head)

    before_tools = {p for p in git(root, "diff", "--name-only", base, ARCH_FIRST).decode().splitlines() if p}
    after_arch = {p for p in git(root, "diff", "--name-only", ARCH_FIRST, head).decode().splitlines() if p}
    require(before_tools == set(ARCH_FILES), "architecture-first delta")
    require(after_arch == set((*TOOLS, *COMPAT_ADDED, *COMPAT_MODIFIED)), "only validation and authorized successor compatibility may follow architecture-first anchor")

    entries = diff_entries(root, base, head)
    originals = {p: git(root, "show", base + ":" + p) for p in CANONICAL}
    current = {p: (root / p).read_bytes() for p in CANONICAL}
    validate_change_set(entries, originals, current)

    modes = git(root, "ls-tree", "-r", head, "--", *sorted(ALLOWED)).decode().splitlines()
    require(len(modes) == 17, "all allowed files must exist")
    require(all(x.startswith("100644 blob ") for x in modes), "no executable/symlink architecture files")
    require(not git(root, "status", "--porcelain", "--untracked-files=no").strip(), "tracked checkout dirty")
    return head

class GuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.scope = parse(Path(SCOPE).read_text("utf-8"))
        cls.auth = parse(Path(AUTH).read_text("utf-8"))

    def setUp(self):
        self.d = copy.deepcopy(self.scope)
        self.a = copy.deepcopy(self.auth)

    def bad(self):
        with self.assertRaises(Invalid):
            validate_scope(self.d)

    def bad_auth(self):
        with self.assertRaises(Invalid):
            validate_authorization(self.a)

    def changes(self):
        entries = [("M" if p in MODIFIED else "A", p) for p in sorted(ALLOWED)]
        old = {p: b"old\n" for p in CANONICAL}
        cur = {p: b"old\nnew\n" for p in CANONICAL}
        return entries, old, cur

    def test_01_valid_scope(self): self.assertEqual(validate_scope(self.d)["domains"], 20)
    def test_02_runtime_auth(self): self.d["runtime_authorized"] = True; self.bad()
    def test_03_location_auth(self): self.d["production_location_collection_authorized"] = True; self.bad()
    def test_04_rules_published(self): self.d["authoritative_rules_published"] = 1; self.bad()
    def test_05_owner_issue(self): self.d["owner_issue"] = 999; self.bad()
    def test_06_wrong_base(self): self.d["base_commit"] = "bad"; self.bad()
    def test_07_missing_domain(self): self.d["domain_families"].pop(); self.bad()
    def test_08_duplicate_domain(self): self.d["domain_families"][-1] = self.d["domain_families"][0]; self.bad()
    def test_09_missing_trigger(self): self.d["trigger_families"].pop(); self.bad()
    def test_10_duplicate_trigger(self): self.d["trigger_families"][-1] = self.d["trigger_families"][0]; self.bad()
    def test_11_missing_scenario(self): self.d["product_acceptance_scenarios"].pop(); self.bad()
    def test_12_executed_scenario(self): self.d["product_acceptance_scenarios"][0]["status"] = "PASS"; self.bad()
    def test_13_wrong_scenario_id(self): self.d["product_acceptance_scenarios"][0]["id"] = "CTX-AC-X"; self.bad()
    def test_14_global_dependency_removed(self): self.d["dependencies"]["global_pr"] = None; self.bad()
    def test_15_global_dependency_claimed_merged(self): self.d["dependencies"]["global_dependency_state"] = "MERGED"; self.bad()
    def test_16_expats_dependency(self): self.d["dependencies"]["expats_pr"] = 0; self.bad()
    def test_17_progress_inflated(self): self.d["v1_progress"]["completed_units"] = 71; self.bad()
    def test_18_expanded_percent_invented(self): self.d["v1_progress"]["expanded_scope_percentage"] = 53.85; self.bad()
    def test_19_arch_file_removed(self): self.d["architecture_files"].pop(); self.bad()
    def test_20_duplicate_json(self):
        with self.assertRaises(Invalid): parse('{"id":1,"id":2}')
    def test_21_valid_change_set(self): validate_change_set(*self.changes())
    def test_22_extra_runtime_file(self):
        e,o,c = self.changes(); e.append(("A", "packages/core/src/context.ts"))
        with self.assertRaises(Invalid): validate_change_set(e,o,c)
    def test_23_rewritten_foundation(self):
        e,o,c = self.changes(); c[CANONICAL[0]] = b"rewrite\n"
        with self.assertRaises(Invalid): validate_change_set(e,o,c)
    def test_24_missing_tooling_file(self):
        e,o,c = self.changes(); e = [x for x in e if x[1] != TOOLS[0]]
        with self.assertRaises(Invalid): validate_change_set(e,o,c)
    def test_25_valid_successor_authorization(self): self.assertTrue(validate_authorization(self.a))
    def test_26_successor_runtime_forbidden(self): self.a["runtime_implementation_authorized"] = True; self.bad_auth()
    def test_27_successor_background_location_forbidden(self): self.a["gps_background_location_authorized"] = True; self.bad_auth()
    def test_28_historical_product_scope_expansion_forbidden(self): self.a["historical_product_scope_expanded"] = True; self.bad_auth()
    def test_29_historical_evidence_mutation_forbidden(self): self.a["historical_evidence_mutation_authorized"] = True; self.bad_auth()
    def test_30_unrelated_document_path_rejected(self):
        e,o,c = self.changes(); e.append(("A", "docs/planning/UNRELATED.md"))
        with self.assertRaises(Invalid): validate_change_set(e,o,c)
    def test_31_unrelated_workflow_path_rejected(self):
        e,o,c = self.changes(); e.append(("A", ".github/workflows/unrelated.yml"))
        with self.assertRaises(Invalid): validate_change_set(e,o,c)
    def test_32_historical_decision_path_rejected(self):
        e,o,c = self.changes(); e.append(("M", "docs/planning/m06-s10-execution.json"))
        with self.assertRaises(Invalid): validate_change_set(e,o,c)
    def test_33_deletion_rejected(self):
        e,o,c = self.changes(); e[0] = ("D", e[0][1])
        with self.assertRaises(Invalid): validate_change_set(e,o,c)
    def test_34_guard_must_be_modified_not_replaced(self):
        e,o,c = self.changes(); e = [("A" if p == M07_GUARD else st, p) for st,p in e]
        with self.assertRaises(Invalid): validate_change_set(e,o,c)

def self_test():
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(GuardTests)
    ids = [re.search(r"\.test_(\d{2})_", t.id()).group(1) for t in suite]
    require(ids == [f"{i:02d}" for i in range(1,35)], "34 test identities")
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    require(
        result.wasSuccessful() and result.testsRun == 34 and
        not result.skipped and not result.expectedFailures and not result.unexpectedSuccesses,
        "architecture/successor guard tests failed/skipped",
    )
    print("PASS 34/34 architecture + bounded-successor validator tests; unrelated paths fail closed; 48 product scenarios remain SPECIFIED_NOT_EXECUTED.")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    root = Path.cwd().resolve()
    try:
        if args.self_test:
            self_test()
            return 0
        counts = validate_scope(parse((root / SCOPE).read_text("utf-8")))
        validate_authorization(parse((root / AUTH).read_text("utf-8")))
        doc_count = validate_docs(root)
        if args.base:
            head = validate_history(root, args.base)
            print("PASS exact bounded architecture + successor-compatibility scope/head " + head)
        print("PASS CALPQ-CONTEXT-0001 architecture " + json.dumps(counts, sort_keys=True) + f" docs={doc_count} successor_compatibility=AUTHORIZED_BOUNDED")
        print("No runtime implementation, background location, rule-pack publication, live notification, provider, deployment, release or historical product-scope expansion is certified.")
        return 0
    except (Invalid, OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        print("FAIL CALPQ-CONTEXT-0001 architecture/successor compatibility: " + str(exc))
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
CTX_ARCH_PY
