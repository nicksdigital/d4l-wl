// test-crosschain.js
const { ethers } = require("hardhat");

async function main() {
  console.log("Testing cross-chain functionality...");

  // Load environment variables
  const chainAId = process.env.NEXT_PUBLIC_CHAIN_A_ID;
  const chainARpcUrl = process.env.NEXT_PUBLIC_CHAIN_A_RPC_URL;
  const chainARegistryAddress = process.env.NEXT_PUBLIC_CHAIN_A_REGISTRY_ADDRESS;
  const chainABridgeAdapterAddress = process.env.NEXT_PUBLIC_CHAIN_A_BRIDGE_ADAPTER_ADDRESS;

  const chainBId = process.env.NEXT_PUBLIC_CHAIN_B_ID;
  const chainBRpcUrl = process.env.NEXT_PUBLIC_CHAIN_B_RPC_URL;
  const chainBRegistryAddress = process.env.NEXT_PUBLIC_CHAIN_B_REGISTRY_ADDRESS;
  const chainBBridgeAdapterAddress = process.env.NEXT_PUBLIC_CHAIN_B_BRIDGE_ADAPTER_ADDRESS;

  if (!chainAId || !chainARpcUrl || !chainARegistryAddress || !chainABridgeAdapterAddress ||
      !chainBId || !chainBRpcUrl || !chainBRegistryAddress || !chainBBridgeAdapterAddress) {
    console.error("Missing environment variables. Please check your .env.local file.");
    process.exit(1);
  }

  // Create providers for both chains
  const providerA = new ethers.JsonRpcProvider(chainARpcUrl);
  const providerB = new ethers.JsonRpcProvider(chainBRpcUrl);

  // Get the current network information
  const networkA = await providerA.getNetwork();
  const networkB = await providerB.getNetwork();

  console.log(`Chain A: ${networkA.name} (chainId: ${networkA.chainId})`);
  console.log(`Chain B: ${networkB.name} (chainId: ${networkB.chainId})`);

  // Get the wallet
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("Missing PRIVATE_KEY environment variable.");
    process.exit(1);
  }

  const walletA = new ethers.Wallet(privateKey, providerA);
  const walletB = new ethers.Wallet(privateKey, providerB);

  console.log(`Wallet address: ${walletA.address}`);
  console.log(`Chain A balance: ${ethers.formatEther(await providerA.getBalance(walletA.address))} ETH`);
  console.log(`Chain B balance: ${ethers.formatEther(await providerB.getBalance(walletB.address))} ETH`);

  // Load contracts
  const registryA = new ethers.Contract(
    chainARegistryAddress,
    [
      "function getUserSoulIdentities(address user) view returns (address[])",
      "function createSoulIdentity(address user, bytes32 appSalt, bytes32 routingIntentHash, bytes32 zkProofKey) returns (address)",
      "function getAssetAddress(string assetType) view returns (address)"
    ],
    walletA
  );

  const registryB = new ethers.Contract(
    chainBRegistryAddress,
    [
      "function getUserSoulIdentities(address user) view returns (address[])",
      "function createSoulIdentity(address user, bytes32 appSalt, bytes32 routingIntentHash, bytes32 zkProofKey) returns (address)",
      "function getAssetAddress(string assetType) view returns (address)"
    ],
    walletB
  );

  const bridgeAdapterA = new ethers.Contract(
    chainABridgeAdapterAddress,
    [
      "function routeReputationCrossChain(address fromSoul, address toSoul, uint256 amount, uint256 destinationChainId) payable returns (bytes32)",
      "function setDestinationChainId(uint256 destinationChainId)",
      "function setDestinationRegistry(address destinationRegistry)"
    ],
    walletA
  );

  const bridgeAdapterB = new ethers.Contract(
    chainBBridgeAdapterAddress,
    [
      "function routeReputationCrossChain(address fromSoul, address toSoul, uint256 amount, uint256 destinationChainId) payable returns (bytes32)",
      "function setDestinationChainId(uint256 destinationChainId)",
      "function setDestinationRegistry(address destinationRegistry)"
    ],
    walletB
  );

  // Configure bridge adapters
  console.log("Configuring bridge adapters...");
  
  // Set destination chain ID
  await bridgeAdapterA.setDestinationChainId(networkB.chainId);
  console.log(`Set Chain A bridge adapter destination chain ID to ${networkB.chainId}`);
  
  await bridgeAdapterB.setDestinationChainId(networkA.chainId);
  console.log(`Set Chain B bridge adapter destination chain ID to ${networkA.chainId}`);
  
  // Set destination registry
  await bridgeAdapterA.setDestinationRegistry(chainBRegistryAddress);
  console.log(`Set Chain A bridge adapter destination registry to ${chainBRegistryAddress}`);
  
  await bridgeAdapterB.setDestinationRegistry(chainARegistryAddress);
  console.log(`Set Chain B bridge adapter destination registry to ${chainARegistryAddress}`);

  // Check for existing soul identities
  let soulIdsA = await registryA.getUserSoulIdentities(walletA.address);
  let soulIdsB = await registryB.getUserSoulIdentities(walletB.address);

  let soulIdA = soulIdsA.length > 0 ? soulIdsA[0] : null;
  let soulIdB = soulIdsB.length > 0 ? soulIdsB[0] : null;

  console.log(`Chain A Soul ID: ${soulIdA || 'Not created'}`);
  console.log(`Chain B Soul ID: ${soulIdB || 'Not created'}`);

  // Create soul identities if they don't exist
  if (!soulIdA) {
    console.log("Creating Soul Identity on Chain A...");
    const appSaltA = ethers.keccak256(ethers.toUtf8Bytes(`soulstream-chainA-${Date.now()}`));
    const tx = await registryA.createSoulIdentity(
      walletA.address,
      appSaltA,
      ethers.ZeroHash,
      ethers.ZeroHash
    );
    await tx.wait();
    
    soulIdsA = await registryA.getUserSoulIdentities(walletA.address);
    soulIdA = soulIdsA[0];
    console.log(`Created Soul Identity on Chain A: ${soulIdA}`);
  }

  if (!soulIdB) {
    console.log("Creating Soul Identity on Chain B...");
    const appSaltB = ethers.keccak256(ethers.toUtf8Bytes(`soulstream-chainB-${Date.now()}`));
    const tx = await registryB.createSoulIdentity(
      walletB.address,
      appSaltB,
      ethers.ZeroHash,
      ethers.ZeroHash
    );
    await tx.wait();
    
    soulIdsB = await registryB.getUserSoulIdentities(walletB.address);
    soulIdB = soulIdsB[0];
    console.log(`Created Soul Identity on Chain B: ${soulIdB}`);
  }

  // Get reputation asset addresses
  const reputationAssetAddressA = await registryA.getAssetAddress("REPUTATION");
  const reputationAssetAddressB = await registryB.getAssetAddress("REPUTATION");

  console.log(`Chain A Reputation Asset: ${reputationAssetAddressA}`);
  console.log(`Chain B Reputation Asset: ${reputationAssetAddressB}`);

  // Create reputation asset contracts
  const reputationAssetA = new ethers.Contract(
    reputationAssetAddressA,
    [
      "function balanceOfSoul(address soul) view returns (uint256)",
      "function mintToSoul(address soul, uint256 amount)"
    ],
    walletA
  );

  const reputationAssetB = new ethers.Contract(
    reputationAssetAddressB,
    [
      "function balanceOfSoul(address soul) view returns (uint256)",
      "function mintToSoul(address soul, uint256 amount)"
    ],
    walletB
  );

  // Check initial reputation balances
  const initialBalanceA = await reputationAssetA.balanceOfSoul(soulIdA);
  const initialBalanceB = await reputationAssetB.balanceOfSoul(soulIdB);

  console.log(`Initial Chain A Reputation: ${ethers.formatEther(initialBalanceA)}`);
  console.log(`Initial Chain B Reputation: ${ethers.formatEther(initialBalanceB)}`);

  // Mint some reputation on Chain A
  if (initialBalanceA < ethers.parseEther("100")) {
    console.log("Minting reputation on Chain A...");
    const mintAmount = ethers.parseEther("100");
    await reputationAssetA.mintToSoul(soulIdA, mintAmount);
    console.log(`Minted ${ethers.formatEther(mintAmount)} reputation to ${soulIdA} on Chain A`);
  }

  // Check updated reputation balance on Chain A
  const updatedBalanceA = await reputationAssetA.balanceOfSoul(soulIdA);
  console.log(`Updated Chain A Reputation: ${ethers.formatEther(updatedBalanceA)}`);

  // Transfer reputation from Chain A to Chain B
  console.log("Transferring reputation from Chain A to Chain B...");
  const transferAmount = ethers.parseEther("10");
  
  const tx = await bridgeAdapterA.routeReputationCrossChain(
    soulIdA,
    soulIdB,
    transferAmount,
    networkB.chainId,
    { value: ethers.parseEther("0.01") } // Gas fee for cross-chain message
  );
  
  const receipt = await tx.wait();
  console.log(`Cross-chain transfer initiated: ${receipt.hash}`);

  // In a real scenario, we would need to wait for the message to be relayed
  // For testing purposes, we'll simulate the message relay
  console.log("\nIn a real cross-chain scenario, you would need to wait for the message to be relayed.");
  console.log("This could take minutes to hours depending on the bridge technology used.");
  console.log("For this test, we're simulating the message relay by directly minting on Chain B.");

  // Simulate the message relay by directly minting on Chain B
  console.log("Simulating message relay...");
  await reputationAssetB.mintToSoul(soulIdB, transferAmount);

  // Check final reputation balances
  const finalBalanceA = await reputationAssetA.balanceOfSoul(soulIdA);
  const finalBalanceB = await reputationAssetB.balanceOfSoul(soulIdB);

  console.log(`Final Chain A Reputation: ${ethers.formatEther(finalBalanceA)}`);
  console.log(`Final Chain B Reputation: ${ethers.formatEther(finalBalanceB)}`);

  console.log("\nCross-chain testing complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
