pragma solidity ^0.6.12;

import {FlashLoanReceiverBase} from "@aave/protocol-v2/contracts/flashloan/base/FlashLoanReceiverBase.sol";
import {ILendingPoolAddressesProvider} from "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DebtCollector is FlashLoanReceiverBase {

    address private swapRouter;
    address [] private paths;

    constructor(
        address provider, address [] memory cPaths, address cSwapRouter) public FlashLoanReceiverBase(ILendingPoolAddressesProvider(provider)){
        require(cPaths.length > 2, "Require at least three tokens to perform the operation");
        require(cPaths[0] == cPaths[cPaths.length - 1], "First and last tokens in the array must be similar");
        paths = cPaths;
        swapRouter = cSwapRouter;
    }

    event Logger(uint256 balance, uint256 debt);

    function executeOperation(address[] calldata assets, uint256[] calldata amounts, uint256[] calldata premiums, address initiator, bytes calldata) external override returns (bool) {
        require(assets.length == 1 && amounts.length == 1 && premiums.length == 1, "Only one token can be borrowed");
        require(assets[0] == paths[0], "Token had to match first path token");
        require(initiator == address(this), "Contract should be its own initiator");

        IERC20 value = IERC20(assets[0]);
        value.approve(swapRouter, amounts[0]);
        IUniswapV2Router02(swapRouter).swapExactTokensForTokens(amounts[0], 0, paths, initiator, block.timestamp);

        uint debt = amounts[0].add(premiums[0]);
        require(value.balanceOf(initiator) >= debt);
        emit Logger(value.balanceOf(initiator), debt);
        value.approve(address(LENDING_POOL), debt);

        return true;
    }

    function flashLending(uint256 amount) external {
        address[] memory assets = new address[](1);
        assets[0] = paths[0];

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;

        LENDING_POOL.flashLoan(address(this), assets, amounts, modes, address(0), "", 0);
    }

}
