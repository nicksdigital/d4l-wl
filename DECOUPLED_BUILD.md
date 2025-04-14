# Decoupled Build Process

This document explains how to build the frontend without compiling d4l_server or hydra_admin.

## Why Decouple?

Decoupling the build process for the frontend, d4l_server, and hydra_admin has several benefits:

1. **Faster builds**: Building only what you need reduces compilation time
2. **Reduced memory usage**: Prevents out-of-memory errors during builds
3. **Cleaner separation of concerns**: Each component can be built independently
4. **Easier maintenance**: Changes to one component don't affect the others

## How to Build Only the Frontend

To build only the frontend, excluding d4l_server and hydra_admin, run:

```bash
npm run build:decoupled
```

This script:
1. Temporarily renames the d4l_server and hydra_admin directories
2. Builds the frontend using Next.js
3. Restores the original directory names

## Configuration

The decoupled build process is configured in several files:

1. **package.json**: Contains the build scripts
2. **.nextignore**: Tells Next.js to ignore d4l_server and hydra_admin
3. **tsconfig.json**: Excludes d4l_server and hydra_admin from TypeScript compilation
4. **scripts/build-frontend-only.js**: Handles the temporary directory renaming

## Building d4l_server and hydra_admin

To build d4l_server:

```bash
cd d4l_server
npm run build
```

To build hydra_admin:

```bash
cd hydra_admin
npm run build
```

## Running the Applications

After building, you can run each application independently:

1. **Frontend**:
   ```bash
   npm run start
   ```

2. **d4l_server**:
   ```bash
   cd d4l_server
   npm run start
   ```

3. **hydra_admin**:
   ```bash
   cd hydra_admin
   npm run start
   ```

## Troubleshooting

If you encounter issues with the decoupled build process:

1. **Memory errors**: Increase the memory limit in the build:frontend-only script
2. **Missing files**: Make sure the directories are properly restored after building
3. **TypeScript errors**: Check that the exclude paths in tsconfig.json are correct
