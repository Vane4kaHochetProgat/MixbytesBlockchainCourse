// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract MyToken is ERC20Votes {

    constructor() ERC20("MyToken", "MYT") ERC20Permit("MyToken") {
        _mint(msg.sender, 100 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}