"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = verifyJWT;
exports.getDomain = getDomain;
exports.getDeadline = getDeadline;
const auth_service_1 = __importDefault(require("../services/auth.service"));
// Verify JWT token and attach user to request
async function verifyJWT(request, reply) {
    try {
        // Verify JWT token
        const payload = await request.jwtVerify();
        // Verify that the session is still valid
        const isValid = await auth_service_1.default.validateSession(payload.wallet, payload.sessionId);
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
    }
    catch (error) {
        return reply.code(401).send({
            success: false,
            error: 'Unauthorized'
        });
    }
}
// Generate EIP-712 domain for client-side signing
function getDomain(contractName, version, chainId, verifyingContract) {
    return {
        name: contractName,
        version: version,
        chainId: chainId,
        verifyingContract: verifyingContract
    };
}
// Generate a deadline timestamp
function getDeadline(minutes = 30) {
    return Math.floor(Date.now() / 1000) + minutes * 60;
}
//# sourceMappingURL=auth.js.map