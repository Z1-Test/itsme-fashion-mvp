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
export const execGit = (args: string, dryRun: boolean = false): string | null => {
    if (dryRun) {
        console.log(`[DRY RUN] git ${args}`);
        return null;
    }

    try {
        return execSync(`git ${args}`, {
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
        }).trim();
    } catch (e) {
        const error = e as Error;
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
export const configureActionsUser = (dryRun: boolean = false): void => {
    execGit('config user.name "github-actions[bot]"', dryRun);
    execGit('config user.email "github-actions[bot]@users.noreply.github.com"', dryRun);
};

// ============================================================================
// Branch Operations
// ============================================================================

/**
 * Create a new branch from current HEAD
 */
export const createBranch = (branchName: string, dryRun: boolean = false): string | null => {
    return execGit(`checkout -b ${branchName}`, dryRun);
};

/**
 * Checkout an existing branch
 */
export const checkoutBranch = (branchName: string, dryRun: boolean = false): string | null => {
    return execGit(`checkout ${branchName}`, dryRun);
};

/**
 * Push branch to remote
 */
export const pushBranch = (branchName: string, dryRun: boolean = false): string | null => {
    return execGit(`push origin ${branchName}`, dryRun);
};

// ============================================================================
// Staging and Commits
// ============================================================================

/**
 * Stage all changes
 */
export const stageAll = (dryRun: boolean = false): string | null => {
    return execGit("add .", dryRun);
};

/**
 * Stage specific files
 */
export const stageFiles = (files: readonly string[], dryRun: boolean = false): string | null => {
    const escaped = files.map(f => `"${f}"`).join(" ");
    return execGit(`add ${escaped}`, dryRun);
};

/**
 * Commit staged changes
 */
export const commit = (message: string, dryRun: boolean = false): string | null => {
    return execGit(`commit -m "${message}"`, dryRun);
};

// ============================================================================
// Query Operations
// ============================================================================

/**
 * Get current branch name
 */
export const getCurrentBranch = (): string | null => {
    return execGit("rev-parse --abbrev-ref HEAD", false);
};

/**
 * Check if working tree is clean
 */
export const isClean = (): boolean => {
    const status = execGit("status --porcelain", false);
    return status === "" || status === null;
};

/**
 * Get list of changed files
 */
export const getChangedFiles = (): readonly string[] => {
    const status = execGit("status --porcelain", false);
    if (!status) return [];
    return status.split("\n").filter(Boolean).map(line => line.slice(3));
};

// ============================================================================
// Composite Operations
// ============================================================================

/**
 * Create branch, stage all, commit, and push
 */
export const createAndPushBranch = (
    branchName: string,
    commitMessage: string,
    dryRun: boolean = false
): boolean => {
    const results = [
        createBranch(branchName, dryRun),
        stageAll(dryRun),
        commit(commitMessage, dryRun),
        pushBranch(branchName, dryRun),
    ];

    // In dry run, all operations return null but are considered successful
    if (dryRun) return true;

    // Check if any non-dry-run operation failed
    return results.every(r => r !== null);
};
