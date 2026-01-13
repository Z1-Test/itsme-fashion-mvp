#!/usr/bin/env node
/**
 * sync-planning.ts
 *
 * Main orchestrator for the Planning Lifecycle Sync workflow.
 *
 * Operations:
 * 1. Scans docs/epics/ and docs/features/
 * 2. Creates GitHub Issues for new documents
 * 3. Links Features to Epics as sub-issues
 * 4. Updates frontmatter with issue_url
 * 5. Renames files with issue numbers (e.g. feat-12-name.md)
 * 6. Fixes all internal links
 * 7. Syncs local MD content to GitHub Issue body
 * 8. Creates a "Sync Cleanup" PR if names changed
 */
import { readFileSync, writeFileSync, readdirSync, renameSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import * as github from "../lib/github.js";
import * as git from "../lib/git.js";
import { updateLinksInContent, filterPendingRenames } from "../lib/rename.js";
import { parseFlagBlock } from "../lib/parser.js";
import { parseEpicFrontmatter, parseFeatureFrontmatter, getDocumentTitle, getDocumentBody, updateEpicWithIssue, updateFeatureWithIssue, updateWithFlagIssue, calculateEpicRename, calculateFeatureRename, findBestIssueType, generateFlagTitle, generatePlaceholderFlagTitle, generateFlagBody, anchorFlagKeysInContent, } from "../lib/document.js";
// ============================================================================
// Configuration
// ============================================================================
const DOCS_ROOT = join(process.cwd(), "docs");
const EPICS_DIR = join(DOCS_ROOT, "epics");
const FEATURES_DIR = join(DOCS_ROOT, "features");
const parseArgs = (args) => {
    const dryRun = args.includes("--dry-run");
    const validate = args.includes("--validate");
    const repoIdx = args.indexOf("--repo");
    const repo = repoIdx !== -1 && args[repoIdx + 1] ? args[repoIdx + 1] : undefined;
    return { dryRun, validate, repo };
};
// ============================================================================
// File System Helpers
// ============================================================================
const listMarkdownFiles = (dir) => {
    return walkSync(dir);
};
const walkSync = (dir) => {
    const results = [];
    try {
        const items = readdirSync(dir);
        for (const item of items) {
            const fullPath = join(dir, item);
            const stat = statSync(fullPath);
            if (stat.isDirectory()) {
                results.push(...walkSync(fullPath));
            }
            else if (item.endsWith(".md")) {
                results.push(fullPath);
            }
        }
    }
    catch {
        // Directory doesn't exist
    }
    return results;
};
// ============================================================================
// Processing Logic
// ============================================================================
const processEpic = (filePath, repoInfo, epicType, dryRun) => {
    const file = basename(filePath);
    let content = readFileSync(filePath, "utf8");
    const fm = parseEpicFrontmatter(content);
    let issueUrl = fm.issue_url ?? null;
    let issueNumber = fm.issue_number ?? null;
    let issueId = fm.issue_id ?? null;
    let renamed = null;
    // Create issue if needed
    if (!issueUrl) {
        console.log(`Creating Epic issue for ${file}...`);
        const title = fm.epic_name || getDocumentTitle(content, file.replace(".md", ""));
        const body = getDocumentBody(content);
        const created = github.createIssue({
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            title,
            body,
        }, dryRun);
        if (created) {
            issueUrl = created.url;
            issueNumber = created.number;
            issueId = created.nodeId;
            // Set issue type
            if (epicType) {
                const ok = github.setIssueType(repoInfo.owner, repoInfo.repo, created.number, epicType, dryRun);
                if (ok) {
                    console.log(`Set epic issue #${created.number} type to ${epicType}`);
                }
            }
            // Update frontmatter
            content = updateEpicWithIssue(content, issueUrl, issueNumber, issueId);
            writeFileSync(filePath, content);
        }
    }
    // Calculate rename
    if (issueNumber !== null) {
        renamed = calculateEpicRename(filePath, issueNumber);
    }
    return {
        type: "Epic",
        id: issueId,
        number: issueNumber,
        url: issueUrl,
        renamed,
    };
};
const processFeature = (filePath, repoInfo, featureType, flagType, epicMap, dryRun) => {
    const file = basename(filePath);
    let content = readFileSync(filePath, "utf8");
    const fm = parseFeatureFrontmatter(content);
    let issueUrl = fm.issue_url ?? null;
    let issueNumber = fm.issue_number ?? null;
    let issueId = fm.issue_id ?? null;
    let flagIssueNumber = fm.flag_issue_number ?? null;
    let renamed = null;
    if (!issueUrl) {
        // Create new feature issue
        console.log(`Creating Feature issue for ${file}...`);
        const title = fm.feature_name || getDocumentTitle(content, file.replace(".md", ""));
        const body = getDocumentBody(content);
        const created = github.createIssue({
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            title,
            body,
        }, dryRun);
        if (created) {
            issueUrl = created.url;
            issueNumber = created.number;
            issueId = created.nodeId;
            // Set issue type
            if (featureType) {
                const ok = github.setIssueType(repoInfo.owner, repoInfo.repo, created.number, featureType, dryRun);
                if (ok) {
                    console.log(`Set feature issue #${created.number} type to ${featureType}`);
                }
            }
            // Create flag sub-issue
            if (flagType && issueNumber !== null && issueId !== null) {
                const flagBlock = parseFlagBlock(content);
                const context = fm.flag_context ||
                    (flagBlock?.flags[0]?.context) ||
                    "default";
                flagIssueNumber = createFlagForFeature(repoInfo, issueNumber, issueId, context, flagType, dryRun);
            }
            // Link to parent epic
            if (fm.parent_epic) {
                linkToParentEpic(repoInfo, fm.parent_epic, issueId, epicMap, dryRun);
            }
            // Update frontmatter
            content = updateFeatureWithIssue(content, issueUrl, issueNumber, issueId, flagIssueNumber ?? undefined);
            // Anchor flag keys if we have both
            if (issueNumber !== null && flagIssueNumber !== null) {
                content = anchorFlagKeysInContent(content, issueNumber, flagIssueNumber);
            }
            writeFileSync(filePath, content);
        }
    }
    else {
        // Update existing issue body
        console.log(`Updating body for issue #${issueNumber}...`);
        const body = getDocumentBody(content);
        github.updateIssueBody(issueNumber, body, dryRun);
        // Create flag if missing
        if (flagIssueNumber === null && issueNumber !== null && issueId !== null && flagType) {
            const flagBlock = parseFlagBlock(content);
            const context = fm.flag_context ||
                (flagBlock?.flags[0]?.context) ||
                "default";
            flagIssueNumber = createFlagForFeature(repoInfo, issueNumber, issueId, context, flagType, dryRun);
            if (flagIssueNumber) {
                content = updateWithFlagIssue(content, flagIssueNumber);
                // Anchor flag keys
                if (issueNumber !== null && flagIssueNumber !== null) {
                    content = anchorFlagKeysInContent(content, issueNumber, flagIssueNumber);
                }
                writeFileSync(filePath, content);
            }
        }
        // Link to parent if needed
        if (fm.parent_epic && issueId) {
            linkToParentEpic(repoInfo, fm.parent_epic, issueId, epicMap, dryRun);
        }
    }
    // Calculate rename
    if (issueNumber !== null) {
        renamed = calculateFeatureRename(filePath, issueNumber);
    }
    return {
        type: "Feature",
        id: issueId,
        number: issueNumber,
        url: issueUrl,
        renamed,
        flagIssueNumber,
    };
};
const createFlagForFeature = (repoInfo, featureNumber, featureId, context, flagType, dryRun) => {
    console.log(`Creating Flag sub-issue for feature #${featureNumber}...`);
    const placeholderTitle = generatePlaceholderFlagTitle(featureNumber, context);
    const body = generateFlagBody(featureNumber, context);
    const created = github.createIssue({
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        title: placeholderTitle,
        body,
    }, dryRun);
    if (!created)
        return null;
    const flagNumber = created.number;
    const flagNodeId = created.nodeId;
    // Set issue type
    github.setIssueType(repoInfo.owner, repoInfo.repo, flagNumber, flagType, dryRun);
    console.log(`Set flag issue #${flagNumber} type to ${flagType}`);
    // Update title with actual flag number
    const actualTitle = generateFlagTitle(featureNumber, flagNumber, context);
    github.updateIssueTitle(flagNumber, actualTitle, dryRun);
    console.log(`Updated flag title to: ${actualTitle}`);
    // Link as sub-issue
    github.linkSubIssue(repoInfo.owner, repoInfo.repo, featureNumber, flagNodeId, dryRun);
    console.log(`Linked flag #${flagNumber} as sub-issue to feature #${featureNumber}`);
    return flagNumber;
};
const linkToParentEpic = (repoInfo, parentEpicName, featureId, epicMap, dryRun) => {
    // Find matching epic
    let parentEpicNumber = null;
    for (const entry of Array.from(epicMap.entries())) {
        const [epicPath, epicResult] = entry;
        const content = readFileSync(epicPath, "utf8");
        const epicFm = parseEpicFrontmatter(content);
        // Robust title matching: check frontmatter, then H1, then filename slug
        const epicTitle = epicFm.epic_name || getDocumentTitle(content, basename(epicPath).replace(".md", ""));
        if (epicTitle === parentEpicName ||
            epicPath.includes(parentEpicName) ||
            epicPath.includes(parentEpicName.toLowerCase().replace(/ /g, "-"))) {
            parentEpicNumber = epicResult.number;
            break;
        }
    }
    if (parentEpicNumber === null)
        return;
    console.log(`Linking feature to epic #${parentEpicNumber}...`);
    github.linkSubIssue(repoInfo.owner, repoInfo.repo, parentEpicNumber, featureId, dryRun);
};
// ============================================================================
// Rename Execution
// ============================================================================
const executeRenames = (renames, fileToIssue, docsRoot) => {
    if (renames.length === 0)
        return;
    console.log(`🔄 Performing ${renames.length} renames and link updates...`);
    // Execute renames
    for (const r of renames) {
        renameSync(r.oldPath, r.newPath);
        // Update mapping
        if (fileToIssue.has(r.oldPath)) {
            fileToIssue.set(r.newPath, fileToIssue.get(r.oldPath));
            fileToIssue.delete(r.oldPath);
        }
    }
    // Fix all links in documentation
    const allDocs = walkSync(docsRoot);
    for (const docPath of allDocs) {
        let content = readFileSync(docPath, "utf8");
        const updated = updateLinksInContent(content, renames);
        if (updated !== content) {
            writeFileSync(docPath, updated);
        }
    }
};
const createCleanupPR = (dryRun) => {
    if (!process.env.GITHUB_ACTIONS)
        return;
    console.log("Preparing cleanup PR...");
    const branchName = `docs/sync-cleanup-${Date.now()}`;
    git.configureActionsUser(dryRun);
    const success = git.createAndPushBranch(branchName, "docs: sync issue identities and rename files", dryRun);
    if (!success && !dryRun) {
        console.error("Failed to create and push branch");
        return;
    }
    const prBody = `This PR was automatically created by the Planning Lifecycle Sync workflow to:
1. Update docs with GitHub Issue URLs
2. Rename files with issue number prefixes
3. Repair internal links`;
    github.createPullRequest("docs: sync issue identities and rename files", prBody, "main", branchName, dryRun);
    console.log("✅ Cleanup PR creation attempted.");
};
// ============================================================================
// Main Entry Point
// ============================================================================
const main = async () => {
    const options = parseArgs(process.argv.slice(2));
    console.log("🔄 Planning Lifecycle Sync");
    console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);
    console.log(`Validate: ${options.validate}`);
    // Get repo info
    const repoInfo = github.getRepoInfo(options.repo);
    if (!repoInfo) {
        console.error("Failed to get repository information");
        process.exit(1);
    }
    console.log(`Repository: ${repoInfo.owner}/${repoInfo.repo}`);
    // Get issue types
    const issueTypes = github.getIssueTypes(repoInfo.owner);
    console.log(`Available issue types: ${issueTypes.join(", ") || "none"}`);
    const epicType = findBestIssueType(issueTypes, "Epic");
    const featureType = findBestIssueType(issueTypes, "Feature");
    const flagType = findBestIssueType(issueTypes, "Flag");
    // Process epics first
    const epicFiles = listMarkdownFiles(EPICS_DIR);
    const epicMap = new Map();
    console.log(`\n📚 Processing ${epicFiles.length} epics...`);
    for (const epicPath of epicFiles) {
        const result = processEpic(epicPath, repoInfo, epicType, options.dryRun);
        epicMap.set(epicPath, result);
    }
    // Process features
    const featureFiles = listMarkdownFiles(FEATURES_DIR);
    const featureMap = new Map();
    console.log(`\n📦 Processing ${featureFiles.length} features...`);
    for (const featurePath of featureFiles) {
        const result = processFeature(featurePath, repoInfo, featureType, flagType, epicMap, options.dryRun);
        featureMap.set(featurePath, result);
    }
    // Collect renames
    const allResults = Array.from(epicMap.values()).concat(Array.from(featureMap.values()));
    const pendingRenames = filterPendingRenames(allResults.map(r => r.renamed));
    if (pendingRenames.length > 0 && !options.dryRun) {
        const combinedMap = new Map([
            ...Array.from(epicMap.entries()),
            ...Array.from(featureMap.entries())
        ]);
        executeRenames(Array.from(pendingRenames), combinedMap, DOCS_ROOT);
        createCleanupPR(options.dryRun);
    }
    else if (pendingRenames.length > 0) {
        console.log(`\n[DRY RUN] Would rename ${pendingRenames.length} files`);
        for (const r of pendingRenames) {
            console.log(`  ${r.oldName} -> ${r.newName}`);
        }
    }
    // Summary
    console.log("\n✅ Sync complete!");
    console.log(`  Epics: ${epicMap.size}`);
    console.log(`  Features: ${featureMap.size}`);
    console.log(`  Renames: ${pendingRenames.length}`);
};
main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=sync-planning.js.map