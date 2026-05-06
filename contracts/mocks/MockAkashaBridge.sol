// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "../interfaces/IAkashaBridge.sol";

/// @notice No-op publisher for verifying TreasuryBridge payload encoding.
contract MockAkashaBridge is IAkashaBridge {
    uint32 public lastNonce;
    bytes public lastPayload;
    uint8 public lastConsistency;

    function publishMessage(
        uint32 nonce,
        bytes memory payload,
        uint8 consistencyLevel
    ) external payable returns (uint64 sequence) {
        lastNonce = nonce;
        lastPayload = payload;
        lastConsistency = consistencyLevel;
        return 0;
    }
}
