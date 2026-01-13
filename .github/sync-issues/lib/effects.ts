/**
 * effects.ts
 *
 * Shell wrappers for I/O operations (impure functions).
 * This module isolates all side effects from pure logic.
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { RemoteConfigTemplate, EnvironmentId, FirebaseNamespace } from "./types.js";
import { NAMESPACE_MAP } from "./types.js";

// ============================================================================
// File System Operations
// ============================================================================

/**
 * Read file content as UTF-8 string.
 */
export const readFile = (path: string): string => readFileSync(path, "utf8");

/**
 * Write content to file.
 */
export const writeFile = (path: string, content: string): void => {
    writeFileSync(path, content, "utf8");
};

/**
 * Check if a file or directory exists.
 */
export const fileExists = (path: string): boolean => existsSync(path);

/**
 * Recursively walk a directory and collect all file paths.
 */
export const walkDirectory = (dir: string): readonly string[] => {
    if (!existsSync(dir)) return [];

    const result: string[] = [];

    const walk = (currentDir: string): void => {
        for (const entry of readdirSync(currentDir)) {
            const fullPath = join(currentDir, entry);
            if (statSync(fullPath).isDirectory()) {
                walk(fullPath);
            } else {
                result.push(fullPath);
            }
        }
    };

    walk(dir);
    return result;
};

/**
 * List markdown files in a directory (recursive).
 */
export const listMarkdownFiles = (dir: string): readonly string[] =>
    walkDirectory(dir).filter((f) => f.endsWith(".md"));

// ============================================================================
// Shell Command Execution
// ============================================================================

/**
 * Execute a shell command and return stdout.
 */
export const execCommand = (cmd: string): string =>
    execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();

/**
 * Execute a shell command silently (suppress output).
 */
export const execCommandSilent = (cmd: string): void => {
    execSync(cmd, { stdio: "pipe" });
};

// ============================================================================
// GCloud & Firebase Operations
// ============================================================================

/**
 * Get GCloud access token for authenticated requests.
 */
export const getAccessToken = (): string => {
    try {
        return execCommand("gcloud auth application-default print-access-token");
    } catch {
        throw new Error("Failed to get access token. Ensure gcloud is authenticated.");
    }
};

/**
 * Path to Firebase Remote Config skill scripts.
 */
const getSkillsDir = (): string =>
    join(process.cwd(), ".github/skills/firebase-remote-config/scripts");

/**
 * Fetch Remote Config template from Firebase.
 */
export const fetchTemplate = (
    projectId: string,
    namespace: FirebaseNamespace,
    accessToken: string
): RemoteConfigTemplate | null => {
    try {
        const outputFile = `/tmp/template_${projectId}.json`;
        const fetchScript = join(getSkillsDir(), "fetch-template.sh");

        execCommandSilent(
            `bash "${fetchScript}" "${accessToken}" "${projectId}" "${namespace}" "${outputFile}"`
        );

        const content = readFile(outputFile);
        return JSON.parse(content) as RemoteConfigTemplate;
    } catch (error) {
        console.error(`Error fetching template from ${projectId}:`, (error as Error).message);
        return null;
    }
};

/**
 * Publish Remote Config template to Firebase.
 */
export const publishTemplate = (
    projectId: string,
    template: RemoteConfigTemplate,
    namespace: FirebaseNamespace,
    accessToken: string
): boolean => {
    try {
        const templateFile = `/tmp/template_publish_${projectId}.json`;
        const publishScript = join(getSkillsDir(), "publish-template.sh");

        // Write template without version field
        const { version: _, ...templateWithoutVersion } = template;
        writeFile(templateFile, JSON.stringify(templateWithoutVersion, null, 2));

        execCommandSilent(
            `bash "${publishScript}" "${accessToken}" "${projectId}" "${namespace}" "*" "${templateFile}"`
        );

        console.log(`✅ Published template to ${projectId}`);
        return true;
    } catch (error) {
        console.error(`Error publishing to ${projectId}:`, (error as Error).message);
        return false;
    }
};

// ============================================================================
// GitHub CLI Operations
// ============================================================================

/**
 * Find a GitHub issue by title search.
 */
export const findIssueByTitle = (
    searchTerm: string
): { number: number; title: string } | null => {
    try {
        // GitHub search is keyword-based. Replace underscores with spaces to match partial strings.
        const query = searchTerm.replace(/_/g, " ");
        const result = execCommand(
            `gh issue list --search "${query}" --json number,title -s all --limit 10`
        );
        const issues = JSON.parse(result) as { number: number; title: string }[];

        // Locally filter to find the one that specifically contains the searchTerm
        return issues.find((i) => i.title.includes(searchTerm)) || null;
    } catch {
        return null;
    }
};

/**
 * Close a GitHub issue with a comment.
 */
export const closeIssue = (issueNumber: number, comment: string): boolean => {
    try {
        execCommandSilent(
            `gh issue close ${issueNumber} --reason completed --comment "${comment}"`
        );
        return true;
    } catch {
        return false;
    }
};

// ============================================================================
// Logging
// ============================================================================

/**
 * Log helpers for consistent output.
 */
export const log = {
    info: (msg: string): void => console.log(msg),
    success: (msg: string): void => console.log(`✅ ${msg}`),
    error: (msg: string): void => console.error(`❌ ${msg}`),
    warn: (msg: string): void => console.warn(`⚠️ ${msg}`),
    skip: (msg: string): void => console.log(`⏭️ ${msg}`),
    section: (msg: string): void => console.log(`\n📦 ${msg}`),
    divider: (): void => console.log("=".repeat(50)),
};

// ============================================================================
// Namespace Resolution
// ============================================================================

/**
 * Resolve a namespace alias to Firebase API namespace.
 */
export const resolveNamespace = (alias: "client" | "server"): FirebaseNamespace =>
    NAMESPACE_MAP[alias];
