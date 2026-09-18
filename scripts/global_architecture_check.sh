#!/usr/bin/env bash
# Architecture-only validation; existing Foundation conventions use shell entry points.
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
python3 - "$@" <<'GLOBAL_ARCH_PY'
"""GLOBAL architecture integrity. Not runtime, legal or linguistic certification."""
from __future__ import annotations
import argparse
import copy
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import subprocess
import unittest
from urllib.parse import urlparse, unquote

BASE = '5b8b655b4b0102c4513c79ca996068c99b949e0e'
ARCH_FIRST = 'eb8d42c45948c4dec1115187471afae4834d7c52'
ARCHIVE = 'docs/planning/global/source/approved-input.json.gz'
ADOPTION = 'docs/planning/global/adoption.json'
BASELINE = 'docs/architecture/CALPQ_GLOBAL_0001_ARCHITECTURE.md'
TRACE = 'docs/planning/global/ADOPTION_AND_TRACEABILITY.md'
RAW_SHA = '9ca9f824e095139607260a4a8b0343ace23fa70a652fa3bc848bcc90d6fe7c73'
GZ_SHA = '2de9e4d125af73031cf5bdab985796c9b35f85425ff8f296e147a56a680b8866'
CANONICAL = ('docs/foundation/ARCHITECTURE.md', 'docs/foundation/BOOK.md',
             'docs/contracts/LOCALIZATION_SEMANTIC_PARITY.md', 'docs/contracts/EQUIVALENCE_RECOGNITION_MODEL.md')
DOCS = (BASELINE, 'docs/contracts/GLOBAL_JURISDICTION_APPLICABILITY.md',
        'docs/contracts/GLOBAL_COUNTRY_PACK.md', 'docs/contracts/GLOBAL_RECOGNITION_EXTENSION.md',
        'docs/contracts/GLOBAL_SOURCE_AUTHORITY_GOVERNANCE.md',
        'docs/contracts/GLOBAL_MARKET_COMMERCIAL_BOUNDARY.md', 'docs/security/GLOBAL_PRIVACY_OPERATIONS.md',
        'docs/adr/ADR-0005-global-jurisdiction-packs.md', TRACE, *CANONICAL)
TOOLS = ('scripts/global_architecture_check.sh', 'tests/global_architecture_test.sh', '.github/workflows/global-architecture.yml')
ALLOWED = frozenset((*DOCS, ARCHIVE, ADOPTION, *TOOLS))
COUNTS = dict(markets=93, seed_inventory=94, seed_jurisdictions=19, languages=35, sector_taxonomy=20,
              work_packages=16, acceptance_scenarios=40, sources=38, population_signals=18, land_area_signals=7)
MW = {k: v.split() for k, v in {
    'W0':'CZ', 'W1':'SK DE PL AT UA', 'W2A':'FR ES IT RO BG PT NL BE IE',
    'W2B':'HU GR SE DK FI HR SI LT LV EE CY MT LU',
    'W3':'GB CH NO IS LI MD RS BA ME MK AL TR GE AM AZ',
    'W4':'US CA AU NZ BR MX AR CL CO PE', 'W5':'IN PH VN ID SG MY TH BD PK NP LK KH LA MM',
    'W6':'CN HK MO TW MN KR JP KZ UZ RU', 'W7':'AE SA QA KW BH OM JO EG MA DZ TN NG ZA KE ET CD'}.items()}
LW = {k:v.split() for k,v in {'L0':'cs en','L1':'uk sk de pl vi','L2':'ro bg es fr it pt ru tr mn',
    'L3':'ar zh ko ja','L4':'hi bn ur pa ta te ne si th id ms fil','L5':'km lo my'}.items()}
WEIGHTS = dict(problem_and_willingness=25, distribution=20, sources_and_reviewer=20, reuse=15,
               economics_and_complexity=10, relevant_population=10)
PRICING = dict(status='APPROVED_EXPERIMENT_DESIGN_NOT_ACTIVE_PRICE_LIST', currency='EUR', personal_year=49,
    family_year=89, professional_year=99, employer_month=149, illustrative_included_profiles=25,
    illustrative_extra_profile_month=3)

class Invalid(ValueError):
    pass

def require(condition, message):
    if not condition:
        raise Invalid(message)

def strict_object(pairs):
    out = {}
    for k,v in pairs:
        require(k not in out, 'duplicate JSON key: ' + k)
        out[k] = v
    return out

def parse(raw):
    result = json.loads(raw, object_pairs_hook=strict_object)
    require(isinstance(result, dict), 'JSON root must be object')
    return result

def archive_data(blob):
    require(len(blob) == 15097 and hashlib.sha256(blob).hexdigest() == GZ_SHA, 'archive integrity mismatch')
    with gzip.GzipFile(fileobj=io.BytesIO(blob)) as stream:
        raw = stream.read(147026)
    require(len(raw) == 147025 and hashlib.sha256(raw).hexdigest() == RAW_SHA, 'original integrity mismatch')
    return parse(raw)

def nonempty(value, label):
    require(isinstance(value,str) and bool(value.strip()), 'empty ' + label)

def url(value):
    require(isinstance(value,str), 'URL must be string')
    parsed = urlparse(value)
    require(parsed.scheme in ('https','http') and bool(parsed.hostname) and not parsed.username and not parsed.password,
            'invalid source URL')

def validate_source(d):
    require(d.get('id') == 'CALPQ-GLOBAL-0001' and d.get('version') == '0.1.0', 'source identity/version')
    require(d.get('status') == 'PROPOSAL_NOT_APPROVED_NOT_DEPLOYED' and d.get('repository_changed') is False,
            'historical proposal status must remain unchanged')
    g = d['governance']
    require(g['runtime_authorized'] is False and g['authoritative_rules_published'] == 0 and
            g['runtime_tests_executed'] == 0 and g['expanded_scope_progress'] is None, 'source runtime inflation')
    for key,count in COUNTS.items():
        if key == 'seed_jurisdictions':
            continue
        require(isinstance(d.get(key),list) and len(d[key]) == count, 'wrong count: ' + key)
    mid = [x['jurisdiction_id'] for x in d['markets']]
    require(mid == [i for wave in MW.values() for i in wave], 'market identities/order')
    for x in d['markets']:
        require(x['jurisdiction_id'] in MW.get(x['wave'],[]), 'market wave')
        require(x['status'] == 'NAVRŽENO; služba neaktivována', 'market activated')
        if x['source'] != 'Vlastní návrh tržního pořadí':
            url(x['source'])
    require([x['id'] for x in d['seed_inventory']] == [f'SEED-{i:03d}' for i in range(1,95)], 'seed IDs')
    require({x['jurisdiction_id'] for x in d['seed_inventory']} == set('AT BG CN DE ES FR GB IT JP KR MN PL PT RO RU SG SK TR UA'.split()), 'seed jurisdiction set')
    for x in d['seed_inventory']:
        require(x['rule_status'] == 'NENÍ_PRÁVNĚ_VALIDOVÁNO' and x['rule_effects'] == 'Žádné', 'seed legal escalation')
        require(x['source_status'] in ('KATEGORIE_V_OFICIÁLNÍM_INDEXU','POJEM_V_OFICIÁLNÍM_ZDROJI'), 'seed source classification')
        for field in ('label','semantic_family','record_level','next_action'):
            nonempty(x[field], 'seed ' + field)
        url(x['source_url'])
    lids = [x['language'] for x in d['languages']]
    expected = {i for wave in LW.values() for i in wave}
    require(len(set(lids)) == 35 and set(lids) == expected, 'language identities')
    for x in d['languages']:
        require(x['language'] in LW.get(x['wave'],[]), 'language wave')
        require(x['status'] == 'NAVRŽENO' and x['ui_status'] == 'NENÍ_DODÁNO' and x['review_status'] == 'NENÍ_OVĚŘENO', 'language delivered/reviewed inflation')
    for key,prefix,count in [('sector_taxonomy','S',20),('work_packages','G',16)]:
        require([x['id'] for x in d[key]] == [f'{prefix}{i:02d}' for i in range(1,count+1)], key + ' identities')
    for x in d['work_packages']:
        require(x['status'] == 'NAVRŽENO / NEIMPLEMENTOVÁNO', 'work package completion inflation')
        for field in ('title','owner_role','output','boundary','gate'):
            nonempty(x[field], 'work ' + field)
    require([x['id'] for x in d['acceptance_scenarios']] == [f'G-AC-{i:03d}' for i in range(1,41)], 'acceptance identities')
    for x in d['acceptance_scenarios']:
        require(x['status'] == 'SPECIFIED_NOT_EXECUTED', 'product tests not executed')
        for field in ('scenario','when','then'):
            nonempty(x[field], 'scenario ' + field)
    require(len({x['id'] for x in d['sources']}) == 38, 'source identities')
    for x in d['sources']:
        url(x['url']); nonempty(x['name'],'source name'); nonempty(x['limitation'],'source limitation')
    for x in d['population_signals']:
        require(x['jurisdiction_id'] in mid and x['year'] == 2026 and x['millions'] > 0, 'population context')
        nonempty(x['method'],'population method'); nonempty(x['warning'],'population warning'); url(x['source'])
    for x in d['land_area_signals']:
        require(x['jurisdiction_id'] in mid and x['land_area_km2'] > 0 and x['measure'] == 'Pevninská plocha; km²', 'land area measure')
        nonempty(x['note'],'area limits'); url(x['source'])
    return COUNTS.copy()

def expected_adoption():
    return dict(id='CALPQ-GLOBAL-0001-ADOPTION',version='1.0.0',approval_issue=137,
        architecture_status='OWNER_APPROVED_TARGET_ARCHITECTURE',runtime_authorized_by_this_change=False,
        public_rules_published_by_this_change=0,markets_activated_by_this_change=0,translations_delivered_by_this_change=0,
        product_acceptance_status='SPECIFIED_NOT_EXECUTED',base_commit=BASE,
        source_counts=COUNTS,market_waves=MW,language_waves=LW,priority_weights_percent=WEIGHTS,
        pricing=PRICING,expanded_project_percentage=None,documents=list(DOCS))

def validate_adoption(a):
    for key,value in expected_adoption().items():
        require(type(a.get(key)) is type(value) and a.get(key) == value, 'adoption ' + key)
    source = a['source_archive']
    require(source['path'] == ARCHIVE and source['compressed_sha256'] == GZ_SHA and
            source['original_sha256'] == RAW_SHA and source['original_bytes'] == 147025 and
            source['preservation'] == 'LOSSLESS_ORIGINAL_BYTES_UNCHANGED', 'adopted archive identity')
    require(a['pilot']['status'] == 'CONDITIONAL_PLAN_NOT_STARTED' and a['pilot']['deep_target_jurisdictions'] == ['CZ','DE'] and
            a['pilot']['source_corridors'] == ['SK','UA'] and a['pilot']['pre_release_data'] == 'SYNTHETIC_ONLY', 'pilot scope')
    require([e['id'] for e in a['errata']] == ['GE-01','GE-02','GE-03','GE-04'], 'source errata missing')
    require(a['prior_v1_progress']['completed_units'] == 60 and a['prior_v1_progress']['total_units'] == 130 and
            a['prior_v1_progress']['source'] == 'https://github.com/robertdominik618/calpq-os/pull/133', 'progress evidence')
    require(a['dependencies'] == dict(expats_pr=135,integration_blocker=136,health_pr=84,separate_m06_admission_pr=133,
            dependency_state_at_intake='OPEN_UNMERGED_NOT_OVERRIDDEN'), 'dependency boundary')
    require(a['companion_workbook']['repository_storage'] == 'HASH_REFERENCE_ONLY_ORIGINAL_USER_ATTACHMENT_RETAINED' and
            a['companion_workbook']['sha256'] == 'ad961d7270f49dffb3355da2187afe962e0e9a4f31d9eb51b42b361edd6f7e8c', 'workbook evidence')
    require(a['service_strata'] == ['A_DOCUMENT_ADMINISTRATION','B_REVIEWED_CATALOG_PATHS','C_SCOPED_EVALUATION_VERIFICATION'], 'service strata')
    require(a['approval_quote'] == 'Perfektní se vším souhlasím kompletně globální sekci implementuj do architektury projektu a podej o tom důkaz a připojit do GitHub architektury', 'approval transcription')

def validate_change_set(entries, originals, current):
    require(len(entries) == 18 and {p for _,p in entries} == ALLOWED, 'exact 18-file scope mismatch')
    for status,path in entries:
        require(status == ('M' if path in CANONICAL else 'A'), 'unexpected change kind ' + path)
    for path in CANONICAL:
        require(bool(originals.get(path)) and current.get(path,b'').startswith(originals[path]) and
                len(current[path]) > len(originals[path]), 'canonical prefix changed ' + path)

def git(root,*args):
    return subprocess.check_output(['git','-C',str(root),*args],stderr=subprocess.STDOUT)

def validate_history(root,base):
    require(base == BASE,'unexpected base')
    head = git(root,'rev-parse','HEAD').decode().strip()
    git(root,'merge-base','--is-ancestor',base,head)
    git(root,'merge-base','--is-ancestor',ARCH_FIRST,head)
    require(git(root,'rev-parse',ARCH_FIRST+'^').decode().strip() == base,'architecture parent')
    first = set(git(root,'ls-tree','-r','--name-only',ARCH_FIRST).decode().splitlines())
    require(all(p in first for p in (*DOCS,ARCHIVE,ADOPTION)) and not any(p in first for p in TOOLS), 'architecture-before-tooling history')
    lines = git(root,'diff','--name-status','--no-renames',base,head).decode().splitlines()
    entries = [tuple(line.split('\t')) for line in lines]
    require(all(len(x)==2 for x in entries), 'unsupported diff format')
    original = {p:git(root,'show',base+':'+p) for p in CANONICAL}
    current = {p:(root/p).read_bytes() for p in CANONICAL}
    validate_change_set(entries,original,current)
    modes = git(root,'ls-tree','-r',head,'--',*sorted(ALLOWED)).decode().splitlines()
    require(len(modes) == 18 and all(x.startswith('100644 blob ') for x in modes),'mode/symlink boundary')
    require(not git(root,'status','--porcelain','--untracked-files=no').strip(),'tracked checkout dirty')
    require(git(root,'rev-parse','HEAD').decode().strip() == head,'checkout moved')
    return head

def validate_docs(root):
    texts = {}
    for path in DOCS:
        file = root/path
        require(not file.is_symlink() and file.is_file(),'missing/symlink document ' + path)
        texts[path] = file.read_text(encoding='utf-8')
        require(len(texts[path]) > 300,'empty document ' + path)
        for target in re.findall(r'\[[^\]]*\]\(([^\s)]+)\)',texts[path]):
            if urlparse(target).scheme or target.startswith('#'):
                continue
            dest = (file.parent/unquote(target.split('#',1)[0])).resolve()
            require(dest.is_relative_to(root) and dest.is_file(),'broken/unsafe local link '+path+': '+target)
    headings = re.findall(r'^## 4\.(\d+)\. .* — GLOBAL-(\d{2})$', texts[BASELINE],re.M)
    require(headings == [(str(i),f'{i:02d}') for i in range(1,29)],'28 baseline sections')
    for i in range(1,29):
        require(re.search(r'^\| 4\.'+str(i)+r' \| GLOBAL-'+f'{i:02d}'+r' \|',texts[TRACE],re.M), 'traceability section')
    for prefix,count,width in [('SRC-',5,2),('G',16,2),('G-AC-',40,3)]:
        markers = re.findall(r'^\| ('+re.escape(prefix)+r'\d{'+str(width)+r'}) \|',texts[TRACE],re.M)
        require(markers == [prefix+str(i).zfill(width) for i in range(1,count+1)],'traceability '+prefix)
    for path in CANONICAL:
        require('CALPQ_GLOBAL_0001_ARCHITECTURE.md' in texts[path],'canonical GLOBAL link '+path)
    return len(texts)

# These tests mutate structural inputs. They do not execute the 40 future product scenarios.
class GuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.blob = Path(ARCHIVE).read_bytes()
        cls.original = archive_data(cls.blob)
    def setUp(self):
        self.d = copy.deepcopy(self.original)
    def bad(self):
        with self.assertRaises(Invalid): validate_source(self.d)
    def test_01_valid_source(self): self.assertEqual(validate_source(self.d)['markets'],93)
    def test_02_missing_market(self): self.d['markets'].pop(); self.bad()
    def test_03_duplicate_market(self): self.d['markets'][-1]=self.d['markets'][0]; self.bad()
    def test_04_changed_market_wave(self): self.d['markets'][0]['wave']='W7'; self.bad()
    def test_05_market_activation(self): self.d['markets'][0]['status']='ACTIVE'; self.bad()
    def test_06_missing_seed(self): self.d['seed_inventory'].pop(); self.bad()
    def test_07_duplicate_seed(self): self.d['seed_inventory'][-1]=self.d['seed_inventory'][0]; self.bad()
    def test_08_seed_verification(self): self.d['seed_inventory'][0]['rule_status']='VERIFIED'; self.bad()
    def test_09_seed_rule_effect(self): self.d['seed_inventory'][0]['rule_effects']='GRANT'; self.bad()
    def test_10_bad_seed_url(self): self.d['seed_inventory'][0]['source_url']='javascript:bad'; self.bad()
    def test_11_missing_language(self): self.d['languages'].pop(); self.bad()
    def test_12_duplicate_language(self): self.d['languages'][-1]=self.d['languages'][0]; self.bad()
    def test_13_language_wave(self): self.d['languages'][0]['wave']='L5'; self.bad()
    def test_14_delivered_translation(self): self.d['languages'][0]['ui_status']='DELIVERED'; self.bad()
    def test_15_reviewed_translation(self): self.d['languages'][0]['review_status']='VERIFIED'; self.bad()
    def test_16_missing_sector(self): self.d['sector_taxonomy'].pop(); self.bad()
    def test_17_duplicate_sector(self): self.d['sector_taxonomy'][-1]=self.d['sector_taxonomy'][0]; self.bad()
    def test_18_missing_work_package(self): self.d['work_packages'].pop(); self.bad()
    def test_19_completed_work_package(self): self.d['work_packages'][0]['status']='COMPLETED'; self.bad()
    def test_20_missing_acceptance(self): self.d['acceptance_scenarios'].pop(); self.bad()
    def test_21_duplicate_acceptance(self): self.d['acceptance_scenarios'][-1]=self.d['acceptance_scenarios'][0]; self.bad()
    def test_22_empty_expected_outcome(self): self.d['acceptance_scenarios'][0]['then']=' '; self.bad()
    def test_23_false_product_execution(self): self.d['acceptance_scenarios'][0]['status']='PASS'; self.bad()
    def test_24_missing_source(self): self.d['sources'].pop(); self.bad()
    def test_25_duplicate_source(self): self.d['sources'][-1]=self.d['sources'][0]; self.bad()
    def test_26_source_url(self): self.d['sources'][0]['url']='file:///etc/passwd'; self.bad()
    def test_27_missing_population(self): self.d['population_signals'].pop(); self.bad()
    def test_28_missing_population_warning(self): self.d['population_signals'][0]['warning']=''; self.bad()
    def test_29_wrong_area_measure(self): self.d['land_area_signals'][0]['measure']='TOTAL'; self.bad()
    def test_30_runtime_authorization(self): self.d['governance']['runtime_authorized']=True; self.bad()
    def test_31_rewritten_source_status(self): self.d['status']='APPROVED'; self.bad()
    def test_32_corrupt_archive(self):
        with self.assertRaises(Invalid): archive_data(self.blob[:-1]+b'X')
    def test_33_valid_archive(self): self.assertEqual(archive_data(self.blob),self.original)
    def changes(self):
        return ([('M' if p in CANONICAL else 'A',p) for p in sorted(ALLOWED)],
                {p:b'old\n' for p in CANONICAL},{p:b'old\nnew\n' for p in CANONICAL})
    def test_34_extra_production_file(self):
        e,o,c=self.changes(); e.append(('A','packages/core/src/global.ts'))
        with self.assertRaises(Invalid): validate_change_set(e,o,c)
    def test_35_rewritten_canonical(self):
        e,o,c=self.changes(); c[CANONICAL[0]]=b'rewrite'
        with self.assertRaises(Invalid): validate_change_set(e,o,c)
    def test_36_valid_append_only_scope(self): validate_change_set(*self.changes())
    def test_37_duplicate_json_key(self):
        with self.assertRaises(Invalid): parse('{"id":1,"id":2}')
    def test_38_unexpected_seed_jurisdiction(self): self.d['seed_inventory'][0]['jurisdiction_id']='XX'; self.bad()
    def test_39_reordered_work_packages(self): self.d['work_packages'].reverse(); self.bad()
    def test_40_empty_source_limit(self): self.d['sources'][0]['limitation']=''; self.bad()
    def test_41_adoption_runtime_flag(self):
        a=copy.deepcopy(expected_adoption()); a['runtime_authorized_by_this_change']=True
        with self.assertRaisesRegex(Invalid,'runtime_authorized'): validate_adoption(a)
    def test_42_adoption_price_activation(self):
        a=copy.deepcopy(expected_adoption()); a['pricing']['status']='ACTIVE'
        with self.assertRaisesRegex(Invalid,'pricing'): validate_adoption(a)

def self_test():
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(GuardTests)
    identities = [re.search(r'\.test_(\d{2})_',t.id()).group(1) for t in suite]
    require(identities == [f'{i:02d}' for i in range(1,43)],'mandatory 42-test identities')
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    require(result.wasSuccessful() and result.testsRun==42 and not result.skipped and
            not result.expectedFailures and not result.unexpectedSuccesses,'validator tests failed/skipped')
    print('PASS 42/42 architecture-validator tests; 40 product scenarios remain SPECIFIED_NOT_EXECUTED.')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base')
    parser.add_argument('--self-test',action='store_true')
    parser.add_argument('--source-only',action='store_true',help='Only imported archive integrity; not repository acceptance')
    args=parser.parse_args()
    root=Path.cwd().resolve()
    try:
        if args.self_test:
            self_test(); return 0
        source=archive_data((root/ARCHIVE).read_bytes())
        counts=validate_source(source)
        if args.source_only:
            print('PASS SOURCE ONLY '+json.dumps(counts,sort_keys=True)); return 0
        validate_adoption(parse((root/ADOPTION).read_bytes()))
        n=validate_docs(root)
        if args.base:
            head=validate_history(root,args.base)
            print('PASS exact head='+head+' scope=18 architecture-before-tooling and canonical prefixes preserved')
        print('PASS GLOBAL architecture '+json.dumps(counts,sort_keys=True)+' documents='+str(n)+' sections=28')
        print('No runtime delivery, legal verification, active markets, completed translations or product test execution is certified.')
        return 0
    except (Invalid,OSError,ValueError,KeyError,TypeError,subprocess.CalledProcessError) as exc:
        print('FAIL GLOBAL architecture: '+str(exc)); return 1

if __name__=='__main__':
    raise SystemExit(main())
GLOBAL_ARCH_PY
