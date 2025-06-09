const {ethers, upgrades} = require("hardhat");
const {logDeploy} = require("../utils");

async function main() {
    const [owner] = await ethers.getSigners();
    // We get the contract to deploy
    console.log(`Deploying from ${owner.address}`);


    const Contract = await ethers.getContractFactory("Treasury");
    const contract = await upgrades.deployProxy(Contract,
        [
            "0x5De72F76ed17F262307B69a03efCcfCF2bf62E53", // tokenAddress
            "0x689e839655DFDBb2901fd52c4183c89874f33235", // approveAddress
            70, // _depositFee 0.7%
            ["0x689e839655DFDBb2901fd52c4183c89874f33235"], // allowedAddresses
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
