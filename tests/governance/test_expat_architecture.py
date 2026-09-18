"""Synthetic adversarial tests for the architecture checker, not product tests."""
import copy
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("expat_check", ROOT / "scripts/check_expat_architecture.py")
assert SPEC and SPEC.loader
m = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(m)


def fixture():
    case = {"given": "A sufficiently described fixture with explicit evidence exists.", "when": "A specific action is requested in the synthetic fixture.", "then": "The expected boundary remains explicit and testable in this fixture."}
    data = {"id": "CALPQ-EXPAT-0001", "version": 1, "approval_issue": 134, "architecture_status": "OWNER_APPROVED_ARCHITECTURE", "runtime_status": "NOT_IMPLEMENTED_BY_THIS_CHANGE", "acceptance_status": "SPECIFIED_NOT_EXECUTED", "base_commit": m.BASE, "baseline": m.BASELINE, "documents": list(m.DOCS), "scope": copy.deepcopy(m.SCOPES), "capabilities": [{"id": i, "contract": m.MOBILITY, "positive": copy.deepcopy(case), "boundary": copy.deepcopy(case)} for i in m.ids("EXP", 24)], "cross_cutting": [{"id": i, "contract": m.PRIVACY, **copy.deepcopy(case)} for i in m.ids("INV", 16)]}
    files = {p: "# Fixture\n" + "Synthetic architecture content for structural tests only. " * 5 for p in m.DOCS}
    files[m.BASELINE] += "\n" + "\n".join(" ".join(v) for v in m.SCOPES.values()) + "\n"
    for i in m.ids("EXP", 24):
        files[m.BASELINE] += f"\n### {i} — Fixture capability\n" + "Explicitly scoped fixture evidence and decision boundary. " * 5 + "\n"
    files[m.PLAN] += "\n" + " ".join(m.SCOPES["source_sections"])
    files[m.LOCALIZATION] += "\n" + " ".join(m.SCOPES["language_layers"] + m.SCOPES["text_trust_labels"])
    for p in m.CANONICAL:
        files[p] += "\n[EXPATS](../architecture/CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md)\n[Scope](../planning/expat_scope.json)\n"
    files[m.REGISTRY] = "{}"
    return data, files


class ArchitectureGuardTests(unittest.TestCase):
    def setUp(self):
        self.data, self.files = fixture()

    def invalid(self):
        with self.assertRaises(m.InvalidPack):
            m.validate_pack(self.data, self.files)

    def test_01_valid_fixture_reports_64_specified_not_executed(self):
        self.assertEqual(m.validate_pack(self.data, self.files)["specified_product_scenarios"], 64)

    def test_02_missing_capability(self):
        self.data["capabilities"].pop(); self.invalid()

    def test_03_duplicate_capability(self):
        self.data["capabilities"][-1] = self.data["capabilities"][0]; self.invalid()

    def test_04_unknown_capability(self):
        self.data["capabilities"][0]["id"] = "EXP-99"; self.invalid()

    def test_05_empty_given(self):
        self.data["capabilities"][0]["positive"]["given"] = ""; self.invalid()

    def test_06_extra_outcome_key(self):
        self.data["capabilities"][0]["boundary"]["result"] = "PASS"; self.invalid()

    def test_07_false_runtime_completion(self):
        self.data["runtime_status"] = "COMPLETE"; self.invalid()

    def test_08_false_product_test_execution(self):
        self.data["acceptance_status"] = "PASSED"; self.invalid()

    def test_09_missing_persona(self):
        self.data["scope"]["personas"].pop(); self.invalid()

    def test_10_missing_locale(self):
        self.data["scope"]["locales"].pop(); self.invalid()

    def test_11_changed_phase(self):
        self.data["scope"]["phases"][0] = "PHA-Z"; self.invalid()

    def test_12_missing_source_coverage(self):
        self.files[m.PLAN] = self.files[m.PLAN].replace("SRC-12", "removed"); self.invalid()

    def test_13_missing_differentiator(self):
        self.data["scope"]["differentiators"].pop(); self.invalid()

    def test_14_missing_navigation(self):
        self.data["scope"]["navigation"].pop(); self.invalid()

    def test_15_missing_variant(self):
        self.data["scope"]["variants"].pop(); self.invalid()

    def test_16_missing_story(self):
        self.data["scope"]["stories"].pop(); self.invalid()

    def test_17_missing_language_layer(self):
        self.data["scope"]["language_layers"].pop(); self.invalid()

    def test_18_missing_translation_trust(self):
        self.data["scope"]["text_trust_labels"].pop(); self.invalid()

    def test_19_unknown_contract(self):
        self.data["capabilities"][0]["contract"] = "docs/unknown.md"; self.invalid()

    def test_20_missing_architecture_heading(self):
        self.files[m.BASELINE] = self.files[m.BASELINE].replace("### EXP-24", "### LOST-24"); self.invalid()

    def test_21_missing_canonical_link(self):
        self.files[m.CANONICAL[0]] = self.files[m.CANONICAL[0]].replace("expat_scope.json", "missing.json"); self.invalid()

    def test_22_missing_document(self):
        del self.files[m.ADR]; self.invalid()

    def test_23_missing_cross_cutting_case(self):
        self.data["cross_cutting"].pop(); self.invalid()

    def test_24_duplicate_cross_cutting_case(self):
        self.data["cross_cutting"][-1] = self.data["cross_cutting"][0]; self.invalid()

    def test_25_altered_baseline_commit(self):
        self.data["base_commit"] = "0" * 40; self.invalid()

    def changes(self):
        changes = [("M" if p in m.CANONICAL else "A", p) for p in sorted(m.ALLOWED)]
        originals = {p: "original\n" for p in m.CANONICAL}
        current = {p: "original\naddition\n" for p in m.CANONICAL}
        return changes, originals, current

    def test_26_unauthorized_production_change(self):
        changes, originals, current = self.changes()
        changes.append(("M", "packages/core/src/authority.ts"))
        with self.assertRaises(m.InvalidPack):
            m.validate_change_set(changes, originals, current)

    def test_27_canonical_deletion(self):
        changes, originals, current = self.changes()
        changes = [("D" if p == m.CANONICAL[0] else s, p) for s, p in changes]
        with self.assertRaises(m.InvalidPack):
            m.validate_change_set(changes, originals, current)

    def test_28_canonical_rewrite(self):
        changes, originals, current = self.changes()
        current[m.CANONICAL[0]] = "rewritten history\n"
        with self.assertRaises(m.InvalidPack):
            m.validate_change_set(changes, originals, current)

    def test_29_extra_top_level_claim(self):
        self.data["all_product_tests_passed"] = True; self.invalid()

    def test_30_duplicate_json_key(self):
        with self.assertRaises(m.InvalidPack):
            m.read_registry('{"id":"one","id":"two"}')

    def test_31_valid_additive_change_set(self):
        m.validate_change_set(*self.changes())

    def test_32_broken_relative_link(self):
        self.files[m.ADR] += "\n[Missing](../contracts/NOT_PRESENT.md)"; self.invalid()

    def test_33_document_placeholder(self):
        self.data["cross_cutting"][0]["then"] = "TODO describe the actual expected outcome for this case"; self.invalid()

    def test_34_scope_marker_only_in_registry_is_insufficient(self):
        self.files[m.BASELINE] = self.files[m.BASELINE].replace("DIF-06", "gone"); self.invalid()

if __name__ == "__main__":
    unittest.main()
