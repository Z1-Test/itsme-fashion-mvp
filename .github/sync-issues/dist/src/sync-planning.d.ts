#!/usr/bin/env node
/**
 * sync-planning.ts
 *
 * Main orchestrator for the Planning Lifecycle Sync workflow.
 *
 * Operations:
 * 1. Scans docs/epics/ and docs/features/
 * 2. Creates GitHub Issues for new documents
 * 3. Links Features to Epics as sub-issues
 * 4. Updates frontmatter with issue_url
 * 5. Renames files with issue numbers (e.g. feat-12-name.md)
 * 6. Fixes all internal links
 * 7. Syncs local MD content to GitHub Issue body
 * 8. Creates a "Sync Cleanup" PR if names changed
 */
export {};
//# sourceMappingURL=sync-planning.d.ts.map