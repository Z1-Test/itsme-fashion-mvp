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
export declare const sanitizeContext: (context: string) => string;
/**
 * Derive the flag key from feature/flag numbers and context.
 * Format: feature_fe_{featureNumber}_fl_{flagNumber}_{context}_enabled
 */
export declare const deriveFlagKey: (featureNumber: number, flagNumber: number, context: string) => string;
/**
 * Extract feature and flag numbers from a flag key.
 * Returns null if the key doesn't match the expected format.
 */
export declare const parseFlagKey: (key: string) => {
    featureNumber: number;
    flagNumber: number;
    context: string;
} | null;
/**
 * Validate if a string is a valid flag key format.
 */
export declare const isValidFlagKey: (key: string) => boolean;
//# sourceMappingURL=flag-key.d.ts.map