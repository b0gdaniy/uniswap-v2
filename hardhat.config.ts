import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'solidity-docgen';

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      blockGasLimit: 20000000,
      throwOnCallFailures: false,
      chainId: 31337,
      forking: {
        url: 'https://eth-mainnet.alchemyapi.io/v2/GrKoZrWutcdzGQeTckSaYaQnvvnE25UC',
        enabled: true,
        //blockNumber: 16612721,
      },
    },
  },
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

export default config;
