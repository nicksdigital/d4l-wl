// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// This is a placeholder contract to ensure typechain can generate something

contract Mock {
    string public greeting = "Hello, World!";
    
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
    
    function getGreeting() public view returns (string memory) {
        return greeting;
    }
}
