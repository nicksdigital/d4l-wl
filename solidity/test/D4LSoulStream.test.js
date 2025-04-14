const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("D4L SoulStream Protocol", function () {
  let factory;
  let registry;
  let router;
  let stakingRoute;
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

    const tx = await factory.setupSoulStream(
      owner.address,
      owner.address,
      lockDuration,
      rewardRate
    );
    const receipt = await tx.wait();

    // Get the deployed addresses from the events
    const registryAddress = receipt.logs.find(
      log => log.fragment && log.fragment.name === "RegistryDeployed"
    ).args[0];

    const routerAddress = receipt.logs.find(
      log => log.fragment && log.fragment.name === "RouterDeployed"
    ).args[0];

    const stakingRouteAddress = receipt.logs.find(
      log => log.fragment && log.fragment.name === "RouteImplementationDeployed"
    ).args[0];

    // Get the contract instances
    registry = await ethers.getContractAt("D4LSoulStreamRegistry", registryAddress);
    router = await ethers.getContractAt("D4LSoulflowRouter", routerAddress);
    stakingRoute = await ethers.getContractAt("D4LSoulflowStakingRoute", stakingRouteAddress);

    // Grant roles
    const ROUTER_MANAGER_ROLE = await router.ROUTE_MANAGER_ROLE();
    await router.grantRole(ROUTER_MANAGER_ROLE, owner.address);
    
    const IDENTITY_MANAGER_ROLE = await registry.IDENTITY_MANAGER_ROLE();
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
      const soulId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "SoulIdentityCreated"
      ).args[1];

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
      const soulId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "SoulIdentityCreated"
      ).args[1];

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
      soulId1 = receipt1.logs.find(
        log => log.fragment && log.fragment.name === "SoulIdentityCreated"
      ).args[1];

      const appSalt2 = ethers.keccak256(ethers.toUtf8Bytes("app2"));
      const routingIntentHash2 = ethers.keccak256(ethers.toUtf8Bytes("intent2"));
      const tx2 = await registry.createSoulIdentity(
        user2.address,
        appSalt2,
        routingIntentHash2,
        ethers.ZeroHash
      );
      const receipt2 = await tx2.wait();
      soulId2 = receipt2.logs.find(
        log => log.fragment && log.fragment.name === "SoulIdentityCreated"
      ).args[1];
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
      const routeId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "RouteRegistered"
      ).args[0];

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
      const routeId = receipt1.logs.find(
        log => log.fragment && log.fragment.name === "RouteRegistered"
      ).args[0];

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
      const routeId = receipt.logs.find(
        log => log.fragment && log.fragment.name === "RouteRegistered"
      ).args[0];

      // Check if the router is correct
      expect(await registry.getRouterForRoute(routeId)).to.equal(router.target);

      // Deactivate the route
      await registry.updateRoute(routeId, ethers.ZeroAddress, false);

      // Check if the router is now zero address (route is inactive)
      expect(await registry.getRouterForRoute(routeId)).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Soul Identity Authorization", function () {
    let soulId;
    let soulIdentity;
    let routeId;

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
      soulId = receipt1.logs.find(
        log => log.fragment && log.fragment.name === "SoulIdentityCreated"
      ).args[1];

      // Get the soul identity contract
      soulIdentity = await ethers.getContractAt("D4LSoulIdentity", soulId);

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
      routeId = receipt2.logs.find(
        log => log.fragment && log.fragment.name === "RouteRegistered"
      ).args[0];
    });

    it("Should authorize a route", async function () {
      // Authorize the route (must be called by the owner of the soul identity)
      const tx = await soulIdentity.connect(user1).authorizeRoute(routeId, true);
      const receipt = await tx.wait();

      // Check if the route was authorized
      expect(await soulIdentity.authorizedRoutes(routeId)).to.be.true;

      // Check the event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "RouteAuthorized"
      );
      expect(event.args[0]).to.equal(routeId);
      expect(event.args[1]).to.be.true;
    });

    it("Should not allow non-owners to authorize routes", async function () {
      // Try to authorize the route as a non-owner
      await expect(
        soulIdentity.connect(user2).authorizeRoute(routeId, true)
      ).to.be.revertedWith("D4LSoulIdentity: caller is not the owner");
    });
  });

  // Add more test cases for route execution, staking, etc.
});

// Mock ERC20 token for testing
const MockERC20 = {
  contractName: "MockERC20",
  abi: [
    {
      inputs: [
        { name: "name", type: "string" },
        { name: "symbol", type: "string" },
        { name: "initialSupply", type: "uint256" }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" }
      ],
      name: "allowance",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      name: "approve",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        { name: "spender", type: "address" },
        { name: "subtractedValue", type: "uint256" }
      ],
      name: "decreaseAllowance",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        { name: "spender", type: "address" },
        { name: "addedValue", type: "uint256" }
      ],
      name: "increaseAllowance",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ name: "", type: "string" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ name: "", type: "string" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [
        { name: "recipient", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      name: "transfer",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        { name: "sender", type: "address" },
        { name: "recipient", type: "address" },
        { name: "amount", type: "uint256" }
      ],
      name: "transferFrom",
      outputs: [{ name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function"
    }
  ],
  bytecode: "0x60806040523480156200001157600080fd5b5060405162000c3838038062000c388339810160408190526200003491620001db565b8251839083906200004d90600390602085019062000068565b5080516200006390600490602084019062000068565b5050505062000282565b828054620000769062000245565b90600052602060002090601f0160209004810192826200009a5760008555620000e5565b82601f10620000b557805160ff1916838001178555620000e5565b82800160010185558215620000e5579182015b82811115620000e5578251825591602001919060010190620000c8565b50620000f3929150620000f7565b5090565b5b80821115620000f35760008155600101620000f8565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126200013657600080fd5b81516001600160401b03808211156200015357620001536200010e565b604051601f8301601f19908116603f011681019082821181831017156200017e576200017e6200010e565b816040528381526020925086838588010111156200019b57600080fd5b600091505b83821015620001bf5785820183015181830184015290820190620001a0565b83821115620001d15760008385830101525b9695505050505050565b600080600060608486031215620001f157600080fd5b83516001600160401b03808211156200020957600080fd5b620002178783880162000124565b945060208601519150808211156200022e57600080fd5b506200023d8682870162000124565b925050604084015190509250925092565b600181811c908216806200025a57607f821691505b602082108114156200027c57634e487b7160e01b600052602260045260246000fd5b50919050565b6109a680620002926000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80633950935111610071578063395093511461012357806370a082311461013657806395d89b411461015f578063a457c2d714610167578063a9059cbb1461017a578063dd62ed3e1461018d57600080fd5b806306fdde03146100ae578063095ea7b3146100cc57806318160ddd146100ef57806323b872dd14610101578063313ce56714610114575b600080fd5b6100b66101a0565b6040516100c3919061080d565b60405180910390f35b6100df6100da366004610877565b610232565b60405190151581526020016100c3565b6002545b6040519081526020016100c3565b6100df61010f3660046108a1565b610249565b604051601281526020016100c3565b6100df610131366004610877565b61026d565b6100f36101443660046108dd565b6001600160a01b031660009081526020819052604090205490565b6100b66102af565b6100df610175366004610877565b6102be565b6100df610188366004610877565b61033e565b6100f361019b3660046108f8565b61034b565b6060600380546101af9061092b565b80601f01602080910402602001604051908101604052809291908181526020018280546101db9061092b565b80156102285780601f106101fd57610100808354040283529160200191610228565b820191906000526020600020905b81548152906001019060200180831161020b57829003601f168201915b5050505050905090565b600061023f338484610376565b50600192915050565b600061025684848461049a565b6102628484846001610613565b5060019392505050565b3360008181526001602090815260408083206001600160a01b038716845290915281205490919061023f9082908690610a3a90869061092b565b6060600480546101af9061092b565b3360009081526001602090815260408083206001600160a01b0386168452909152812054828110156103335760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b60648201526084015b60405180910390fd5b610262338585840361049a565b600061023f338484610613565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6001600160a01b0383166103d85760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b606482015260840161032a565b6001600160a01b0382166104395760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b606482015260840161032a565b6001600160a01b0383811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b0383166104fe5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b606482015260840161032a565b6001600160a01b03821661056a5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b606482015260840161032a565b6001600160a01b038316600090815260208190526040902054818110156105e25760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b606482015260840161032a565b6001600160a01b03848116600081815260208181526040808320878703905593871680835291849020805487019055925185815290927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a35b50505050565b6001600160a01b0383166106775760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b606482015260840161032a565b6001600160a01b0382166106e35760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b606482015260840161032a565b6001600160a01b0383166000908152602081905260409020548181101561075b5760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b606482015260840161032a565b6001600160a01b03808516600090815260208190526040808220858503905591851681529081208054849290610792908490610965565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161060c91815260200190565b60005b838110156107f95781810151838201526020016107e1565b8381111561060c5750506000910152565b60208152600082518060208401526108298160408501602087016107de565b601f01601f19169190910160400192915050565b80356001600160a01b038116811461085457600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b6000806040838503121561088a57600080fd5b6108938361083d565b946020939093013593505050565b6000806000606084860312156108b657600080fd5b6108bf8461083d565b92506108cd6020850161083d565b9150604084013590509250925092565b6000602082840312156108ef57600080fd5b6108f88261083d565b9392505050565b6000806040838503121561090b57600080fd5b6109148361083d565b91506109226020840161083d565b90509250929050565b600181811c9082168061093f57607f821691505b6020821081141561096057634e487b7160e01b600052602260045260246000fd5b50919050565b6000821982111561098657634e487b7160e01b600052601160045260246000fd5b50019056fea2646970667358221220a9a8f8a9d3b5b7e9e9c3f6b6b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b64736f6c634300080a0033"
};
