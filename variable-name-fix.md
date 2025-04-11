# Variable Name Fix

## Issue Fixed
I fixed a compilation error in `src/app/api/airdrop/route.ts` where the variable name `amount` was defined multiple times in the same scope.

## Changes Made
1. Renamed the destructured `amount` variable from the request body to `claimAmount` to avoid the naming conflict:
   ```typescript
   // Changed from
   const { address, amount, proof } = body;
   
   // Changed to
   const { address, proof } = body;
   const claimAmount = body.amount;
   ```

2. Updated references to this variable throughout the code:
   ```typescript
   // Changed conditional check
   if (!address || !claimAmount || !proof) {
     // ...
   }
   
   // Changed proof verification
   const isValid = await contract.verifyProof(proof, address, claimAmount);
   ```

3. Renamed the second `amount` variable (used for the actual token amount) to `tokenAmount`:
   ```typescript
   // Changed from
   const amount = ethersLib.parseUnits('1', 'ether');
   
   // Changed to
   const tokenAmount = ethersLib.parseUnits('1', 'ether');
   ```

4. Updated the reference to this variable in the contract call:
   ```typescript
   // Updated contract call
   const tx = await contractWithSigner["claim(address,uint256,bytes32[])"](address, tokenAmount, proof);
   ```

These changes ensure that each variable has a unique name in its scope, resolving the compilation error.
