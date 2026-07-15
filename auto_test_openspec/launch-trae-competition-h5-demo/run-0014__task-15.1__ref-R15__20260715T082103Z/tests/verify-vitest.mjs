import { readFileSync } from "node:fs";

const reportPath = process.argv[2];
if (!reportPath) throw new Error("Expected a Vitest JSON report path.");
const report = JSON.parse(readFileSync(reportPath, "utf8"));
if (report.success !== true || report.numFailedTests !== 0) {
  throw new Error(`Vitest report contains failures: ${reportPath}`);
}
console.log(`Verified ${report.numPassedTests} passing tests and zero failures.`);

