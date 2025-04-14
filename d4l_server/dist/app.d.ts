import { FastifyInstance } from 'fastify';
declare module 'fastify' {
    interface FastifyRequest {
        user: {
            wallet: string;
            sessionId: string;
            isAdmin: boolean;
        };
    }
}
declare const server: FastifyInstance;
export default server;
