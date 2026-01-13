/**
 * template.ts
 *
 * Pure functions for Remote Config template manipulation.
 * All functions are immutable - they return new objects.
 */

import type {
    ValueType,
    RemoteConfigTemplate,
    RemoteConfigParameter,
    ParameterGroup,
} from "./types.js";

/**
 * Validate that a value type is valid.
 */
export const isValidValueType = (type: string): type is ValueType =>
    ["BOOLEAN", "STRING", "NUMBER", "JSON"].includes(type);

/**
 * Normalize a value type, defaulting to STRING if invalid.
 */
export const normalizeValueType = (type: string): ValueType =>
    isValidValueType(type) ? type : "STRING";

/**
 * Create a Remote Config parameter.
 */
export const createParameter = (
    defaultValue: string,
    description: string,
    valueType: ValueType
): RemoteConfigParameter => ({
    defaultValue: { value: String(defaultValue) },
    description,
    valueType,
});

/**
 * Create a parameter group with a single parameter.
 */
export const createParameterGroup = (
    flagKey: string,
    parameter: RemoteConfigParameter
): ParameterGroup => ({
    parameters: {
        [flagKey]: parameter,
    },
});

/**
 * Create a partial template with a single parameter in a group.
 */
export const createTemplateFragment = (
    boundedContext: string,
    flagKey: string,
    defaultValue: string,
    description: string,
    valueType: ValueType
): Partial<RemoteConfigTemplate> => ({
    parameterGroups: {
        [boundedContext]: createParameterGroup(
            flagKey,
            createParameter(defaultValue, description, valueType)
        ),
    },
});

/**
 * Merge parameter groups from two sources (immutable).
 */
const mergeParameterGroups = (
    existing: Readonly<Record<string, ParameterGroup>>,
    incoming: Readonly<Record<string, ParameterGroup>>
): Readonly<Record<string, ParameterGroup>> => {
    const result: Record<string, ParameterGroup> = { ...existing };

    for (const [groupName, groupData] of Object.entries(incoming)) {
        if (!result[groupName]) {
            result[groupName] = { parameters: {} };
        }

        result[groupName] = {
            ...result[groupName],
            parameters: {
                ...result[groupName].parameters,
                ...groupData.parameters,
            },
        };
    }

    return result;
};

/**
 * Merge an incoming template fragment into an existing template (immutable).
 * Returns a new template with the merged content.
 */
export const mergeTemplates = (
    existing: RemoteConfigTemplate,
    incoming: Partial<RemoteConfigTemplate>
): RemoteConfigTemplate => {
    const mergedGroups = mergeParameterGroups(
        existing.parameterGroups ?? {},
        incoming.parameterGroups ?? {}
    );

    // Return new template without version field (Firebase auto-generates it)
    return {
        conditions: existing.conditions ?? [],
        parameterGroups: mergedGroups,
    };
};

/**
 * Remove a parameter from a template (immutable).
 */
export const removeParameter = (
    template: RemoteConfigTemplate,
    boundedContext: string,
    flagKey: string
): RemoteConfigTemplate => {
    const groups = { ...template.parameterGroups };

    if (groups[boundedContext]?.parameters[flagKey]) {
        const { [flagKey]: _, ...remainingParams } =
            groups[boundedContext].parameters;

        if (Object.keys(remainingParams).length === 0) {
            // Remove empty group
            const { [boundedContext]: __, ...remainingGroups } = groups;
            return {
                conditions: template.conditions ?? [],
                parameterGroups: remainingGroups,
            };
        }

        groups[boundedContext] = {
            ...groups[boundedContext],
            parameters: remainingParams,
        };
    }

    return {
        conditions: template.conditions ?? [],
        parameterGroups: groups,
    };
};

/**
 * Update the default value of an existing parameter (immutable).
 */
export const updateParameterValue = (
    template: RemoteConfigTemplate,
    flagKey: string,
    newValue: string
): RemoteConfigTemplate => {
    const groups: Record<string, ParameterGroup> = {};

    for (const [groupName, groupData] of Object.entries(template.parameterGroups)) {
        if (groupData.parameters[flagKey]) {
            groups[groupName] = {
                ...groupData,
                parameters: {
                    ...groupData.parameters,
                    [flagKey]: {
                        ...groupData.parameters[flagKey],
                        defaultValue: { value: newValue },
                    },
                },
            };
        } else {
            groups[groupName] = groupData;
        }
    }

    return {
        conditions: template.conditions ?? [],
        parameterGroups: groups,
    };
};

/**
 * Get all flag keys from a template that match the standard pattern.
 */
export const extractFlagKeys = (template: RemoteConfigTemplate): readonly string[] => {
    const keys: string[] = [];

    for (const group of Object.values(template.parameterGroups ?? {})) {
        for (const key of Object.keys(group.parameters ?? {})) {
            if (key.startsWith("feature_fe_")) {
                keys.push(key);
            }
        }
    }

    return keys;
};

/**
 * Find a parameter in any group by its key.
 */
export const findParameter = (
    template: RemoteConfigTemplate,
    flagKey: string
): { groupName: string; parameter: RemoteConfigParameter } | null => {
    for (const [groupName, groupData] of Object.entries(template.parameterGroups ?? {})) {
        if (groupData.parameters[flagKey]) {
            return { groupName, parameter: groupData.parameters[flagKey] };
        }
    }
    return null;
};

/**
 * Create an empty template.
 */
export const createEmptyTemplate = (): RemoteConfigTemplate => ({
    conditions: [],
    parameterGroups: {},
});
