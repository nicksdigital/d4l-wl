// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

/**
 * @title D4LPacker
 * @dev Library for efficiently packing and unpacking data
 */
library D4LPacker {
    /**
     * @dev Packs multiple uint8 values into a single uint256
     * @param values Array of uint8 values to pack
     * @return packed The packed uint256 value
     */
    function packUint8Array(uint8[] memory values) internal pure returns (uint256 packed) {
        require(values.length <= 32, "D4LPacker: too many values to pack");
        
        for (uint256 i = 0; i < values.length; i++) {
            packed |= uint256(values[i]) << (i * 8);
        }
        
        return packed;
    }
    
    /**
     * @dev Unpacks a uint256 into multiple uint8 values
     * @param packed The packed uint256 value
     * @param length The number of uint8 values to unpack
     * @return values Array of unpacked uint8 values
     */
    function unpackToUint8Array(uint256 packed, uint8 length) internal pure returns (uint8[] memory values) {
        require(length <= 32, "D4LPacker: too many values to unpack");
        
        values = new uint8[](length);
        
        for (uint8 i = 0; i < length; i++) {
            values[i] = uint8((packed >> (i * 8)) & 0xFF);
        }
        
        return values;
    }
    
    /**
     * @dev Packs multiple uint16 values into a single uint256
     * @param values Array of uint16 values to pack
     * @return packed The packed uint256 value
     */
    function packUint16Array(uint16[] memory values) internal pure returns (uint256 packed) {
        require(values.length <= 16, "D4LPacker: too many values to pack");
        
        for (uint256 i = 0; i < values.length; i++) {
            packed |= uint256(values[i]) << (i * 16);
        }
        
        return packed;
    }
    
    /**
     * @dev Unpacks a uint256 into multiple uint16 values
     * @param packed The packed uint256 value
     * @param length The number of uint16 values to unpack
     * @return values Array of unpacked uint16 values
     */
    function unpackToUint16Array(uint256 packed, uint8 length) internal pure returns (uint16[] memory values) {
        require(length <= 16, "D4LPacker: too many values to unpack");
        
        values = new uint16[](length);
        
        for (uint8 i = 0; i < length; i++) {
            values[i] = uint16((packed >> (i * 16)) & 0xFFFF);
        }
        
        return values;
    }
    
    /**
     * @dev Packs multiple uint32 values into a single uint256
     * @param values Array of uint32 values to pack
     * @return packed The packed uint256 value
     */
    function packUint32Array(uint32[] memory values) internal pure returns (uint256 packed) {
        require(values.length <= 8, "D4LPacker: too many values to pack");
        
        for (uint256 i = 0; i < values.length; i++) {
            packed |= uint256(values[i]) << (i * 32);
        }
        
        return packed;
    }
    
    /**
     * @dev Unpacks a uint256 into multiple uint32 values
     * @param packed The packed uint256 value
     * @param length The number of uint32 values to unpack
     * @return values Array of unpacked uint32 values
     */
    function unpackToUint32Array(uint256 packed, uint8 length) internal pure returns (uint32[] memory values) {
        require(length <= 8, "D4LPacker: too many values to unpack");
        
        values = new uint32[](length);
        
        for (uint8 i = 0; i < length; i++) {
            values[i] = uint32((packed >> (i * 32)) & 0xFFFFFFFF);
        }
        
        return values;
    }
    
    /**
     * @dev Packs multiple uint64 values into a single uint256
     * @param values Array of uint64 values to pack
     * @return packed The packed uint256 value
     */
    function packUint64Array(uint64[] memory values) internal pure returns (uint256 packed) {
        require(values.length <= 4, "D4LPacker: too many values to pack");
        
        for (uint256 i = 0; i < values.length; i++) {
            packed |= uint256(values[i]) << (i * 64);
        }
        
        return packed;
    }
    
    /**
     * @dev Unpacks a uint256 into multiple uint64 values
     * @param packed The packed uint256 value
     * @param length The number of uint64 values to unpack
     * @return values Array of unpacked uint64 values
     */
    function unpackToUint64Array(uint256 packed, uint8 length) internal pure returns (uint64[] memory values) {
        require(length <= 4, "D4LPacker: too many values to unpack");
        
        values = new uint64[](length);
        
        for (uint8 i = 0; i < length; i++) {
            values[i] = uint64((packed >> (i * 64)) & 0xFFFFFFFFFFFFFFFF);
        }
        
        return values;
    }
    
    /**
     * @dev Packs multiple boolean values into a single uint256
     * @param values Array of boolean values to pack
     * @return packed The packed uint256 value
     */
    function packBoolArray(bool[] memory values) internal pure returns (uint256 packed) {
        require(values.length <= 256, "D4LPacker: too many values to pack");
        
        for (uint256 i = 0; i < values.length; i++) {
            if (values[i]) {
                packed |= 1 << i;
            }
        }
        
        return packed;
    }
    
    /**
     * @dev Unpacks a uint256 into multiple boolean values
     * @param packed The packed uint256 value
     * @param length The number of boolean values to unpack
     * @return values Array of unpacked boolean values
     */
    function unpackToBoolArray(uint256 packed, uint16 length) internal pure returns (bool[] memory values) {
        require(length <= 256, "D4LPacker: too many values to unpack");
        
        values = new bool[](length);
        
        for (uint16 i = 0; i < length; i++) {
            values[i] = (packed & (1 << i)) != 0;
        }
        
        return values;
    }
    
    /**
     * @dev Packs an address and a uint96 into a single uint256
     * @param addr The address to pack
     * @param value The uint96 value to pack
     * @return packed The packed uint256 value
     */
    function packAddressUint96(address addr, uint96 value) internal pure returns (uint256 packed) {
        return (uint256(uint160(addr)) << 96) | uint256(value);
    }
    
    /**
     * @dev Unpacks a uint256 into an address and a uint96
     * @param packed The packed uint256 value
     * @return addr The unpacked address
     * @return value The unpacked uint96 value
     */
    function unpackAddressUint96(uint256 packed) internal pure returns (address addr, uint96 value) {
        addr = address(uint160(packed >> 96));
        value = uint96(packed);
    }
    
    /**
     * @dev Packs two uint128 values into a single uint256
     * @param a The first uint128 value
     * @param b The second uint128 value
     * @return packed The packed uint256 value
     */
    function packUint128Pair(uint128 a, uint128 b) internal pure returns (uint256 packed) {
        return (uint256(a) << 128) | uint256(b);
    }
    
    /**
     * @dev Unpacks a uint256 into two uint128 values
     * @param packed The packed uint256 value
     * @return a The first unpacked uint128 value
     * @return b The second unpacked uint128 value
     */
    function unpackUint128Pair(uint256 packed) internal pure returns (uint128 a, uint128 b) {
        a = uint128(packed >> 128);
        b = uint128(packed);
    }
    
    /**
     * @dev Packs four uint64 values into a single uint256
     * @param a The first uint64 value
     * @param b The second uint64 value
     * @param c The third uint64 value
     * @param d The fourth uint64 value
     * @return packed The packed uint256 value
     */
    function packUint64Quad(uint64 a, uint64 b, uint64 c, uint64 d) internal pure returns (uint256 packed) {
        return (uint256(a) << 192) | (uint256(b) << 128) | (uint256(c) << 64) | uint256(d);
    }
    
    /**
     * @dev Unpacks a uint256 into four uint64 values
     * @param packed The packed uint256 value
     * @return a The first unpacked uint64 value
     * @return b The second unpacked uint64 value
     * @return c The third unpacked uint64 value
     * @return d The fourth unpacked uint64 value
     */
    function unpackUint64Quad(uint256 packed) internal pure returns (uint64 a, uint64 b, uint64 c, uint64 d) {
        a = uint64(packed >> 192);
        b = uint64(packed >> 128);
        c = uint64(packed >> 64);
        d = uint64(packed);
    }
    
    /**
     * @dev Packs a bytes32 and a uint32 into a single bytes32
     * @param data The bytes32 value to pack
     * @param value The uint32 value to pack
     * @return packed The packed bytes32 value
     */
    function packBytes32Uint32(bytes32 data, uint32 value) internal pure returns (bytes32 packed) {
        // Clear the last 4 bytes of data
        bytes32 maskedData = bytes32(uint256(data) & ~uint256(0xFFFFFFFF));
        // Combine with value
        return maskedData | bytes32(uint256(value));
    }
    
    /**
     * @dev Unpacks a bytes32 into a bytes32 and a uint32
     * @param packed The packed bytes32 value
     * @return data The unpacked bytes32 value
     * @return value The unpacked uint32 value
     */
    function unpackBytes32Uint32(bytes32 packed) internal pure returns (bytes32 data, uint32 value) {
        value = uint32(uint256(packed));
        data = bytes32(uint256(packed) & ~uint256(0xFFFFFFFF));
    }
    
    /**
     * @dev Packs a bytes32 and a uint64 into a single bytes32
     * @param data The bytes32 value to pack
     * @param value The uint64 value to pack
     * @return packed The packed bytes32 value
     */
    function packBytes32Uint64(bytes32 data, uint64 value) internal pure returns (bytes32 packed) {
        // Clear the last 8 bytes of data
        bytes32 maskedData = bytes32(uint256(data) & ~uint256(0xFFFFFFFFFFFFFFFF));
        // Combine with value
        return maskedData | bytes32(uint256(value));
    }
    
    /**
     * @dev Unpacks a bytes32 into a bytes32 and a uint64
     * @param packed The packed bytes32 value
     * @return data The unpacked bytes32 value
     * @return value The unpacked uint64 value
     */
    function unpackBytes32Uint64(bytes32 packed) internal pure returns (bytes32 data, uint64 value) {
        value = uint64(uint256(packed));
        data = bytes32(uint256(packed) & ~uint256(0xFFFFFFFFFFFFFFFF));
    }
    
    /**
     * @dev Packs multiple small values into a single uint256
     * @param values Array of values to pack
     * @param bitSizes Array of bit sizes for each value
     * @return packed The packed uint256 value
     */
    function packValues(uint256[] memory values, uint8[] memory bitSizes) internal pure returns (uint256 packed) {
        require(values.length == bitSizes.length, "D4LPacker: array length mismatch");
        
        uint256 bitPosition = 0;
        
        for (uint256 i = 0; i < values.length; i++) {
            uint256 mask = (1 << bitSizes[i]) - 1;
            require((values[i] & mask) == values[i], "D4LPacker: value too large for bit size");
            
            packed |= (values[i] & mask) << bitPosition;
            bitPosition += bitSizes[i];
            
            require(bitPosition <= 256, "D4LPacker: total bits exceed 256");
        }
        
        return packed;
    }
    
    /**
     * @dev Unpacks a uint256 into multiple values with specified bit sizes
     * @param packed The packed uint256 value
     * @param bitSizes Array of bit sizes for each value
     * @return values Array of unpacked values
     */
    function unpackValues(uint256 packed, uint8[] memory bitSizes) internal pure returns (uint256[] memory values) {
        values = new uint256[](bitSizes.length);
        
        uint256 bitPosition = 0;
        
        for (uint256 i = 0; i < bitSizes.length; i++) {
            uint256 mask = (1 << bitSizes[i]) - 1;
            values[i] = (packed >> bitPosition) & mask;
            bitPosition += bitSizes[i];
            
            require(bitPosition <= 256, "D4LPacker: total bits exceed 256");
        }
        
        return values;
    }
    
    /**
     * @dev Packs a route ID, chain ID, and timestamp into a single bytes32
     * @param routeId The route ID (bytes32)
     * @param chainId The chain ID (uint32)
     * @param timestamp The timestamp (uint32)
     * @return packed The packed bytes32 value
     */
    function packRouteData(bytes32 routeId, uint32 chainId, uint32 timestamp) internal pure returns (bytes32 packed) {
        // Take the first 24 bytes of the route ID
        bytes32 maskedRouteId = bytes32(uint256(routeId) & ~uint256(0xFFFFFFFFFFFFFFFF));
        // Combine with chain ID and timestamp
        return maskedRouteId | bytes32((uint256(chainId) << 32) | uint256(timestamp));
    }
    
    /**
     * @dev Unpacks a bytes32 into a route ID, chain ID, and timestamp
     * @param packed The packed bytes32 value
     * @return routeId The unpacked route ID
     * @return chainId The unpacked chain ID
     * @return timestamp The unpacked timestamp
     */
    function unpackRouteData(bytes32 packed) internal pure returns (bytes32 routeId, uint32 chainId, uint32 timestamp) {
        routeId = bytes32(uint256(packed) & ~uint256(0xFFFFFFFFFFFFFFFF));
        chainId = uint32(uint256(packed) >> 32);
        timestamp = uint32(uint256(packed));
    }
    
    /**
     * @dev Packs a route ID, permission level, and flags into a single bytes32
     * @param routeId The route ID (bytes32)
     * @param permissionLevel The permission level (uint8)
     * @param flags The flags (uint8)
     * @return packed The packed bytes32 value
     */
    function packRouteMetadata(bytes32 routeId, uint8 permissionLevel, uint8 flags) internal pure returns (bytes32 packed) {
        // Take the first 30 bytes of the route ID
        bytes32 maskedRouteId = bytes32(uint256(routeId) & ~uint256(0xFFFF));
        // Combine with permission level and flags
        return maskedRouteId | bytes32((uint256(permissionLevel) << 8) | uint256(flags));
    }
    
    /**
     * @dev Unpacks a bytes32 into a route ID, permission level, and flags
     * @param packed The packed bytes32 value
     * @return routeId The unpacked route ID
     * @return permissionLevel The unpacked permission level
     * @return flags The unpacked flags
     */
    function unpackRouteMetadata(bytes32 packed) internal pure returns (bytes32 routeId, uint8 permissionLevel, uint8 flags) {
        routeId = bytes32(uint256(packed) & ~uint256(0xFFFF));
        permissionLevel = uint8(uint256(packed) >> 8);
        flags = uint8(uint256(packed));
    }
    
    /**
     * @dev Packs a route ID and a selector into a single bytes32
     * @param routeId The route ID (bytes28)
     * @param selector The function selector (bytes4)
     * @return packed The packed bytes32 value
     */
    function packRouteSelector(bytes28 routeId, bytes4 selector) internal pure returns (bytes32 packed) {
        return bytes32(routeId) | bytes32(selector);
    }
    
    /**
     * @dev Unpacks a bytes32 into a route ID and a selector
     * @param packed The packed bytes32 value
     * @return routeId The unpacked route ID
     * @return selector The unpacked function selector
     */
    function unpackRouteSelector(bytes32 packed) internal pure returns (bytes28 routeId, bytes4 selector) {
        routeId = bytes28(packed & bytes32(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000000000000000000000000000));
        selector = bytes4(packed);
    }
    
    /**
     * @dev Packs transient storage data for a route execution
     * @param routeId The route ID
     * @param caller The caller address
     * @param sourceChainId The source chain ID
     * @param selector The function selector
     * @return packed The packed uint256 value
     */
    function packTransientData(
        bytes32 routeId,
        address caller,
        uint64 sourceChainId,
        bytes4 selector
    ) internal pure returns (uint256 packed) {
        // We can't pack the entire routeId (bytes32) into a uint256 along with the other data
        // So we'll take the last 8 bytes of the routeId as a uint64
        uint64 routeIdPart = uint64(uint256(routeId));
        
        // Pack the data: routeIdPart (64 bits) | caller (160 bits) | sourceChainId (32 bits)
        packed = (uint256(routeIdPart) << 192) | (uint256(uint160(caller)) << 32) | uint256(sourceChainId);
        
        // We still have 32 bits left, which we can use for the selector
        // Convert the selector to uint32
        uint32 selectorUint = uint32(bytes4(selector));
        
        // Add the selector to the packed data
        packed = (packed << 32) | uint256(selectorUint);
        
        return packed;
    }
    
    /**
     * @dev Unpacks transient storage data for a route execution
     * @param packed The packed uint256 value
     * @return routeIdPart The unpacked route ID part (last 8 bytes)
     * @return caller The unpacked caller address
     * @return sourceChainId The unpacked source chain ID
     * @return selector The unpacked function selector
     */
    function unpackTransientData(uint256 packed) internal pure returns (
        uint64 routeIdPart,
        address caller,
        uint64 sourceChainId,
        bytes4 selector
    ) {
        // Extract the selector (last 32 bits)
        selector = bytes4(uint32(packed));
        
        // Shift right to remove the selector
        packed = packed >> 32;
        
        // Extract the sourceChainId (next 32 bits)
        sourceChainId = uint64(uint32(packed));
        
        // Shift right to remove the sourceChainId
        packed = packed >> 32;
        
        // Extract the caller (next 160 bits)
        caller = address(uint160(packed));
        
        // Shift right to remove the caller
        packed = packed >> 160;
        
        // Extract the routeIdPart (remaining 32 bits)
        routeIdPart = uint64(packed);
    }
}
