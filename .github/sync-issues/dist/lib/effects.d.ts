/**
 * effects.ts
 *
 * Shell wrappers for I/O operations (impure functions).
 * This module isolates all side effects from pure logic.
 */
import type { RemoteConfigTemplate, FirebaseNamespace } from "./types.js";
/**
 * Read file content as UTF-8 string.
 */
export declare const readFile: (path: string) => string;
/**
 * Write content to file.
 */
export declare const writeFile: (path: string, content: string) => void;
/**
 * Check if a file or directory exists.
 */
export declare const fileExists: (path: string) => boolean;
/**
 * Recursively walk a directory and collect all file paths.
 */
export declare const walkDirectory: (dir: string) => readonly string[];
/**
 * List markdown files in a directory (recursive).
 */
export declare const listMarkdownFiles: (dir: string) => readonly string[];
/**
 * Execute a shell command and return stdout.
 */
export declare const execCommand: (cmd: string) => string;
/**
 * Execute a shell command silently (suppress output).
 */
export declare const execCommandSilent: (cmd: string) => void;
/**
 * Get GCloud access token for authenticated requests.
 */
export declare const getAccessToken: () => string;
/**
 * Fetch Remote Config template from Firebase.
 */
export declare const fetchTemplate: (projectId: string, namespace: FirebaseNamespace, accessToken: string) => RemoteConfigTemplate | null;
/**
 * Publish Remote Config template to Firebase.
 */
export declare const publishTemplate: (projectId: string, template: RemoteConfigTemplate, namespace: FirebaseNamespace, accessToken: string) => boolean;
/**
 * Find a GitHub issue by title search.
 */
export declare const findIssueByTitle: (searchTerm: string) => {
    number: number;
    title: string;
} | null;
/**
 * Close a GitHub issue with a comment.
 */
export declare const closeIssue: (issueNumber: number, comment: string) => boolean;
/**
 * Log helpers for consistent output.
 */
export declare const log: {
    info: (msg: string) => void;
    success: (msg: string) => void;
    error: (msg: string) => void;
    warn: (msg: string) => void;
    skip: (msg: string) => void;
    section: (msg: string) => void;
    divider: () => void;
};
/**
 * Resolve a namespace alias to Firebase API namespace.
 */
export declare const resolveNamespace: (alias: "client" | "server") => FirebaseNamespace;
//# sourceMappingURL=effects.d.ts.map