// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.6.12;

// Needed to handle structures externally
pragma experimental ABIEncoderV2;

// Imports

import "../interfaces/IBFactory.sol";
import "../interfaces/IERC20.sol";

contract RealFundSwap {

    IBPool private _pool;
    address private _realfund;
    address private _dai;

    constructor(address pool, address realfund, address dai) public {
        _pool = IBPool(pool);
        _realfund = realfund;
        _dai = dai;
    }

    function swapRealfundForDai(uint daiAmount) external {
        uint price = _pool.getSpotPrice(_realfund, _dai) * 120 / 100;
        uint realfundAmount = price * daiAmount;
        IERC20(_realfund).approve(address(_pool), realfundAmount);
        _pool.swapExactAmountOut(_realfund,realfundAmount,_dai,daiAmount, price);
    }

    function getSpotPrice() external view returns(uint) {
        return _pool.getSpotPrice(_realfund, _dai);
    }

    function getDaiBalance() external view returns(uint) {
        return IERC20(_dai).balanceOf(address(this));
    }

    function getRealfundBalance() external view returns(uint) {
        return IERC20(_realfund).balanceOf(address(this));
    }
}
