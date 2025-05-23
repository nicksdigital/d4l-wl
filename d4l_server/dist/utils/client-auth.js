"use strict";
/**
 * Client-side authentication utilities
 *
 * This file is meant to be used as a reference for client-side implementation.
 * It should be adapted to work with the client's environment (browser, React Native, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.signRegistration = signRegistration;
exports.signLogin = signLogin;
/**
 * Generates a registration signature
 * @param signer - The ethers.js signer
 * @param username - The username
 * @param email - The email
 * @param deadline - The deadline timestamp
 * @param domain - The EIP-712 domain
 * @returns The signature
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
 * @param signer - The ethers.js signer
 * @param deadline - The deadline timestamp
 * @param domain - The EIP-712 domain
 * @returns The signature
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
 * Example usage:
 *
 * // Connect to MetaMask
 * const provider = new ethers.BrowserProvider(window.ethereum);
 * const signer = await provider.getSigner();
 *
 * // Get signing info from the server
 * const response = await fetch('http://localhost:3000/api/auth/signing-info');
 * const { domain, deadline } = await response.json();
 *
 * // Register
 * const username = 'testuser';
 * const email = 'test@example.com';
 * const signature = await signRegistration(signer, username, email, deadline, domain);
 *
 * // Send registration request
 * await fetch('http://localhost:3000/api/auth/register', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     username,
 *     email,
 *     deadline,
 *     signature
 *   })
 * });
 *
 * // Login
 * const loginSignature = await signLogin(signer, deadline, domain);
 *
 * // Send login request
 * const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     deadline,
 *     signature: loginSignature
 *   })
 * });
 *
 * // Get token
 * const { token } = await loginResponse.json();
 *
 * // Store token in localStorage
 * localStorage.setItem('token', token);
 */
//# sourceMappingURL=client-auth.js.map