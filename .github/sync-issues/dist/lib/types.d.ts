/**
 * types.ts
 *
 * Core type definitions for Firebase Remote Config synchronization.
 * All interfaces are immutable (readonly) and explicit.
 */
/** Supported value types in Firebase Remote Config */
export type ValueType = "BOOLEAN" | "STRING" | "NUMBER" | "JSON";
/** User-friendly namespace names */
export type NamespaceAlias = "client" | "server";
/** Firebase API namespace names */
export type FirebaseNamespace = "firebase" | "firebase-server";
/** Remote Config parameter value */
export interface ParameterValue {
    readonly value: string;
}
/** Remote Config parameter with all properties */
export interface RemoteConfigParameter {
    readonly defaultValue: ParameterValue;
    readonly description: string;
    readonly valueType: ValueType;
    readonly conditionalValues?: Readonly<Record<string, ParameterValue>>;
}
/** Parameter group containing related parameters */
export interface ParameterGroup {
    readonly parameters: Readonly<Record<string, RemoteConfigParameter>>;
    readonly description?: string;
}
/** Remote Config condition */
export interface RemoteConfigCondition {
    readonly name: string;
    readonly expression: string;
    readonly tagColor?: string;
}
/** Version metadata */
export interface TemplateVersion {
    readonly versionNumber: string;
    readonly updateTime?: string;
    readonly updateUser?: {
        email: string;
    };
    readonly updateOrigin?: string;
    readonly updateType?: string;
}
/** Complete Firebase Remote Config template */
export interface RemoteConfigTemplate {
    readonly conditions?: readonly RemoteConfigCondition[];
    readonly parameterGroups: Readonly<Record<string, ParameterGroup>>;
    readonly version?: TemplateVersion;
}
/** Flag configuration parsed from markdown table */
export interface FlagConfig {
    readonly context: string;
    readonly type: ValueType;
    readonly namespace: NamespaceAlias;
    readonly defaultDev: string;
    readonly defaultStg: string;
    readonly defaultProd: string;
    readonly key: string;
}
/** Result of parsing a flag block */
export interface FlagBlockParseResult {
    readonly flags: readonly FlagConfig[];
    readonly header: readonly string[];
    readonly separator: readonly string[];
    readonly rows: readonly string[];
    readonly original: string;
}
/** Feature frontmatter fields */
export interface FeatureFrontmatter {
    readonly feature_name?: string;
    readonly bounded_context?: string;
    readonly parent_epic?: string;
    readonly status?: string;
    readonly issue_number?: number;
    readonly issue_url?: string;
    readonly issue_id?: string;
    readonly flag_issue_number?: number;
    readonly flag_key?: string;
    readonly flag_context?: string;
}
/** Parsed frontmatter result */
export interface FrontmatterParseResult {
    readonly data: FeatureFrontmatter;
    readonly body: string;
    readonly rawYaml: string;
}
/** Environment identifier */
export type EnvironmentId = "dev-ecom-test" | "stg-ecom-test" | "prod-ecom-test";
/** Environment configuration */
export interface EnvironmentConfig {
    readonly id: EnvironmentId;
    readonly projectId: string;
    readonly isProduction: boolean;
}
/** Firebase project mapping */
export declare const FIREBASE_PROJECTS: Readonly<Record<EnvironmentId, EnvironmentConfig>>;
/** Namespace mapping: user-friendly -> Firebase API */
export declare const NAMESPACE_MAP: Readonly<Record<NamespaceAlias, FirebaseNamespace>>;
/** Result of a provisioning operation */
export interface ProvisionResult {
    readonly success: boolean;
    readonly flagKey: string;
    readonly environment: EnvironmentId;
    readonly error?: string;
}
/** Summary of sync operation */
export interface SyncSummary {
    readonly provisioned: number;
    readonly skipped: number;
    readonly errors: number;
    readonly results: readonly ProvisionResult[];
}
/** Command-line arguments */
export interface CliArgs {
    readonly env: EnvironmentId;
    readonly dryRun: boolean;
}
/** Repository owner and name */
export interface RepoInfo {
    readonly owner: string;
    readonly repo: string;
}
/** GitHub Issue data */
export interface IssueData {
    readonly number: number;
    readonly id: string;
    readonly nodeId: string;
    readonly url: string;
    readonly title: string;
}
/** Rename operation result */
export interface RenameOperation {
    readonly oldPath: string;
    readonly newPath: string;
    readonly oldName: string;
    readonly newName: string;
}
/** Epic document frontmatter */
export interface EpicFrontmatter {
    readonly epic_name?: string;
    readonly issue_url?: string;
    readonly issue_number?: number;
    readonly issue_id?: string;
}
/** Document processing result */
export interface DocProcessResult {
    readonly type: "Epic" | "Feature";
    readonly id: string | null;
    readonly number: number | null;
    readonly url: string | null;
    readonly renamed: RenameOperation | null;
    readonly flagIssueNumber?: number | null;
}
/** Issue type mapping */
export type IssueTypeName = "Epic" | "Feature" | "Flag";
/** Issue creation request */
export interface CreateIssueRequest {
    readonly owner: string;
    readonly repo: string;
    readonly title: string;
    readonly body: string;
    readonly type?: IssueTypeName;
}
/** Link update for markdown files */
export interface LinkUpdate {
    readonly pattern: RegExp;
    readonly replacement: string;
}
//# sourceMappingURL=types.d.ts.map