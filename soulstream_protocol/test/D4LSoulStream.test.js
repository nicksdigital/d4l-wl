const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("D4L SoulStream Protocol", function () {
  let factory;
  let registry;
  let router;
  let owner;
  let user1;
  let user2;
  let mockToken;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy mock token for testing
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MOCK", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();

    // Deploy the factory
    const D4LSoulStreamFactory = await ethers.getContractFactory("D4LSoulStreamFactory");
    factory = await D4LSoulStreamFactory.deploy();
    await factory.waitForDeployment();

    // Set up the SoulStream system
    const lockDuration = 86400; // 1 day in seconds
    const rewardRate = ethers.parseUnits("0.0001", 18); // 0.0001 tokens per second per token staked

    // Deploy the registry
    console.log("Deploying registry...");
    await factory.deployRegistry(owner.address);

    // Get the registry address directly from the factory
    const registryAddress = await factory.registry();
    console.log("Registry address:", registryAddress);

    // Deploy the router
    console.log("Deploying router...");
    await factory.deployRouter(owner.address);

    // Get the router address directly from the factory
    const routerAddress = await factory.router();
    console.log("Router address:", routerAddress);

    // Deploy the staking route
    console.log("Deploying staking route...");
    const supportedChains = [await ethers.provider.getNetwork().then(n => n.chainId)];
    console.log("Supported chains:", supportedChains);

    // Deploy the staking route implementation
    const stakingRouteTx = await factory.deployStakingRouteImplementation(
      "D4L Staking Route",
      supportedChains,
      owner.address,
      lockDuration,
      rewardRate
    );

    // For the staking route, we need to extract the address from the transaction receipt
    // since it's not stored in the factory contract
    const stakingRouteReceipt = await stakingRouteTx.wait();

    // Find the contract creation event
    let stakingRouteAddress;
    for (const log of stakingRouteReceipt.logs) {
      // Look for the OwnershipTransferred event which is emitted when a contract is created
      if (log.topics[0] === '0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0') {
        // The contract address is in the third topic (index 2)
        stakingRouteAddress = ethers.getAddress('0x' + log.topics[2].slice(26));
        console.log("Found staking route address from OwnershipTransferred event:", stakingRouteAddress);
        break;
      }
    }

    if (!stakingRouteAddress) {
      // If we couldn't find it from the OwnershipTransferred event, try to get it from the last log
      const lastLog = stakingRouteReceipt.logs[stakingRouteReceipt.logs.length - 1];
      if (lastLog && lastLog.address) {
        stakingRouteAddress = lastLog.address;
        console.log("Found staking route address from last log:", stakingRouteAddress);
      }
    }

    if (!registryAddress || !routerAddress || !stakingRouteAddress) {
      throw new Error("Failed to get all required addresses");
    }

    // Get the contract instances
    registry = await ethers.getContractAt("D4LSoulStreamRegistryImpl", registryAddress);
    router = await ethers.getContractAt("D4LSoulflowRouter", routerAddress);

    // Grant roles
    const ROUTER_MANAGER_ROLE = await router.ROUTE_MANAGER_ROLE();
    await router.grantRole(ROUTER_MANAGER_ROLE, owner.address);

    const IDENTITY_MANAGER_ROLE = await registry.REGISTRY_IDENTITY_MANAGER_ROLE();
    await registry.grantRole(IDENTITY_MANAGER_ROLE, owner.address);

    // Register the staking route implementation in the router
    await router.registerRouteImplementation(
      ethers.keccak256(ethers.toUtf8Bytes("StakingRoute")),
      stakingRouteAddress
    );

    // Mint tokens to users
    await mockToken.transfer(user1.address, ethers.parseEther("10000"));
    await mockToken.transfer(user2.address, ethers.parseEther("10000"));
  });

  describe("Soul Identity Creation", function () {
    it("Should create a soul identity", async function () {
      const appSalt = ethers.keccak256(ethers.toUtf8Bytes("app1"));
      const routingIntentHash = ethers.keccak256(ethers.toUtf8Bytes("intent1"));
      const zkProofKey = ethers.ZeroHash;

      // Create a soul identity
      const tx = await registry.createSoulIdentity(
        user1.address,
        appSalt,
        routingIntentHash,
        zkProofKey
      );
      const receipt = await tx.wait();

      // Get the soul identity address from the event
      let soulId;
      for (const log of receipt.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "SoulIdentityCreated") {
            soulId = parsedLog.args[1];
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      if (!soulId) {
        throw new Error("SoulIdentityCreated event not found");
      }

      // Check if the soul identity was created
      expect(await registry.isSoul(soulId)).to.be.true;

      // Check if the soul identity is associated with the user
      const userSoulIds = await registry.getUserSoulIdentities(user1.address);
      expect(userSoulIds).to.include(soulId);
    });

    it("Should compute the soul identity address correctly", async function () {
      const appSalt = ethers.keccak256(ethers.toUtf8Bytes("app1"));
      const routingIntentHash = ethers.keccak256(ethers.toUtf8Bytes("intent1"));

      // Compute the soul identity address
      const computedAddress = await registry.computeSoulIdentityAddress(
        user1.address,
        appSalt,
        routingIntentHash
      );

      // Create the soul identity
      const tx = await registry.createSoulIdentity(
        user1.address,
        appSalt,
        routingIntentHash,
        ethers.ZeroHash
      );
      const receipt = await tx.wait();

      // Get the soul identity address from the event
      let soulId;
      for (const log of receipt.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "SoulIdentityCreated") {
            soulId = parsedLog.args[1];
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      if (!soulId) {
        throw new Error("SoulIdentityCreated event not found");
      }

      // Check if the computed address matches the actual address
      expect(computedAddress).to.equal(soulId);
    });
  });

  describe("Route Registration", function () {
    let soulId1;
    let soulId2;

    beforeEach(async function () {
      // Create soul identities
      const appSalt1 = ethers.keccak256(ethers.toUtf8Bytes("app1"));
      const routingIntentHash1 = ethers.keccak256(ethers.toUtf8Bytes("intent1"));
      const tx1 = await registry.createSoulIdentity(
        user1.address,
        appSalt1,
        routingIntentHash1,
        ethers.ZeroHash
      );
      const receipt1 = await tx1.wait();
      // Get the soul identity address from the event
      for (const log of receipt1.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "SoulIdentityCreated") {
            soulId1 = parsedLog.args[1];
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      if (!soulId1) {
        throw new Error("SoulIdentityCreated event not found for user1");
      }

      const appSalt2 = ethers.keccak256(ethers.toUtf8Bytes("app2"));
      const routingIntentHash2 = ethers.keccak256(ethers.toUtf8Bytes("intent2"));
      const tx2 = await registry.createSoulIdentity(
        user2.address,
        appSalt2,
        routingIntentHash2,
        ethers.ZeroHash
      );
      const receipt2 = await tx2.wait();
      // Get the soul identity address from the event
      for (const log of receipt2.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "SoulIdentityCreated") {
            soulId2 = parsedLog.args[1];
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      if (!soulId2) {
        throw new Error("SoulIdentityCreated event not found for user2");
      }
    });

    it("Should register a route", async function () {
      const action = 1; // Stake
      const constraintHash = ethers.keccak256(ethers.toUtf8Bytes("constraints"));

      // Register a route
      const tx = await registry.registerRoute(
        soulId1,
        soulId2,
        mockToken.target,
        action,
        constraintHash,
        router.target
      );
      const receipt = await tx.wait();

      // Get the route ID from the event
      let routeId;
      for (const log of receipt.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "RouteRegistered") {
            routeId = parsedLog.args[0];
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      if (!routeId) {
        throw new Error("RouteRegistered event not found");
      }

      // Check if the route was registered
      const route = await registry.getRoute(routeId);
      expect(route.fromSoul).to.equal(soulId1);
      expect(route.toSoul).to.equal(soulId2);
      expect(route.asset).to.equal(mockToken.target);
      expect(route.action).to.equal(action);
      expect(route.constraintHash).to.equal(constraintHash);
      expect(route.router).to.equal(router.target);
      expect(route.active).to.be.true;
    });

    it("Should update a route", async function () {
      const action = 1; // Stake
      const constraintHash = ethers.keccak256(ethers.toUtf8Bytes("constraints"));

      // Register a route
      const tx1 = await registry.registerRoute(
        soulId1,
        soulId2,
        mockToken.target,
        action,
        constraintHash,
        router.target
      );
      const receipt1 = await tx1.wait();
      // Get the route ID from the event
      let routeId;
      for (const log of receipt1.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "RouteRegistered") {
            routeId = parsedLog.args[0];
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      if (!routeId) {
        throw new Error("RouteRegistered event not found");
      }

      // Update the route
      const tx2 = await registry.updateRoute(
        routeId,
        ethers.ZeroAddress, // Keep the current router
        false // Deactivate the route
      );
      await tx2.wait();

      // Check if the route was updated
      const route = await registry.getRoute(routeId);
      expect(route.router).to.equal(router.target); // Router should not change
      expect(route.active).to.be.false; // Route should be deactivated
    });

    it("Should get the router for a route", async function () {
      const action = 1; // Stake
      const constraintHash = ethers.keccak256(ethers.toUtf8Bytes("constraints"));

      // Register a route
      const tx = await registry.registerRoute(
        soulId1,
        soulId2,
        mockToken.target,
        action,
        constraintHash,
        router.target
      );
      const receipt = await tx.wait();
      // Get the route ID from the event
      let routeId;
      for (const log of receipt.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "RouteRegistered") {
            routeId = parsedLog.args[0];
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      if (!routeId) {
        throw new Error("RouteRegistered event not found");
      }

      // Check if the router is correct
      expect(await registry.getRouterForRoute(routeId)).to.equal(router.target);

      // Deactivate the route
      await registry.updateRoute(routeId, ethers.ZeroAddress, false);

      // Check if the router is now zero address (route is inactive)
      expect(await registry.getRouterForRoute(routeId)).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Soul Identity Authorization", function () {
    let soulIdentity;
    let routeId;
    let soulId;

    beforeEach(async function () {
      // Create a soul identity
      const appSalt = ethers.keccak256(ethers.toUtf8Bytes("app1"));
      const routingIntentHash = ethers.keccak256(ethers.toUtf8Bytes("intent1"));
      const tx1 = await registry.createSoulIdentity(
        user1.address,
        appSalt,
        routingIntentHash,
        ethers.ZeroHash
      );
      const receipt1 = await tx1.wait();

      // Get the soul identity address from the event
      for (const log of receipt1.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "SoulIdentityCreated") {
            soulId = parsedLog.args[1];
            console.log("Found soul identity address:", soulId);
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      if (!soulId) {
        throw new Error("SoulIdentityCreated event not found");
      }

      // Get the soul identity contract
      // We need to use the ABI directly since the contract is created dynamically
      const soulIdentityABI = [
        "function authorizeRoute(bytes32 routeId, bool authorized) external",
        "function authorizedRoutes(bytes32) external view returns (bool)",
        "event RouteAuthorized(bytes32 indexed routeId, bool authorized)"
      ];
      soulIdentity = new ethers.Contract(soulId, soulIdentityABI, ethers.provider);
      console.log("Soul identity contract created at:", await soulIdentity.getAddress());

      // Register a route
      const action = 1; // Stake
      const constraintHash = ethers.keccak256(ethers.toUtf8Bytes("constraints"));
      const tx2 = await registry.registerRoute(
        soulId,
        ethers.ZeroAddress, // No destination soul
        mockToken.target,
        action,
        constraintHash,
        router.target
      );
      const receipt2 = await tx2.wait();

      // Get the route ID from the event
      for (const log of receipt2.logs) {
        try {
          const parsedLog = registry.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          if (parsedLog && parsedLog.name === "RouteRegistered") {
            routeId = parsedLog.args[0];
            console.log("Found route ID:", routeId);
            break;
          }
        } catch (e) {
          // Skip logs that can't be parsed
          continue;
        }
      }

      if (!routeId) {
        throw new Error("RouteRegistered event not found");
      }
    });

    it("Should authorize a route", async function () {
      console.log("Authorizing route...");
      // Authorize the route (must be called by the owner of the soul identity)
      const connectedSoulIdentity = soulIdentity.connect(user1);
      const tx = await connectedSoulIdentity.authorizeRoute(routeId, true);
      const receipt = await tx.wait();
      console.log("Route authorization transaction hash:", tx.hash);

      // Check if the route was authorized
      const isAuthorized = await soulIdentity.authorizedRoutes(routeId);
      console.log("Is route authorized:", isAuthorized);
      expect(isAuthorized).to.be.true;

      // Check the event
      let routeAuthorizedEvent;
      for (const log of receipt.logs) {
        // The RouteAuthorized event has the signature: RouteAuthorized(bytes32 indexed routeId, bool authorized)
        // The topic[0] is the event signature hash
        if (log.topics[0] === ethers.id("RouteAuthorized(bytes32,bool)")) {
          console.log("Found RouteAuthorized event");
          // The routeId is the first indexed parameter (topic[1])
          const eventRouteId = log.topics[1];
          // The authorized value is in the data field (not indexed)
          const authorized = parseInt(log.data, 16) === 1;

          routeAuthorizedEvent = {
            args: [eventRouteId, authorized]
          };
          break;
        }
      }

      expect(routeAuthorizedEvent).to.not.be.undefined;
      expect(routeAuthorizedEvent.args[0]).to.equal(routeId);
      expect(routeAuthorizedEvent.args[1]).to.be.true;
    });

    it("Should not allow non-owners to authorize routes", async function () {
      console.log("Testing non-owner authorization...");
      // Try to authorize the route as a non-owner
      const connectedSoulIdentity = soulIdentity.connect(user2);

      try {
        await connectedSoulIdentity.authorizeRoute(routeId, true);
        // If we get here, the transaction didn't revert as expected
        expect.fail("Transaction should have reverted");
      } catch (error) {
        // Check that the error message contains the expected revert reason
        console.log("Error message:", error.message);
        expect(error.message).to.include("caller is not the owner");
      }
    });
  });

  // Add more test cases for route execution, staking, etc.
});

// End of test file
