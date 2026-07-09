# CLI Quality Gate Assertions

This bundle validates task 1.1 through `run.sh` or `run.bat`.

Assertions:

- `corepack pnpm typecheck` exits successfully.
- `corepack pnpm test` exits successfully.
- `corepack pnpm lint` exits successfully.
- Captured logs do not include the previously blocking Discover order assertion names.
- Captured lint log does not include the previous unused `_input` error.
