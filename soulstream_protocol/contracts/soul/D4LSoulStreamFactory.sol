// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./D4LSoulStreamRegistryFactory.sol";
import "./D4LSoulflowRouterFactory.sol";
import "./D4LSoulflowStakingRouteFactory.sol";
import "../bridge/D4LLayerZeroBridgeAdapterFactory.sol";
import "../interfaces/ID4LSoulStreamRegistry.sol";
import "./D4LSoulflowRouter.sol";

/**
 * @title D4LSoulStreamFactory
 * @dev Factory for deploying SoulStream components
 */
contract D4LSoulStreamFactory is Ownable {
    // The registry contract
    address public registry;

    // The router contract
    address public router;

    // The bridge adapter contract
    address public bridgeAdapter;

    // Component factories
    D4LSoulStreamRegistryFactory public registryFactory;
    D4LSoulflowRouterFactory public routerFactory;
    D4LSoulflowStakingRouteFactory public stakingRouteFactory;
    D4LLayerZeroBridgeAdapterFactory public bridgeAdapterFactory;

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        // Deploy the component factories
        registryFactory = new D4LSoulStreamRegistryFactory();
        routerFactory = new D4LSoulflowRouterFactory();
        stakingRouteFactory = new D4LSoulflowStakingRouteFactory();
        bridgeAdapterFactory = new D4LLayerZeroBridgeAdapterFactory();
    }

    /**
     * @dev Deploys the registry
     * @param admin The admin address
     * @return registryAddress The address of the deployed registry
     */
    function deployRegistry(
        address admin
    ) external onlyOwner returns (address registryAddress) {
        require(registry == address(0), "D4LSoulStreamFactory: registry already deployed");

        // Deploy the registry using the factory
        registry = registryFactory.deployRegistry(admin);

        return registry;
    }

    /**
     * @dev Deploys the router
     * @param admin The admin address
     * @return routerAddress The address of the deployed router
     */
    function deployRouter(
        address admin
    ) external onlyOwner returns (address routerAddress) {
        require(registry != address(0), "D4LSoulStreamFactory: registry not deployed");
        require(router == address(0), "D4LSoulStreamFactory: router already deployed");

        // Deploy the router using the factory
        router = routerFactory.deployRouter(admin, registry);

        return router;
    }

    /**
     * @dev Deploys a bridge adapter
     * @param lzEndpoint The LayerZero endpoint address
     * @param owner The owner of the bridge adapter
     * @return bridgeAdapterAddress The address of the deployed bridge adapter
     */
    function deployBridgeAdapter(
        address lzEndpoint,
        address owner
    ) external onlyOwner returns (address bridgeAdapterAddress) {
        require(router != address(0), "D4LSoulStreamFactory: router not deployed");
        require(bridgeAdapter == address(0), "D4LSoulStreamFactory: bridge adapter already deployed");

        // Deploy the bridge adapter using the factory
        bridgeAdapter = bridgeAdapterFactory.deployBridgeAdapter(lzEndpoint, router, owner);

        // Set the bridge adapter in the router
        D4LSoulflowRouter(payable(router)).setBridgeAdapter(bridgeAdapter);

        return bridgeAdapter;
    }

    /**
     * @dev Deploys a staking route implementation
     * @param name The name of the route
     * @param supportedChains Array of supported chain IDs
     * @param owner The owner of the route implementation
     * @param lockDuration The lock duration in seconds
     * @param rewardRate The reward rate
     * @return implementation The address of the deployed implementation
     */
    function deployStakingRouteImplementation(
        string memory name,
        uint256[] memory supportedChains,
        address owner,
        uint256 lockDuration,
        uint256 rewardRate
    ) external onlyOwner returns (address implementation) {
        require(registry != address(0), "D4LSoulStreamFactory: registry not deployed");
        require(router != address(0), "D4LSoulStreamFactory: router not deployed");

        // Deploy the staking route implementation using the factory
        implementation = stakingRouteFactory.deployStakingRouteImplementation(
            name,
            router,
            registry,
            supportedChains,
            owner,
            lockDuration,
            rewardRate
        );

        return implementation;
    }

    /**
     * @dev Sets up a complete SoulStream system
     * @param admin The admin address
     * @param stakingRouteOwner The owner of the staking route
     * @param lockDuration The lock duration in seconds
     * @param rewardRate The reward rate
     * @return registryAddress The address of the deployed registry
     * @return routerAddress The address of the deployed router
     * @return stakingRouteAddress The address of the deployed staking route
     */
    function setupSoulStream(
        address admin,
        address stakingRouteOwner,
        uint256 lockDuration,
        uint256 rewardRate
    ) external onlyOwner returns (
        address registryAddress,
        address routerAddress,
        address stakingRouteAddress
    ) {
        // Deploy the registry
        registryAddress = this.deployRegistry(admin);

        // Deploy the router
        routerAddress = this.deployRouter(admin);

        // Deploy the staking route implementation
        uint256[] memory supportedChains = new uint256[](1);
        supportedChains[0] = block.chainid;

        stakingRouteAddress = this.deployStakingRouteImplementation(
            "D4L Staking Route",
            supportedChains,
            stakingRouteOwner,
            lockDuration,
            rewardRate
        );

        return (registryAddress, routerAddress, stakingRouteAddress);
    }
}
