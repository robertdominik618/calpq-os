#!/usr/bin/env python3
"""Validate the EXPATS architecture pack, not product or legal correctness."""
from __future__ import annotations
import argparse
import json
import posixpath
import re
import subprocess
from pathlib import Path
from typing import Any, Mapping

BASE = "4a3c97e2314b2c8ccdf508123bb9ce5a04b499f0"
ARCHITECTURE_FIRST = "d6018a09826fd2d49009e2d51d4328264bc299b0"
REGISTRY = "docs/planning/expat_scope.json"
BASELINE = "docs/architecture/CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md"
MOBILITY = "docs/contracts/EXPAT_MOBILITY_CONTEXT.md"
LOCALIZATION = "docs/contracts/LOCALIZATION_SEMANTIC_PARITY.md"
PRIVACY = "docs/security/EXPAT_PRIVACY_SAFEGUARD_MODEL.md"
PLAN = "docs/planning/CALPQ_EXPAT_0001_INTAKE_AND_DELIVERY.md"
ADR = "docs/adr/ADR-0004-expat-global-mobility.md"
CANONICAL = ("docs/foundation/ARCHITECTURE.md", "docs/foundation/BOOK.md")
DOCS = (BASELINE, MOBILITY, LOCALIZATION, PRIVACY, PLAN, ADR, *CANONICAL)
TOOLING = ("scripts/check_expat_architecture.py", "tests/governance/test_expat_architecture.py", ".github/workflows/expat-architecture.yml")
ALLOWED = frozenset((*DOCS, REGISTRY, *TOOLING))
CONTRACTS = frozenset((MOBILITY, LOCALIZATION, PRIVACY))

def ids(prefix: str, count: int) -> list[str]:
    return [f"{prefix}-{i:02d}" for i in range(1, count + 1)]

SCOPES = {
    "source_sections": ids("SRC", 12), "personas": ids("PER", 18),
    "locales": "cs en uk sk vi ru de pl ro bg es fr it pt tr ar zh mn ko ja".split(),
    "language_layers": ids("LAYER", 5), "text_trust_labels": ids("TRUST", 4),
    "differentiators": ids("DIF", 6), "navigation": ids("NAV", 7),
    "variants": ids("VAR", 9), "phases": [f"PHA-{c}" for c in "ABCDE"],
    "stories": ids("STORY", 3),
}
TOP_KEYS = frozenset(("id", "version", "approval_issue", "architecture_status", "runtime_status", "acceptance_status", "base_commit", "baseline", "documents", "scope", "capabilities", "cross_cutting"))

class InvalidPack(ValueError):
    """An architecture invariant or change boundary failed."""

def need(condition: bool, message: str) -> None:
    if not condition:
        raise InvalidPack(message)

def unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        need(key not in result, f"duplicate JSON key: {key}")
        result[key] = value
    return result

def read_registry(text: str) -> dict[str, Any]:
    value = json.loads(text, object_pairs_hook=unique_object)
    need(isinstance(value, dict), "registry must be an object")
    return value

def exact_ids(values: Any, expected: list[str], label: str) -> None:
    need(isinstance(values, list) and values == expected, f"{label}: missing, duplicated, reordered or unknown ID")

def scenario(value: Any, label: str) -> None:
    need(isinstance(value, dict) and set(value) == {"given", "when", "then"}, f"{label}: require only Given/When/Then")
    for key in ("given", "when", "then"):
        item = value[key]
        need(isinstance(item, str) and len(item.strip()) >= 15, f"{label}: empty or underspecified {key}")
        need(not re.search(r"\b(TODO|TBD|PLACEHOLDER)\b", item, re.I), f"{label}: placeholder {key}")

def validate_pack(registry: Mapping[str, Any], files: Mapping[str, str]) -> dict[str, int]:
    need(set(registry) == TOP_KEYS, "unexpected/missing top-level field")
    for key, expected in (("id", "CALPQ-EXPAT-0001"), ("version", 1), ("approval_issue", 134), ("architecture_status", "OWNER_APPROVED_ARCHITECTURE"), ("runtime_status", "NOT_IMPLEMENTED_BY_THIS_CHANGE"), ("acceptance_status", "SPECIFIED_NOT_EXECUTED"), ("base_commit", BASE), ("baseline", BASELINE)):
        need(type(registry.get(key)) is type(expected) and registry.get(key) == expected, f"invalid {key}")
    exact_ids(registry["documents"], list(DOCS), "documents")
    for path in DOCS:
        need(isinstance(files.get(path), str) and len(files[path].strip()) > 100, f"missing/empty document: {path}")
    scope = registry["scope"]
    need(isinstance(scope, dict) and set(scope) == set(SCOPES), "scope fields incomplete")
    for key, expected in SCOPES.items():
        exact_ids(scope[key], expected, key)
        path = PLAN if key == "source_sections" else LOCALIZATION if key in ("language_layers", "text_trust_labels") else BASELINE
        for marker in expected:
            need(re.search(r"(?<![A-Za-z0-9-])" + re.escape(marker) + r"(?![A-Za-z0-9-])", files[path]) is not None, f"{key}: missing document marker {marker}")
    caps = registry["capabilities"]
    need(isinstance(caps, list) and all(isinstance(c, dict) for c in caps), "invalid capabilities")
    exact_ids([c.get("id") for c in caps], ids("EXP", 24), "capabilities")
    headings = re.findall(r"^### (EXP-\d{2}) — .+$", files[BASELINE], re.M)
    exact_ids(headings, ids("EXP", 24), "architecture headings")
    for c in caps:
        need(set(c) == {"id", "contract", "positive", "boundary"}, f"{c['id']}: invalid fields")
        need(c["contract"] in CONTRACTS, f"{c['id']}: unknown contract")
        body = re.search(r"^### " + c["id"] + r" — [^\n]+\n(.*?)(?=^### EXP-|^## |\Z)", files[BASELINE], re.M | re.S)
        need(body is not None and len(body.group(1).strip()) >= 180, f"{c['id']}: underspecified architecture")
        scenario(c["positive"], c["id"] + "-P")
        scenario(c["boundary"], c["id"] + "-B")
    cross = registry["cross_cutting"]
    need(isinstance(cross, list) and all(isinstance(c, dict) for c in cross), "invalid cross-cutting cases")
    exact_ids([c.get("id") for c in cross], ids("INV", 16), "cross-cutting")
    for c in cross:
        need(set(c) == {"id", "contract", "given", "when", "then"}, f"{c['id']}: invalid fields")
        need(c["contract"] in CONTRACTS, f"{c['id']}: unknown contract")
        scenario({k: c[k] for k in ("given", "when", "then")}, c["id"])
    for path in CANONICAL:
        need("CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md" in files[path] and "expat_scope.json" in files[path], f"missing canonical integration: {path}")
    for path in DOCS:
        for target in re.findall(r"\[[^\]]+\]\(([^\s)]+)\)", files[path]):
            if re.match(r"[a-zA-Z][a-zA-Z0-9+.-]*:", target) or target.startswith("#"):
                continue
            relative = target.split("#", 1)[0]
            resolved = posixpath.normpath(posixpath.join(posixpath.dirname(path), relative))
            need(not resolved.startswith("../") and not resolved.startswith("/"), f"unsafe document link: {path}: {target}")
            need(resolved in files, f"broken document link: {path}: {target}")
    return {"capabilities": 24, "personas": 18, "target_locales": 20, "source_sections": 12, "specified_product_scenarios": 64}

def validate_change_set(changes: list[tuple[str, str]], originals: Mapping[str, str], current: Mapping[str, str]) -> None:
    need(len(changes) == len(ALLOWED) and {p for _, p in changes} == ALLOWED, "changed-file scope differs from the exact 12-file allowlist")
    for status, path in changes:
        need(status == ("M" if path in CANONICAL else "A"), f"unexpected change kind: {status} {path}")
    for path in CANONICAL:
        need(path in originals and bool(originals[path]), f"missing original: {path}")
        need(current.get(path, "").startswith(originals[path]), f"rewritten historical canonical content: {path}")
        need(len(current[path]) > len(originals[path]), f"missing additive canonical integration: {path}")

def git(root: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(root), *args], text=True, encoding="utf-8", stderr=subprocess.STDOUT)

def validate_git(root: Path, base: str, files: Mapping[str, str]) -> None:
    need(base == BASE, "unexpected comparison base")
    git(root, "merge-base", "--is-ancestor", base, "HEAD")
    git(root, "merge-base", "--is-ancestor", ARCHITECTURE_FIRST, "HEAD")
    need(git(root, "rev-parse", ARCHITECTURE_FIRST + "^").strip() == base, "architecture-first parent mismatch")
    first_paths = set(git(root, "ls-tree", "-r", "--name-only", ARCHITECTURE_FIRST).splitlines())
    need(all(p in first_paths for p in (*DOCS, REGISTRY)), "architecture-first pack incomplete")
    need(all(p not in first_paths for p in TOOLING), "tooling predates architecture contract")
    raw = git(root, "diff", "--name-status", "--no-renames", base, "HEAD")
    changes = [tuple(line.split("\t")) for line in raw.splitlines()]
    need(all(len(c) == 2 for c in changes), "invalid diff output")
    originals = {p: git(root, "show", f"{base}:{p}") for p in CANONICAL}
    validate_change_set(changes, originals, files)
    modes = git(root, "ls-tree", "-r", "HEAD", "--", *sorted(ALLOWED)).splitlines()
    need(len(modes) == len(ALLOWED) and all(line.startswith("100644 blob ") for line in modes), "unexpected file mode or symlink")

def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--base", help="Also validate exact Git diff and architecture-before-tooling order")
    args = parser.parse_args()
    root = args.root.resolve()
    try:
        text = (root / REGISTRY).read_text(encoding="utf-8")
        registry = read_registry(text)
        files = {str(p.relative_to(root)): p.read_text(encoding="utf-8") for p in (root / "docs").rglob("*.md") if p.is_file()}
        files[REGISTRY] = text
        result = validate_pack(registry, files)
        if args.base:
            validate_git(root, args.base, files)
        print("PASS EXPATS architecture integrity: " + json.dumps(result, sort_keys=True))
        print("Product acceptance status: SPECIFIED_NOT_EXECUTED; no runtime/legal/translation certification.")
        if args.base:
            print("PASS exact 12-file scope; canonical prefixes preserved; architecture commit precedes tooling; no production source or existing gates changed.")
        return 0
    except (InvalidPack, OSError, ValueError, TypeError, KeyError, subprocess.CalledProcessError) as exc:
        print(f"FAIL EXPATS architecture integrity: {exc}")
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
