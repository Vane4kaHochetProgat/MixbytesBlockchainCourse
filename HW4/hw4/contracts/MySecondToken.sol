// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MySecondToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("My second token", "MYT2") {
        _mint(msg.sender, initialSupply);
    }
}