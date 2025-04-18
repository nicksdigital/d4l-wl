// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/ID4LSoulStreamRegistry.sol";
import "../libraries/D4LSoulflowRouteLib.sol";
import "../libraries/D4LSoulIdentityLib.sol";
import "./D4LSoulIdentity.sol";

/**
 * @title D4LSoulStreamRegistryImpl
 * @dev Implementation of the SoulStream registry that combines route and identity management
 */
contract D4LSoulStreamRegistryImpl is ID4LSoulStreamRegistry, AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant REGISTRY_ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REGISTRY_ROUTER_MANAGER_ROLE = keccak256("ROUTER_MANAGER_ROLE");
    bytes32 public constant REGISTRY_IDENTITY_MANAGER_ROLE = keccak256("IDENTITY_MANAGER_ROLE");

    // The implementation contract for soul identities
    address public immutable override soulIdentityImplementation;

    // Mapping of routes
    mapping(bytes32 => ID4LSoulflowRoute.SoulflowRoute) private _routes;

    // Mapping of soul identities
    mapping(address => bool) private _isSoulIdentity;

    // Mapping of user to soul identities
    mapping(address => address[]) private _userSoulIdentities;

    /**
     * @dev Constructor
     * @param admin The admin address
     */
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRY_ADMIN_ROLE, admin);
        _grantRole(REGISTRY_ROUTER_MANAGER_ROLE, admin);
        _grantRole(REGISTRY_IDENTITY_MANAGER_ROLE, admin);

        // Deploy the soul identity implementation
        // We use address(this) as the registry parameter for the implementation
        soulIdentityImplementation = address(new D4LSoulIdentity(
            address(0), // owner - will be set during deployment
            bytes32(0), // appSalt - will be set during deployment
            bytes32(0), // routingIntentHash - will be set during deployment
            bytes32(0), // zkProofKey - will be set during deployment
            address(this) // registry
        ));
    }

    /**
     * @dev Creates a new soul identity
     * @param user The user address
     * @param appSalt The app salt
     * @param routingIntentHash The routing intent hash
     * @param zkProofKey Optional zkProof verification key
     * @return soulId The address of the created soul identity
     */
    function createSoulIdentity(
        address user,
        bytes32 appSalt,
        bytes32 routingIntentHash,
        bytes32 zkProofKey
    ) external override onlyRole(REGISTRY_IDENTITY_MANAGER_ROLE) returns (address soulId) {
        // Deploy the soul identity
        soulId = D4LSoulIdentityLib.deploySoulIdentity(
            user,
            appSalt,
            routingIntentHash,
            type(D4LSoulIdentity).creationCode,
            zkProofKey,
            address(this)
        );

        // Register the soul identity
        _isSoulIdentity[soulId] = true;
        _userSoulIdentities[user].push(soulId);

        emit SoulIdentityCreated(user, soulId, appSalt, routingIntentHash);

        return soulId;
    }

    /**
     * @dev Computes the address of a soul identity without deploying it
     * @param user The user address
     * @param appSalt The app salt
     * @param routingIntentHash The routing intent hash
     * @return soulId The computed address of the soul identity
     */
    function computeSoulIdentityAddress(
        address user,
        bytes32 appSalt,
        bytes32 routingIntentHash
    ) external view override returns (address soulId) {
        return D4LSoulIdentityLib.computeSoulIdentityAddress(
            user,
            appSalt,
            routingIntentHash,
            type(D4LSoulIdentity).creationCode,
            bytes32(0), // Default zkProofKey
            address(this) // Registry address
        );
    }

    /**
     * @dev Registers a new route
     * @param fromSoul The source soul identity
     * @param toSoul The destination soul identity
     * @param asset The asset address
     * @param action The action code
     * @param constraintHash The constraint hash
     * @param router The router address
     * @return routeId The ID of the registered route
     */
    function registerRoute(
        address fromSoul,
        address toSoul,
        address asset,
        uint8 action,
        bytes32 constraintHash,
        address router
    ) external override onlyRole(REGISTRY_ROUTER_MANAGER_ROLE) returns (bytes32 routeId) {
        // Validate parameters
        (bool isValid, string memory errorMessage) = D4LSoulflowRouteLib.validateRouteParams(
            fromSoul,
            toSoul,
            router,
            this.isSoul
        );
        
        require(isValid, errorMessage);

        // Create the route
        routeId = D4LSoulflowRouteLib.createRoute(
            _routes,
            fromSoul,
            toSoul,
            asset,
            action,
            constraintHash,
            router
        );

        emit RouteRegistered(
            routeId,
            fromSoul,
            toSoul,
            asset,
            action,
            constraintHash,
            router
        );

        return routeId;
    }

   
   
    /**
     * @dev Updates a route
     * @param routeId The ID of the route to update
     * @param router The new router address (or zero address to keep current)
     * @param active Whether the route should be active
     */
    function updateRoute(
        bytes32 routeId,
        address router,
        bool active
    ) external override onlyRole(REGISTRY_ROUTER_MANAGER_ROLE) {
        // Update the route
        D4LSoulflowRouteLib.updateRoute(
            _routes,
            routeId,
            router,
            active
        );

        emit RouteUpdated(routeId, _routes[routeId].router, active);
    }

    /**
     * @dev Gets the router for a route
     * @param routeId The ID of the route
     * @return router The router address
     */
    function getRouterForRoute(bytes32 routeId) external view override returns (address) {
        ID4LSoulflowRoute.SoulflowRoute storage route = _routes[routeId];

        if (!route.active) {
            return address(0);
        }

        return route.router;
    }

    /**
     * @dev Gets a route by ID
     * @param routeId The ID of the route
     * @return route The route information
     */
    function getRoute(bytes32 routeId) external view override returns (ID4LSoulflowRoute.SoulflowRoute memory) {
        return _routes[routeId];
    }

    /**
     * @dev Gets all soul identities for a user
     * @param user The user address
     * @return soulIds Array of soul identity addresses
     */
    function getUserSoulIdentities(address user) external view override returns (address[] memory) {
        return _userSoulIdentities[user];
    }

    /**
     * @dev Checks if an address is a soul identity
     * @param addr The address to check
     * @return isSoul Whether the address is a soul identity
     */
    function isSoul(address addr) external view override returns (bool) {
        return _isSoulIdentity[addr];
    }
}
