# TypeScript Error Fixes Guide

This guide provides solutions for all the TypeScript errors found in your project. The fixes are organized by file.

## API Route Issues

### File: `src/app/api/fallback/airdrop/route.ts`

1. **FALLBACK Function Error**
   - **Error:** `Type '...' does not satisfy the constraint '{ [x: string]: never; }'`
   - **Fix:** Renamed `FALLBACK` function to `POST` to comply with Next.js route handler conventions
   
2. **Ethers.js v6 Migration**
   - **Errors:** Multiple `Property 'utils' does not exist on type 'ethers'`
   - **Fixes:**
     - Replace `ethers.utils.isAddress()` with `ethers.isAddress()`
     - Replace `ethers.providers.JsonRpcProvider` with `ethers.JsonRpcProvider`
     - Replace `ethers.BigNumber.from()` with `BigInt()`
     - Replace BigNumber operations (like `.mul()`, `.lt()`) with native BigInt operations (`*`, `<`)

3. **Error Handling**
   - **Error:** `'error' is of type 'unknown'`
   - **Fix:** Added proper type checking for error messages:
   ```typescript
   error instanceof Error ? error.message : String(error)
   ```

4. **ContractTransaction Type**
   - **Error:** `Property 'wait' does not exist on type 'ContractTransaction'`
   - **Fix:** Updated to match ethers v6 contract transaction handling

## Database Utilities

### File: `src/utils/dbUtils.ts`

- **Error:** `TS2578: Unused '@ts-expect-error' directive`
- **Fix:** Remove the unused directive on line 257, or add an explanatory comment if it's needed

## Rate Limiting

### File: `src/utils/rateLimit.ts`

- **Error:** `Type 'RedisCommandRawReply[]' is not assignable to type 'RedisMultiExecResult'`
- **Fix:** Add a type assertion when executing Redis pipeline:
```typescript
const results = await pipeline.exec() as unknown as RedisMultiExecResult;
```

## Test Files

These fixes apply to all test files: `sample_tests/*.test.ts`

### Missing Dependencies

- **Error:** `Cannot find module 'hardhat' or its corresponding type declarations`
- **Fix:** Install required dependencies (already prepared in `install-deps.sh`):
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers @nomicfoundation/hardhat-network-helpers @nomicfoundation/hardhat-chai-matchers chai
```

### Chai Assertion Methods

- **Error:** `Property 'reverted' does not exist on type 'Assertion'` and `Property 'revertedWithCustomError' does not exist on type 'Assertion'`
- **Fix:** Import chai matchers in each test file:
```typescript
import "@nomicfoundation/hardhat-chai-matchers";
```

### BigInt Literals

- **Error:** `BigInt literals are not available when targeting lower than ES2020`
- **Fix:** Updated `tsconfig.json` to target ES2020 (already done)

## Implementation Steps

1. Run the dependency installation script:
```bash
chmod +x install-deps.sh
./install-deps.sh
```

2. Apply the specific file changes as outlined above

3. Make sure you address any other project-specific type issues

## Verification Steps

After making all changes, verify that the errors are fixed:

1. Run TypeScript type checking:
```bash
npx tsc --noEmit
```

2. Run the project's linting tool (if applicable):
```bash
npm run lint
```

3. Build the project:
```bash
npm run build
```

4. Run the tests:
```bash
npm test
```

If you encounter any additional issues, review the specific error messages and apply similar fixes as needed.
