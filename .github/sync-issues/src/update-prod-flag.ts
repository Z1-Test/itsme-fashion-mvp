/**
 * update-prod-flag.ts
 *
 * Updates a single flag value in production Firebase Remote Config.
 * Creates an audit trail via GitHub Actions summary.
 *
 * Usage:
 *   node dist/src/update-prod-flag.js --key=<flag_key> --value=<value>
 */

import { parseFrontmatter, parseFlagBlock } from "../lib/parser.js";
import { findParameter, updateParameterValue } from "../lib/template.js";
import {
    getAccessToken,
    fetchTemplate,
    publishTemplate,
    log,
} from "../lib/effects.js";
import { FIREBASE_PROJECTS } from "../lib/types.js";
import type { FirebaseNamespace } from "../lib/types.js";

// ============================================================================
// CLI Argument Parsing
// ============================================================================

interface UpdateArgs {
    readonly flagKey: string;
    readonly value: string;
    readonly reason: string;
}

const parseCliArgs = (argv: readonly string[]): UpdateArgs => {
    const args = argv.slice(2);

    const getArg = (name: string): string => {
        const arg = args.find((a) => a.startsWith(`--${name}=`));
        return arg ? arg.split("=").slice(1).join("=") : "";
    };

    return {
        flagKey: getArg("key"),
        value: getArg("value"),
        reason: getArg("reason") || "Manual update",
    };
};

// ============================================================================
// Main
// ============================================================================

const main = async (): Promise<void> => {
    const { flagKey, value, reason } = parseCliArgs(process.argv);

    if (!flagKey || !value) {
        log.error("Usage: update-prod-flag.js --key=<flag_key> --value=<value> [--reason=<reason>]");
        process.exit(1);
    }

    log.info("🔧 Update Production Flag");
    log.info(`Flag: ${flagKey}`);
    log.info(`Value: ${value}`);
    log.info(`Reason: ${reason}`);
    log.divider();

    const prodConfig = FIREBASE_PROJECTS["prod-ecom-test"];
    const namespace: FirebaseNamespace = "firebase";

    // Get access token
    const accessToken = getAccessToken();

    // Fetch current template
    const template = fetchTemplate(prodConfig.projectId, namespace, accessToken);
    if (!template) {
        log.error("Failed to fetch production template");
        process.exit(1);
    }

    // Find the parameter
    const found = findParameter(template, flagKey);
    if (!found) {
        log.error(`Flag ${flagKey} not found in production template`);
        process.exit(1);
    }

    log.info(`Found in group: ${found.groupName}`);
    log.info(`Current value: ${found.parameter.defaultValue.value}`);

    // Update the value
    const updated = updateParameterValue(template, flagKey, value);

    // Publish
    const success = publishTemplate(prodConfig.projectId, updated, namespace, accessToken);

    if (success) {
        log.success(`Updated ${flagKey} to ${value}`);
    } else {
        log.error("Failed to publish updated template");
        process.exit(1);
    }
};

// Run
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
