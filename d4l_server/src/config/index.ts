import dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '../../.env') });

const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-key',
    expiration: parseInt(process.env.JWT_EXPIRATION || '86400', 10), // 24 hours in seconds
  },
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    chainId: parseInt(process.env.CHAIN_ID || '31337', 10),
    authContractAddress: process.env.AUTH_CONTRACT_ADDRESS || '',
    registryContractAddress: process.env.REGISTRY_CONTRACT_ADDRESS || '',
    routerContractAddress: process.env.ROUTER_CONTRACT_ADDRESS || '',
    privateKey: process.env.PRIVATE_KEY || '',
  },
};

export default config;
