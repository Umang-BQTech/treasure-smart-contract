const {ethers, upgrades} = require("hardhat");
const {logDeploy} = require("../utils");

async function main() {
    const [owner] = await ethers.getSigners();
    // We get the contract to deploy
    console.log(`Deploying from ${owner.address}`);


    const Contract = await ethers.getContractFactory("TreasuryBridge");
    const contract = await upgrades.deployProxy(Contract,
        [
            "0xd016ea99Fc64B5f93a877a3316d18c0cCebd79E9", // _tokenAddress
            "0x0000000000000000000000000000000000000000", // _bridgeAddress
            "0x0000000000000000000000000000000000000000", // _bridgeErc20HandlerAddress
            "0xd703361ec5bd2ac51637d5C54e8539baA65D44F6", // _treasureAddress
            "0x04dEF6Ff8b5FED32784BB3b7a4D956a382CFbFaC", // _akashaBridge
            1, // _destinationChainId
            "0x000000000000000000000052b502e0c7986A3c705DCf411E768e5cE90c87ec01", // _resourceId
            ["0x0000000000000000000000000000000000000000"], // allowedAddresses
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
