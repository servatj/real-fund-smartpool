// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IRealFundTokenERC20 {
    function changeOwner(address newOwner) external;
    function addToWhitelist(address account) external;
    function removeFromWhitelist(address account) external;
    function isWhitelisted(address account) external view returns (bool);
}