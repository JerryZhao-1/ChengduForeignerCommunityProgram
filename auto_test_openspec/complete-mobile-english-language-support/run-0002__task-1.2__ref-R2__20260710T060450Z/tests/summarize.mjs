import { writeFileSync } from "node:fs";

const [testExit, typecheckExit, outputPath] = process.argv.slice(2);
writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      change: "complete-mobile-english-language-support",
      task: "1.2",
      ref: "R2",
      commands: [
        {
          command:
            "./node_modules/.bin/vitest run packages/shared/test/bilingual-contracts.spec.ts packages/shared/test/contracts.spec.ts packages/shared/test/places-marker-contract.spec.ts",
          exitCode: Number(testExit),
          log: "logs/focused-shared-tests.log"
        },
        {
          command: "pnpm --filter @community-map/shared typecheck",
          exitCode: Number(typecheckExit),
          log: "logs/shared-typecheck.log"
        }
      ],
      assertions: {
        contractFixturesParsed: Number(testExit) === 0,
        readinessFieldPathsVerified: Number(testExit) === 0,
        publicPlaceBoundariesUnchanged: Number(testExit) === 0,
        sharedTypecheckCompleted: Number(typecheckExit) === 0
      }
    },
    null,
    2
  )}\n`
);
