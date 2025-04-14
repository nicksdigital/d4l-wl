/**
 * Client-side authentication utilities
 *
 * This file is meant to be used as a reference for client-side implementation.
 * It should be adapted to work with the client's environment (browser, React Native, etc.)
 */
import { ethers } from 'ethers';
/**
 * Generates a registration signature
 * @param signer - The ethers.js signer
 * @param username - The username
 * @param email - The email
 * @param deadline - The deadline timestamp
 * @param domain - The EIP-712 domain
 * @returns The signature
 */
export declare function signRegistration(signer: ethers.Signer, username: string, email: string, deadline: number, domain: any): Promise<string>;
/**
 * Generates a login signature
 * @param signer - The ethers.js signer
 * @param deadline - The deadline timestamp
 * @param domain - The EIP-712 domain
 * @returns The signature
 */
export declare function signLogin(signer: ethers.Signer, deadline: number, domain: any): Promise<string>;
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
