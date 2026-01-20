# Quick Start Guide

## Prerequisites

- Node.js v20+ (project requires Node 24 for Firebase Functions, but v20 works for development)
- npm (comes with Node.js)
- Firebase CLI (install with `npm install -g firebase-tools`)

## Installation

1. **Install all dependencies:**
   ```bash
   npm install
   ```

   This single command installs dependencies for:
   - Root workspace
   - Frontend app
   - All packages (design-system, shared-utils)
   - All services (cart, catalog, identity, etc.)

## Development

### Option 1: Frontend Only (Fastest)

Perfect for UI development and component work:

```bash
npm run dev:app
```

- Opens browser at http://localhost:3000
- Hot reload enabled
- No backend services running

### Option 2: Full Stack (Frontend + Backend)

For testing features that require Firebase services:

```bash
npm run dev:full
```

- Frontend: http://localhost:3000
- Firebase UI: http://localhost:4000
- Functions, Firestore, Auth, and Storage emulators running

### Option 3: Backend Only

To test Firebase Functions separately:

```bash
npm run emulators:start
```

- Firebase UI: http://localhost:4000
- Functions API: http://localhost:5001

## Building

### Build Everything

```bash
npm run build
```

This builds:
1. Shared packages (shared-utils, design-system)
2. Firebase Cloud Functions services

### Build Frontend

```bash
npm run build:app
```

Output: `src/app/dist/`

## Project Structure Quick Reference

```
src/
├── app/              ← Frontend (Vite + Lit)
├── packages/         ← Shared libraries
│   ├── design-system ← UI components
│   └── shared-utils  ← Helper functions
└── services/         ← Firebase Functions
    ├── cart
    ├── catalog
    ├── delivery
    ├── identity
    ├── payments
    └── wishList
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev:app` | Start frontend dev server |
| `npm run dev:full` | Start frontend + backend together |
| `npm run build` | Build packages and services |
| `npm run build:app` | Build frontend only |
| `npm run emulators:start` | Start Firebase emulators |

## Ports

- **3000** - Vite dev server (frontend)
- **4000** - Firebase Emulator UI
- **5000** - Firebase Hosting emulator
- **5001** - Cloud Functions emulator
- **8080** - Firestore emulator
- **9099** - Authentication emulator
- **9199** - Storage emulator

## IDE Setup (VS Code)

Recommended extensions:
- ESLint
- Prettier
- lit-plugin (for Lit components)
- Firebase

The project is configured with TypeScript project references, so IntelliSense will work across all packages.

## Troubleshooting

**Port already in use:**
- Check if another process is using port 3000 or 5001
- Kill the process or change ports in configuration files

**Module not found:**
- Run `npm install` at the root
- Run `npm run build:packages` to build shared libraries

**TypeScript errors in editor:**
- Build packages: `npm run build:packages`
- Reload VS Code window

**Firebase emulator issues:**
- Ensure Firebase CLI is installed: `npm install -g firebase-tools`
- Login to Firebase: `firebase login`

## Next Steps

1. ✅ Installation complete
2. 🚀 Start development with `npm run dev:app`
3. 📚 Read [INTEGRATION.md](INTEGRATION.md) for detailed information
4. 📖 Check [docs/](docs/) for feature documentation

Happy coding! 🎉
