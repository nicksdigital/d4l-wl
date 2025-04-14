import { FastifyRequest, FastifyReply } from 'fastify';
export declare function verifyJWT(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function getDomain(contractName: string, version: string, chainId: number, verifyingContract: string): {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
};
export declare function getDeadline(minutes?: number): number;
