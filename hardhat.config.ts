import "dotenv/config";
import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "./tasks";

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.24",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockGasLimit: 1000000000,
        },
        sepolia_base: {
            chainId: 84532,
            url: "https://sepolia.base.org",
            accounts: [process.env.OWNER_KEY] ?? [""],
        },
        base: {
            chainId: 8453,
            url: "https://mainnet.base.org",
            accounts: [process.env.OWNER_KEY] ?? [""],
        },
        testnet_ulx: {
            url: "https://ultron-dev.io",
            accounts: [process.env.OWNER_KEY] ?? [""],
        },
        ulx: {
            url: "https://ultron-rpc.net",
            accounts: [process.env.OWNER_KEY] ?? [""],
        },
    },
    etherscan: {
        apiKey: {
            baseSepolia: process.env.ETHERSCAN_API_KEY,
            base: process.env.ETHERSCAN_API_KEY,
        },
    },
};

export default config;
