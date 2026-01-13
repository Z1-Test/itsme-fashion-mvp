/**
 * parser.ts
 *
 * Pure functions for parsing markdown documents.
 * Handles frontmatter and REMOTE_CONFIG_FLAG block parsing.
 */

import type {
    FeatureFrontmatter,
    FrontmatterParseResult,
    FlagConfig,
    FlagBlockParseResult,
    ValueType,
    NamespaceAlias,
} from "./types.js";

// ============================================================================
// Frontmatter Parsing
// ============================================================================

/**
 * Parse YAML frontmatter from markdown content.
 * Frontmatter is delimited by --- markers at start of file.
 */
export const parseFrontmatter = (content: string): FrontmatterParseResult => {
    const match = content.match(/^---\n([\s\S]*?)\n---/);

    if (!match) {
        return { data: {}, body: content, rawYaml: "" };
    }

    const rawYaml = match[1];
    const data: Record<string, string | number> = {};

    for (const line of rawYaml.split("\n")) {
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) continue;

        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, "");

        if (key && value) {
            // Parse numbers for issue_number fields
            if (key.includes("issue_number") || key.includes("_number")) {
                const num = parseInt(value, 10);
                data[key] = isNaN(num) ? value : num;
            } else {
                data[key] = value;
            }
        }
    }

    return {
        data: data as FeatureFrontmatter,
        body: content.slice(match[0].length).trim(),
        rawYaml,
    };
};

/**
 * Update frontmatter with new values (immutable).
 * Returns new content string.
 */
export const updateFrontmatter = (
    content: string,
    updates: Partial<FeatureFrontmatter>
): string => {
    const { data, body } = parseFrontmatter(content);
    const mergedData = { ...data, ...updates };

    const newYaml = Object.entries(mergedData)
        .map(([k, v]) => `${k}: "${v}"`)
        .join("\n");

    return `---\n${newYaml}\n---\n\n${body}`;
};

/**
 * Extract H1 title from markdown body.
 */
export const extractTitle = (body: string, fallback: string): string => {
    const match = body.match(/^#\s*(?:Feature:|Epic:)?\s*(.*)$/m);
    return match ? match[1].trim() : fallback;
};

// ============================================================================
// Flag Block Parsing
// ============================================================================

/**
 * Parse a value type string to ValueType.
 */
const parseValueType = (type: string): ValueType => {
    const upper = type.toUpperCase();
    if (["BOOLEAN", "STRING", "NUMBER", "JSON"].includes(upper)) {
        return upper as ValueType;
    }
    return "STRING";
};

/**
 * Parse a namespace string to NamespaceAlias.
 */
const parseNamespace = (ns: string): NamespaceAlias => {
    const lower = ns.toLowerCase();
    if (lower === "server" || lower === "firebase-server") {
        return "server";
    }
    return "client";
};

/**
 * Parse the REMOTE_CONFIG_FLAG block from markdown content.
 * Returns structured flag configurations.
 */
export const parseFlagBlock = (content: string): FlagBlockParseResult | null => {
    const blockMatch = content.match(
        /<!-- REMOTE_CONFIG_FLAG_START -->([\s\S]*?)<!-- REMOTE_CONFIG_FLAG_END -->/
    );

    if (!blockMatch) {
        return null;
    }

    const blockContent = blockMatch[1];
    const lines = blockContent.trim().split("\n");

    const header: string[] = [];
    const separator: string[] = [];
    const rows: string[] = [];
    const flags: FlagConfig[] = [];

    let headerFound = false;
    let separatorFound = false;

    for (const line of lines) {
        if (!line.trim()) continue;

        // Header row
        if (!headerFound && line.includes("|")) {
            header.push(line);
            headerFound = true;
            continue;
        }

        // Separator row (---|---|---)
        if (headerFound && !separatorFound && line.match(/^\|[\s-:|]+\|$/)) {
            separator.push(line);
            separatorFound = true;
            continue;
        }

        // Data rows
        if (separatorFound && line.startsWith("|")) {
            rows.push(line);

            const cells = line
                .split("|")
                .map((c) => c.trim())
                .filter(Boolean);

            // Expected columns: Context | Type | Namespace | Default (Dev) | Default (Stg) | Default (Prod) | Key
            if (cells.length >= 6) {
                flags.push({
                    context: cells[0],
                    type: parseValueType(cells[1]),
                    namespace: parseNamespace(cells[2]),
                    defaultDev: cells[3],
                    defaultStg: cells[4],
                    defaultProd: cells[5],
                    key: cells[6] ?? "_auto-generated_",
                });
            }
        }
    }

    return {
        flags,
        header,
        separator,
        rows,
        original: blockMatch[0],
    };
};

/**
 * Extract flag keys from a parsed flag block.
 */
export const extractFlagKeysFromBlock = (
    blockResult: FlagBlockParseResult
): readonly string[] =>
    blockResult.flags
        .map((f) => f.key)
        .filter((key) => key && !key.includes("auto-generated"));

/**
 * Update a row with a new flag key.
 */
export const updateRowWithKey = (row: string, flagKey: string): string => {
    const cells = row.split("|");
    // Ensure we have enough cells and update the last data cell (Key column)
    if (cells.length >= 8) {
        cells[7] = ` \`${flagKey}\` `;
    }
    return cells.join("|");
};

/**
 * Rebuild the flag block with updated keys.
 */
export const rebuildFlagBlock = (
    header: readonly string[],
    separator: readonly string[],
    rows: readonly string[]
): string => {
    return [
        "<!-- REMOTE_CONFIG_FLAG_START -->",
        ...header,
        ...separator,
        ...rows,
        "<!-- REMOTE_CONFIG_FLAG_END -->",
    ].join("\n");
};

// ============================================================================
// Flag Key Extraction from Content
// ============================================================================

/**
 * Extract all flag keys from document content.
 * Checks both frontmatter and REMOTE_CONFIG_FLAG blocks.
 */
export const extractFlagKeysFromContent = (content: string): readonly string[] => {
    const keys: Set<string> = new Set();

    // Check frontmatter
    const { data } = parseFrontmatter(content);
    if (data.flag_key) {
        keys.add(data.flag_key);
    }

    // Check flag block
    const blockResult = parseFlagBlock(content);
    if (blockResult) {
        // Extract from Key column using regex for backtick-wrapped keys
        const keyMatches = blockResult.original.match(
            /`(feature_fe_\d+_fl_\d+_\w+_enabled)`/g
        );
        if (keyMatches) {
            for (const match of keyMatches) {
                keys.add(match.replace(/`/g, ""));
            }
        }
    }

    return Array.from(keys);
};
