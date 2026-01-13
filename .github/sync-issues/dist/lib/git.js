/**
 * git.ts
 *
 * Functional shell wrappers for Git operations.
 * All functions are pure wrappers around shell commands.
 */
import { execSync } from "node:child_process";
// ============================================================================
// Shell Wrapper
// ============================================================================
/**
 * Execute a git command and return stdout
 */
export const execGit = (args, dryRun = false) => {
    if (dryRun) {
        console.log(`[DRY RUN] git ${args}`);
        return null;
    }
    try {
        return execSync(`git ${args}`, {
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
        }).trim();
    }
    catch (e) {
        const error = e;
        console.error(`Git Error: ${error.message}`);
        return null;
    }
};
// ============================================================================
// Git Configuration
// ============================================================================
/**
 * Configure git user for GitHub Actions bot
 */
export const configureActionsUser = (dryRun = false) => {
    execGit('config user.name "github-actions[bot]"', dryRun);
    execGit('config user.email "github-actions[bot]@users.noreply.github.com"', dryRun);
};
// ============================================================================
// Branch Operations
// ============================================================================
/**
 * Create a new branch from current HEAD
 */
export const createBranch = (branchName, dryRun = false) => {
    return execGit(`checkout -b ${branchName}`, dryRun);
};
/**
 * Checkout an existing branch
 */
export const checkoutBranch = (branchName, dryRun = false) => {
    return execGit(`checkout ${branchName}`, dryRun);
};
/**
 * Push branch to remote
 */
export const pushBranch = (branchName, dryRun = false) => {
    return execGit(`push origin ${branchName}`, dryRun);
};
// ============================================================================
// Staging and Commits
// ============================================================================
/**
 * Stage all changes
 */
export const stageAll = (dryRun = false) => {
    return execGit("add .", dryRun);
};
/**
 * Stage specific files
 */
export const stageFiles = (files, dryRun = false) => {
    const escaped = files.map(f => `"${f}"`).join(" ");
    return execGit(`add ${escaped}`, dryRun);
};
/**
 * Commit staged changes
 */
export const commit = (message, dryRun = false) => {
    return execGit(`commit -m "${message}"`, dryRun);
};
// ============================================================================
// Query Operations
// ============================================================================
/**
 * Get current branch name
 */
export const getCurrentBranch = () => {
    return execGit("rev-parse --abbrev-ref HEAD", false);
};
/**
 * Check if working tree is clean
 */
export const isClean = () => {
    const status = execGit("status --porcelain", false);
    return status === "" || status === null;
};
/**
 * Get list of changed files
 */
export const getChangedFiles = () => {
    const status = execGit("status --porcelain", false);
    if (!status)
        return [];
    return status.split("\n").filter(Boolean).map(line => line.slice(3));
};
// ============================================================================
// Composite Operations
// ============================================================================
/**
 * Create branch, stage all, commit, and push
 */
export const createAndPushBranch = (branchName, commitMessage, dryRun = false) => {
    const results = [
        createBranch(branchName, dryRun),
        stageAll(dryRun),
        commit(commitMessage, dryRun),
        pushBranch(branchName, dryRun),
    ];
    // In dry run, all operations return null but are considered successful
    if (dryRun)
        return true;
    // Check if any non-dry-run operation failed
    return results.every(r => r !== null);
};
//# sourceMappingURL=git.js.map