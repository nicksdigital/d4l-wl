// Auth utilities for generating signatures

const ethers = require('ethers');

/**
 * Generates a registration signature
 * @param {Object} signer - The ethers.js signer
 * @param {string} username - The username
 * @param {string} email - The email
 * @param {number} deadline - The deadline timestamp
 * @param {Object} domain - The EIP-712 domain
 * @returns {Promise<string>} The signature
 */
async function signRegistration(signer, username, email, deadline, domain) {
  const wallet = await signer.getAddress();
  
  // Define the types
  const types = {
    Registration: [
      { name: 'wallet', type: 'address' },
      { name: 'username', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'deadline', type: 'uint256' }
    ]
  };
  
  // Define the data
  const data = {
    wallet,
    username,
    email,
    deadline
  };
  
  // Sign the data
  const signature = await signer._signTypedData(domain, types, data);
  
  return signature;
}

/**
 * Generates a login signature
 * @param {Object} signer - The ethers.js signer
 * @param {number} deadline - The deadline timestamp
 * @param {Object} domain - The EIP-712 domain
 * @returns {Promise<string>} The signature
 */
async function signLogin(signer, deadline, domain) {
  const wallet = await signer.getAddress();
  
  // Define the types
  const types = {
    Login: [
      { name: 'wallet', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ]
  };
  
  // Define the data
  const data = {
    wallet,
    deadline
  };
  
  // Sign the data
  const signature = await signer._signTypedData(domain, types, data);
  
  return signature;
}

/**
 * Gets the EIP-712 domain for the auth contract
 * @param {string} contractName - The contract name
 * @param {string} version - The contract version
 * @param {number} chainId - The chain ID
 * @param {string} verifyingContract - The contract address
 * @returns {Object} The domain object
 */
function getDomain(contractName, version, chainId, verifyingContract) {
  return {
    name: contractName,
    version: version,
    chainId: chainId,
    verifyingContract: verifyingContract
  };
}

/**
 * Generates a deadline timestamp
 * @param {number} minutes - The number of minutes from now
 * @returns {number} The deadline timestamp
 */
function getDeadline(minutes = 30) {
  return Math.floor(Date.now() / 1000) + minutes * 60;
}

module.exports = {
  signRegistration,
  signLogin,
  getDomain,
  getDeadline
};
