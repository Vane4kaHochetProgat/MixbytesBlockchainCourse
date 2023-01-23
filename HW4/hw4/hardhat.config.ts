import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const CHAIN_IDS = {
    hardhat: 31337,
}

const config: HardhatUserConfig = {
    networks: {
        hardhat: {
            chainId: CHAIN_IDS.hardhat,
            forking: {
                url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
            },
        },
    },
    solidity: "0.8.17",
};

export default config;