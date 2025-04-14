import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtPayload } from '../types';
import authService from '../services/auth.service';

// Verify JWT token and attach user to request
export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Verify JWT token
    const payload = await request.jwtVerify<JwtPayload>();
    
    // Verify that the session is still valid
    const isValid = await authService.validateSession(payload.wallet, payload.sessionId);
    
    if (!isValid) {
      return reply.code(401).send({
        success: false,
        error: 'Invalid or expired session'
      });
    }
    
    // Attach user to request
    request.user = {
      wallet: payload.wallet,
      sessionId: payload.sessionId,
      isAdmin: false // Set this based on your admin logic
    };
  } catch (error) {
    return reply.code(401).send({
      success: false,
      error: 'Unauthorized'
    });
  }
}

// Generate EIP-712 domain for client-side signing
export function getDomain(contractName: string, version: string, chainId: number, verifyingContract: string) {
  return {
    name: contractName,
    version: version,
    chainId: chainId,
    verifyingContract: verifyingContract
  };
}

// Generate a deadline timestamp
export function getDeadline(minutes = 30): number {
  return Math.floor(Date.now() / 1000) + minutes * 60;
}
