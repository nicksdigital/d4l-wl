const { expect } = require("chai");
const { ethers } = require("hardhat");
const { signRegistration, signLogin, getDomain, getDeadline } = require("../scripts/auth-utils");

describe("D4L Authentication System", function () {
  let authFactory;
  let auth;
  let registry;
  let owner;
  let user1;
  let user2;
  let admin;
  let domain;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, admin] = await ethers.getSigners();

    // Deploy mock registry
    const MockRegistry = await ethers.getContractFactory("MockRegistry");
    registry = await MockRegistry.deploy();
    await registry.waitForDeployment();

    // Deploy the auth factory
    const D4LAuthFactory = await ethers.getContractFactory("D4LAuthFactory");
    authFactory = await D4LAuthFactory.deploy();
    await authFactory.waitForDeployment();

    // Deploy the auth contract
    const sessionDuration = 86400; // 1 day in seconds
    const tx = await authFactory.deployAuth(
      admin.address,
      await registry.getAddress(),
      sessionDuration
    );
    const receipt = await tx.wait();

    // Get the auth contract address from the event
    const authAddress = receipt.logs.find(
      log => log.fragment && log.fragment.name === "AuthDeployed"
    ).args[0];

    // Get the auth contract instance
    auth = await ethers.getContractAt("D4LAuth", authAddress);

    // Grant roles
    const USER_MANAGER_ROLE = await auth.USER_MANAGER_ROLE();
    await auth.connect(admin).grantRole(USER_MANAGER_ROLE, admin.address);
    
    const AUTH_ADMIN_ROLE = await auth.AUTH_ADMIN_ROLE();
    await auth.connect(admin).grantRole(AUTH_ADMIN_ROLE, admin.address);

    // Set up the domain for EIP-712 signatures
    const chainId = (await ethers.provider.getNetwork()).chainId;
    domain = getDomain("D4LAuth", "1", chainId, authAddress);
  });

  describe("User Registration", function () {
    it("Should register a new user with signature", async function () {
      const username = "testuser";
      const email = "test@example.com";
      const deadline = getDeadline(30); // 30 minutes from now

      // Sign the registration data
      const signature = await signRegistration(user1, username, email, deadline, domain);

      // Register the user
      const tx = await auth.connect(user1).registerWithSignature(
        username,
        email,
        deadline,
        signature
      );
      const receipt = await tx.wait();

      // Check if the user was registered
      const user = await auth.getUser(user1.address);
      expect(user.wallet).to.equal(user1.address);
      expect(user.username).to.equal(ethers.keccak256(ethers.toUtf8Bytes(username)));
      expect(user.email).to.equal(ethers.keccak256(ethers.toUtf8Bytes(email)));
      expect(user.active).to.be.true;

      // Check the event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "UserRegistered"
      );
      expect(event.args[0]).to.equal(user1.address);
      expect(event.args[1]).to.equal(ethers.keccak256(ethers.toUtf8Bytes(username)));
      expect(event.args[2]).to.equal(ethers.keccak256(ethers.toUtf8Bytes(email)));
    });

    it("Should not register with an expired signature", async function () {
      const username = "testuser";
      const email = "test@example.com";
      const deadline = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

      // Sign the registration data
      const signature = await signRegistration(user1, username, email, deadline, domain);

      // Try to register the user
      await expect(
        auth.connect(user1).registerWithSignature(
          username,
          email,
          deadline,
          signature
        )
      ).to.be.revertedWith("D4LSignatureVerifier: expired signature");
    });

    it("Should not register with an invalid signature", async function () {
      const username = "testuser";
      const email = "test@example.com";
      const deadline = getDeadline(30); // 30 minutes from now

      // Sign the registration data with user2's key
      const signature = await signRegistration(user2, username, email, deadline, domain);

      // Try to register the user with user1
      await expect(
        auth.connect(user1).registerWithSignature(
          username,
          email,
          deadline,
          signature
        )
      ).to.be.revertedWith("D4LSignatureVerifier: invalid signature");
    });

    it("Should not register with a taken username", async function () {
      const username = "testuser";
      const email1 = "test1@example.com";
      const email2 = "test2@example.com";
      const deadline = getDeadline(30); // 30 minutes from now

      // Register the first user
      const signature1 = await signRegistration(user1, username, email1, deadline, domain);
      await auth.connect(user1).registerWithSignature(
        username,
        email1,
        deadline,
        signature1
      );

      // Try to register the second user with the same username
      const signature2 = await signRegistration(user2, username, email2, deadline, domain);
      await expect(
        auth.connect(user2).registerWithSignature(
          username,
          email2,
          deadline,
          signature2
        )
      ).to.be.revertedWith("D4LAuth: username already taken");
    });

    it("Should not register with a taken email", async function () {
      const username1 = "testuser1";
      const username2 = "testuser2";
      const email = "test@example.com";
      const deadline = getDeadline(30); // 30 minutes from now

      // Register the first user
      const signature1 = await signRegistration(user1, username1, email, deadline, domain);
      await auth.connect(user1).registerWithSignature(
        username1,
        email,
        deadline,
        signature1
      );

      // Try to register the second user with the same email
      const signature2 = await signRegistration(user2, username2, email, deadline, domain);
      await expect(
        auth.connect(user2).registerWithSignature(
          username2,
          email,
          deadline,
          signature2
        )
      ).to.be.revertedWith("D4LAuth: email already taken");
    });
  });

  describe("User Login", function () {
    beforeEach(async function () {
      // Register a user
      const username = "testuser";
      const email = "test@example.com";
      const deadline = getDeadline(30); // 30 minutes from now

      const signature = await signRegistration(user1, username, email, deadline, domain);
      await auth.connect(user1).registerWithSignature(
        username,
        email,
        deadline,
        signature
      );
    });

    it("Should login a registered user with signature", async function () {
      const deadline = getDeadline(30); // 30 minutes from now

      // Sign the login data
      const signature = await signLogin(user1, deadline, domain);

      // Login the user
      const tx = await auth.connect(user1).loginWithSignature(
        deadline,
        signature
      );
      const receipt = await tx.wait();

      // Get the session ID and expiration from the event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "UserLoggedIn"
      );
      const sessionId = event.args[1];
      const expiresAt = event.args[3];

      // Check if the session was created
      const session = await auth.getSession(sessionId);
      expect(session.wallet).to.equal(user1.address);
      expect(session.sessionId).to.equal(sessionId);
      expect(session.active).to.be.true;
      expect(session.expiresAt).to.equal(expiresAt);

      // Validate the session
      expect(await auth.validateSession(user1.address, sessionId)).to.be.true;
    });

    it("Should not login with an expired signature", async function () {
      const deadline = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

      // Sign the login data
      const signature = await signLogin(user1, deadline, domain);

      // Try to login the user
      await expect(
        auth.connect(user1).loginWithSignature(
          deadline,
          signature
        )
      ).to.be.revertedWith("D4LSignatureVerifier: expired signature");
    });

    it("Should not login with an invalid signature", async function () {
      const deadline = getDeadline(30); // 30 minutes from now

      // Sign the login data with user2's key
      const signature = await signLogin(user2, deadline, domain);

      // Try to login user1
      await expect(
        auth.connect(user1).loginWithSignature(
          deadline,
          signature
        )
      ).to.be.revertedWith("D4LSignatureVerifier: invalid signature");
    });

    it("Should not login an unregistered user", async function () {
      const deadline = getDeadline(30); // 30 minutes from now

      // Sign the login data with user2's key (not registered)
      const signature = await signLogin(user2, deadline, domain);

      // Try to login user2
      await expect(
        auth.connect(user2).loginWithSignature(
          deadline,
          signature
        )
      ).to.be.revertedWith("D4LAuth: user not registered");
    });
  });

  describe("Session Management", function () {
    let sessionId;

    beforeEach(async function () {
      // Register a user
      const username = "testuser";
      const email = "test@example.com";
      let deadline = getDeadline(30); // 30 minutes from now

      let signature = await signRegistration(user1, username, email, deadline, domain);
      await auth.connect(user1).registerWithSignature(
        username,
        email,
        deadline,
        signature
      );

      // Login the user
      deadline = getDeadline(30); // 30 minutes from now
      signature = await signLogin(user1, deadline, domain);
      const tx = await auth.connect(user1).loginWithSignature(
        deadline,
        signature
      );
      const receipt = await tx.wait();

      // Get the session ID from the event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "UserLoggedIn"
      );
      sessionId = event.args[1];
    });

    it("Should logout a user", async function () {
      // Logout the user
      const tx = await auth.connect(user1).logout(sessionId);
      const receipt = await tx.wait();

      // Check if the session was deactivated
      const session = await auth.getSession(sessionId);
      expect(session.active).to.be.false;

      // Check the event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "UserLoggedOut"
      );
      expect(event.args[0]).to.equal(user1.address);
      expect(event.args[1]).to.equal(sessionId);

      // Validate the session (should fail)
      expect(await auth.validateSession(user1.address, sessionId)).to.be.false;
    });

    it("Should not logout another user's session", async function () {
      // Try to logout user1's session as user2
      await expect(
        auth.connect(user2).logout(sessionId)
      ).to.be.revertedWith("D4LAuth: not session owner");
    });

    it("Should not validate an expired session", async function () {
      // Set the session duration to 1 second
      await auth.connect(admin).setSessionDuration(1);

      // Wait for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Validate the session (should fail)
      expect(await auth.validateSession(user1.address, sessionId)).to.be.false;
    });

    it("Should get active sessions for a user", async function () {
      // Get active sessions
      const activeSessions = await auth.getActiveSessions(user1.address);
      expect(activeSessions.length).to.equal(1);
      expect(activeSessions[0]).to.equal(sessionId);

      // Logout the user
      await auth.connect(user1).logout(sessionId);

      // Get active sessions again (should be empty)
      const activeSessionsAfterLogout = await auth.getActiveSessions(user1.address);
      expect(activeSessionsAfterLogout.length).to.equal(0);
    });
  });

  describe("User Management", function () {
    beforeEach(async function () {
      // Register a user
      const username = "testuser";
      const email = "test@example.com";
      const deadline = getDeadline(30); // 30 minutes from now

      const signature = await signRegistration(user1, username, email, deadline, domain);
      await auth.connect(user1).registerWithSignature(
        username,
        email,
        deadline,
        signature
      );

      // Login the user
      const loginDeadline = getDeadline(30); // 30 minutes from now
      const loginSignature = await signLogin(user1, loginDeadline, domain);
      await auth.connect(user1).loginWithSignature(
        loginDeadline,
        loginSignature
      );
    });

    it("Should deactivate a user", async function () {
      // Deactivate the user
      const tx = await auth.connect(admin).deactivateUser(user1.address);
      const receipt = await tx.wait();

      // Check if the user was deactivated
      const user = await auth.getUser(user1.address);
      expect(user.active).to.be.false;

      // Check the event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "UserDeactivated"
      );
      expect(event.args[0]).to.equal(user1.address);

      // Get active sessions (should be empty)
      const activeSessions = await auth.getActiveSessions(user1.address);
      expect(activeSessions.length).to.equal(0);
    });

    it("Should reactivate a user", async function () {
      // Deactivate the user
      await auth.connect(admin).deactivateUser(user1.address);

      // Reactivate the user
      const tx = await auth.connect(admin).reactivateUser(user1.address);
      const receipt = await tx.wait();

      // Check if the user was reactivated
      const user = await auth.getUser(user1.address);
      expect(user.active).to.be.true;

      // Check the event
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "UserReactivated"
      );
      expect(event.args[0]).to.equal(user1.address);
    });

    it("Should not allow non-admins to deactivate users", async function () {
      // Try to deactivate the user as a non-admin
      await expect(
        auth.connect(user2).deactivateUser(user1.address)
      ).to.be.revertedWith("AccessControl: account");
    });

    it("Should not allow non-admins to reactivate users", async function () {
      // Deactivate the user
      await auth.connect(admin).deactivateUser(user1.address);

      // Try to reactivate the user as a non-admin
      await expect(
        auth.connect(user2).reactivateUser(user1.address)
      ).to.be.revertedWith("AccessControl: account");
    });
  });

  describe("Utility Functions", function () {
    beforeEach(async function () {
      // Register users
      const username1 = "testuser1";
      const email1 = "test1@example.com";
      const username2 = "testuser2";
      const email2 = "test2@example.com";
      const deadline = getDeadline(30); // 30 minutes from now

      const signature1 = await signRegistration(user1, username1, email1, deadline, domain);
      await auth.connect(user1).registerWithSignature(
        username1,
        email1,
        deadline,
        signature1
      );

      const signature2 = await signRegistration(user2, username2, email2, deadline, domain);
      await auth.connect(user2).registerWithSignature(
        username2,
        email2,
        deadline,
        signature2
      );
    });

    it("Should get wallet by username", async function () {
      const wallet = await auth.getWalletByUsername("testuser1");
      expect(wallet).to.equal(user1.address);
    });

    it("Should get wallet by email", async function () {
      const wallet = await auth.getWalletByEmail("test1@example.com");
      expect(wallet).to.equal(user1.address);
    });

    it("Should check if username is available", async function () {
      expect(await auth.isUsernameAvailable("testuser1")).to.be.false;
      expect(await auth.isUsernameAvailable("testuser3")).to.be.true;
    });

    it("Should check if email is available", async function () {
      expect(await auth.isEmailAvailable("test1@example.com")).to.be.false;
      expect(await auth.isEmailAvailable("test3@example.com")).to.be.true;
    });
  });
});

// Mock Registry for testing
const MockRegistry = {
  contractName: "MockRegistry",
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      inputs: [
        { name: "user", type: "address" },
        { name: "appSalt", type: "bytes32" },
        { name: "routingIntentHash", type: "bytes32" },
        { name: "zkProofKey", type: "bytes32" }
      ],
      name: "createSoulIdentity",
      outputs: [{ name: "", type: "address" }],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ name: "user", type: "address" }],
      name: "getUserSoulIdentities",
      outputs: [{ name: "", type: "address[]" }],
      stateMutability: "view",
      type: "function"
    }
  ],
  bytecode: "0x608060405234801561001057600080fd5b50610415806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80635a1c17821461003b578063c7a823e01461006b575b600080fd5b61004e6100493660046102a0565b61008e565b6040516001600160a01b03909116815260200160405180910390f35b61007e6100793660046102e9565b6101a0565b60405161008b9190610304565b60405180910390f35b6000848484846040516020016100a7949392919061035d565b60408051601f1981840301815291905280516020909101206000908152600160205260409020546001600160a01b03161561010f576000818152600160205260409020546001600160a01b031661019a565b604080516001600160a01b0387168152602081018690529081018590526060810184905260009060800160405160208183030381529060405280519060200120905060008181526001602081905260409091208054336001600160a01b0319909116179055805b95945050505050565b60606001600160a01b03821660009081526020819052604090208054806020026020016040519081016040528092919081815260200182805480156101f457602002820191906000526020600020905b81546001600160a01b0316815260019091019060200180831161019a575b50505050509050919050565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261022857600080fd5b813567ffffffffffffffff8082111561024357610243610201565b604051601f8301601f19908116603f0116810190828211818310171561026b5761026b610201565b8160405283815286602085880101111561028457600080fd5b836020870160208301376000602085830101528094505050505092915050565b600080600080608085870312156102b657600080fd5b84356001600160a01b03811681146102cd57600080fd5b9350602085013592506040850135915060608501356102eb81610397565b939692955090935050565b6000602082840312156102fb57600080fd5b813561019a81610397565b6020808252825182820181905260009190848201906040850190845b8181101561033b5783516001600160a01b031683529284019291840191600101610316565b50909695505050505050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b6001600160a01b038516815283602082015260606040820152600061038760608301848661034a565b9695505050505050565b6001600160a01b038116811461039c57600080fd5b5056fea2646970667358221220a9a8f8a9d3b5b7e9e9c3f6b6b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b64736f6c634300080a0033"
};
