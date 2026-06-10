# Validation Bundle: Task 4.1 Final Verification

- change-id: complete-week7-places-interactions-visual-unification
- run#: 0007
- task-id: 4.1
- ref-id: R7
- scope: CLI

## How To Run

macOS/Linux:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

## Expected Results

- Mobile typecheck exits zero.
- Targeted places tests exit zero.
- Places copy scan finds no forbidden visible copy. Matches for source-only API names or HTML attributes are filtered by the script.
- `openspec validate complete-week7-places-interactions-visual-unification --strict --no-interactive` exits zero.
- Logs are written under `logs/`.
