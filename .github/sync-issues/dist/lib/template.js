/**
 * template.ts
 *
 * Pure functions for Remote Config template manipulation.
 * All functions are immutable - they return new objects.
 */
/**
 * Validate that a value type is valid.
 */
export const isValidValueType = (type) => ["BOOLEAN", "STRING", "NUMBER", "JSON"].includes(type);
/**
 * Normalize a value type, defaulting to STRING if invalid.
 */
export const normalizeValueType = (type) => isValidValueType(type) ? type : "STRING";
/**
 * Create a Remote Config parameter.
 */
export const createParameter = (defaultValue, description, valueType) => ({
    defaultValue: { value: String(defaultValue) },
    description,
    valueType,
});
/**
 * Create a parameter group with a single parameter.
 */
export const createParameterGroup = (flagKey, parameter) => ({
    parameters: {
        [flagKey]: parameter,
    },
});
/**
 * Create a partial template with a single parameter in a group.
 */
export const createTemplateFragment = (boundedContext, flagKey, defaultValue, description, valueType) => ({
    parameterGroups: {
        [boundedContext]: createParameterGroup(flagKey, createParameter(defaultValue, description, valueType)),
    },
});
/**
 * Merge parameter groups from two sources (immutable).
 */
const mergeParameterGroups = (existing, incoming) => {
    const result = { ...existing };
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
export const mergeTemplates = (existing, incoming) => {
    const mergedGroups = mergeParameterGroups(existing.parameterGroups ?? {}, incoming.parameterGroups ?? {});
    // Return new template without version field (Firebase auto-generates it)
    return {
        conditions: existing.conditions ?? [],
        parameterGroups: mergedGroups,
    };
};
/**
 * Remove a parameter from a template (immutable).
 */
export const removeParameter = (template, boundedContext, flagKey) => {
    const groups = { ...template.parameterGroups };
    if (groups[boundedContext]?.parameters[flagKey]) {
        const { [flagKey]: _, ...remainingParams } = groups[boundedContext].parameters;
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
export const updateParameterValue = (template, flagKey, newValue) => {
    const groups = {};
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
        }
        else {
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
export const extractFlagKeys = (template) => {
    const keys = [];
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
export const findParameter = (template, flagKey) => {
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
export const createEmptyTemplate = () => ({
    conditions: [],
    parameterGroups: {},
});
//# sourceMappingURL=template.js.map