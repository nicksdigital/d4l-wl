import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.29",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 20,
      },
      viaIR: true, // Disable IR for faster compilation during testing
    }
  },
  // Add test-specific configuration
  mocha: {
    timeout: 100000 // Increase timeout for tests
  },
};

export default config;
