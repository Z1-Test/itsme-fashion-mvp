/**
 * parser.ts
 *
 * Pure functions for parsing markdown documents.
 * Handles frontmatter and REMOTE_CONFIG_FLAG block parsing.
 */
import type { FeatureFrontmatter, FrontmatterParseResult, FlagBlockParseResult } from "./types.js";
/**
 * Parse YAML frontmatter from markdown content.
 * Frontmatter is delimited by --- markers at start of file.
 */
export declare const parseFrontmatter: (content: string) => FrontmatterParseResult;
/**
 * Update frontmatter with new values (immutable).
 * Returns new content string.
 */
export declare const updateFrontmatter: (content: string, updates: Partial<FeatureFrontmatter>) => string;
/**
 * Extract H1 title from markdown body.
 */
export declare const extractTitle: (body: string, fallback: string) => string;
/**
 * Parse the REMOTE_CONFIG_FLAG block from markdown content.
 * Returns structured flag configurations.
 */
export declare const parseFlagBlock: (content: string) => FlagBlockParseResult | null;
/**
 * Extract flag keys from a parsed flag block.
 */
export declare const extractFlagKeysFromBlock: (blockResult: FlagBlockParseResult) => readonly string[];
/**
 * Update a row with a new flag key.
 */
export declare const updateRowWithKey: (row: string, flagKey: string) => string;
/**
 * Rebuild the flag block with updated keys.
 */
export declare const rebuildFlagBlock: (header: readonly string[], separator: readonly string[], rows: readonly string[]) => string;
/**
 * Extract all flag keys from document content.
 * Checks both frontmatter and REMOTE_CONFIG_FLAG blocks.
 */
export declare const extractFlagKeysFromContent: (content: string) => readonly string[];
//# sourceMappingURL=parser.d.ts.map