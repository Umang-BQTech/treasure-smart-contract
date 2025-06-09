// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

interface ITreasury {
    function calculateAndUpdateFee(uint256 _nftId, uint256 _amount) external returns (uint256);

    event SetDepositFee(uint256 _depositFee);
    event AddAllowedAddress(address indexed _address);
    event RemoveAllowedAddress(address indexed _address);
    event Withdraw(address indexed token, address indexed to, uint256 amount);
    event FeeCalculated(uint256 indexed nftId, uint256 amount, uint256 fee);
}
