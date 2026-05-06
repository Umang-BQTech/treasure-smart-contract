// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "../interfaces/IBridge.sol";

/// @notice Captures deposit args for assertions in tests.
contract MockBridge is IBridge {
    uint8 public lastDomain;
    bytes32 public lastResource;
    bytes public lastData;

    function deposit(uint8 destinationDomainID, bytes32 resourceID, bytes calldata data) external {
        lastDomain = destinationDomainID;
        lastResource = resourceID;
        lastData = data;
    }
}
