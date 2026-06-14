# GUI MCP Runbook

Scope: CLI

1. Start services with the commands printed by `run.sh` when GUI verification is needed.
2. Open Mobile H5 at `http://localhost:5174/#/pages/places/index`, `detail?id=place_001`, and `map`.
3. Open Admin at `http://localhost:5173/places`.
4. Capture evidence for visible list/detail/map/admin states, no horizontal overflow, no broken images, imported/incomplete review indicators where seeded, and public absence of draft imports.
5. Record known local limitation if H5 logs `Map key not configured`.

Worker note: Browser verification on 2026-06-14 covered mobile list/detail/map and admin places render states; CloudBase live verification is blocked by MCP auth.
