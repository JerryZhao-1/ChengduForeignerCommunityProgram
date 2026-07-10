## Context

The project has completed several release-readiness changes for Places, Events, Discover, Admin hosting, Mini Program CloudBase function mode, and production-like acceptance. The latest handoff still says not to submit for public launch because the remaining blockers are not ordinary code gaps: Admin production identity has not been accepted without dev mock actors, WeChat account/legal-domain settings require account-owner confirmation, iOS/Android true-device evidence is missing, and production content/media must be reviewed.

The system already has useful pieces for closure:

- Mini Program `cloudbase-function` mode and CloudBase WeChat identity mapping for user-owned actions.
- Admin username/password login with Bearer token support.
- CloudBase dev API and hosted Admin smoke evidence.
- OpenSpec validation bundle conventions under `auto_test_openspec/`.
- Existing GUI runbooks for Places, Events, Discover, Mini Program tabs, and config/media checks.

The launch closure must therefore treat public release as an evidence and operations problem as much as an implementation problem. Codex can harden code, write scripts, build artifacts, and prepare runbooks. A human account owner must complete WeChat console, CloudBase console, content approval, true-device execution, review submission, and release decisions.

## Goals / Non-Goals

**Goals:**

- Produce an explicit final public-launch gate with decision states and evidence requirements.
- Split all remaining work into Codex-owned, human-owned, and mixed-ownership tasks.
- Generate a detailed human operations manual under `docs/` so account-owner work can be performed and audited step by step.
- Add reproducible validation bundles for production artifact scanning, Admin auth acceptance, CloudBase/API target checks, media/content audit, and evidence indexing.
- Ensure public-release Mini Program artifacts do not contain local endpoints, mock actor behavior, fixture media, or ambiguous upload/import paths.
- Verify Admin production auth with Bearer sessions, durable admin user/role data, and `x-mock-user-id` disabled in CloudBase live mode.
- Require iOS and Android true-device evidence before public launch signoff.

**Non-Goals:**

- This change does not itself submit the Mini Program to WeChat review or click publish.
- This change does not complete WeChat account certification, ICP/mini program filing, or legal-domain setup without the account owner.
- This change does not introduce multi-community platformization.
- This change does not replace the existing CloudBase architecture with a different backend platform.
- This change does not change public business API contracts unless implementation discovers a contract defect.

## Decisions

1. Public launch is a separate gate from production-like dev acceptance.

   Production-like acceptance can prove CloudBase dev behavior, but public launch also depends on WeChat account settings, legal domains, true-device behavior, production data, and review submission. The final handoff must use explicit states: blocked, ready for WeChat review upload, ready for review submission, ready for phased release, or ready for full public release.

   Alternative considered: mark the current production-readiness handoff as sufficient once CLI checks pass. This was rejected because the handoff itself records public-launch blockers and pending true-device evidence.

2. Human-owned work must be documented, not automated around.

   WeChat certification, filing, service categories, privacy settings, legal domains, code upload key creation, IP whitelist updates, review submission, and release are account-owner actions. Codex should produce a detailed manual and checklists, then collect evidence references after the human performs them.

   Alternative considered: provide a generic "configure WeChat backend" reminder. This was rejected because launch risk sits in exact console settings and evidence capture.

3. Production artifacts must be scanned as release blockers.

   Public-release Mini Program output must fail validation if it contains local endpoints (`localhost`, `127.0.0.1`, LAN IPs), `x-mock-user-id`, mock-only actor configuration, or fixture media such as `example.com/public/events`. Scans should target generated artifacts, source config, and docs where appropriate, with docs allowed to mention local development only when clearly scoped as non-production.

   Alternative considered: rely on runtime CloudBase function mode and ignore unused fallback strings. This was rejected because review/upload artifacts should not carry ambiguous local fallback behavior.

4. Admin production auth acceptance uses the existing Bearer session path but requires production-mode evidence.

   The API already supports Admin username/password login and Bearer tokens. Public launch acceptance must verify the deployed target with `CLOUDBASE_PROVIDER_MODE=live`, mock actor headers disabled, configured `API_ADMIN_*` environment variables, and a durable admin user with `community_admin` or `system_admin` role flags. Admin-only routes must reject unauthenticated callers, invalid Bearer tokens, non-admin users, and `x-mock-user-id` attempts when mock headers are disabled.

   Alternative considered: continue using documented `user_001` dev mock actor for Admin smoke. This was rejected for public launch because it does not prove operator authentication.

5. True-device evidence is a hard gate for public launch.

   WeChat DevTools can prove import and simulator routing, but iOS and Android WeChat devices must prove the tab matrix, CloudBase calls, media loading, map/navigation, sharing/fallback behavior, permissions, events registration/ticket, Discover creation/reporting, and Admin governance screenshots where applicable.

   Alternative considered: accept DevTools screenshots only. This was rejected because WeChat share, domain enforcement, permission prompts, and native map handoff differ on true devices.

6. Validation bundles remain append-only.

   Every Codex or human-evidence validation attempt must create a new run folder under `auto_test_openspec/production-public-launch-closure/`. Existing `production-readiness-acceptance` evidence can be referenced but not mutated or reclassified as final public-launch evidence.

   Alternative considered: edit the prior production-readiness run folders with new status. This was rejected because prior runs are audit records for an earlier gate.

## Risks / Trade-offs

- [Risk] WeChat account owner cannot complete certification, filing, or legal-domain configuration during implementation. -> Mitigation: keep the final state blocked with exact owner/action fields and still complete Codex-owned automation.
- [Risk] Removing local fallback strings could disturb local mock/H5 development. -> Mitigation: scope changes to release build configuration or add explicit dev-only paths while preserving documented local commands.
- [Risk] Admin production auth may pass locally but fail in CloudBase due to missing environment variables or user role records. -> Mitigation: add deployed-target checks and manual console verification steps.
- [Risk] True-device behavior differs between iOS and Android. -> Mitigation: require separate evidence rows for both platforms and classify platform-specific fallbacks.
- [Risk] Production content cleanup requires human editorial judgment. -> Mitigation: Codex provides audits for obvious fixture/mock/domain issues, while content approval remains human-owned.
- [Risk] Upload/review automation via `miniprogram-ci` requires sensitive code-upload keys. -> Mitigation: provide both manual DevTools and optional CI paths; do not store secrets in the repository.

## Migration Plan

1. Create launch-closure documentation and validation tasks without changing runtime behavior.
2. Harden production build configuration and artifact scans, then verify local development commands still work.
3. Add Admin production auth checks and deployed-target smoke scripts.
4. Add content/media/domain audit scripts and manual evidence indexing.
5. Generate the human launch manual and require account-owner evidence to be recorded by path.
6. Run all Codex-owned CLI gates and build the Mini Program public-review package.
7. Human account owner completes WeChat/CloudBase console setup and true-device runbooks.
8. Produce final launch handoff with a decision state.

Rollback is procedural: do not submit review or publish while the handoff state is blocked. If a release has already been submitted or published, use WeChat's version management rollback/withdraw controls according to the human operations manual and record the action in the handoff.

## Open Questions

- What is the approved production CloudBase environment id, and is the current dev environment allowed to become production for the first launch?
- Is native WeChat friend/share-sheet behavior required for launch, or is an explicitly labeled copy-link fallback acceptable?
- Which WeChat service category and privacy disclosures will the account owner choose for a community information/UGC map?
- Will upload be manual through WeChat DevTools or automated through `miniprogram-ci` with a code-upload key and IP whitelist?
- What is the minimum production seed content set for first public launch?
