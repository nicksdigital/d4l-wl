declare const config: {
    server: {
        port: number;
        host: string;
        nodeEnv: string;
    };
    jwt: {
        secret: string;
        expiration: number;
    };
    blockchain: {
        rpcUrl: string;
        chainId: number;
        authContractAddress: string;
        registryContractAddress: string;
        routerContractAddress: string;
        privateKey: string;
    };
};
export default config;
