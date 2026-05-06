import "dotenv/config";
import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "./tasks";

const rawOwnerKey = process.env.OWNER_KEY?.trim();
const rpcAccounts =
    rawOwnerKey && rawOwnerKey !== '""'
        ? [rawOwnerKey.startsWith("0x") ? rawOwnerKey : `0x${rawOwnerKey}`]
        : undefined;

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
            ...(rpcAccounts ? {accounts: rpcAccounts} : {}),
        },
        base: {
            chainId: 8453,
            url: "https://mainnet.base.org",
            ...(rpcAccounts ? {accounts: rpcAccounts} : {}),
        },
        testnet_ulx: {
            url: "https://ultron-dev.io",
            ...(rpcAccounts ? {accounts: rpcAccounts} : {}),
        },
        ulx: {
            url: "https://ultron-rpc.net",
            ...(rpcAccounts ? {accounts: rpcAccounts} : {}),
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
