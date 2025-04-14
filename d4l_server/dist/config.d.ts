declare const config: {
    server: {
        port: number;
        host: string;
        env: string;
    };
    jwt: {
        secret: string;
        expiration: number;
    };
    admin: {
        apiKey: string;
        privateKey: string;
    };
    cache: {
        useInMemory: boolean;
        disabled: boolean;
        maxAge: number;
        staleWhileRevalidate: number;
    };
    blockchain: {
        rpcUrl: string;
        chainId: number;
        supportedChains: {
            id: number;
            name: string;
            rpc: string | undefined;
        }[];
        privateKey: string;
    };
    contracts: {
        authContract: string;
        registryContract: string;
        routerContract: string;
        D4LSoulIdentity: string;
        D4LSoulflowRouter: string;
        D4LToken: string;
        D4LAirdropController: string;
        D4LRewardRegistry: string;
    };
    database: {
        enabled: boolean;
        user: string | undefined;
        password: string | undefined;
        host: string | undefined;
        port: number;
        name: string | undefined;
        ssl: boolean;
    };
    storage: {
        spaces: {
            endpoint: string | undefined;
            bucket: string | undefined;
            accessKey: string | undefined;
            secretKey: string | undefined;
            url: string | undefined;
            cdnUrl: string | undefined;
        };
    };
    site: {
        url: string;
    };
};
export default config;
