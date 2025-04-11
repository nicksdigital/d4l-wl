# TypeScript Test Fixes

This document provides instructions for fixing the TypeScript errors in your test files.

## 1. Test Framework Type Definitions

Install the necessary type definitions for your test framework:

```bash
npm install --save-dev @types/mocha @types/jest
```

This will fix errors like "Cannot find name 'describe'", "Cannot find name 'it'", etc.

## 2. Fix Contract Type Issues

The TypeScript errors in your test files are mostly related to contract types not matching the expected interfaces. There are three approaches to fix this:

### Option 1: Use Type Assertions (Quick Fix)

You can use type assertions to tell TypeScript the contract instances match your expected interfaces:

```typescript
// Example
const wishlistRegistry = await WishlistRegistryFactory.deploy(owner.address) as unknown as WishlistRegistry;
```

Update each contract deployment in your test files with the appropriate type assertion.

### Option 2: Update Interface Implementations (Better but More Work)

Create factory functions that properly map deployed contracts to your interfaces:

```typescript
// Add this to a test helper file
export async function deployWishlistRegistry(factory: any, owner: string): Promise<WishlistRegistry> {
  const contract = await factory.deploy(owner);
  return contract as WishlistRegistry;
}
```

### Option 3: Generate Proper Type Definitions (Best)

Run Hardhat's TypeChain task to generate type definitions from your contract ABIs:

```bash
npx hardhat typechain
```

## 3. Missing Method Errors

For errors like "Property 'register' does not exist on type 'BaseContract'", use type assertions:

```typescript
// Before
await wishlistRegistry.connect(user1).register("user1@example.com", "user1_social");

// After
await (wishlistRegistry.connect(user1) as any).register("user1@example.com", "user1_social");
```

## 4. BigInt/Number Conversion Issues

For arguments that expect strings instead of BigInt:

```typescript
// Instead of
ethers.parseEther("1000000")

// Use
ethers.parseEther("1000000").toString()
```

## 5. Adding Chai Matchers

Make sure your test setup properly includes chai matchers:

```typescript
// At the top of each test file
import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
```

## Important Note

These test file fixes are primarily for TypeScript compilation. For the tests to actually run correctly, you'll need proper contract ABI definitions and a working Hardhat environment with all the necessary plugins configured.

If you're not actively running these tests right now, you can temporarily disable type checking for these files by adding them to the `exclude` array in your `tsconfig.json`:

```json
{
  "exclude": ["node_modules", "sample_tests/**/*.ts"]
}
```
