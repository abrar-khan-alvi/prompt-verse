// Hardhat configuration for ESM project (type: "module")
// Using CommonJS format as required by Hardhat when "type": "module" is set.
process.env.TS_NODE_PROJECT = 'tsconfig.hardhat.json';
require('dotenv').config({ path: '.env.local' });

if (!process.env.SEPOLIA_RPC_URL && !process.env.ALCHEMY_API_KEY) {
  console.error(
    'ERROR: ALCHEMY_API_KEY is missing in .env.local. Please add it to deploy to Sepolia.'
  );
}
require('@nomicfoundation/hardhat-toolbox');
/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY || ''}`,
      accounts:
        process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== '0'.repeat(64)
          ? [process.env.PRIVATE_KEY]
          : [],
      chainId: 11155111,
    },
  },
  paths: {
    sources: './contracts', // Pointing to contracts directory
    tests: './test',
    cache: './cache',
    artifacts: './src/lib/artifacts',
  },
};
module.exports = config;
