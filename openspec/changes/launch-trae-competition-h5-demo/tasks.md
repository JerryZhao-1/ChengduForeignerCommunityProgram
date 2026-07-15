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
  - ACCEPT: API route/providers use the shared curated bundle and matcher, remove the competition model adapter/config/tests, keep guest-only authorization and spoof-resistant limiter, preserve Places boundaries, reject legacy requests, produce strict responses, log only request/scenario/catalog metadata, and make no external model request.
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

- [ ] 16.1 Polish the judge flow and update canonical competition documentation [#R16]
  - ACCEPT: Start through completion remains under 180 seconds, route list works without map SDK, four reasons are clear, zh/en switching preserves session, reset/refresh/404/failure states are explicit, Demo Confirm stays local, and current docs consistently describe the curated AI-free product and TRAE evidence boundary.
  - TEST: SCOPE: MIXED
    - Use MCP-only runbooks for four representative profiles, both locales, mobile/desktop, map degradation, offline mode, and completion. Run documentation stale-claim scans and store evidence pointers in a new immutable R16 bundle.
  - BUNDLE: `auto_test_openspec/launch-trae-competition-h5-demo/run-0033__task-16.1__ref-R16__20260715T125139Z/`
  - EVIDENCE: PARTIAL — CLI PASS (`logs/preflight.log`, 6/6 checks); GUI PENDING. Run-0033 is immutable and does not contain the required GUI outputs or a final PASS/FAIL verdict. Execute the MIXED validation in a new run folder with an MCP-enabled Supervisor before checking this task.

## 17. Local release gate

- [x] 17.1 Run exhaustive tests, dual-target builds, and model-free audit [#R17]
  - ACCEPT: Shared/API/mobile focused tests, `pnpm typecheck`, `pnpm test`, `pnpm lint`, H5 build, mp-weixin build, and strict OpenSpec validation pass; coverage is 576/576 and 1,152/1,152; provider/local parity is 576/576; current runtime/build contains no Community Plan model credential/call/result field; and active task format is valid.
  - TEST: SCOPE: CLI
    - Capture exact commands, logs, artifact assertions, scans, and consolidated result in a new immutable R17 bundle without editing prior runs.

## 18. Independent deployment and sign-off

- [ ] 18.1 Deploy independently and complete external online/offline acceptance [#R18]
  - ACCEPT: After R10–R17 pass and deployment-gate confirmation, deploy H5 as independent Web App `trae-h5-demo`; record public URL/build/API/commit/rollback; prove existing Admin hosting unchanged; complete zh online, en online, and blocked-network offline flows within 180 seconds; record matching scenario/catalog evidence; and finish append-only TRAE/evidence/submission indexes without invented Session IDs.
  - TEST: SCOPE: MIXED
    - Use MCP-only external runbooks and a new immutable R18 bundle. Record pre/post hosting, public responses, screenshots, timings, rollback, Supervisor decision, and final release metadata.
