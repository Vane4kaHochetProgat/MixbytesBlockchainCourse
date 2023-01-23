import {expect} from "chai";
import {ethers} from "hardhat";

//Token addresses
const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USTD_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
//Uniswap utils
const PROVIDER_ADDRESS = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
const UNISWAP_V2_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";


describe("DebtCollector", function () {

    it("Credit and swap in limited time", async function () {
        const [WETHOwner] = await ethers.getSigners();

        const DebtCollectorFactory = await ethers.getContractFactory("DebtCollector");

        const DebtCollector = await DebtCollectorFactory.deploy(
            PROVIDER_ADDRESS,
            [WETH_ADDRESS, USTD_ADDRESS, USDC_ADDRESS, WETH_ADDRESS],
            UNISWAP_V2_ROUTER_ADDRESS
        );
        const weth = await ethers.getContractAt("WETH9", WETH_ADDRESS);
        weth.connect(WETHOwner).deposit({value: ethers.utils.parseEther("3")})
        weth.connect(WETHOwner).transfer(DebtCollector.address, ethers.utils.parseEther("0.01"))
        const balanceBefore = await weth.balanceOf(DebtCollector.address)
        console.log("Balance of our flashloan contract: %s gwei \n", balanceBefore.toString())

        await expect(DebtCollector.flashLending(ethers.utils.parseEther("0.01"))).to.emit(DebtCollector, "Logger").withArgs(catchAndCheck(), catchAndCheck());
        const balanceAfter = await weth.balanceOf(DebtCollector.address)
        console.log("New balance of our flashloan contract: %s gwei \n", balanceAfter.toString())

        console.log(((balanceBefore.lte(balanceAfter)) ? "Win: %s gwei" : "Loss: %s gwei "), ((balanceBefore.sub(balanceAfter)).abs()).toString())
    });

    const catchAndCheck = () => {
        return (value: bigint) => {
            return value > 0;
        }
    }
});
