/**
 * git.ts
 *
 * Functional shell wrappers for Git operations.
 * All functions are pure wrappers around shell commands.
 */
/**
 * Execute a git command and return stdout
 */
export declare const execGit: (args: string, dryRun?: boolean) => string | null;
/**
 * Configure git user for GitHub Actions bot
 */
export declare const configureActionsUser: (dryRun?: boolean) => void;
/**
 * Create a new branch from current HEAD
 */
export declare const createBranch: (branchName: string, dryRun?: boolean) => string | null;
/**
 * Checkout an existing branch
 */
export declare const checkoutBranch: (branchName: string, dryRun?: boolean) => string | null;
/**
 * Push branch to remote
 */
export declare const pushBranch: (branchName: string, dryRun?: boolean) => string | null;
/**
 * Stage all changes
 */
export declare const stageAll: (dryRun?: boolean) => string | null;
/**
 * Stage specific files
 */
export declare const stageFiles: (files: readonly string[], dryRun?: boolean) => string | null;
/**
 * Commit staged changes
 */
export declare const commit: (message: string, dryRun?: boolean) => string | null;
/**
 * Get current branch name
 */
export declare const getCurrentBranch: () => string | null;
/**
 * Check if working tree is clean
 */
export declare const isClean: () => boolean;
/**
 * Get list of changed files
 */
export declare const getChangedFiles: () => readonly string[];
/**
 * Create branch, stage all, commit, and push
 */
export declare const createAndPushBranch: (branchName: string, commitMessage: string, dryRun?: boolean) => boolean;
//# sourceMappingURL=git.d.ts.map