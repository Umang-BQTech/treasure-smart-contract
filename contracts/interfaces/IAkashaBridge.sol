// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

interface IAkashaBridge {
    function publishMessage(
        uint32 nonce,
        bytes memory payload,
        uint8 consistencyLevel
    ) external payable returns (uint64 sequence);
}
