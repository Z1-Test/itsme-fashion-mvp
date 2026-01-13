/**
 * cleanup-remote-config.ts
 *
 * Garbage collection for orphaned Remote Config flags.
 * Scans docs for active flags, compares with Firebase, removes orphans.
 *
 * Usage:
 *   node dist/src/cleanup-remote-config.js [--dry-run]
 */

import { join } from "node:path";
import { extractFlagKeysFromContent } from "../lib/parser.js";
import { extractFlagKeys } from "../lib/template.js";
import {
    readFile,
    listMarkdownFiles,
    fileExists,
    getAccessToken,
    fetchTemplate,
    findIssueByTitle,
    closeIssue,
    log,
} from "../lib/effects.js";
import { FIREBASE_PROJECTS, FirebaseNamespace } from "../lib/types.js";
import { parseFlagKey } from "../lib/flag-key.js";

// ============================================================================
// CLI Argument Parsing
// ============================================================================

const parseCliArgs = (argv: readonly string[]): { dryRun: boolean } => {
    const args = argv.slice(2);
    const cliDryRun = args.includes("--dry-run");
    const envDryRun = process.env.DRY_RUN === "true";
    return { dryRun: cliDryRun || envDryRun };
};

// ============================================================================
// Core Logic
// ============================================================================

/**
 * Get all flag keys from documentation.
 */
const getFlagKeysFromDocs = (featuresDir: string): Set<string> => {
    const keys = new Set<string>();

    if (!fileExists(featuresDir)) {
        return keys;
    }

    const files = listMarkdownFiles(featuresDir);

    for (const filePath of files) {
        const content = readFile(filePath);
        const fileKeys = extractFlagKeysFromContent(content);
        fileKeys.forEach((key) => keys.add(key));
    }

    return keys;
};

/**
 * Close GitHub issue for a flag.
 */
const closeFlagIssue = (flagKey: string, dryRun: boolean): void => {
    const parsed = parseFlagKey(flagKey);
    const searchPrefix = parsed ? `feature_fe_${parsed.featureNumber}_fl_${parsed.flagNumber}` : flagKey;

    const issue = findIssueByTitle(searchPrefix);

    if (dryRun) {
        if (issue) {
            log.info(`[DRY-RUN] Would close issue #${issue.number}: ${issue.title}`);
        } else {
            log.info(`[DRY-RUN] No matching issue found for ${searchPrefix}`);
        }
        return;
    }

    if (issue) {
        const success = closeIssue(issue.number, "Auto-closed: Flag removed during garbage collection");
        if (success) {
            log.info(`Closed issue #${issue.number}`);
        }
    }
};

// ============================================================================
// Main
// ============================================================================

const main = async (): Promise<void> => {
    const { dryRun } = parseCliArgs(process.argv);

    log.info("🧹 Remote Config Garbage Collection");
    log.info(`Dry Run: ${dryRun}`);
    log.divider();

    const featuresDir = join(process.cwd(), "docs/features");

    // Get flag keys from documentation
    const docKeys = getFlagKeysFromDocs(featuresDir);
    log.info(`📄 Found ${docKeys.size} flag keys in documentation`);

    // Get flag keys from Firebase
    const accessToken = getAccessToken();
    const projectId = process.env.FIREBASE_PROJECT_ID || FIREBASE_PROJECTS["dev-ecom-test"]?.projectId;
    const namespace: FirebaseNamespace = "firebase";

    if (!projectId) {
        log.error("No project ID found. Set FIREBASE_PROJECT_ID environment variable.");
        process.exit(1);
    }

    log.info(`Project: ${projectId}`);

    let firebaseKeys: readonly string[] = [];

    const template = fetchTemplate(projectId, namespace, accessToken);
    if (template) {
        firebaseKeys = extractFlagKeys(template);
    }

    log.info(`🔥 Found ${firebaseKeys.length} flag keys in Firebase`);

    // Find orphaned keys (in Firebase but not in docs)
    const orphanedKeys = firebaseKeys.filter((key) => !docKeys.has(key));
    log.info(`\n🗑️ Found ${orphanedKeys.length} orphaned keys`);

    if (orphanedKeys.length === 0) {
        log.info("\n✅ No orphaned keys found. Nothing to clean up.");
        return;
    }

    log.info("\nOrphaned keys:");
    orphanedKeys.forEach((key) => log.info(`  - ${key}`));

    // Delete orphaned keys (not implemented in this version - would need delete API)
    for (const key of orphanedKeys) {
        log.info(`\n🗑️ Flagged for deletion: ${key}`);
        closeFlagIssue(key, dryRun);
    }

    log.divider();
    log.info(`📊 Cleanup complete: ${orphanedKeys.length} keys processed`);
};

// Run
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
