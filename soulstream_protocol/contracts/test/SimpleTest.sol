// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

import "../assets/D4LAssetFactory.sol";

contract SimpleTest {
    D4LAssetFactory public factory;
    
    constructor(address soulManager) {
        factory = new D4LAssetFactory(soulManager, address(this));
    }
}
