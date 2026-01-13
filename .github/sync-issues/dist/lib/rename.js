/**
 * rename.ts
 *
 * Pure functions for file renaming and link fixing.
 * No I/O operations - all inputs and outputs are explicit.
 */
import { basename, dirname, join, relative } from "node:path";
// ============================================================================
// Rename Calculation
// ============================================================================
/**
 * Calculate the new filename with issue number prefix
 */
export const calculateRenamedPath = (filePath, issueNumber, prefix) => {
    const file = basename(filePath);
    const expectedPrefix = `${prefix}-${issueNumber}-`;
    // Already has the correct prefix
    if (file.startsWith(expectedPrefix)) {
        return null;
    }
    // Remove any existing prefix pattern (e.g., "epic-123-" or "feat-45-")
    const withoutPrefix = file.replace(/^(epic|feat)-\d+-/, "");
    const newName = `${expectedPrefix}${withoutPrefix}`;
    return {
        oldPath: filePath,
        newPath: join(dirname(filePath), newName),
        oldName: file,
        newName,
    };
};
// ============================================================================
// Link Pattern Generation
// ============================================================================
/**
 * Generate link update patterns for a rename operation
 */
export const generateLinkPatterns = (rename) => {
    const oldBase = rename.oldName;
    // Match various link formats:
    // - [text](path/to/oldname.md)
    // - [text](./oldname.md)
    // - [text](../dir/oldname.md)
    return [
        new RegExp(`\\]\\(([^)]*/)${escapeRegex(oldBase)}\\)`, "g"),
        new RegExp(`\\]\\(\\./${escapeRegex(oldBase)}\\)`, "g"),
        new RegExp(`\\]\\(${escapeRegex(oldBase)}\\)`, "g"),
    ];
};
/**
 * Escape special regex characters in a string
 */
const escapeRegex = (str) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
// ============================================================================
// Link Replacement
// ============================================================================
/**
 * Update all links in content for a set of renames
 */
export const updateLinksInContent = (content, renames) => {
    let updated = content;
    for (const rename of renames) {
        // Replace all occurrences of the old filename with the new one
        updated = updated.replace(new RegExp(escapeRegex(rename.oldName), "g"), rename.newName);
    }
    return updated;
};
/**
 * Calculate relative path between two files
 */
export const calculateRelativePath = (fromFile, toFile) => {
    const fromDir = dirname(fromFile);
    return relative(fromDir, toFile);
};
// ============================================================================
// Batch Operations
// ============================================================================
/**
 * Filter renames that actually need to be performed
 */
export const filterPendingRenames = (renames) => {
    return renames.filter((r) => r !== null);
};
/**
 * Build a mapping from old paths to new paths
 */
export const buildRenameMap = (renames) => {
    return new Map(renames.map(r => [r.oldPath, r.newPath]));
};
/**
 * Update a path according to rename map
 */
export const applyRenameToPath = (path, renameMap) => {
    return renameMap.get(path) ?? path;
};
//# sourceMappingURL=rename.js.map