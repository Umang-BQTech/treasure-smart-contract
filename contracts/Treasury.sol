// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./base/BaseUpgradable.sol";
import "./interfaces/ITreasury.sol";

contract Treasury is ITreasury, BaseUpgradable {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    EnumerableSet.AddressSet private _allowedAddresses;
    uint256 public depositFee; //1e4
    uint256 public totalFeeAmount;

    modifier onlyAllowedAddresses() {
        require(_allowedAddresses.contains(msg.sender), "Treasury: only allowed addresses");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    receive() external payable {}

    fallback() external payable {}

    function initialize(
        address tokenAddress,
        address approveAddress,
        uint256 _depositFee,
        address[] memory allowedAddresses
    ) external initializer {
        depositFee = _depositFee;

        IERC20(tokenAddress).approve(approveAddress, type(uint256).max);

        for (uint256 i = 0; i < allowedAddresses.length; ++i) {
            _allowedAddresses.add(allowedAddresses[i]);
        }
        __Base_init(_msgSender());
    }

    function setDepositFee(uint256 _depositFee) external onlyAdmin {
        depositFee = _depositFee;

        emit SetDepositFee(_depositFee);
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

    function approveToken(address tokenAddress, address approveAddress) external onlyAdmin {
        IERC20(tokenAddress).approve(approveAddress, type(uint256).max);
    }

    function withdraw(address _token, address _to, uint256 _amount) external onlyAdmin {
        require(IERC20(_token).balanceOf(address(this)) >= _amount, "Treasury: Invalid amount");
        IERC20(_token).safeTransfer(_to, _amount);

        emit Withdraw(_token, _to, _amount);
    }

    function calculateAndUpdateFee(
        uint256 _nftId,
        uint256 _amount
    ) external onlyAllowedAddresses returns (uint256) {
        uint256 _feeAmount = (_amount * depositFee) / 1e4;

        totalFeeAmount += _feeAmount;

        emit FeeCalculated(_nftId, _amount, _feeAmount);

        return _amount - _feeAmount;
    }
}
