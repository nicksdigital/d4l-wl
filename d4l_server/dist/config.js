"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Application configuration
 */
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const config = {
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || '0.0.0.0',
        env: process.env.NODE_ENV || 'development'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'development-jwt-secret-key-change-in-production',
        expiration: parseInt(process.env.JWT_EXPIRATION || '86400', 10)
    },
    admin: {
        apiKey: process.env.ADMIN_API_KEY || '',
        privateKey: process.env.ADMIN_PRIVATE_KEY || ''
    },
    cache: {
        useInMemory: process.env.USE_IN_MEMORY_CACHE === 'true',
        disabled: process.env.DISABLE_CACHE === 'true',
        maxAge: parseInt(process.env.CACHE_MAX_AGE || '3600', 10),
        staleWhileRevalidate: parseInt(process.env.STALE_WHILE_REVALIDATE || '60', 10)
    },
    blockchain: {
        rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
        chainId: parseInt(process.env.CHAIN_ID || '31337', 10),
        supportedChains: [
            {
                id: 1,
                name: 'Ethereum Mainnet',
                rpc: process.env.ETH_MAINNET_RPC
            },
            {
                id: 137,
                name: 'Polygon Mainnet',
                rpc: process.env.POLYGON_MAINNET_RPC
            },
            {
                id: 8453,
                name: 'Base Mainnet',
                rpc: process.env.BASE_MAINNET_RPC
            }
        ],
        privateKey: process.env.PRIVATE_KEY || ''
    },
    contracts: {
        authContract: process.env.AUTH_CONTRACT_ADDRESS || '',
        registryContract: process.env.REGISTRY_CONTRACT_ADDRESS || '',
        routerContract: process.env.ROUTER_CONTRACT_ADDRESS || '',
        D4LSoulIdentity: process.env.D4L_SOUL_IDENTITY_ADDRESS || '',
        D4LSoulflowRouter: process.env.D4L_SOULFLOW_ROUTER_ADDRESS || '',
        D4LToken: process.env.D4L_TOKEN_ADDRESS || '',
        D4LAirdropController: process.env.D4L_AIRDROP_CONTROLLER_ADDRESS || '',
        D4LRewardRegistry: process.env.D4L_REWARD_REGISTRY_ADDRESS || ''
    },
    database: {
        enabled: true,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        name: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true'
    },
    storage: {
        spaces: {
            endpoint: process.env.DO_SPACES_ENDPOINT,
            bucket: process.env.DO_SPACES_BUCKET,
            accessKey: process.env.DO_SPACES_ACCESS_KEY,
            secretKey: process.env.DO_SPACES_SECRET_KEY,
            url: process.env.DO_SPACES_URL,
            cdnUrl: process.env.DO_SPACES_CDN_URL
        }
    },
    site: {
        url: process.env.SITE_URL || 'http://localhost:3000'
    }
};
exports.default = config;
//# sourceMappingURL=config.js.map