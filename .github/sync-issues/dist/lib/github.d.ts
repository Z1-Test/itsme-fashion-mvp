/**
 * github.ts
 *
 * Functional shell wrappers for GitHub CLI operations.
 * All functions are pure wrappers around `gh` commands.
 */
import type { RepoInfo, IssueData, CreateIssueRequest } from "./types.js";
/**
 * Execute a GitHub CLI command and return stdout
 */
export declare const execGh: (args: string, dryRun?: boolean) => string | null;
/**
 * Get current repository owner and name
 */
export declare const getRepoInfo: (repoArg?: string | undefined) => RepoInfo | null;
/**
 * Get available issue types for an organization
 */
export declare const getIssueTypes: (owner: string) => readonly string[];
/**
 * Set issue type via REST API
 */
export declare const setIssueType: (owner: string, repo: string, number: number, typeName: string, dryRun?: boolean) => boolean;
/**
 * Create a new GitHub issue
 */
export declare const createIssue: (request: CreateIssueRequest, dryRun?: boolean) => IssueData | null;
/**
 * Update issue body
 */
export declare const updateIssueBody: (number: number, body: string, dryRun?: boolean) => boolean;
/**
 * Update issue title
 */
export declare const updateIssueTitle: (number: number, title: string, dryRun?: boolean) => boolean;
/**
 * Get issue details by number
 */
export declare const getIssue: (number: number) => {
    id: string;
    nodeId: string;
} | null;
/**
 * Get database ID from node ID
 */
export declare const getDatabaseId: (nodeId: string) => string | null;
/**
 * Link a child issue as a sub-issue to a parent
 */
export declare const linkSubIssue: (owner: string, repo: string, parentNumber: number, childNodeId: string, dryRun?: boolean) => boolean;
/**
 * Create a pull request
 */
export declare const createPullRequest: (title: string, body: string, base: string, head: string, dryRun?: boolean) => boolean;
//# sourceMappingURL=github.d.ts.map