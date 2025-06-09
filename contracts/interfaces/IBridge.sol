// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

interface IBridge {
    /**
        @notice It is intended that deposit are made using the Bridge contract.
        @param destinationDomainID ID of chain deposit will be bridged to.
        @param resourceID ResourceID used to find address of token to be used for deposit.
        @param data Consists of additional data needed for a specific deposit.
     */
    function deposit(uint8 destinationDomainID, bytes32 resourceID, bytes calldata data) external;
}
