/**
 * rename.ts
 *
 * Pure functions for file renaming and link fixing.
 * No I/O operations - all inputs and outputs are explicit.
 */
import type { RenameOperation } from "./types.js";
/**
 * Calculate the new filename with issue number prefix
 */
export declare const calculateRenamedPath: (filePath: string, issueNumber: number, prefix: "epic" | "feat") => RenameOperation | null;
/**
 * Generate link update patterns for a rename operation
 */
export declare const generateLinkPatterns: (rename: RenameOperation) => readonly RegExp[];
/**
 * Update all links in content for a set of renames
 */
export declare const updateLinksInContent: (content: string, renames: readonly RenameOperation[]) => string;
/**
 * Calculate relative path between two files
 */
export declare const calculateRelativePath: (fromFile: string, toFile: string) => string;
/**
 * Filter renames that actually need to be performed
 */
export declare const filterPendingRenames: (renames: readonly (RenameOperation | null)[]) => readonly RenameOperation[];
/**
 * Build a mapping from old paths to new paths
 */
export declare const buildRenameMap: (renames: readonly RenameOperation[]) => ReadonlyMap<string, string>;
/**
 * Update a path according to rename map
 */
export declare const applyRenameToPath: (path: string, renameMap: ReadonlyMap<string, string>) => string;
//# sourceMappingURL=rename.d.ts.map