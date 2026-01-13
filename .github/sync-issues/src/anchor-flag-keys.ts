/**
 * anchor-flag-keys.ts
 *
 * Updates feature documentation with generated flag keys.
 * Preserves REMOTE_CONFIG_FLAG block structure, updates Key column.
 *
 * Usage:
 *   node dist/src/anchor-flag-keys.js
 */

import { join } from "node:path";
import { anchorFlagKeysInContent } from "../lib/document.js";
import { parseFrontmatter, parseFlagBlock } from "../lib/parser.js";
import { readFile, writeFile, listMarkdownFiles, fileExists, log } from "../lib/effects.js";

// ============================================================================
// Main Logic
// ============================================================================

const main = async (): Promise<void> => {
    log.info("⚓ Anchoring Flag Keys to Documentation");
    log.divider();

    const featuresDir = join(process.cwd(), "docs/features");

    if (!fileExists(featuresDir)) {
        log.info("No features directory found. Skipping.");
        return;
    }

    const files = listMarkdownFiles(featuresDir);
    let updated = 0;

    for (const filePath of files) {
        const content = readFile(filePath);
        const { data } = parseFrontmatter(content);

        // Skip if no flag issue number or feature number
        if (!data.flag_issue_number || !data.issue_number) {
            continue;
        }

        // Skip if already has flag_key in frontmatter
        if (data.flag_key) {
            continue;
        }

        // Check if there is even a flag block to update
        const blockResult = parseFlagBlock(content);
        if (!blockResult || blockResult.flags.length === 0) {
            continue;
        }

        const featureNumber = data.issue_number;
        const flagNumber = data.flag_issue_number;

        const updatedContent = anchorFlagKeysInContent(content, featureNumber, flagNumber);

        if (updatedContent !== content) {
            writeFile(filePath, updatedContent);
            log.info(`📝 ${filePath.split("/").pop()}: Updated with flag keys`);
            updated++;
        }
    }

    log.divider();
    log.info(`📊 Anchored ${updated} documents with flag keys`);
};

// Run
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
