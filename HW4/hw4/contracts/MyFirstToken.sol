// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyFirstToken is ERC20 {
    constructor(uint256 initialSupply) public ERC20("My first token", "MYT1") {
        _mint(msg.sender, initialSupply);
    }
}