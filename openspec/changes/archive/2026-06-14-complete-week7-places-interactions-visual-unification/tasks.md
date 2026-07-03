## 1. Favorite And Share Closure

- [x] 1.1 Implement visible v1 favorite state for place detail [#R1]
  - ACCEPT: The place detail favorite action toggles visible state for the current place, uses production-intent localized copy, and keeps favorite persistence behind a replaceable frontend state boundary without adding backend APIs or shared contracts.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      auto_test_openspec/complete-week7-places-interactions-visual-unification/run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/
    - run-folder MUST be:
      run-<RUN4>__task-1.1__ref-R1__<YYYYMMDDThhmmssZ>/
    - Run: auto_test_openspec/complete-week7-places-interactions-visual-unification/<run-folder>/run.sh (macOS/Linux) or run.bat (Windows)
    - CLI checks: run the affected mobile typecheck or targeted static checks for the favorite state code.
    - GUI runbook: verify the detail page favorite action toggles visible state and does not show "pending", "reserved", "placeholder", or future-tense implementation copy.

- [x] 1.2 Implement place detail share behavior from detail share payload [#R2]
  - ACCEPT: Place detail exposes Mini Program page sharing behavior using localized `place.share` data or safe fallbacks, targets the same place detail path, and unsupported surfaces receive non-placeholder feedback.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      auto_test_openspec/complete-week7-places-interactions-visual-unification/run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/
    - run-folder MUST be:
      run-<RUN4>__task-1.2__ref-R2__<YYYYMMDDThhmmssZ>/
    - Run: auto_test_openspec/complete-week7-places-interactions-visual-unification/<run-folder>/run.sh (macOS/Linux) or run.bat (Windows)
    - CLI checks: run the affected mobile typecheck and any targeted checks for share path construction.
    - GUI runbook: verify share menu/page share behavior in mp-weixin or WeChat DevTools, including share title/path evidence and documented simulator limitations.

## 2. Navigation Closure

- [x] 2.1 Centralize places native navigation action handling [#R3]
  - ACCEPT: Places native location opening is handled through a shared places action/helper path that localizes name/address, validates coordinates where needed, preserves page state on failure, and uses consistent localized failure feedback.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      auto_test_openspec/complete-week7-places-interactions-visual-unification/run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/
    - run-folder MUST be:
      run-<RUN4>__task-2.1__ref-R3__<YYYYMMDDThhmmssZ>/
    - Run: auto_test_openspec/complete-week7-places-interactions-visual-unification/<run-folder>/run.sh (macOS/Linux) or run.bat (Windows)
    - CLI checks: run affected mobile typecheck and targeted checks for the shared navigation helper.
    - GUI runbook: verify detail navigation opens native location/navigation when available and shows the expected failure feedback when launch is blocked or unavailable.

- [x] 2.2 Document and verify location/privacy authorization expectations [#R4]
  - ACCEPT: Week 7 evidence records Mini Program location permission prompt expectations, privacy/authorization assumptions, navigation launch behavior, and known WeChat DevTools simulator limitations.
  - TEST: SCOPE: GUI
    - When done, generate validation bundle under:
      auto_test_openspec/complete-week7-places-interactions-visual-unification/run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/
    - run-folder MUST be:
      run-<RUN4>__task-2.2__ref-R4__<YYYYMMDDThhmmssZ>/
    - Run: auto_test_openspec/complete-week7-places-interactions-visual-unification/<run-folder>/run.sh (macOS/Linux) or run.bat (Windows)
    - GUI runbook: start the mobile Mini Program/H5 target only, then use MCP or WeChat DevTools evidence capture to record share, privacy, location permission, and navigation behavior.
    - Hard rule: run.sh/run.bat MUST be start-server only for this GUI task and MUST NOT drive the browser or mutate app state.

## 3. Places Copy And Visual Unification

- [x] 3.1 Remove placeholder places copy and transitional recommendation UI [#R5]
  - ACCEPT: Places list, map, detail, recommendation, favorite, share, and navigation surfaces no longer expose placeholder-quality copy such as "pending", "reserved", "placeholder", "入口" as a feature label, or equivalent transitional wording; recommended places open the filtered list behavior without a visible redirect card.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      auto_test_openspec/complete-week7-places-interactions-visual-unification/run-<RUN4>__task-3.1__ref-R5__<YYYYMMDDThhmmssZ>/
    - run-folder MUST be:
      run-<RUN4>__task-3.1__ref-R5__<YYYYMMDDThhmmssZ>/
    - Run: auto_test_openspec/complete-week7-places-interactions-visual-unification/<run-folder>/run.sh (macOS/Linux) or run.bat (Windows)
    - CLI checks: scan affected places source/copy files for forbidden transitional wording and run affected mobile typecheck.
    - GUI runbook: verify places list, map, detail, and recommended entry surfaces present production-intent copy in zh/en.

- [x] 3.2 Unify places action, chip, card, and feedback styling [#R6]
  - ACCEPT: Places list, map, detail, and recommended flows use consistent module-level visual patterns for primary actions, secondary actions, ghost actions, chips, cards, loading, empty, and error states without introducing a new UI library or broad non-places refactor.
  - TEST: SCOPE: MIXED
    - When done, generate validation bundle under:
      auto_test_openspec/complete-week7-places-interactions-visual-unification/run-<RUN4>__task-3.2__ref-R6__<YYYYMMDDThhmmssZ>/
    - run-folder MUST be:
      run-<RUN4>__task-3.2__ref-R6__<YYYYMMDDThhmmssZ>/
    - Run: auto_test_openspec/complete-week7-places-interactions-visual-unification/<run-folder>/run.sh (macOS/Linux) or run.bat (Windows)
    - CLI checks: run affected mobile typecheck and any targeted style/static checks.
    - GUI runbook: capture places list, map, detail, recommended, loading, empty, and error surfaces at representative mobile viewport sizes and verify no text overlap or incoherent visual mismatch.

## 4. Final Verification

- [x] 4.1 Run affected checks and OpenSpec validation [#R7]
  - ACCEPT: The completed change passes affected mobile typecheck, relevant unit/static tests, and `openspec validate complete-week7-places-interactions-visual-unification --strict --no-interactive`.
  - TEST: SCOPE: CLI
    - When done, generate validation bundle under:
      auto_test_openspec/complete-week7-places-interactions-visual-unification/run-<RUN4>__task-4.1__ref-R7__<YYYYMMDDThhmmssZ>/
    - run-folder MUST be:
      run-<RUN4>__task-4.1__ref-R7__<YYYYMMDDThhmmssZ>/
    - Run: auto_test_openspec/complete-week7-places-interactions-visual-unification/<run-folder>/run.sh (macOS/Linux) or run.bat (Windows)
    - CLI checks: run `pnpm --filter @community-map/mobile typecheck`, relevant tests for touched places helpers, and OpenSpec strict validation.
    - Verify: exit code is zero, logs contain the exact commands and their success output, and no prior run-folder is overwritten.
