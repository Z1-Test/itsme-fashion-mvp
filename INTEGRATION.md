# Frontend Integration Guide

## Overview

The project has been successfully integrated with the `app` and `packages` folders, creating a complete monorepo structure with:

- Frontend application (Lit + Vite)
- Design system and shared utilities packages
- Firebase Cloud Functions services
- Firebase hosting for the web app

## Project Structure

```
itsme-fashion-mvp/
├── src/
│   ├── app/                    # Frontend Vite application
│   │   ├── src/                # App source code
│   │   ├── package.json        # App dependencies
│   │   ├── tsconfig.json       # App TypeScript config
│   │   └── vite.config.ts      # Vite configuration
│   │
│   ├── packages/               # Shared packages
│   │   ├── design-system/      # UI components (Lit)
│   │   └── shared-utils/       # Utility functions
│   │
│   └── services/               # Firebase Cloud Functions
│       ├── cart/
│       ├── catalog/
│       ├── delivery/
│       ├── identity/
│       ├── payments/
│       └── wishList/
│
├── firebase.json               # Firebase configuration
├── package.json                # Root workspace configuration
└── tsconfig.json               # Root TypeScript config
```

## Key Integration Changes

### 1. **Workspace Configuration** ([package.json](package.json))

- Configured npm workspaces for all packages
- Added build scripts that respect dependency order
- Added development scripts for frontend and backend

### 2. **TypeScript Project References**

- All services now support composite builds with `composite: true`
- Declaration files are generated for proper type checking
- App references all required packages and services

### 3. **Firebase Hosting** ([firebase.json](firebase.json))

- Configured to serve the Vite build output from `src/app/dist`
- Added hosting emulator on port 5000
- Configured SPA routing with catch-all rewrite

### 4. **Vite Configuration** ([src/app/vite.config.ts](src/app/vite.config.ts))

- Added path aliases for package imports
- Configured proxy to Firebase Functions emulator
- Set up proper build output directory

### 5. **Build Artifacts** ([.gitignore](.gitignore))

- Added ignore patterns for all build outputs
- Included TypeScript build info files
- Properly ignoring dist and lib folders

## Available Scripts

### Development

```bash
# Run frontend app only (Vite dev server on port 3000)
npm run dev:app

# Run Firebase emulators only (Functions, Firestore, Auth, Storage)
npm run emulators:start

# Run both frontend and backend together (recommended for full development)
npm run dev:full
```

### Building

```bash
# Build shared packages (design-system, shared-utils)
npm run build:packages

# Build Firebase Cloud Functions services
npm run build:services

# Build frontend app
npm run build:app

# Build everything (packages + services)
npm run build
```

### Individual Package Commands

```bash
# Work with specific workspace packages
npm run dev -w @itsme/app
npm run build -w @itsme/design-system
npm run build -w @itsme/shared-utils
```

## Development Workflow

### Starting Development

1. **Install dependencies** (if not already done):

   ```bash
   npm install
   ```

2. **Start the development environment**:

   ```bash
   # Option 1: Just frontend (recommended for UI development)
   npm run dev:app

   # Option 2: Frontend + Backend (full stack development)
   npm run dev:full
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000 (Vite dev server)
   - Firebase UI: http://localhost:4000 (when emulators are running)
   - Functions: http://localhost:5001
   - Firestore: http://localhost:8080
   - Auth: http://localhost:9099

### Making Changes

#### Frontend Code (App)

- Edit files in `src/app/src/`
- Changes hot-reload automatically via Vite
- API calls to `/api/*` are proxied to Functions emulator

#### Design System Components

- Edit files in `src/packages/design-system/src/`
- Run `npm run build -w @itsme/design-system` to rebuild
- Restart the app dev server to see changes

#### Shared Utilities

- Edit files in `src/packages/shared-utils/src/`
- Run `npm run build -w @itsme/shared-utils` to rebuild
- Restart the app dev server to see changes

#### Cloud Functions

- Edit files in `src/services/*/src/`
- Functions automatically rebuild and reload in emulator

### Building for Production

```bash
# Build everything in the correct order
npm run build        # Services and packages
npm run build:app    # Frontend application

# Deploy to Firebase
firebase deploy
```

## Integration Features

### ✅ Monorepo with npm Workspaces

- All packages installed via single `npm install` at root
- Dependencies shared across workspaces
- Proper TypeScript project references

### ✅ Development Server

- Vite dev server with hot module replacement
- API proxy to Firebase Functions emulator
- Concurrent frontend/backend development

### ✅ TypeScript Support

- Composite builds for incremental compilation
- Type checking across workspace packages
- Declaration files for all libraries

### ✅ Firebase Integration

- Hosting configuration for SPA deployment
- Functions emulator integration
- Auth, Firestore, and Storage emulators

### ✅ Build System

- Coordinated build scripts
- Proper dependency order (packages → services → app)
- Separate dev and production builds

## Package Dependencies

The app depends on:

- `@itsme/design-system` - UI component library (Lit)
- `@itsme/shared-utils` - Shared utility functions
- `@itsme/service-catalog` - Product catalog types/interfaces
- `@itsme/service-identity` - User authentication types
- `@itsme/service-cart` - Shopping cart types
- `@itsme/service-payments` - Payment types
- `@itsme/service-delivery` - Delivery tracking types

All internal dependencies use `*` version to always use workspace versions.

## Troubleshooting

### "Cannot find module" errors

1. Build the packages first: `npm run build:packages`
2. Ensure TypeScript project references are correct
3. Check that paths in tsconfig.json are properly configured

### Vite dev server not starting

1. Check if port 3000 is available
2. Ensure all dependencies are installed: `npm install`
3. Try cleaning build artifacts: `rm -rf src/*/dist src/*/lib`

### Functions not responding

1. Ensure emulators are running: `npm run emulators:start`
2. Check that services are built: `npm run build:services`
3. Verify the proxy configuration in vite.config.ts

### Type errors in editor

1. Build all packages: `npm run build:packages`
2. Restart your TypeScript server in VS Code
3. Check that all tsconfig.json files have correct references

## Next Steps

- ✅ Workspace structure configured
- ✅ Development scripts ready
- ✅ Build system operational
- ✅ Firebase hosting configured
- 🔄 Ready for development!

You can now start developing with:

```bash
npm run dev:app
```

For full-stack development with backend:

```bash
npm run dev:full
```
