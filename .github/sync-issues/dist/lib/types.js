/**
 * types.ts
 *
 * Core type definitions for Firebase Remote Config synchronization.
 * All interfaces are immutable (readonly) and explicit.
 */
/** Firebase project mapping */
export const FIREBASE_PROJECTS = {
    "dev-ecom-test": {
        id: "dev-ecom-test",
        projectId: "dev-ecom-test-010126",
        isProduction: false,
    },
    "stg-ecom-test": {
        id: "stg-ecom-test",
        projectId: "stg-ecom-test-010126",
        isProduction: false,
    },
    "prod-ecom-test": {
        id: "prod-ecom-test",
        projectId: "prod-ecom-test-010126",
        isProduction: true,
    },
};
/** Namespace mapping: user-friendly -> Firebase API */
export const NAMESPACE_MAP = {
    client: "firebase",
    server: "firebase-server",
};
//# sourceMappingURL=types.js.map