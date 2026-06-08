# GUI Evidence

- Mobile places filter GUI: `#service` card tag produced one filtered card and active tag reset state.
- Mobile detail media GUI: place detail rendered gallery image media and did not show raw file ids/cloud paths.
- Admin places GUI: metadata fields and file-backed gallery registration controls were present; no manual gallery URL input was present.
- Dev servers:
  - Mobile H5: `http://127.0.0.1:5174/`
  - Admin: `http://127.0.0.1:5173/`
- Full lint blocker: `corepack pnpm lint` fails on pre-existing `scripts/generate_aidrun_figma_svg.js` issues: `@typescript-eslint/no-require-imports` at lines 1-2 and `@typescript-eslint/no-unused-vars` for `top` at line 158.
