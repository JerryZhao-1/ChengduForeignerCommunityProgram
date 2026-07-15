## Superseded Baseline

Tasks and evidence references R1–R9 described the pre-2026-07-15 design that included optional DeepSeek narration. They are retained in git history and existing evidence locations for provenance, but they are superseded by the confirmed AI-free curated-catalog decision and are not current release gates. Existing evidence folders and screenshots must not be edited.

## Evidence State Model

A checked task records DONE and requires both implementation completion and `supervisor verified` evidence. `worker bundle prepared` means a new immutable run folder contains the prescribed scripts, inputs, expected results, and runbook. `supervisor verified` requires real outputs/logs, GUI evidence when applicable, a final PASS/FAIL verdict, and evidence pointers. Prepared, partial, or empty run folders MUST NOT be checked off or cited as release-PASS evidence.

## 10. AI-free specification migration

- [x] 10.1 Migrate the active change to the curated-catalog specification [#R10]
  - ACCEPT: Proposal, design, four capability specs, and this task list consistently define required singular preferences, 576 logical profiles, 1,152 localized cases, stable scenario keys, four explanation reasons, shared API/local matching, advisory accessibility copy, and no Community Plan model runtime. Competition README/evidence log mark prior AI-oriented material superseded without modifying historical screenshots or inventing a TRAE Session ID.
  - TEST: SCOPE: CLI
    - Run `openspec validate launch-trae-competition-h5-demo --strict --no-interactive` and stale-runtime-claim scans. Record exact commands and exits in a new immutable `auto_test_openspec/launch-trae-competition-h5-demo/run-<RUN4>__task-10.1__ref-R10__<YYYYMMDDThhmmssZ>/` bundle.

## 11. Shared singular contracts

- [x] 11.1 Implement singular preferences and explainable response contracts [#R11]
  - ACCEPT: Shared strict schemas/types/contracts require `primary_interest` and `accessibility_need`, reject legacy arrays and unknown/community/PII/free-text fields, add scenario/catalog/explanation types, require four unique ordered reasons, remove model-result schemas/fields, preserve plan invariants and safe projections, and expose only POST generation.
  - TEST: SCOPE: CLI
    - Run focused shared schema/client tests plus shared typecheck. Store valid/invalid samples, outputs, and exact commands in a new immutable R11 bundle.

## 12. Curated catalog and matcher

- [x] 12.1 Implement the versioned catalog, matcher, and exhaustive coverage [#R12]
  - ACCEPT: Shared owns `tongzilin-curated-v1`, exactly 21 complete bilingual dimension modules for 8/3/4/6 choices, stable scenario keys, deterministic place selection, fixed event, advisory accessibility copy, safe bundle, scenario enumerator, three updated judge scenarios, and no model constants. The matcher composes modules rather than storing 576 duplicated full-text plans, and each generated reason maps to the selected dimension module. Coverage reports 576 logical profiles, 576 unique keys, 1,152 localized cases, zero invalid plans, and zero missing copy.
  - TEST: SCOPE: CLI
    - Run exhaustive matcher/fixture/snapshot tests and shared typecheck. Write the machine-readable coverage summary and exact commands to a new immutable R12 bundle.

## 13. API, provider, guest security, and privacy

- [x] 13.1 Remove Community Plan model integration and use the shared matcher [#R13]
  - ACCEPT: API route/providers use the shared curated bundle and matcher, remove the competition model adapter/config/tests, keep guest-only authorization and spoof-resistant limiter, preserve Places boundaries, reject legacy requests, produce strict responses, log only request/catalog metadata without the preference-encoding scenario key, and make no external model request.
  - TEST: SCOPE: CLI
    - Run focused API/provider/security/limiter/log tests plus API typecheck, including all 576 provider profiles and missing-curated-data failure. Store results in a new immutable R13 bundle.

## 14. Mobile singular and explainable UI

- [x] 14.1 Implement singular onboarding and the four-reason plan UI [#R14]
  - ACCEPT: Mobile store/form use singular required choices including explicit `none`; matching steps use approved copy; plan renders localized summary and four reasons; model status UI is removed; community-editorial transparency and offline badge are localized; 44px/focus/responsive and mp-weixin boundaries remain.
  - TEST: SCOPE: MIXED
    - Run mobile store/adapter/i18n tests and typecheck. Use an MCP-only H5 runbook for zh/en single-choice and explanation screenshots at 390px and desktop; store pointers in a new immutable R14 bundle.

## 15. Shared online/offline delivery

- [x] 15.1 Implement current-profile local matching and exhaustive parity [#R15]
  - ACCEPT: Mock and transport/DNS/timeout/5xx paths invoke the shared matcher with the current preference; 400/403/404/409/429 remain errors; delivery mode stays outside the plan; local actions work offline; and provider/local semantic fingerprints match 576/576 without unsafe fields.
  - TEST: SCOPE: CLI
    - Run exhaustive parity, fallback-boundary, safe-bundle, and session tests plus affected typechecks. Store the parity summary and commands in a new immutable R15 bundle.

## 16. Complete H5 experience and documentation

- [x] 16.1 Polish the judge flow and update canonical competition documentation [#R16]
  - ACCEPT: Start through completion remains under 180 seconds, route list works without map SDK, four reasons are clear, zh/en switching preserves session, reset/refresh/404/failure states are explicit, Demo Confirm stays local, and current docs consistently describe the curated AI-free product and TRAE evidence boundary.
  - TEST: SCOPE: MIXED
    - Use MCP-only runbooks for four representative profiles, both locales, mobile/desktop, map degradation, offline mode, and completion. Run documentation stale-claim scans and store evidence pointers in a new immutable R16 bundle.
  - BUNDLE: `auto_test_openspec/launch-trae-competition-h5-demo/run-0033__task-16.1__ref-R16__20260715T125139Z/`
  - EVIDENCE: PARTIAL — CLI PASS (`logs/preflight.log`, 6/6 checks); GUI PENDING. Run-0033 is immutable and does not contain the required GUI outputs or a final PASS/FAIL verdict. Execute the MIXED validation in a new run folder with an MCP-enabled Supervisor before checking this task.
  - RETRY: `auto_test_openspec/launch-trae-competition-h5-demo/run-0036__task-16.1__ref-R16__20260715T133643Z/`
  - RETRY EVIDENCE: SUPERVISOR FAIL — 24/24 matrix screenshots, 0 console messages, 390/390 geometry, 0 raw-enum/AI-text matches, ordered two-stop routes, and 1/1 completion passed. Same-session post-plan locale switching is unavailable, and exact 1280×900 desktop evidence was not captured. R16 remains open; run-0036 is immutable.
  - CORRECTED RETRY: `auto_test_openspec/launch-trae-competition-h5-demo/run-0037__task-16.1__ref-R16__20260715T141344Z/`
  - CORRECTED EVIDENCE: SUPERVISOR PASS — added visible plan-page zh/en controls without rematching; 24/24 fresh matrix screenshots passed, zh → en → zh preserved the route and session state, console stayed at 0 messages, geometry was 390/390, and exact 1280×900 CSS desktop evidence was captured. Run-0037 is immutable and supersedes run-0036 for current R16 proof.

## 17. Local release gate

- [x] 17.1 Run exhaustive tests, dual-target builds, and model-free audit [#R17]
  - ACCEPT: Shared/API/mobile focused tests, `pnpm typecheck`, `pnpm test`, `pnpm lint`, H5 build, mp-weixin build, and strict OpenSpec validation pass; coverage is 576/576 and 1,152/1,152; provider/local parity is 576/576; current runtime/build contains no Community Plan model credential/call/result field; and active task format is valid.
  - TEST: SCOPE: CLI
    - Capture exact commands, logs, artifact assertions, scans, and consolidated result in a new immutable R17 bundle without editing prior runs.
  - BUNDLE: `auto_test_openspec/launch-trae-competition-h5-demo/run-0035__task-17.1__ref-R17__20260715T133643Z/`
  - EVIDENCE: SUPERVISOR PASS — corrected CLI-only retry; 282 repository tests and 61 focused tests passed, dual builds passed, forbidden-marker `rg` exit `1` was distinguished from execution errors, and Worker output remained pending until the Supervisor verdict.
  - POST-FIX BUNDLE: `auto_test_openspec/launch-trae-competition-h5-demo/run-0038__task-17.1__ref-R17__20260715T142725Z/`
  - POST-FIX EVIDENCE: SUPERVISOR PASS — authoritative corrected-source gate; 283 repository tests and 62 focused tests passed, typechecks/lint/dual builds passed, forbidden scan failed closed, and the three-file source scope contained no added type-suppression escape.
  - CURRENT-HEAD BUNDLE: `auto_test_openspec/launch-trae-competition-h5-demo/run-0041__task-17.1__ref-R17__20260715T150145Z/`
  - CURRENT-HEAD EVIDENCE: SUPERVISOR PASS — exact HEAD `775ede09`; strict OpenSpec, typechecks, 283 repository tests, lint, dual builds, privacy scan, and type-suppression scan passed.
  - DEPLOY-BUNDLE CORRECTION: `auto_test_openspec/launch-trae-competition-h5-demo/run-0043__task-17.1__ref-R17__20260715T150515Z/`
  - DEPLOY-BUNDLE EVIDENCE: SUPERVISOR PASS — the production bundler exposed a missing deploy-adapter export; the single-file diff was fingerprinted, the self-contained HTTP bundle was produced, and the complete gate passed again before remote mutation.

## 18. Independent deployment and sign-off

- [ ] 18.1 Deploy independently and complete external online/offline acceptance [#R18]
  - ACCEPT: After R10–R17 pass and deployment-gate confirmation, deploy H5 as independent Vercel project `trae-h5-demo`; record Preview/Production IDs, public URL/API/commit/rollback and promotion relationship; prove existing CloudBase Admin hosting unchanged; complete zh online, en online, and blocked-network offline flows within 180 seconds; record matching scenario/catalog evidence; and finish append-only TRAE/evidence/submission indexes without invented Session IDs.
  - TEST: SCOPE: MIXED
    - Use MCP-only external runbooks and a new immutable R18 bundle. Record pre/post hosting, public responses, screenshots, timings, rollback, Supervisor decision, and final release metadata.
  - ATTEMPT BUNDLE: `auto_test_openspec/launch-trae-competition-h5-demo/run-0042__task-18.1__ref-R18__20260715T150307Z/`
  - ATTEMPT EVIDENCE: SUPERVISOR NOT COMPLETE — API update and validation passed; CloudBase build `2601340810` reached SUCCESS and transient zh/en online flows passed. The Web App root unexpectedly shared the existing Admin Hosting root, so the original Admin entry was restored byte-for-byte and the returned Web App domain no longer serves H5. The in-app Browser also lacked request interception for the required API-only offline flow. S14 TRAE evidence remains pending.
  - VERCEL BUNDLE: `auto_test_openspec/launch-trae-competition-h5-demo/run-0044__task-18.1__ref-R18__20260715T155349Z/`
  - VERCEL EVIDENCE: SUPERVISOR NOT COMPLETE — Preview `dpl_A3ZCGQzuYYKHksnjN8qZMBcocqFt` and Production promotion `dpl_3dr58TxFu6Y2URu9AbZnMWB2S95d` are READY; the public Vercel H5, zh/en online flows, exact semantic fingerprint, assets, and unchanged Admin fingerprint passed. The API-only offline flow, valid product screenshots, and S14 raw TRAE evidence remain missing.
  - CONTENT ROLLOUT BUNDLE: `auto_test_openspec/launch-trae-competition-h5-demo/run-0045__content-rollout-and-redeploy__20260715T164511Z/`
  - CONTENT ROLLOUT EVIDENCE: scoped PASS / R18 NOT COMPLETE — anonymous events fix, deterministic demo content, same-artifact Vercel promotion `dpl_ne41t25XVXQM98SPsUGAHoJhwEn7`, Admin deployment, responsive browser checks, and valid product screenshots passed. The API-blocked offline flow and complete S14 raw TRAE evidence remain missing.
