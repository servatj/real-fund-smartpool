// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import './ERC20.sol';
import '../interfaces/IRealFundTokenERC20.sol';

contract RealFundTokenERC20 is IRealFundTokenERC20, ERC20 {
    address private _owner;
    mapping(address => bool) private _whitelist;

    modifier onlyOwner() {
        require(msg.sender == _owner, "OnlyOwner");
        _;
    }

    constructor(uint256 initialSupply) ERC20("RealFund", "RFD") public {
        _owner = msg.sender;
        _mint(msg.sender, initialSupply);
        _whitelist[msg.sender] = true;
    }

    function changeOwner(address newOwner) external override onlyOwner {
        _owner = newOwner;
    }

    function addToWhitelist(address account) external override onlyOwner {
        _whitelist[account] = true;
    }

    function removeFromWhitelist(address account) external override onlyOwner {
        _whitelist[account] = false;
    }

    function isWhitelisted(address account) external view override returns (bool) {
        return _whitelist[account];
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(_whitelist[recipient], toString(recipient));
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(_whitelist[recipient], toString(recipient));
        return super.transferFrom(sender, recipient, amount);
    }

    function toString(address account) public pure returns(string memory) {
    return toString(abi.encodePacked(account));
}

function toString(uint256 value) public pure returns(string memory) {
    return toString(abi.encodePacked(value));
}

function toString(bytes32 value) public pure returns(string memory) {
    return toString(abi.encodePacked(value));
}

function toString(bytes memory data) public pure returns(string memory) {
    bytes memory alphabet = "0123456789abcdef";

    bytes memory str = new bytes(2 + data.length * 2);
    str[0] = "0";
    str[1] = "x";
    for (uint i = 0; i < data.length; i++) {
        str[2+i*2] = alphabet[uint(uint8(data[i] >> 4))];
        str[3+i*2] = alphabet[uint(uint8(data[i] & 0x0f))];
    }
    return string(str);
}
}