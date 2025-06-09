const {ethers, upgrades} = require("hardhat");
const {logDeploy} = require("../utils");

async function main() {
    const [owner] = await ethers.getSigners();
    // We get the contract to deploy
    console.log(`Deploying from ${owner.address}`);


    const Contract = await ethers.getContractFactory("TreasuryBridge");
    const contract = await upgrades.deployProxy(Contract,
        [
            "0x54b659832f59c24ceC0E4A2Cd193377F1BCEfc3c", // _tokenAddress
            "0x6Ab2A602d1018987Cdcb29aE6fB6E3Ebe44b1412", // _bridgeAddress
            "0xFe21Dd0eC80e744A473770827E1aD6393A5A94F0", // _bridgeErc20HandlerAddress
            "0xA7Bb966A815B79f5e0a07062dDd2D68aDCD63440", // _treasuryAddress
            "0x7a04e724A6641975230467f6bdbD04A64008dC6d", // _akashaBridge
            1, // _destinationChainId
            "0x000000000000000000000052b502e0c7986A3c705DCf411E768e5cE90c87ec01", // _resourceId
            ["0xf74c045d0dA150Cf04D1B8B5fA6aD97dd4Cac409"], // allowedAddresses
        ], {
            initializer: "initialize",
            kind: "uups",
            redeployImplementation: "always",
        });
    await contract.waitForDeployment();

    logDeploy("TreasuryBridge", await contract.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
