# 🔄 Planning Lifecycle Sync Scripts

Automation scripts for syncing planning documentation with GitHub Issues after Requirement Agent workflow completion.

## 📁 Structure

```
scripts/sync-issues/
├── sync-planning.js          # Main orchestration script
└── lib/
    ├── document-processor.js # Parse and process markdown docs
    ├── file-operations.js    # File system operations
    ├── git-operations.js     # Git commit/push operations
    ├── github-api.js         # GitHub API interactions
    └── rename-manager.js     # File renaming with issue numbers
```

## 🎯 Purpose

This automation runs **after** the Planning PR is merged to `main` and:

1. ✅ Creates GitHub Issues for all Epic and Feature documents
2. ✅ Links Features as sub-issues to their parent Epics
3. ✅ Creates Flag issues linked to Features
4. ✅ Updates frontmatter with `issue_url` and `issue_number`
5. ✅ Renames files with issue number prefixes (e.g., `feat-12-login.md`)
6. ✅ Repairs internal document links to match new filenames
7. ✅ Creates cleanup PR: `docs: sync issue identities`

## 🚀 Workflow Trigger

Defined in `.github/workflows/sync-planning.yml`:

- **Trigger:** Push to `main` branch
- **Paths:** Changes to `docs/epics/`, `docs/features/`, `docs/product/`, `docs/execution/`
- **Permissions:** `issues: write`, `pull-requests: write`, `contents: write`

## 📋 Prerequisites

- GitHub token with appropriate permissions (automatically provided by GitHub Actions)
- Node.js 20+
- Repository with `docs/` structure as defined by Requirement Agent

## 🔧 Usage

### Automatic (GitHub Actions)

Runs automatically when Planning PR is merged to `main`.

### Manual Testing

```bash
# Set GitHub token
export GH_TOKEN=your_github_token

# Run script
node scripts/sync-issues/sync-planning.js
```

## 📝 What Gets Created

### Epic Issues

- **Type:** Epic (if available in repo)
- **Title:** Epic name from frontmatter
- **Body:** Epic document content

### Feature Issues

- **Type:** Feature (if available in repo)
- **Title:** Feature name from frontmatter
- **Body:** Feature document content with Gherkin scenarios
- **Parent:** Linked to Epic via Sub-issue API

### Flag Issues

- **Type:** Flag (if available in repo)
- **Title:** `feature_fe_{feature_issue}_fl_{flag_issue}_{context}_enabled`
- **Body:** Feature flag configuration
- **Parent:** Linked to Feature via Sub-issue API

## 🔄 File Renaming Convention

**Before:**

```
docs/features/auth/feat-login.md
```

**After:**

```
docs/features/auth/feat-12-login.md
```

Where `12` is the GitHub issue number.

## ⚙️ Configuration

No configuration needed. Script reads:

- Repository structure from `docs/`
- Frontmatter from markdown files
- Issue types from GitHub API

## 🐛 Troubleshooting

### Script fails with "Invalid frontmatter"

→ Ensure all feature files have valid YAML frontmatter with required fields:

- `feature_name`
- `parent_epic`
- `bounded_context`

### Issues not created

→ Check GitHub Actions logs for API errors
→ Verify token permissions

### Links not repaired

→ Ensure links use relative paths
→ Check that linked files exist

## 📚 Related Documentation

- Requirement Agent: `instructions/agents/Requirement.md`
- Quick Start Guide: `instructions/agents/README.md`
- Feature Template: `instructions/skills/doc-feature-specification/assets/feature-spec.template.md`

---

**Last Updated:** 2026-01-01
