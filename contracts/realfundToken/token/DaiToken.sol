// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import './ERC20.sol';

contract DaiToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("DAI", "DAI") public {
        _mint(msg.sender, initialSupply);
    }
}
