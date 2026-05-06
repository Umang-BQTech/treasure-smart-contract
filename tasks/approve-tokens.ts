import {task, types} from "hardhat/config";

interface TaskParams {
    contract: string;
    token: string;
    approveAddress: string;
}

task("approve-tokens")
    .setDescription("Call Treasury.approveToken (admin) to set ERC-20 allowance for a spender")
    .addParam<string>("contract", "Contract address", undefined, types.string)
    .addParam<string>("token", "Token address", undefined, types.string)
    .addParam<string>("approveAddress", "Approve address", undefined, types.string)
    .setAction(
        async ({
                   contract: contractAddress,
                   token: tokenAddress,
                   approveAddress: approveAddress
               }: TaskParams, {ethers, network}) => {
            if (!ethers.isAddress(contractAddress)) {
                throw new Error("Invalid contract address");
            }
            if (!ethers.isAddress(tokenAddress)) {
                throw new Error("Invalid token address");
            }

            if (!ethers.isAddress(approveAddress)) {
                throw new Error("Invalid approve address");
            }

            const networkName = network.name;
            console.log(`Network name: ${networkName}`);

            const [deployer] = await ethers.getSigners();
            const treasury = await ethers.getContractAt(
                "Treasury",
                contractAddress,
                deployer
            );

            const tx = await treasury.approveToken(tokenAddress, approveAddress);
            await tx.wait();
            console.log(
                `Treasury ${contractAddress} approve tokens`
            );
        }
    );
