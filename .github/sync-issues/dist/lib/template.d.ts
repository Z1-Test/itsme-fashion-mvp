/**
 * template.ts
 *
 * Pure functions for Remote Config template manipulation.
 * All functions are immutable - they return new objects.
 */
import type { ValueType, RemoteConfigTemplate, RemoteConfigParameter, ParameterGroup } from "./types.js";
/**
 * Validate that a value type is valid.
 */
export declare const isValidValueType: (type: string) => type is ValueType;
/**
 * Normalize a value type, defaulting to STRING if invalid.
 */
export declare const normalizeValueType: (type: string) => ValueType;
/**
 * Create a Remote Config parameter.
 */
export declare const createParameter: (defaultValue: string, description: string, valueType: ValueType) => RemoteConfigParameter;
/**
 * Create a parameter group with a single parameter.
 */
export declare const createParameterGroup: (flagKey: string, parameter: RemoteConfigParameter) => ParameterGroup;
/**
 * Create a partial template with a single parameter in a group.
 */
export declare const createTemplateFragment: (boundedContext: string, flagKey: string, defaultValue: string, description: string, valueType: ValueType) => Partial<RemoteConfigTemplate>;
/**
 * Merge an incoming template fragment into an existing template (immutable).
 * Returns a new template with the merged content.
 */
export declare const mergeTemplates: (existing: RemoteConfigTemplate, incoming: Partial<RemoteConfigTemplate>) => RemoteConfigTemplate;
/**
 * Remove a parameter from a template (immutable).
 */
export declare const removeParameter: (template: RemoteConfigTemplate, boundedContext: string, flagKey: string) => RemoteConfigTemplate;
/**
 * Update the default value of an existing parameter (immutable).
 */
export declare const updateParameterValue: (template: RemoteConfigTemplate, flagKey: string, newValue: string) => RemoteConfigTemplate;
/**
 * Get all flag keys from a template that match the standard pattern.
 */
export declare const extractFlagKeys: (template: RemoteConfigTemplate) => readonly string[];
/**
 * Find a parameter in any group by its key.
 */
export declare const findParameter: (template: RemoteConfigTemplate, flagKey: string) => {
    groupName: string;
    parameter: RemoteConfigParameter;
} | null;
/**
 * Create an empty template.
 */
export declare const createEmptyTemplate: () => RemoteConfigTemplate;
//# sourceMappingURL=template.d.ts.map