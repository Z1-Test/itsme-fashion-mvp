/**
 * github.ts
 *
 * Functional shell wrappers for GitHub CLI operations.
 * All functions are pure wrappers around `gh` commands.
 */

import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { RepoInfo, IssueData, CreateIssueRequest } from "./types.js";

// ============================================================================
// Shell Wrapper
// ============================================================================

/**
 * Execute a GitHub CLI command and return stdout
 */
export const execGh = (args: string, dryRun: boolean = false): string | null => {
    // Read operations should always execute even in dry run
    const isRead =
        args.includes("repo view") ||
        args.includes("issue view") ||
        args.includes('api "/repos') ||
        args.includes("api /repos") ||
        args.includes("api orgs/") ||
        args.includes("-X GET") ||
        args.includes("api graphql");

    if (dryRun && !isRead) {
        console.log(`[DRY RUN] gh ${args}`);
        return null;
    }

    try {
        return execSync(`gh ${args}`, {
            encoding: "utf8",
            stdio: ["pipe", "pipe", "pipe"],
        }).trim();
    } catch (e) {
        const error = e as Error & { stdout?: string; stderr?: string };
        console.error(`GH CLI Error: ${error.message}`);
        if (error.stdout) console.error(`STDOUT: ${error.stdout}`);
        if (error.stderr) console.error(`STDERR: ${error.stderr}`);
        return null;
    }
};

// ============================================================================
// Temp File Helpers
// ============================================================================

const createTempFile = (prefix: string, content: string): string => {
    const tempFile = join(tmpdir(), `${prefix}_${Date.now()}.md`);
    writeFileSync(tempFile, content);
    return tempFile;
};

const deleteTempFile = (path: string): void => {
    try {
        unlinkSync(path);
    } catch {
        // Ignore cleanup errors
    }
};

// ============================================================================
// Repository Information
// ============================================================================

/**
 * Get current repository owner and name
 */
export const getRepoInfo = (repoArg?: string): RepoInfo | null => {
    if (repoArg) {
        const parts = repoArg.split("/");
        if (parts.length === 2 && parts[0] && parts[1]) {
            return { owner: parts[0], repo: parts[1] };
        }
        return null;
    }

    try {
        const json = execGh("repo view --json name,owner", false);
        if (!json) return null;
        const parsed = JSON.parse(json) as { owner: { login: string }; name: string };
        return { owner: parsed.owner.login, repo: parsed.name };
    } catch {
        return null;
    }
};

// ============================================================================
// Issue Types
// ============================================================================

/**
 * Get available issue types for an organization
 */
export const getIssueTypes = (owner: string): readonly string[] => {
    try {
        const result = execGh(`api orgs/${owner}/issue-types --jq ".[] | {name}"`, false);
        if (!result) return [];
        return result
            .split("\n")
            .filter(Boolean)
            .map(line => {
                try {
                    return (JSON.parse(line) as { name: string }).name;
                } catch {
                    return null;
                }
            })
            .filter((n): n is string => n !== null);
    } catch {
        return [];
    }
};

/**
 * Set issue type via REST API
 */
export const setIssueType = (
    owner: string,
    repo: string,
    number: number,
    typeName: string,
    dryRun: boolean = false
): boolean => {
    if (!typeName) return false;
    try {
        const result = execGh(
            `api -X PATCH /repos/${owner}/${repo}/issues/${number} -f type="${typeName}"`,
            dryRun
        );
        return dryRun || result !== null;
    } catch {
        return false;
    }
};

// ============================================================================
// Issue CRUD Operations
// ============================================================================

/**
 * Create a new GitHub issue
 */
export const createIssue = (
    request: CreateIssueRequest,
    dryRun: boolean = false
): IssueData | null => {
    const { owner, repo, title, body } = request;

    const tempFile = createTempFile("issue_body", body);

    try {
        const result = execGh(
            `api -X POST /repos/${owner}/${repo}/issues -f title="${title}" --field body=@${tempFile}`,
            dryRun
        );

        if (dryRun) {
            return {
                number: 0,
                id: "dry-run",
                nodeId: "dry-run",
                url: `https://github.com/${owner}/${repo}/issues/0`,
                title,
            };
        }

        if (!result) return null;

        const parsed = JSON.parse(result) as {
            number: number;
            id: number;
            node_id: string;
            html_url: string;
            title: string;
        };

        return {
            number: parsed.number,
            id: String(parsed.id),
            nodeId: parsed.node_id,
            url: parsed.html_url,
            title: parsed.title,
        };
    } finally {
        deleteTempFile(tempFile);
    }
};

/**
 * Update issue body
 */
export const updateIssueBody = (
    number: number,
    body: string,
    dryRun: boolean = false
): boolean => {
    const tempFile = createTempFile("issue_body", body);

    try {
        const result = execGh(`issue edit ${number} --body-file "${tempFile}"`, dryRun);
        return dryRun || result !== null;
    } finally {
        deleteTempFile(tempFile);
    }
};

/**
 * Update issue title
 */
export const updateIssueTitle = (
    number: number,
    title: string,
    dryRun: boolean = false
): boolean => {
    const result = execGh(`issue edit ${number} --title "${title}"`, dryRun);
    return dryRun || result !== null;
};

/**
 * Get issue details by number
 */
export const getIssue = (number: number): { id: string; nodeId: string } | null => {
    const json = execGh(`issue view ${number} --json id,node_id`, false);
    if (!json) return null;
    try {
        const parsed = JSON.parse(json) as { id: number; node_id: string };
        return { id: String(parsed.id), nodeId: parsed.node_id };
    } catch {
        return null;
    }
};

// ============================================================================
// Sub-Issue Linking
// ============================================================================

/**
 * Get database ID from node ID
 */
export const getDatabaseId = (nodeId: string): string | null => {
    // If already a database ID (numeric string), return as-is
    if (/^\d+$/.test(String(nodeId))) {
        return String(nodeId);
    }

    const result = execGh(
        `api graphql -f query='query { node(id: "${nodeId}") { ... on Issue { databaseId } } }'`,
        false
    );

    if (!result) return null;

    try {
        const parsed = JSON.parse(result) as { data: { node: { databaseId: number } } };
        return String(parsed.data.node.databaseId);
    } catch {
        return null;
    }
};

/**
 * Link a child issue as a sub-issue to a parent
 */
export const linkSubIssue = (
    owner: string,
    repo: string,
    parentNumber: number,
    childNodeId: string,
    dryRun: boolean = false
): boolean => {
    const dbId = getDatabaseId(childNodeId);
    if (!dbId) return false;

    const result = execGh(
        `api repos/${owner}/${repo}/issues/${parentNumber}/sub_issues -X POST -F sub_issue_id=${dbId}`,
        dryRun
    );
    return dryRun || result !== null;
};

// ============================================================================
// Pull Request Operations
// ============================================================================

/**
 * Create a pull request
 */
export const createPullRequest = (
    title: string,
    body: string,
    base: string,
    head: string,
    dryRun: boolean = false
): boolean => {
    const tempFile = createTempFile("pr_body", body);

    try {
        const result = execGh(
            `pr create --title "${title}" --body-file "${tempFile}" --base ${base} --head ${head}`,
            dryRun
        );
        return dryRun || result !== null;
    } finally {
        deleteTempFile(tempFile);
    }
};
