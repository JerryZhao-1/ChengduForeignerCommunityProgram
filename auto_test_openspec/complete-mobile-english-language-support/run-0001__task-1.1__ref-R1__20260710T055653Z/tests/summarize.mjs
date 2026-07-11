import { writeFileSync } from "node:fs";

const [testExit, typecheckExit, scanExit, outputPath] = process.argv.slice(2);

writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      change: "complete-mobile-english-language-support",
      task: "1.1",
      ref: "R1",
      commands: [
        {
          command:
            "./node_modules/.bin/vitest run apps/mobile/src/i18n/catalog.spec.ts apps/mobile/src/pages/events/event-signup-state.spec.ts",
          exitCode: Number(testExit),
          log: "logs/focused-tests.log"
        },
        {
          command: "pnpm --filter @community-map/mobile typecheck",
          exitCode: Number(typecheckExit),
          log: "logs/mobile-typecheck.log"
        },
        {
          command:
            "rg -n '[一-鿿]' apps/mobile/src/pages/events/event-signup-state.ts",
          exitCode: Number(scanExit),
          interpretation: "0 means no forbidden domain-helper literals",
          log: "logs/domain-copy-scan.log"
        }
      ],
      assertions: {
        catalogParityAndLocalizedCasesExecuted: Number(testExit) === 0,
        mobileTypecheckCompleted: Number(typecheckExit) === 0,
        domainHelperHasNoHanLiterals: Number(scanExit) === 0
      }
    },
    null,
    2
  )}\n`
);
