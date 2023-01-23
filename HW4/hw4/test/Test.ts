import {time} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";

//can be changed
const initialStock = 999999999;
const liquidity = 50000;
const toSwap = 300;
const swapAfter = 50;

//can't be changed
const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const week = 604800;

describe("Swap tokens", () => {

    it("Should be ended after swap deployment", async function () {
        const [firstTokenOwner, secondTokenOwner, liquidityProvider] = await ethers.getSigners();

        const firstTokenFactory = await ethers.getContractFactory("MyFirstToken");
        const secondTokenFactory = await ethers.getContractFactory("MySecondToken")

        const firstToken = await firstTokenFactory.connect(firstTokenOwner).deploy(initialStock);
        const secondToken = await secondTokenFactory.connect(secondTokenOwner).deploy(initialStock)

        const router = await ethers.getContractAt("IUniswapV2Router02", routerAddress);
        const factory = await ethers.getContractAt("IUniswapV2Factory", await router.factory());

        await firstToken.connect(firstTokenOwner).transfer(liquidityProvider.address, liquidity);
        await secondToken.connect(secondTokenOwner).transfer(liquidityProvider.address, liquidity);

        await secondToken.connect(liquidityProvider).approve(router.address, liquidity);
        await firstToken.connect(liquidityProvider).approve(router.address, liquidity);

        await factory.createPair(firstToken.address, secondToken.address);

        await router.connect(liquidityProvider).addLiquidity(
            firstToken.address,
            secondToken.address,
            liquidity,
            liquidity,
            0,
            0,
            liquidityProvider.address,
            (await time.latest()) + week
        );

        const FirstOwnsAfterLiquidity = await firstToken.balanceOf(firstTokenOwner.getAddress());
        const SecondOwnsAfterLiquidity = await secondToken.balanceOf(secondTokenOwner.getAddress());
        console.log("After liquidity:\n fistOwner's balance: %s firstToken, \n secondOwner's balance: %s secondToken", FirstOwnsAfterLiquidity, SecondOwnsAfterLiquidity);


        await firstToken.connect(firstTokenOwner).approve(router.address, toSwap);
        await router.swapExactTokensForTokens(
            toSwap,
            swapAfter,
            [firstToken.address, secondToken.address],
            firstTokenOwner.address,
            (await time.latest()) + week
        );

        const FirstOwnsFirst = await firstToken.balanceOf(firstTokenOwner.address);
        const FirstOwnsSecond = await secondToken.balanceOf(firstTokenOwner.address);

        console.log("firstOwner owns after swap %s firstToken and %s secondToken", FirstOwnsFirst, FirstOwnsSecond);

        expect(FirstOwnsFirst).to.equal(FirstOwnsAfterLiquidity.sub(toSwap))
        expect(FirstOwnsSecond).to.be.greaterThan(swapAfter);
    })
});