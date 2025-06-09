// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/ITreasuryBridge.sol";
import "./interfaces/IAkashaBridge.sol";
import "./base/BaseUpgradable.sol";
import "./interfaces/IBridge.sol";

contract TreasuryBridge is ITreasuryBridge, BaseUpgradable {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    IERC20 public token;
    IBridge public bridge;
    IAkashaBridge public akashaBridge;
    EnumerableSet.AddressSet private _allowedAddresses;
    address public bridgeErc20HandlerAddress;
    address public treasuryAddress;
    uint8 public destinationChainId;
    bytes32 public resourceId;

    modifier onlyAllowedAddresses() {
        require(_allowedAddresses.contains(msg.sender), "TreasuryBridge: only allowed addresses");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _tokenAddress,
        address _bridgeAddress,
        address _bridgeErc20HandlerAddress,
        address _TreasuryAddress,
        address _akashaBridge,
        uint8 _destinationChainId,
        bytes32 _resourceId,
        address[] memory allowedAddresses
    ) external initializer {
        token = IERC20(_tokenAddress);
        bridge = IBridge(_bridgeAddress);
        akashaBridge = IAkashaBridge(_akashaBridge);
        treasuryAddress = _TreasuryAddress;
        bridgeErc20HandlerAddress = _bridgeErc20HandlerAddress;

        destinationChainId = _destinationChainId;
        resourceId = _resourceId;

        for (uint256 i = 0; i < allowedAddresses.length; ++i) {
            _allowedAddresses.add(allowedAddresses[i]);
        }

        __Base_init(_msgSender());
    }

    function setTokenAddress(address _address) external onlyAdmin {
        token = IERC20(_address);

        emit SetTokenAddress(_address);
    }

    function setBridgeAddress(address _address) external onlyAdmin {
        bridge = IBridge(_address);

        emit SetBridgeAddress(_address);
    }

    function setAkashaBridgeAddress(address _address) external onlyAdmin {
        akashaBridge = IAkashaBridge(_address);

        emit SetAkashaBridgeAddress(_address);
    }

    function setBridgeErc20HandlerAddress(address _address) external onlyAdmin {
        bridgeErc20HandlerAddress = _address;

        emit SetBridgeErc20HandlerAddress(_address);
    }

    function setBridgeParams(uint8 _destinationChainId, bytes32 _resourceId) external onlyAdmin {
        destinationChainId = _destinationChainId;
        resourceId = _resourceId;

        emit SetBridgeParams(_destinationChainId, _resourceId);
    }

    function addAllowedAddress(address _address) external onlyAdmin {
        _allowedAddresses.add(_address);

        emit AddAllowedAddress(_address);
    }

    function removeAllowedAddress(address _address) external onlyAdmin {
        _allowedAddresses.remove(_address);

        emit RemoveAllowedAddress(_address);
    }

    /**
     * @notice Function to get allowed addresses
     */
    function getAllowedAddresses() external view returns (address[] memory) {
        return _allowedAddresses.values();
    }

    function depositNFT(uint256 amount, uint256 nftItemId, uint32 nonce) external {
        require(amount > 0, "TreasuryBridge: invalid amount");

        token.safeTransferFrom(_msgSender(), address(this), amount);

        ITreasuryBridge.DepositNFTBridge memory deposit = ITreasuryBridge.DepositNFTBridge({
            payloadID: 4,
            holder: _msgSender(),
            amount: amount,
            nftId: nftItemId
        });

        bytes memory payload = abi.encodePacked(
            deposit.payloadID,
            bytes32(uint256(uint160(deposit.holder))),
            deposit.amount,
            deposit.nftId
        );

        akashaBridge.publishMessage{value: 0}(nonce, payload, 2);

        emit DepositNFT(_msgSender(), amount, nftItemId);
    }

    function bridgeTokens() external onlyAllowedAddresses {
        uint256 amount = token.balanceOf(address(this));
        token.approve(bridgeErc20HandlerAddress, amount);

        bytes memory data = abi.encodePacked(
            amount,
            abi.encodePacked(treasuryAddress).length,
            treasuryAddress
        );
        IBridge(bridge).deposit(destinationChainId, resourceId, data);
    }

    function withdraw(address _token, address _to, uint256 _amount) external onlyAdmin {
        require(
            IERC20(_token).balanceOf(address(this)) >= _amount,
            "TreasuryBridge: Invalid amount"
        );
        IERC20(_token).safeTransfer(_to, _amount);

        emit Withdraw(_token, _to, _amount);
    }
}
