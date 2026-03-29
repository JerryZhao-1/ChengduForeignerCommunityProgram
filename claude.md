# CLAUDE.md

Compatibility note for tools that look for a Claude-specific instruction file.

## Status

This repository does not maintain a separate Claude-only execution workflow.
Do not treat this file as a parallel source of truth for task orchestration,
subagent management, checkpoint rituals, or model-specific command chains.

## Source of Truth

- Read the root `AGENTS.md` first for the OpenSpec bootstrap rule.
- Read `openspec/AGENTS.md` as the primary repository-level AI collaboration
  guide.
- Read `openspec/project.md` and the relevant specs or active changes whenever
  OpenSpec applies.

## Repository Defaults

- Prefer a Codex-first or tool-agnostic coding workflow.
- English-first instructions are preferred in repository docs, but user requests
  may be in Chinese or English.
- Default ownership context in this repository prioritizes the `places` module
  and the `apps/api` backend.
- For `places` and backend work, check whether `packages/shared` contracts,
  schemas, or types also need updates.

## OpenSpec Usage

- Use OpenSpec for new capabilities, breaking changes, architecture shifts, and
  other behavior-changing work as defined in `openspec/AGENTS.md`.
- Do not require a proposal for straightforward configuration changes, bug
  fixes, or other direct maintenance work that does not change repository
  capabilities.

## Explicit Non-Rules

The following legacy ideas are not active rules in this repository:

- no mandatory Claude supervisor plus Codex worker chain
- no English-only user interaction rule
- no single-command worker restriction
- no custom `/monitor-openspec-codex` execution flow
- no repository-specific checkpoint, runbook, or evidence ritual outside normal
  project and OpenSpec requirements
