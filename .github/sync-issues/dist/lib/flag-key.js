/**
 * flag-key.ts
 *
 * Pure functions for flag key derivation.
 * No side effects, no I/O.
 */
/**
 * Sanitize a context string for use in flag key.
 * - Converts to lowercase
 * - Replaces non-alphanumeric chars with underscores
 * - Collapses multiple underscores
 * - Trims leading/trailing underscores
 */
export const sanitizeContext = (context) => context
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
/**
 * Derive the flag key from feature/flag numbers and context.
 * Format: feature_fe_{featureNumber}_fl_{flagNumber}_{context}_enabled
 */
export const deriveFlagKey = (featureNumber, flagNumber, context) => `feature_fe_${featureNumber}_fl_${flagNumber}_${sanitizeContext(context)}_enabled`;
/**
 * Extract feature and flag numbers from a flag key.
 * Returns null if the key doesn't match the expected format.
 */
export const parseFlagKey = (key) => {
    const match = key.match(/^feature_fe_(\d+)_fl_(\d+)_(.+)_enabled$/);
    if (!match)
        return null;
    return {
        featureNumber: parseInt(match[1], 10),
        flagNumber: parseInt(match[2], 10),
        context: match[3],
    };
};
/**
 * Validate if a string is a valid flag key format.
 */
export const isValidFlagKey = (key) => /^feature_fe_\d+_fl_\d+_\w+_enabled$/.test(key);
//# sourceMappingURL=flag-key.js.map