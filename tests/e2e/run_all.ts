/**
 * Master E2E Test Suite Runner
 * Executes all 4 tiers of automated tests:
 * - Tier 1: Feature Coverage
 * - Tier 2: Boundary & Corner Cases
 * - Tier 3: Cross-Feature Interactions
 * - Tier 4: Real-World Scenarios
 * - Tier 5: Adversarial Hardening
 * 
 * Usage:
 *   npx tsx tests/e2e/run_all.ts
 */

import "./bootstrap";
import { runSuites } from "./runner";
import { registerTier1Tests } from "./tier1_feature_coverage.test";
import { registerTier2Tests } from "./tier2_boundary_corner.test";
import { registerTier3Tests } from "./tier3_cross_feature.test";
import { registerTier4Tests } from "./tier4_real_world.test";
import { registerTier5Tests } from "./tier5_adversarial.test";

async function main() {
  console.log("Registering test tiers...");
  
  // Register Tier 1 to Tier 5 test suites
  registerTier1Tests();
  registerTier2Tests();
  registerTier3Tests();
  registerTier4Tests();
  registerTier5Tests();

  // Run all registered suites
  const summary = await runSuites();

  // Exit with non-zero code if any test failed
  if (summary.totalFailed > 0) {
    console.error(`\n❌ TEST SUITE FAILED with ${summary.totalFailed} failure(s).\n`);
    process.exit(1);
  } else {
    console.log(`\n🎉 ALL ${summary.totalPassed} E2E TESTS PASSED SUCCESSFULLY!\n`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
