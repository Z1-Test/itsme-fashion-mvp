/**
 * sync-remote-config.ts
 *
 * Main orchestrator for Remote Config flag synchronization.
 * Composes pure logic functions with effects to provision flags.
 *
 * Usage:
 *   node dist/src/sync-remote-config.js --env=dev-ecom-test [--dry-run]
 */

import { join } from "node:path";
import { deriveFlagKey } from "../lib/flag-key.js";
import { createTemplateFragment, mergeTemplates, createEmptyTemplate, extractFlagKeys } from "../lib/template.js";
import { parseFrontmatter, parseFlagBlock } from "../lib/parser.js";
import {
    readFile,
    listMarkdownFiles,
    fileExists,
    getAccessToken,
    fetchTemplate,
    publishTemplate,
    resolveNamespace,
    log,
} from "../lib/effects.js";
import type {
    CliArgs,
    EnvironmentId,
    ProvisionResult,
    SyncSummary,
    FlagConfig,
    FeatureFrontmatter,
    RemoteConfigTemplate,
} from "../lib/types.js";
import { FIREBASE_PROJECTS } from "../lib/types.js";

// ============================================================================
// CLI Argument Parsing
// ============================================================================

const parseCliArgs = (argv: readonly string[]): CliArgs => {
    const args = argv.slice(2);

    const getArg = (name: string): string | null => {
        const arg = args.find((a) => a.startsWith(`--${name}=`));
        return arg ? arg.split("=")[1] : null;
    };

    const env = (getArg("env") ?? "dev-ecom-test") as EnvironmentId;
    const cliDryRun = args.includes("--dry-run");
    const envDryRun = process.env.DRY_RUN === "true";

    return { env, dryRun: cliDryRun || envDryRun };
};

// ============================================================================
// Core Provisioning Logic
// ============================================================================

/**
 * Determine default value for a flag based on environment.
 */
const getDefaultValueForEnv = (
    flag: FlagConfig,
    env: EnvironmentId
): string => {
    if (env.includes("dev")) return flag.defaultDev;
    if (env.includes("stg")) return flag.defaultStg;
    return flag.defaultProd;
};

/**
 * Provision a single flag to all environments.
 */
const provisionFlag = (
    featureNumber: number,
    flagNumber: number,
    flag: FlagConfig,
    boundedContext: string,
    description: string,
    accessToken: string,
    targetEnv: EnvironmentId,
    projectId: string,
    dryRun: boolean
): ProvisionResult => {
    const flagKey = deriveFlagKey(featureNumber, flagNumber, flag.context);
    const firebaseNamespace = resolveNamespace(flag.namespace);

    log.info(`   🔧 Flag: ${flag.context}`);
    log.info(`      Type: ${flag.type}, Namespace: ${firebaseNamespace}`);
    log.info(`      Key: ${flagKey}`);

    const defaultValue = getDefaultValueForEnv(flag, targetEnv);

    if (dryRun) {
        log.info(`      [DRY-RUN] Would provision ${flagKey} = ${defaultValue} to ${targetEnv}`);
        return { success: true, flagKey, environment: targetEnv };
    }

    // Fetch existing template
    const existing = fetchTemplate(projectId, firebaseNamespace, accessToken);
    if (!existing) {
        return { success: false, flagKey, environment: targetEnv, error: "fetch_failed" };
    }

    // Create new parameter fragment
    const fragment = createTemplateFragment(
        boundedContext,
        flagKey,
        defaultValue,
        description,
        flag.type
    );

    // Merge and publish
    const merged = mergeTemplates(existing, fragment);
    const success = publishTemplate(projectId, merged, firebaseNamespace, accessToken);

    return { success, flagKey, environment: targetEnv };
};

// ============================================================================
// Main Orchestrator
// ============================================================================

const main = async (): Promise<void> => {
    const args = parseCliArgs(process.argv);

    log.info("🔥 Remote Config Sync (TypeScript)");
    log.info(`Target Environment: ${args.env}`);

    // Prioritize environment variable from GitHub Actions secrets
    const projectId = process.env.FIREBASE_PROJECT_ID || FIREBASE_PROJECTS[args.env]?.projectId;

    log.info(`Firebase Project: ${projectId}`);
    log.info(`Dry Run: ${args.dryRun}`);
    log.divider();

    if (!projectId) {
        log.error(`No project ID found for environment: ${args.env}`);
        process.exit(1);
    }

    const featuresDir = join(process.cwd(), "docs/features");

    if (!fileExists(featuresDir)) {
        log.info("No features directory found. Skipping.");
        return;
    }

    // Get access token upfront
    const accessToken = getAccessToken();


    // Cache templates to avoid redundant fetches
    const templates: Record<string, RemoteConfigTemplate | null> = {
        "firebase": null,
        "firebase-server": null
    };

    const files = listMarkdownFiles(featuresDir);
    let provisioned = 0;
    let skipped = 0;

    for (const filePath of files) {
        const content = readFile(filePath);
        const { data } = parseFrontmatter(content);

        // Skip if no flag issue or feature issue
        if (!data.flag_issue_number || !data.issue_number) {
            log.skip(`${filePath.split("/").pop()} - no flag issue`);
            skipped++;
            continue;
        }

        // Parse flag block
        const blockResult = parseFlagBlock(content);
        if (!blockResult || blockResult.flags.length === 0) {
            log.skip(`${filePath.split("/").pop()} - no flag block`);
            skipped++;
            continue;
        }

        const featureNumber = data.issue_number;
        const flagNumber = data.flag_issue_number;
        const boundedContext = data.bounded_context ?? "general";
        const description = data.feature_name ?? `Feature ${featureNumber}`;

        log.section(`Processing: ${filePath.split("/").pop()}`);
        log.info(`   Feature #${featureNumber}, Flag #${flagNumber}`);

        // Process each flag in the block
        for (const flag of blockResult.flags) {
            const flagKey = deriveFlagKey(featureNumber, flagNumber, flag.context);
            const firebaseNamespace = resolveNamespace(flag.namespace);

            // Fetch template for this namespace if not already cached
            if (!templates[firebaseNamespace]) {
                log.info(`   📥 Fetching template for ${firebaseNamespace}...`);
                templates[firebaseNamespace] = fetchTemplate(projectId, firebaseNamespace, accessToken);
            }


            const currentTemplate = templates[firebaseNamespace];

            // Check if flag already exists in the project's Remote Config
            const existsInProject = currentTemplate ? !!extractFlagKeys(currentTemplate).includes(flagKey) : false;

            if (existsInProject) {
                log.skip(`   Flag "${flag.context}" already exists in project ${projectId}`);
                continue;
            }

            // Also skip if it has a key that is NOT auto-generated AND it exists? 
            // Actually, if it's missing from project, we MUST provision it.

            const result = provisionFlag(
                featureNumber,
                flagNumber,
                flag,
                boundedContext,
                description,
                accessToken,
                args.env,
                projectId,
                args.dryRun
            );

            if (result.success) {
                log.success(`Provisioned: ${result.flagKey} to ${args.env}`);
                provisioned++;

                // Clear cache for this namespace so next flag fetches updated template
                // (Optimized would be to update the cache locally, but this is safer for now)
                templates[firebaseNamespace] = null;
            }
        }
    }

    log.divider();
    log.info(`📊 Summary: ${provisioned} provisioned, ${skipped} skipped`);
};

// Run
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
