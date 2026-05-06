import {expect} from "chai";
import {ethers, upgrades} from "hardhat";

describe("Treasury", () => {
    async function deployFixture() {
        const [owner, approveTarget, keeper, outsider] = await ethers.getSigners();

        const token = await ethers.deployContract("MockERC20");
        await token.mint(owner.address, ethers.parseEther("1000000"));

        const treasuryFactory = await ethers.getContractFactory("Treasury");
        const treasury = await upgrades.deployProxy(
            treasuryFactory,
            [
                await token.getAddress(),
                approveTarget.address,
                250n,
                [keeper.address],
            ],
            {kind: "uups", initializer: "initialize"}
        );

        return {owner, approveTarget, keeper, outsider, token, treasury};
    }

    it("reverts fee calculation when caller is not allowlisted", async () => {
        const {treasury, outsider} = await deployFixture();

        const calc = treasury.connect(outsider).getFunction("calculateAndUpdateFee");
        await expect(calc(1n, 10_000n)).to.be.revertedWith("Treasury: only allowed addresses");
    });

    it("computes fee in basis points for allowlisted caller", async () => {
        const {treasury, keeper} = await deployFixture();

        const gross = 10_000n;
        const calc = treasury.connect(keeper).getFunction("calculateAndUpdateFee");

        await expect(calc(123n, gross))
            .to.emit(treasury, "FeeCalculated")
            .withArgs(123n, gross, 250n);

        const totalFee = treasury.getFunction("totalFeeAmount");
        expect(await totalFee()).to.equal(250n);

        const net = await calc.staticCall(124n, gross);
        expect(net).to.equal(gross - 250n);
    });

    it("withdraws ERC-20 reserves to arbitrary recipient under admin / owner", async () => {
        const {owner, outsider, token, treasury} = await deployFixture();

        await token.transfer(await treasury.getAddress(), ethers.parseEther("10"));
        const withdraw = treasury.connect(owner).getFunction("withdraw");
        await expect(withdraw(await token.getAddress(), outsider.address, ethers.parseEther("3"))).to.emit(
            treasury,
            "Withdraw"
        );

        expect(await token.balanceOf(outsider.address)).to.equal(ethers.parseEther("3"));
    });
});
