const {ethers, upgrades} = require("hardhat");
const {logDeploy} = require("../utils");

async function main() {
    const [owner] = await ethers.getSigners();
    // We get the contract to deploy
    console.log(`Deploying from ${owner.address}`);


    const Contract = await ethers.getContractFactory("Treasury");
    const contract = await upgrades.deployProxy(Contract,
        [
            "0x52b502e0c7986A3c705DCf411E768e5cE90c87ec", // tokenAddress
            "0x7f2d71297334C5d14fCc89BBae242F41bbb5d5FE", // approveAddress
            70, // _depositFee 0.7%
            ["0x7f2d71297334C5d14fCc89BBae242F41bbb5d5FE"], // allowedAddresses
        ], {
            initializer: "initialize",
            kind: "uups",
            redeployImplementation: "always",
        });
    await contract.waitForDeployment();

    logDeploy("Treasury", await contract.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
