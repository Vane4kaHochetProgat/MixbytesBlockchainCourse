// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyToken is ERC20Votes {
    uint8 private constant DECIMALS = 6;
    uint256 private constant INITIAL_SUPPLY = 100;

    constructor() ERC20("MyToken", "MYT") ERC20Permit("MyToken") {
        _mint(msg.sender, INITIAL_SUPPLY * 10 ** DECIMALS);
    }

    function decimals() public view virtual override returns (uint8) {
        return DECIMALS;
    }
}