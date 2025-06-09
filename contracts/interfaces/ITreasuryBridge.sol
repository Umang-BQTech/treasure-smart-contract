// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

interface ITreasuryBridge {
    struct DepositNFTBridge {
        uint8 payloadID;
        address holder;
        uint256 amount;
        uint256 nftId;
    }

    event SetTokenAddress(address _address);
    event SetBridgeAddress(address _address);
    event SetAkashaBridgeAddress(address _address);
    event SetBridgeErc20HandlerAddress(address _address);
    event SetBridgeParams(uint8 destinationChainId, bytes32 resourceId);
    event AddAllowedAddress(address indexed _address);
    event RemoveAllowedAddress(address indexed _address);
    event DepositNFT(address indexed user, uint256 amount, uint256 nftId);
    event Withdraw(address indexed token, address indexed to, uint256 amount);
}
