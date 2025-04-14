// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "./D4LSoulStreamRegistryImpl.sol";
import "../interfaces/ID4LSoulStreamRegistry.sol";
import "./D4LSoulflowRouter.sol";
import "./D4LSoulflowStakingRoute.sol";
import "../bridge/D4LLayerZeroBridgeAdapter.sol";

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

    // Events
    event RegistryDeployed(address indexed registry);
    event RouterDeployed(address indexed router);
    event BridgeAdapterDeployed(address indexed bridgeAdapter, address lzEndpoint);
    event RouteImplementationDeployed(address indexed implementation, string name, uint8 routeType);

    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deploys the registry
     * @param admin The admin address
     * @return registryAddress The address of the deployed registry
     */
    function deployRegistry(
        address admin
    ) external onlyOwner returns (address registryAddress) {
        require(registry == address(0), "D4LSoulStreamFactory: registry already deployed");

        // Deploy the registry
        D4LSoulStreamRegistryImpl registryContract = new D4LSoulStreamRegistryImpl(admin);

        registry = address(registryContract);

        emit RegistryDeployed(registry);

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

        // Deploy the router
        D4LSoulflowRouter routerContract = new D4LSoulflowRouter(admin, registry);

        router = address(routerContract);

        emit RouterDeployed(router);

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

        // Deploy the bridge adapter
        D4LLayerZeroBridgeAdapter adapter = new D4LLayerZeroBridgeAdapter(
            lzEndpoint,
            router,
            owner
        );

        bridgeAdapter = address(adapter);

        // Set the bridge adapter in the router
        D4LSoulflowRouter(router).setBridgeAdapter(bridgeAdapter);

        emit BridgeAdapterDeployed(bridgeAdapter, lzEndpoint);

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

        // Deploy the staking route implementation
        D4LSoulflowStakingRoute stakingRoute = new D4LSoulflowStakingRoute(
            name,
            router,
            registry,
            supportedChains,
            owner,
            lockDuration,
            rewardRate
        );

        implementation = address(stakingRoute);

        emit RouteImplementationDeployed(implementation, name, 1);

        return implementation;
    }

    /**
     * @dev Sets up a complete SoulStream system
     * @param admin The admin address
     * @param stakingRouteOwner The owner of the staking route
     * @param lockDuration The lock duration in seconds
     * @param rewardRate The reward rate
     * @param lzEndpoint The LayerZero endpoint address (optional, set to zero address to skip bridge adapter deployment)
     * @return registryAddress The address of the deployed registry
     * @return routerAddress The address of the deployed router
     * @return stakingRouteAddress The address of the deployed staking route
     * @return bridgeAdapterAddress The address of the deployed bridge adapter (zero address if not deployed)
     */
    function setupSoulStream(
        address admin,
        address stakingRouteOwner,
        uint256 lockDuration,
        uint256 rewardRate,
        address lzEndpoint
    ) external onlyOwner returns (
        address registryAddress,
        address routerAddress,
        address stakingRouteAddress,
        address bridgeAdapterAddress
    ) {
        // Deploy the registry
        registryAddress = deployRegistry(admin);

        // Deploy the router
        routerAddress = deployRouter(admin);

        // Deploy the bridge adapter if lzEndpoint is provided
        if (lzEndpoint != address(0)) {
            bridgeAdapterAddress = deployBridgeAdapter(lzEndpoint, admin);
        }

        // Deploy the staking route implementation
        uint256[] memory supportedChains = new uint256[](1);
        supportedChains[0] = block.chainid;

        stakingRouteAddress = deployStakingRouteImplementation(
            "D4L Staking Route",
            supportedChains,
            stakingRouteOwner,
            lockDuration,
            rewardRate
        );

        return (registryAddress, routerAddress, stakingRouteAddress, bridgeAdapterAddress);
    }
}
