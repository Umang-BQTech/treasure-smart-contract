import {expect} from "chai";
import {ethers, upgrades} from "hardhat";

describe("TreasuryBridge", () => {
    async function deployFixture() {
        const [owner, erc20Handler, keeper, player, outsider] = await ethers.getSigners();

        const token = await ethers.deployContract("MockERC20");
        const bridge = await ethers.deployContract("MockBridge");
        const akasha = await ethers.deployContract("MockAkashaBridge");

        const destinationChainId = 7;
        const resourceId = ethers.id("resource");
        const treasuryOnOtherChain = outsider.address;

        const factory = await ethers.getContractFactory("TreasuryBridge");
        const treasuryBridge = await upgrades.deployProxy(
            factory,
            [
                await token.getAddress(),
                await bridge.getAddress(),
                erc20Handler.address,
                treasuryOnOtherChain,
                await akasha.getAddress(),
                destinationChainId,
                resourceId,
                [keeper.address],
            ],
            {kind: "uups", initializer: "initialize"}
        );

        return {
            owner,
            erc20Handler,
            keeper,
            player,
            token,
            bridge,
            akasha,
            treasuryBridge,
            destinationChainId,
            resourceId,
            treasuryOnOtherChain,
        };
    }

    it("pulls tokens from user, encodes payload, and publishes via Akasha", async () => {
        const {player, token, akasha, treasuryBridge} = await deployFixture();

        const amount = ethers.parseEther("5");
        await token.mint(player.address, amount);

        const nonce = 99;
        const nftId = 4242n;

        await token.connect(player).approve(await treasuryBridge.getAddress(), amount);

        const deposit = treasuryBridge.connect(player).getFunction("depositNFT");
        await expect(deposit(amount, nftId, nonce))
            .to.emit(treasuryBridge, "DepositNFT")
            .withArgs(player.address, amount, nftId);

        expect(await token.balanceOf(await treasuryBridge.getAddress())).to.equal(amount);
        const lastNonce = akasha.getFunction("lastNonce");
        const lastConsistency = akasha.getFunction("lastConsistency");
        expect(await lastNonce()).to.equal(BigInt(nonce));
        expect(await lastConsistency()).to.equal(2);
    });

    it("only allowlisted executors can trigger bridge deposit", async () => {
        const {
            player,
            keeper,
            owner,
            token,
            bridge,
            treasuryBridge,
            destinationChainId,
            resourceId,
            treasuryOnOtherChain,
            erc20Handler,
        } = await deployFixture();

        const amount = ethers.parseEther("2");
        await token.mint(player.address, amount);
        await token.connect(player).approve(await treasuryBridge.getAddress(), amount);
        await treasuryBridge.connect(player).getFunction("depositNFT")(amount, 1n, 1);

        await expect(treasuryBridge.connect(owner).getFunction("bridgeTokens")()).to.be.revertedWith(
            "TreasuryBridge: only allowed addresses"
        );

        await treasuryBridge.connect(keeper).getFunction("bridgeTokens")();

        expect(await bridge.getFunction("lastDomain")()).to.equal(destinationChainId);
        expect(await bridge.getFunction("lastResource")()).to.equal(resourceId);

        const expectedData = ethers.solidityPacked(
            ["uint256", "uint256", "address"],
            [amount, 20n, treasuryOnOtherChain]
        );
        expect(await bridge.getFunction("lastData")()).to.equal(expectedData);

        expect(await token.allowance(await treasuryBridge.getAddress(), erc20Handler.address)).to.equal(amount);
    });
});
