/**
 * document.ts
 *
 * Pure functions for processing Epic and Feature documents.
 * Separates computation from I/O - receives content as input, returns structured results.
 */
import type { EpicFrontmatter, FeatureFrontmatter, RenameOperation } from "./types.js";
/**
 * Parse epic frontmatter from content
 */
export declare const parseEpicFrontmatter: (content: string) => EpicFrontmatter;
/**
 * Parse feature frontmatter from content
 */
export declare const parseFeatureFrontmatter: (content: string) => FeatureFrontmatter;
/**
 * Extract document title from content
 */
export declare const getDocumentTitle: (content: string, fallback: string) => string;
/**
 * Get document body (content without frontmatter)
 */
export declare const getDocumentBody: (content: string) => string;
/**
 * Update epic frontmatter with issue data
 */
export declare const updateEpicWithIssue: (content: string, issueUrl: string, issueNumber: number, issueId: string) => string;
/**
 * Update feature frontmatter with issue data
 */
export declare const updateFeatureWithIssue: (content: string, issueUrl: string, issueNumber: number, issueId: string, flagIssueNumber?: number | undefined) => string;
/**
 * Update frontmatter with flag issue number
 */
export declare const updateWithFlagIssue: (content: string, flagIssueNumber: number) => string;
/**
 * Calculate epic rename based on issue number
 */
export declare const calculateEpicRename: (filePath: string, issueNumber: number) => RenameOperation | null;
/**
 * Calculate feature rename based on issue number
 */
export declare const calculateFeatureRename: (filePath: string, issueNumber: number) => RenameOperation | null;
/**
 * Find the best matching issue type from available types
 */
export declare const findBestIssueType: (availableTypes: readonly string[], preferred: string) => string | null;
/**
 * Generate flag title from feature and flag issue numbers
 */
export declare const generateFlagTitle: (featureNumber: number, flagNumber: number, context: string) => string;
/**
 * Generate placeholder flag title (before we know the flag issue number)
 */
export declare const generatePlaceholderFlagTitle: (featureNumber: number, context: string) => string;
/**
 * Generate flag body content
 */
export declare const generateFlagBody: (featureNumber: number, context: string) => string;
/**
 * Anchor flag keys in markdown content.
 * Updates REMOTE_CONFIG_FLAG block and frontmatter.
 */
export declare const anchorFlagKeysInContent: (content: string, featureNumber: number, flagNumber: number) => string;
/**
 * Check if a file is an epic document
 */
export declare const isEpicDocument: (filePath: string) => boolean;
/**
 * Check if a file is a feature document
 */
export declare const isFeatureDocument: (filePath: string) => boolean;
/**
 * Get document type from path
 */
export declare const getDocumentType: (filePath: string) => "Epic" | "Feature" | null;
//# sourceMappingURL=document.d.ts.map