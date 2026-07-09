## Context

The current project has working local loops for Admin, Mobile H5, the WeChat Mini Program simulator, and mock-backed API flows. The 2026-07-09 manual E2E bundle captured useful evidence, including Admin Places publishing, Mobile H5 page coverage, Mini Program simulator tab coverage, Events API registration/ticket/check-in, and Discover API post/comment/interaction/governance.

That evidence is not enough for production acceptance. The same bundle recorded failing release commands, local-only service endpoints, Mini Program fixture asset errors, incomplete true-device validation, and a real-device Places share behavior that copies a route path instead of opening native sharing. Production acceptance must therefore become a separate gate with explicit environment, account, platform, and evidence requirements.

Stakeholders are the local operator validating the community release, maintainers of `apps/mobile`, `apps/admin`, `apps/api`, shared contract owners in `packages/shared`, and the account owner responsible for WeChat Mini Program, CloudBase, domains, map keys, and review permissions.

## Goals / Non-Goals

**Goals:**

- Define the evidence required to call the project production-ready.
- Separate local mock/simulator smoke tests from production-like CloudBase or HTTPS Mini Program preview evidence.
- Require failing `typecheck`, `test`, and `lint` checks to be resolved or treated as production blockers.
- Require true-device Mini Program coverage for Places, Events, Discover, Home, and Me.
- Require a clear Places share product decision and implementation: native WeChat share or explicit copy-link fallback.
- Require release data/media/config cleanup and a handoff bundle with blockers and platform limitations.

**Non-Goals:**

- This change does not introduce multi-community platformization.
- This change does not upload a production release, submit review, or require CloudBase production migration by itself.
- This change does not replace existing local mock development flows.
- This change does not rewrite Events, Discover, or Places contracts unless implementation discovers a contract defect needed to pass acceptance.

## Decisions

1. Production acceptance is evidence-based and environment-tagged.

   Local H5, local API, and Mini Program simulator runs remain valuable regression evidence, but they must be tagged as local/dev evidence. Production acceptance requires a WeChat-reachable API target through CloudBase function mode or an HTTPS legal domain and must reject `127.0.0.1`, LAN IPs, and mock-only flows as final proof.

   Alternative considered: treat the local E2E run as sufficient and list true-device checks as follow-up. This was rejected because real-device sharing already behaves differently from the simulator, and WeChat legal-domain/API constraints are release-critical.

2. The Mini Program production gate uses true-device workflows as the source of truth.

   The supported device set must include at least one iOS WeChat client and one Android WeChat client when available. Simulator evidence can prove page compilation and basic routing, but true-device evidence decides platform capabilities such as navigation, sharing, auth, network domains, map rendering, and permission fallback.

   Alternative considered: rely on WeChat DevTools QR preview only. This was rejected because DevTools cannot fully prove native share, map/navigation handoff, or account permission behavior.

3. Places sharing must not mix native share with an implicit clipboard fallback.

   A button labelled as sharing must either trigger native WeChat sharing or visibly communicate that it copies a link. Implementation should separate "Share to WeChat" from "Copy link" when both are supported. The native share path should use `open-type="share"` and `onShareAppMessage`; the copy fallback should be a separate user-visible action.

   Alternative considered: keep the current copy fallback behind the share button. This was rejected because the current real-device result does not match the product expectation of sharing.

4. Release validation commands are hard gates.

   `pnpm typecheck`, `pnpm test`, and `pnpm lint` must pass before production acceptance. If an external or account-side limitation blocks a command or workflow, it must be recorded with scope, owner, evidence, and whether it blocks upload, review, or public launch.

   Alternative considered: allow known failing tests if the manual E2E flow passes. This was rejected because the observed Discover ordering and lint failures are local codebase issues, not platform limitations.

5. Handoff evidence is append-only and linked to acceptance tasks.

   Each production acceptance attempt should produce a dated evidence bundle with screenshots, command output summaries, API IDs, device/platform notes, console/API errors, and pass/blocker classifications. Existing historical evidence folders remain audit records and should not be rewritten.

   Alternative considered: only update a final status document. This was rejected because true-device and platform acceptance need traceable screenshots and logs.

## Risks / Trade-offs

- WeChat share may be account-policy limited → record account status and platform message, then either obtain required permission or relabel the UX as copy-link fallback before production acceptance.
- CloudBase or HTTPS legal domain may not be ready → production acceptance remains blocked while local/dev evidence can continue to pass.
- True-device iOS and Android behavior may diverge → capture device-specific evidence and treat unsupported or degraded behavior as explicit release risks.
- Discover like/favorite/share writes may overwrite interaction state under near-concurrent updates → add focused tests or serialization/idempotency safeguards before acceptance.
- Fixture assets can pass local flows but fail Mini Program network restrictions → replace `example.com` references or move production-preview media to approved storage/CDN domains.
- Root project import in WeChat DevTools may remain unstable → either fix the root import path or document the generated `apps/mobile/dist/dev/mp-weixin` directory as the canonical DevTools project for release validation.

## Migration Plan

1. Fix quality blockers from the local E2E run: Discover post ordering expectations and the unused `_input` lint issue.
2. Establish a production-like Mini Program API target through CloudBase function mode or an approved HTTPS domain, and verify health/read/write flows from that target.
3. Repair or clarify Places share behavior and keep navigation behavior validated on true devices.
4. Run true-device workflows for Places, Events, Discover, Home, and Me on the supported device set.
5. Clean release media/config, including fixture image URLs, map keys, legal domains, and DevTools import documentation.
6. Produce a dated production acceptance evidence bundle and update release handoff status.

Rollback is procedural: do not mark production acceptance complete, do not upload/submit the Mini Program release, and keep the previous local/dev evidence classified as non-production until blockers are resolved.

## Open Questions

- Is native WeChat friend/share-sheet behavior required for launch, or is an explicitly labelled copy-link fallback acceptable for the first production release?
- Which CloudBase environment and domain are the approved production-like targets for Mini Program acceptance?
- Which WeChat Mini Program account permissions, certification status, and legal-domain entries are already approved?
- What is the minimum supported true-device matrix for launch: one iOS and one Android device, or additional WeChat versions?
