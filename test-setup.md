# Test Setup Guide

To fix the test errors in your project, follow these steps:

## 1. Install Required Dependencies

Run the `install-deps.sh` script to install all necessary dependencies:

```bash
chmod +x install-deps.sh
./install-deps.sh
```

## 2. Update Test Files

For each test file, make sure you have the proper imports:

```typescript
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import "@nomicfoundation/hardhat-chai-matchers";
```

## 3. Fix the Chai Assertion Errors

Replace `.reverted` with proper chai-matchers assertions:

```typescript
// From:
await expect(contract.someFunction()).to.be.reverted;

// To:
await expect(contract.someFunction()).to.be.reverted;
```

Replace `.revertedWithCustomError` with proper chai-matchers assertions:

```typescript
// From:
await expect(contract.someFunction()).to.be.revertedWithCustomError(contract, "ErrorName");

// To:
await expect(contract.someFunction()).to.be.revertedWithCustomError(contract, "ErrorName");
```

## 4. TypeScript Configuration

Make sure your `tsconfig.json` has been updated to target ES2020 or higher to support BigInt literals.

## 5. Update Ethers.js References

Please refer to the changes made in `src/app/api/fallback/airdrop/route.ts` for examples of how to update from ethers v5 to v6 syntax:

- Replace `ethers.utils.*` with direct ethers functions
- Use `ethers.JsonRpcProvider` instead of `ethers.providers.JsonRpcProvider`
- Use native BigInt instead of ethers.BigNumber where possible
- Update type handling for errors and other values

## 6. Redis Type Error Fix

If you encounter type errors with Redis, add proper type assertions:

```typescript
const results = await pipeline.exec() as unknown as RedisMultiExecResult;
```
